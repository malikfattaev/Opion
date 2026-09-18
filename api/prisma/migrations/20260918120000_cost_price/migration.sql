-- Себестоимость вещи. Может быть неизвестна, поэтому колонка необязательная.
ALTER TABLE "Product" ADD COLUMN "costPrice" INTEGER;

-- Себестоимость позиции на момент заказа. У прежних заказов её нет.
ALTER TABLE "OrderItem" ADD COLUMN "unitCost" INTEGER NOT NULL DEFAULT 0;
