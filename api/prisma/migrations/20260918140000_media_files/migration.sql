CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaFile_path_key" ON "MediaFile"("path");
CREATE INDEX "MediaFile_createdAt_idx" ON "MediaFile"("createdAt");

-- Файлы, загруженные до появления раздела, подхватываем из карточек товаров.
-- Размеры у них неизвестны, имя берём из самого файла.
INSERT INTO "MediaFile" ("id", "path", "name", "createdAt")
SELECT gen_random_uuid()::text,
       substring("url" from '/images/products/.*$'),
       regexp_replace("url", '^.*/', ''),
       min("createdAt")
FROM "ProductImage"
WHERE "url" LIKE '%/images/products/%'
GROUP BY 1, 2, 3
ON CONFLICT ("path") DO NOTHING;
