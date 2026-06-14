import { useState } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import { useApi } from '@/shared/hooks/useApi';
import { Badge } from '@/shared/components/Badge';
import { StarRating } from '@/shared/components/StarRating';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatDate } from '@/shared/lib/format';
import { ProductService } from '@/features/product/ProductService';

/** Paginated public reviews for a listing (PDR §2.6). `reloadKey` forces a refetch when bumped. */
export function ReviewList({ productId, reloadKey = 0 }: { productId: string; reloadKey?: number }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, error, isLoading, reload } = useApi(
    () => ProductService.getReviews(productId, page, pageSize),
    [productId, page, reloadKey],
  );

  if (isLoading) return <LoadingState label="Loading reviews…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="No reviews yet" description="Be the first to review this vendor after you connect." />;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {data.items.map((review) => (
          <li key={review.id} className="rounded-card border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{review.authorDisplayName}</span>
                {review.contactedVendor && (
                  <Badge tone="success">
                    <CheckBadgeIcon className="h-3.5 w-3.5" /> Contacted vendor
                  </Badge>
                )}
              </div>
              <time className="text-xs text-slate-400">{formatDate(review.createdAtUtc)}</time>
            </div>
            <div className="mt-2">
              <StarRating value={review.rating} size="sm" />
            </div>
            {review.text && <p className="mt-2 text-sm text-slate-700">{review.text}</p>}
          </li>
        ))}
      </ul>
      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
    </div>
  );
}
