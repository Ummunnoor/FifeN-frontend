import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { formatDate } from '@/shared/lib/format';
import type { VendorRequestResponse, VendorRequestStatus } from '@/features/vendor/vendor.types';

const STATUS_META: Record<
  VendorRequestStatus,
  { tone: 'warning' | 'success' | 'danger'; icon: typeof ClockIcon; title: string; body: string }
> = {
  Pending: {
    tone: 'warning',
    icon: ClockIcon,
    title: 'Application under review',
    body: 'Our team is verifying your details. This usually takes less than 24 hours.',
  },
  Approved: {
    tone: 'success',
    icon: CheckCircleIcon,
    title: "You're a verified vendor",
    body: 'You can now create listings and receive buyer leads.',
  },
  Rejected: {
    tone: 'danger',
    icon: XCircleIcon,
    title: 'Application not approved',
    body: 'Your application could not be verified. You may submit a new application with correct details.',
  },
};

/** Status panel shown after a vendor has applied (PDR §2.9). */
export function VendorRequestStatusCard({ request }: { request: VendorRequestResponse }) {
  const meta = STATUS_META[request.status];
  const Icon = meta.icon;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Icon className="h-8 w-8 shrink-0 text-accent-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{meta.title}</h2>
            <Badge tone={meta.tone}>{request.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">{meta.body}</p>
          <p className="mt-3 text-xs text-slate-400">Submitted {formatDate(request.createdAtUtc)}</p>
        </div>
      </div>
    </Card>
  );
}
