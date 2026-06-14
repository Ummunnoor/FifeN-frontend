import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatPrice, humanizeEnum } from '@/shared/lib/format';
import { AdminService } from '@/features/admin/AdminService';
import { AdminMfaRequired } from '@/features/admin/components/AdminMfaRequired';
import type { ProductSummary } from '@/features/discovery/discovery.types';

const PAGE_SIZE = 20;

/** Admin moderation queue for probation listings: approve to go live, or take down with a reason (PDR §2.15). */
export function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, reload } = useApi(
    () => AdminService.getPendingListings(page, PAGE_SIZE),
    [page],
  );

  const approve = useMutation((id: string) => AdminService.moderateProduct(id, 'Live', 'Approved by moderator'));
  const takedown = useMutation((args: { id: string; reason: string }) =>
    AdminService.moderateProduct(args.id, 'Removed', args.reason),
  );

  const [removing, setRemoving] = useState<ProductSummary | null>(null);
  const [reason, setReason] = useState('');

  async function onApprove(item: ProductSummary) {
    await approve.run(item.id);
    reload();
  }
  async function onTakedown() {
    if (!removing) return;
    await takedown.run({ id: removing.id, reason: reason.trim() });
    setRemoving(null);
    setReason('');
    reload();
  }

  if (error && error.status === 403) return <AdminMfaRequired />;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Nothing to review" description="No listings are awaiting moderation." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Listing</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <PhotoIcon className="h-full w-full p-2.5 text-slate-300" />
                          )}
                        </div>
                        <Link to={`/products/${item.id}`} className="font-medium text-slate-900 hover:text-accent-700">
                          {item.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.vendorName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatPrice(item.priceAmount, item.priceType)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.city}, {humanizeEnum(item.state)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" isLoading={approve.isLoading} onClick={() => onApprove(item)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setRemoving(item)}>
                          Take down
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

      <Modal open={!!removing} title="Take down listing" onClose={() => setRemoving(null)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Take down <span className="font-medium text-slate-900">{removing?.title}</span>? The vendor is notified
            with your reason.
          </p>
          <textarea
            aria-label="Takedown reason"
            rows={3}
            placeholder="Reason (recorded in the audit log and sent to the vendor)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
          />
          {takedown.error && (
            <p role="alert" className="text-sm text-red-600">
              {takedown.error.detail}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth disabled={!reason.trim()} isLoading={takedown.isLoading} onClick={onTakedown}>
              Take down
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
