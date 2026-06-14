import { useState } from 'react';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Select } from '@/shared/components/Select';
import { Modal } from '@/shared/components/Modal';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatDate, humanizeEnum } from '@/shared/lib/format';
import type { ReportStatus } from '@/shared/types/enums';
import { AdminService } from '@/features/admin/AdminService';
import { AdminMfaRequired } from '@/features/admin/components/AdminMfaRequired';
import type { ReportResponse } from '@/features/admin/admin.types';

const FILTERS: ReportStatus[] = ['Open', 'Actioned', 'Dismissed'];
const STATUS_TONE: Record<ReportStatus, 'accent' | 'success' | 'neutral'> = {
  Open: 'accent',
  Actioned: 'success',
  Dismissed: 'neutral',
};

/** Admin report queue: resolve reports and optionally take down the reported content (PDR §2.16). */
export function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus | ''>('Open');
  const [page, setPage] = useState(1);

  const { data, error, isLoading, reload } = useApi(
    () => AdminService.getReportQueue(status || undefined, page, 20),
    [status, page],
  );

  const [active, setActive] = useState<ReportResponse | null>(null);
  const [decision, setDecision] = useState<Extract<ReportStatus, 'Actioned' | 'Dismissed'>>('Actioned');
  const [note, setNote] = useState('');
  const [takeDown, setTakeDown] = useState(false);

  const resolve = useMutation(AdminService.resolveReport);
  const moderateProduct = useMutation(AdminService.moderateProduct);
  const moderateReview = useMutation(AdminService.moderateReview);
  const isWorking = resolve.isLoading || moderateProduct.isLoading || moderateReview.isLoading;
  const actionError = resolve.error ?? moderateProduct.error ?? moderateReview.error;

  function openResolve(report: ReportResponse) {
    setActive(report);
    setDecision('Actioned');
    setNote('');
    setTakeDown(false);
  }

  async function submitResolve() {
    if (!active) return;
    // When actioning a Listing/Review report with take-down checked, remove the content first.
    if (decision === 'Actioned' && takeDown) {
      if (active.targetType === 'Listing') {
        await moderateProduct.run(active.targetId, 'Removed', note.trim() || 'Report actioned.');
      } else if (active.targetType === 'Review') {
        await moderateReview.run(active.targetId, 'Removed', note.trim() || 'Report actioned.');
      }
    }
    await resolve.run(active.id, decision, note.trim());
    setActive(null);
    reload();
  }

  if (error && error.status === 403) return <AdminMfaRequired />;
  const canTakeDown = active?.targetType === 'Listing' || active?.targetType === 'Review';

  return (
    <div className="space-y-4">
      <div className="w-44">
        <Select
          aria-label="Filter by status"
          value={status}
          placeholder="All statuses"
          onChange={(e) => {
            setStatus(e.target.value as ReportStatus | '');
            setPage(1);
          }}
          options={FILTERS.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No reports" description="The moderation queue is clear." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Reported</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((report) => (
                  <tr key={report.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{report.targetType}</Badge>
                      <p className="mt-1 font-mono text-xs text-slate-400">{report.targetId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{humanizeEnum(report.reason)}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">{report.note ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(report.createdAtUtc)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[report.status]}>{report.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.status === 'Open' && (
                        <Button size="sm" onClick={() => openResolve(report)}>
                          Resolve
                        </Button>
                      )}
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

      <Modal open={!!active} title="Resolve report" onClose={() => setActive(null)}>
        <div className="space-y-4">
          <Select
            label="Decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value as 'Actioned' | 'Dismissed')}
            options={[
              { value: 'Actioned', label: 'Actioned — the report was valid' },
              { value: 'Dismissed', label: 'Dismissed — no action needed' },
            ]}
          />

          {decision === 'Actioned' && canTakeDown && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={takeDown}
                onChange={(e) => setTakeDown(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-accent-600"
              />
              Also remove the reported {active?.targetType.toLowerCase()}
            </label>
          )}

          <textarea
            aria-label="Resolution note"
            rows={3}
            placeholder="Note (recorded in the audit log)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
          />

          {actionError && (
            <p role="alert" className="text-sm text-red-600">
              {actionError.detail}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              variant={decision === 'Actioned' ? 'primary' : 'secondary'}
              fullWidth
              isLoading={isWorking}
              onClick={submitResolve}
            >
              {decision === 'Actioned' ? 'Action report' : 'Dismiss report'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
