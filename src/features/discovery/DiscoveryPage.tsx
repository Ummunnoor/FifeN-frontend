import { useMemo, useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useApi } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { DiscoveryService } from '@/features/discovery/DiscoveryService';
import { DiscoveryFilters } from '@/features/discovery/components/DiscoveryFilters';
import { ProductCard } from '@/features/discovery/components/ProductCard';
import type { ProductQuery } from '@/features/discovery/discovery.types';

const DEFAULT_QUERY: ProductQuery = { sort: 'recent', page: 1, pageSize: 20 };

/** Public browse + search page: filter panel, responsive product grid, pagination (PDR §2.2). */
export function DiscoveryPage() {
  const [query, setQuery] = useState<ProductQuery>(DEFAULT_QUERY);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Categories load once; failure is non-fatal (the rest of discovery still works).
  const { data: categories } = useApi(() => DiscoveryService.getCategories(), []);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);
  const { data, error, isLoading, reload } = useApi(() => DiscoveryService.search(query), [queryKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Discover listings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse verified vendors across Nigeria and connect on WhatsApp.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
        {/* Filters: sidebar on desktop, collapsible panel on mobile. */}
        <div className="mb-4 lg:mb-0">
          <Button
            variant="secondary"
            fullWidth
            className="lg:hidden"
            leftIcon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {filtersOpen ? 'Hide filters' : 'Filters'}
          </Button>
          <Card className={`mt-3 p-5 lg:mt-0 lg:block ${filtersOpen ? 'block' : 'hidden'}`}>
            <DiscoveryFilters categories={categories ?? []} value={query} onChange={setQuery} />
          </Card>
        </div>

        {/* Results */}
        <section aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <LoadingState label="Finding listings…" />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No listings match your filters"
              description="Try widening your search — fewer filters, a different state, or a higher price range."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
