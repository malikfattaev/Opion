import { readProductImage } from "@/lib/storage/images";

/** Ключ приходит по частям: `products/ab12.webp` - это два сегмента пути. */
export async function GET(_request: Request, { params }: RouteContext<"/images/[...key]">) {
  const key = (await params).key.join("/");
  const image = await readProductImage(key);

  if (!image) {
    return new Response("Не найдено.", { status: 404 });
  }

  return new Response(image.body, {
    headers: {
      "content-type": image.contentType,
      // Имя файла случайное и никогда не переиспользуется, поэтому кешируем навсегда.
      "cache-control": "public, max-age=31536000, immutable",
      ...(image.length === undefined ? {} : { "content-length": String(image.length) }),
    },
  });
}
