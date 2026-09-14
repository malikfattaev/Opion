import { CatalogPagination } from "@/components/catalog-pagination";
import { FilterSheet } from "@/components/filter-sheet";
import { ProductCard } from "@/components/product-card";
import { appConfig } from "@/config/site";
import { filterProducts, getCatalog } from "@/lib/catalog";
import { parseFilters, parsePage } from "@/lib/filters";

export default async function CatalogPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const { types, styles, products } = await getCatalog();

  const matching = filterProducts(products, filters);
  const pageCount = Math.max(1, Math.ceil(matching.length / appConfig.productsPerPage));
  // Ссылку на несуществующую страницу приводим к последней, чтобы не показывать пустоту.
  const page = Math.min(parsePage(params), pageCount);
  const visible = matching.slice((page - 1) * appConfig.productsPerPage, page * appConfig.productsPerPage);

  return (
    <div className="px-5">
      <h1 className="sr-only">Каталог OPIØN</h1>

      <FilterSheet types={types} styles={styles} filters={filters} />

      {matching.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          {products.length === 0 ? "Каталог пока пуст." : "Под выбранные фильтры ничего не подошло."}
        </p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
            {visible.map((product, index) => (
              <li key={product.slug}>
                <ProductCard product={product} priority={index < 2} />
              </li>
            ))}
          </ul>

          <CatalogPagination filters={filters} page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
