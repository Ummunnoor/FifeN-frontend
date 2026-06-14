import { useState, type FormEvent } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useMutation } from '@/shared/hooks/useApi';
import { VendorService } from '@/features/vendor/VendorService';

/** Vendor self-service profile. Currently the editable WhatsApp number (PDR §2.10). */
export function VendorProfilePage() {
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [saved, setSaved] = useState(false);
  const { run, isLoading, error } = useMutation(VendorService.updateProfile);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    if (!whatsAppNumber.trim()) return;
    await run({ whatsAppNumber: whatsAppNumber.trim() });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Vendor profile" description="Update the WhatsApp number buyers reach you on." />
      <Card className="p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="WhatsApp number"
            type="tel"
            placeholder="0801 234 5678"
            value={whatsAppNumber}
            onChange={(e) => {
              setWhatsAppNumber(e.target.value);
              setSaved(false);
            }}
            error={error?.fieldError('whatsAppNumber') ?? (error?.detail && Object.keys(error.fieldErrors).length === 0 ? error.detail : undefined)}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={isLoading}>
              Save changes
            </Button>
            {saved && (
              <Badge tone="success">
                <CheckCircleIcon className="h-4 w-4" /> Saved
              </Badge>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
