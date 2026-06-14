import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatPrice } from '@/shared/lib/format';
import { ListingService } from '@/features/listings/ListingService';
import type { ProductSummary } from '@/features/discovery/discovery.types';
import type { ListingStatus } from '@/shared/types/enums';

/** Status → badge tone + label. "Unavailable" covers probation pre-moderation, so label it clearly. */
type StatusBadge = { tone: 'success' | 'warning' | 'neutral' | 'danger'; label: string };
const STATUS_BADGE: Record<ListingStatus, StatusBadge> = {
  Live: { tone: 'success', label: 'Live' },
  Unavailable: { tone: 'warning', label: 'Pending review' },
  Archived: { tone: 'neutral', label: 'Archived' },
  Removed: { tone: 'danger', label: 'Removed' },
};
const UNKNOWN_BADGE: StatusBadge = { tone: 'neutral', label: 'Unknown' };

/** Vendor's listing management table with edit/delete actions (PDR §2.11). */
export function MyListingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ProductSummary | null>(null);

  const { data, error, isLoading, reload } = useApi(
    () => ListingService.getMine(page, 20),
    [page],
  );

  const del = useMutation(ListingService.remove);

  async function confirmDelete() {
    if (!toDelete) return;
    await del.run(toDelete.id);
    setToDelete(null);
    reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My listings"
        description="Manage your published products."
        action={
          <Button leftIcon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/vendor/listings/new')}>
            New listing
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Create your first listing to start receiving buyer leads."
          action={
            <Button className="mt-2" onClick={() => navigate('/vendor/listings/new')}>
              Create a listing
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Listing</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {listing.coverUrl ? (
                            <img src={listing.coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <PhotoIcon className="h-full w-full p-2.5 text-slate-300" />
                          )}
                        </div>
                        <Link to={`/products/${listing.id}`} className="font-medium text-slate-900 hover:text-accent-700">
                          {listing.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatPrice(listing.priceAmount, listing.priceType)}</td>
                    <td className="px-4 py-3 text-slate-600">{listing.city}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const badge = STATUS_BADGE[listing.status] ?? UNKNOWN_BADGE;
                        return <Badge tone={badge.tone}>{badge.label}</Badge>;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/vendor/listings/${listing.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setToDelete(listing)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4">
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete listing"
        message={
          <>
            Delete <span className="font-medium text-slate-900">{toDelete?.title}</span>? This archives the
            listing and removes it from search.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={del.isLoading}
        error={del.error}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
