import { FilterSheet } from "@/components/filter-sheet";
import { ProductCard } from "@/components/product-card";
import { filterProducts, getCatalog } from "@/lib/catalog";
import { parseFilters } from "@/lib/filters";

export default async function CatalogPage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const { types, styles, products } = await getCatalog();
  const visible = filterProducts(products, filters);

  return (
    <div className="px-5">
      <h1 className="sr-only">Каталог OPIØN</h1>

      <FilterSheet types={types} styles={styles} filters={filters} />

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          {products.length === 0 ? "Каталог пока пуст." : "Под выбранные фильтры ничего не подошло."}
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6">
          {visible.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
