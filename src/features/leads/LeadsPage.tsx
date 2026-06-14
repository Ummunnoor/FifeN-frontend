import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowsRightLeftIcon } from '@heroicons/react/20/solid';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Select } from '@/shared/components/Select';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatDate } from '@/shared/lib/format';
import type { LeadStatus } from '@/shared/types/enums';
import { LeadService } from '@/features/leads/LeadService';

const LEAD_STATUSES: LeadStatus[] = ['New', 'Viewed', 'Closed'];
const STATUS_TONE: Record<LeadStatus, 'accent' | 'neutral' | 'success'> = {
  New: 'accent',
  Viewed: 'neutral',
  Closed: 'success',
};

const ngn = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

/** Vendor leads dashboard: filter by status, update progress, spot cross-discovery leads (PDR §2.12). */
export function LeadsPage() {
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, error, isLoading, reload } = useApi(
    () => LeadService.getLeads(status || undefined, page, 20),
    [status, page],
  );
  const update = useMutation(LeadService.updateStatus);

  async function changeStatus(id: string, next: LeadStatus) {
    await update.run(id, next);
    reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Buyer leads"
        description="Buyers who contacted you. Cross-discovery leads found you outside their original search."
        action={
          <div className="w-44">
            <Select
              aria-label="Filter by status"
              value={status}
              placeholder="All statuses"
              onChange={(e) => {
                setStatus(e.target.value as LeadStatus | '');
                setPage(1);
              }}
              options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </div>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No leads yet" description="When buyers express interest in your listings, they'll appear here." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Listing / Buyer</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Offer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/products/${lead.productId}`} className="font-medium text-slate-900 hover:text-accent-700">
                        {lead.productTitle}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        {lead.buyerDisplayName}
                        {lead.isCrossDiscovery && (
                          <Badge tone="accent">
                            <ArrowsRightLeftIcon className="h-3 w-3" /> Cross-discovery
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">{lead.message ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {lead.offerPrice != null ? ngn.format(lead.offerPrice) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(lead.createdAtUtc)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                        <select
                          aria-label="Update lead status"
                          value={lead.status}
                          disabled={update.isLoading}
                          onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
                          className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
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
    </div>
  );
}
