import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import { useApi } from '@/shared/hooks/useApi';
import { Badge } from '@/shared/components/Badge';
import { StarRating } from '@/shared/components/StarRating';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { ProductCard } from '@/features/discovery/components/ProductCard';
import { VendorService } from '@/features/vendor/VendorService';
import { ListingService } from '@/features/listings/ListingService';

const PAGE_SIZE = 20;

/** Public vendor storefront reached from a product's "View shop" (PDR §2.x). */
export function VendorShopPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data: vendor, error: vendorError, isLoading: vendorLoading, reload: reloadVendor } =
    useApi(() => VendorService.getPublic(id), [id]);
  const productsKey = useMemo(() => `${id}:${page}`, [id, page]);
  const { data: products, error: productsError, isLoading: productsLoading, reload: reloadProducts } =
    useApi(() => ListingService.getByVendor(id, page, PAGE_SIZE), [productsKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {vendorLoading ? (
        <LoadingState label="Loading shop…" />
      ) : vendorError ? (
        <ErrorState error={vendorError} onRetry={reloadVendor} />
      ) : vendor ? (
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{vendor.businessName}</h1>
            {vendor.verified && (
              <Badge tone="accent" className="shrink-0">
                <CheckBadgeIcon className="h-4 w-4" /> Verified
              </Badge>
            )}
          </div>
          {vendor.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <StarRating value={vendor.averageRating} size="sm" />
              <span>
                {vendor.averageRating.toFixed(1)} ({vendor.reviewCount}{' '}
                {vendor.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </header>
      ) : null}

      <section aria-live="polite" aria-busy={productsLoading}>
        {productsLoading ? (
          <LoadingState label="Loading listings…" />
        ) : productsError ? (
          <ErrorState error={productsError} onRetry={reloadProducts} />
        ) : !products || products.items.length === 0 ? (
          <EmptyState
            title="No live listings"
            description="This vendor doesn't have any active listings right now."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                page={products.page}
                pageSize={products.pageSize}
                total={products.total}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
