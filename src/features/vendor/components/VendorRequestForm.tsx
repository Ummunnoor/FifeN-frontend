import { useState, type FormEvent } from 'react';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useMutation } from '@/shared/hooks/useApi';
import type { VerificationMethod } from '@/shared/types/enums';
import { VendorService } from '@/features/vendor/VendorService';
import type { VendorRequestResponse } from '@/features/vendor/vendor.types';

const METHODS: { value: VerificationMethod; label: string }[] = [
  { value: 'Nin', label: 'NIN (National Identity Number)' },
  { value: 'Cac', label: 'CAC (Business Registration)' },
];

/** Onboarding form. Mirrors the backend validators (PDR §2.9). */
export function VendorRequestForm({ onSubmitted }: { onSubmitted: (r: VendorRequestResponse) => void }) {
  const [businessName, setBusinessName] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('Nin');
  const [identifierToken, setIdentifierToken] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});

  const { run, isLoading, error } = useMutation(VendorService.submitRequest);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (businessName.trim().length < 2) next.businessName = 'Business name is required (min 2 characters).';
    if (businessName.trim().length > 160) next.businessName = 'Business name cannot exceed 160 characters.';
    if (!whatsAppNumber.trim()) next.whatsAppNumber = 'A WhatsApp number is required.';
    if (identifierToken.trim().length < 7) next.identifierToken = 'The identity number appears invalid.';
    setLocal(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const result = await run({
      businessName: businessName.trim(),
      whatsAppNumber: whatsAppNumber.trim(),
      method,
      identifierToken: identifierToken.trim(),
    });
    onSubmitted(result);
  }

  const err = (field: string) => error?.fieldError(field) ?? local[field];

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          error={err('businessName')}
          maxLength={160}
        />
        <Input
          label="WhatsApp number"
          type="tel"
          placeholder="0801 234 5678"
          value={whatsAppNumber}
          onChange={(e) => setWhatsAppNumber(e.target.value)}
          error={err('whatsAppNumber')}
          hint="Buyers will reach you here after expressing interest."
        />
        <Select
          label="Verification method"
          value={method}
          onChange={(e) => setMethod(e.target.value as VerificationMethod)}
          options={METHODS}
          error={err('method')}
        />
        <Input
          label={method === 'Nin' ? 'NIN' : 'CAC number'}
          value={identifierToken}
          onChange={(e) => setIdentifierToken(e.target.value)}
          error={err('identifierToken')}
          hint="Used for one-time identity verification — never stored."
        />

        {error && Object.keys(error.fieldErrors).length === 0 && (
          <p role="alert" className="text-sm text-red-600">
            {error.detail}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth isLoading={isLoading}>
          Submit application
        </Button>
      </form>
    </Card>
  );
}
