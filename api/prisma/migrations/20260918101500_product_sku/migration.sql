-- Артикул заказанной позиции. У прежних заказов его нет, поэтому пустая строка.
ALTER TABLE "OrderItem" ADD COLUMN "sku" TEXT NOT NULL DEFAULT '';

-- Артикул вещи. Колонку заводим пустой, заполняем и только потом делаем обязательной:
-- в базе уже есть каталог, а обязательное поле без значения её не пустит.
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

WITH numbered AS (
  SELECT "id", row_number() OVER (ORDER BY "position", "createdAt") AS "index" FROM "Product"
)
UPDATE "Product"
SET "sku" = 'OP-' || lpad(numbered."index"::text, 4, '0')
FROM numbered
WHERE "Product"."id" = numbered."id";

ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
