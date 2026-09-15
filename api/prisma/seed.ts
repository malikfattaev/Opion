// Скрипт запускается отдельным процессом, переменные из .env он читает сам.
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { TeamRole } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/lib/auth/password";
import { placeholderProducts, placeholderStyles, placeholderTypes } from "../src/lib/catalog/placeholder-data";

/**
 * Первое наполнение базы: типы, стили и витрина, с которой магазин открывался,
 * плюс учётная запись владельца админки.
 *
 * Сид идемпотентен: повторный запуск ничего не дублирует и не затирает правки,
 * сделанные из админки.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Нужна переменная DATABASE_URL.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedCatalog(): Promise<void> {
  for (const [position, type] of placeholderTypes.entries()) {
    await db.productType.upsert({
      where: { slug: type.slug },
      update: {},
      create: { slug: type.slug, name: type.name, position },
    });
  }

  for (const [position, style] of placeholderStyles.entries()) {
    await db.style.upsert({
      where: { slug: style.slug },
      update: {},
      create: { slug: style.slug, name: style.name, position },
    });
  }

  for (const [position, product] of placeholderProducts.entries()) {
    const type = await db.productType.findUniqueOrThrow({ where: { slug: product.typeSlug } });
    const styles = await db.style.findMany({ where: { slug: { in: [...product.styleSlugs] } }, select: { id: true } });

    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.compareAtPrice ?? null,
        sizes: [...product.sizes],
        position,
        typeId: type.id,
        styles: { create: styles.map(({ id }) => ({ styleId: id })) },
        images: {
          create: product.images.map((image, index) => ({ url: image.url, alt: image.alt, position: index })),
        },
      },
    });
  }
}

/**
 * Владелец создаётся один раз, из переменных окружения. Пароль в репозитории
 * не хранится, а после первого входа его можно сменить в разделе «Команда».
 */
async function seedOwner(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.info("ADMIN_USERNAME и ADMIN_PASSWORD не заданы, владелец не создан.");

    return;
  }

  // upsert, а не «проверить и создать»: сид может запуститься дважды подряд,
  // и второй заход не должен падать на уникальном логине.
  await db.teamMember.upsert({
    where: { username },
    update: {},
    create: {
      username,
      name: process.env.ADMIN_NAME ?? username,
      passwordHash: await hashPassword(password),
      role: TeamRole.OWNER,
    },
  });

  console.info(`Владелец ${username} на месте.`);
}

async function main(): Promise<void> {
  await seedCatalog();
  await seedOwner();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
