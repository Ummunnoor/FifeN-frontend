import { useState } from 'react';
import { useApi } from '@/shared/hooks/useApi';
import { LoadingState, ErrorState } from '@/shared/components/StateViews';
import { PageHeader } from '@/shared/components/PageHeader';
import { VendorService } from '@/features/vendor/VendorService';
import { VendorRequestForm } from '@/features/vendor/components/VendorRequestForm';
import { VendorRequestStatusCard } from '@/features/vendor/components/VendorRequestStatusCard';
import type { VendorRequestResponse } from '@/features/vendor/vendor.types';

/**
 * Vendor onboarding. Shows the application form to first-timers and a status panel once applied.
 * A rejected applicant may re-apply (PDR §2.9).
 */
export function BecomeVendorPage() {
  const { data, error, isLoading, reload } = useApi(() => VendorService.getMyRequest(), []);
  const [submitted, setSubmitted] = useState<VendorRequestResponse | null>(null);

  const request = submitted ?? data;
  const showForm = !request || request.status === 'Rejected';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Sell on Trade9ja"
        description="Get verified to list products and receive buyer leads in your Trade9ja inbox."
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          {request && <VendorRequestStatusCard request={request} />}
          {showForm && <VendorRequestForm onSubmitted={setSubmitted} />}
        </div>
      )}
    </div>
  );
}
