import { useApi } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { LoadingState, ErrorState } from '@/shared/components/StateViews';
import { AdminService } from '@/features/admin/AdminService';
import { MetricCard } from '@/features/admin/components/MetricCard';
import { AdminMfaRequired } from '@/features/admin/components/AdminMfaRequired';
import type { NameCount } from '@/features/admin/admin.types';

const pct = (n: number) => `${Math.round(n * 100)}%`;
const num = new Intl.NumberFormat('en-NG');

/** Admin home: platform KPIs with cross-discovery as the headline metric (PDR §2.13). */
export function AdminDashboardPage() {
  const { data, error, isLoading, reload } = useApi(() => AdminService.getDashboard(), []);

  if (isLoading) return <LoadingState />;
  if (error) return error.status === 403 ? <AdminMfaRequired /> : <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Cross-discovery rate" value={pct(data.crossDiscoveryRate)} emphasis />
        <MetricCard label="Registered users" value={num.format(data.registeredUsers)} />
        <MetricCard label="Active users (30d)" value={num.format(data.activeUsers30d)} />
        <MetricCard label="Active listings" value={num.format(data.activeListings)} />
        <MetricCard label="Interactions (30d)" value={num.format(data.interactions30d)} />
        <MetricCard label="OTP success rate" value={pct(data.otpSuccessRate)} />
        <MetricCard label="Pending approvals" value={num.format(data.pendingApprovals)} />
        <MetricCard label="Open reports" value={num.format(data.openReports)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopList title="Top categories" rows={data.topCategories} />
        <TopList title="Top locations" rows={data.topLocations} />
      </div>
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: NameCount[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">{row.name}</span>
              <span className="font-medium text-slate-900">{num.format(row.count)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
