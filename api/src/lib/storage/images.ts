import "server-only";

import { randomBytes } from "node:crypto";

import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { bucketConfig, publicApiOrigin } from "@/lib/env";

/**
 * Фотографии товаров лежат в бакете Railway. Бакет закрытый, поэтому наружу
 * они отдаются через сам API: `/images/<ключ>`.
 */

/** Больше этого размера на витрине не нужно: карточка занимает половину экрана. */
const MAX_SIDE = 1600;
const WEBP_QUALITY = 82;
const CONTENT_TYPE = "image/webp";

const PRODUCTS_FOLDER = "products";
const PUBLIC_PREFIX = "/images/";

/** Исходник до обработки. Десять мегабайт - это фото с любого телефона. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export class BucketNotConfiguredError extends Error {}
export class BrokenImageError extends Error {}

let client: S3Client | undefined;

function bucket(): { client: S3Client; name: string } {
  const config = bucketConfig();

  if (!config) {
    throw new BucketNotConfiguredError("Хранилище картинок не настроено.");
  }

  client ??= new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });

  return { client, name: config.name };
}

/**
 * Кладёт фотографию в бакет и возвращает её ключ. Всё приводится к webp:
 * так картинка весит в разы меньше, а формат понимают все браузеры.
 */
export async function storeProductImage(file: File): Promise<string> {
  const source = Buffer.from(await file.arrayBuffer());

  let webp: Buffer;

  try {
    webp = await sharp(source)
      // Снимки с телефона хранят поворот в метаданных, после сжатия его уже не будет.
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new BrokenImageError("Не получилось прочитать изображение.");
  }

  const key = `${PRODUCTS_FOLDER}/${randomBytes(16).toString("hex")}.webp`;
  const { client: s3, name } = bucket();

  await s3.send(
    new PutObjectCommand({ Bucket: name, Key: key, Body: webp, ContentType: CONTENT_TYPE }),
  );

  return key;
}

export type StoredImage = { body: ReadableStream; contentType: string; length?: number };

/** Отдаёт файл из бакета. `null`, если такого ключа нет. */
export async function readProductImage(key: string): Promise<StoredImage | null> {
  const { client: s3, name } = bucket();

  try {
    const object = await s3.send(new GetObjectCommand({ Bucket: name, Key: key }));

    return object.Body
      ? {
          body: object.Body.transformToWebStream(),
          contentType: object.ContentType ?? CONTENT_TYPE,
          length: object.ContentLength,
        }
      : null;
  } catch (error) {
    if (isMissingObject(error)) {
      return null;
    }

    throw error;
  }
}

/**
 * Убирает из хранилища файлы, на которые больше никто не ссылается.
 * Чужие ссылки пропускаем: в каталоге могут остаться картинки со стороны.
 */
export async function forgetProductImages(urls: readonly string[]): Promise<void> {
  const keys = urls.map(toKey).filter((key): key is string => key !== null);

  if (keys.length === 0) {
    return;
  }

  const { client: s3, name } = bucket();

  await s3.send(
    new DeleteObjectsCommand({ Bucket: name, Delete: { Objects: keys.map((Key) => ({ Key })) } }),
  );
}

/**
 * В базе лежит путь без домена: домен у API может смениться, а картинки
 * должны продолжать открываться.
 */
export function toStoredImageUrl(url: string): string {
  return imagePath(url) ?? url;
}

/** Наружу путь разворачивается в полную ссылку: витрина живёт на другом домене. */
export function toPublicImageUrl(url: string): string {
  const path = imagePath(url);

  if (!path) {
    return url;
  }

  const origin = publicApiOrigin();

  return origin ? `${origin}${path}` : path;
}

/** Путь нашей картинки, если ссылка вообще про неё. Чужие адреса не трогаем. */
function imagePath(url: string): string | null {
  const path = url.startsWith(PUBLIC_PREFIX) ? url : (URL.parse(url)?.pathname ?? null);

  return path?.startsWith(`${PUBLIC_PREFIX}${PRODUCTS_FOLDER}/`) ? path : null;
}

/** `/images/products/ab12.webp` - это ключ `products/ab12.webp`. */
function toKey(url: string): string | null {
  const path = imagePath(url);

  return path === null ? null : decodeURIComponent(path.slice(PUBLIC_PREFIX.length));
}

function isMissingObject(error: unknown): boolean {
  const name = (error as { name?: string }).name;

  return name === "NoSuchKey" || name === "NotFound";
}
