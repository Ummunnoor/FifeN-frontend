import { useState } from 'react';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Select } from '@/shared/components/Select';
import { Modal } from '@/shared/components/Modal';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatDate, humanizeEnum } from '@/shared/lib/format';
import { REJECTION_REASONS, type RejectionReason } from '@/shared/types/enums';
import { AdminService } from '@/features/admin/AdminService';
import { AdminMfaRequired } from '@/features/admin/components/AdminMfaRequired';
import type { VendorRequestQueueItem } from '@/features/admin/admin.types';
import type { VendorRequestStatus } from '@/features/vendor/vendor.types';

const STATUSES: VendorRequestStatus[] = ['Pending', 'Approved', 'Rejected'];

/** Admin vendor request moderation queue with approve / reject / suspend (PDR §2.14). */
export function AdminVendorsPage() {
  const [status, setStatus] = useState<VendorRequestStatus>('Pending');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, error, isLoading, reload } = useApi(
    () => AdminService.getVendorQueue(status, page, pageSize),
    [status, page],
  );

  const approve = useMutation(AdminService.approveVendor);
  const reject = useMutation(AdminService.rejectVendor);
  const suspend = useMutation(AdminService.suspendVendor);
  const reinstate = useMutation(AdminService.reinstateVendor);

  const [rejecting, setRejecting] = useState<VendorRequestQueueItem | null>(null);
  const [reason, setReason] = useState<RejectionReason>('NameMismatch');
  const [suspending, setSuspending] = useState<VendorRequestQueueItem | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  async function onApprove(item: VendorRequestQueueItem) {
    await approve.run(item.id);
    reload();
  }
  async function onReject() {
    if (!rejecting) return;
    await reject.run(rejecting.id, reason);
    setRejecting(null);
    reload();
  }
  async function onSuspend() {
    if (!suspending) return;
    await suspend.run(suspending.userId, suspendReason.trim());
    setSuspending(null);
    setSuspendReason('');
    reload();
  }
  async function onReinstate(item: VendorRequestQueueItem) {
    await reinstate.run(item.userId);
    reload();
  }

  if (error && error.status === 403) return <AdminMfaRequired />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-44">
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as VendorRequestStatus);
              setPage(1);
            }}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Nothing here" description={`No ${status.toLowerCase()} vendor requests.`} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">KYC</th>
                  <th className="px-4 py-3 font-medium">Name match</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        {item.businessName}
                        {item.suspended && <Badge tone="danger">Suspended</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.method}</td>
                    <td className="px-4 py-3">
                      <Badge tone={item.verificationStatus === 'Verified' ? 'success' : item.verificationStatus === 'Failed' ? 'danger' : 'warning'}>
                        {item.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={item.nameMatch ? 'success' : 'warning'}>{item.nameMatch ? 'Match' : 'Mismatch'}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(item.createdAtUtc)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {status === 'Pending' && (
                          <>
                            <Button size="sm" isLoading={approve.isLoading} onClick={() => onApprove(item)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setRejecting(item)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {status === 'Approved' &&
                          (item.suspended ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              isLoading={reinstate.isLoading}
                              onClick={() => onReinstate(item)}
                            >
                              Reinstate
                            </Button>
                          ) : (
                            <Button size="sm" variant="danger" onClick={() => setSuspending(item)}>
                              Suspend
                            </Button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="px-2 text-sm text-slate-600">Page {page}</span>
            <Button variant="secondary" size="sm" disabled={data.length < pageSize} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Reject reason */}
      <Modal open={!!rejecting} title="Reject vendor request" onClose={() => setRejecting(null)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Rejecting <span className="font-medium text-slate-900">{rejecting?.businessName}</span>. Pick a reason —
            this drives the message the vendor receives.
          </p>
          <Select
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as RejectionReason)}
            options={REJECTION_REASONS.map((r) => ({ value: r, label: humanizeEnum(r) }))}
          />
          {reject.error && (
            <p role="alert" className="text-sm text-red-600">
              {reject.error.detail}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth isLoading={reject.isLoading} onClick={onReject}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend reason */}
      <Modal open={!!suspending} title="Suspend vendor" onClose={() => setSuspending(null)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Suspend <span className="font-medium text-slate-900">{suspending?.businessName}</span>? Their listings
            will be hidden.
          </p>
          <textarea
            aria-label="Suspension reason"
            rows={3}
            placeholder="Reason (recorded in the audit log)"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
          />
          {suspend.error && (
            <p role="alert" className="text-sm text-red-600">
              {suspend.error.detail}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setSuspending(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth disabled={!suspendReason.trim()} isLoading={suspend.isLoading} onClick={onSuspend}>
              Suspend
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
