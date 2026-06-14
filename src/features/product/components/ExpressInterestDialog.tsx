import { useState, type FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Textarea } from '@/shared/components/Textarea';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { ProductService } from '@/features/product/ProductService';

interface ExpressInterestDialogProps {
  productId: string;
  productTitle: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Captures the buyer lead, then hands off to WhatsApp. The lead is recorded server-side before the
 * wa.me link is returned, so on success we open the link in a new tab (PDR §2.4).
 */
export function ExpressInterestDialog({ productId, productTitle, open, onClose }: ExpressInterestDialogProps) {
  const [message, setMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const { run, isLoading, error, reset } = useMutation(ProductService.expressInterest);

  function close() {
    reset();
    setMessage('');
    setOfferPrice('');
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { whatsAppUrl } = await run(productId, {
      message: message.trim() || undefined,
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
    });
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    close();
  }

  return (
    <Modal open={open} title="Contact vendor" onClose={close}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Send a message about <span className="font-medium text-slate-900">{productTitle}</span>. We'll
          open WhatsApp with your message pre-filled.
        </p>

        <Textarea
          label="Message (optional)"
          rows={3}
          maxLength={500}
          placeholder="Hi, is this still available? Can I pick up today?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={error?.fieldError('message')}
        />

        <Input
          label="Your offer (optional)"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="₦"
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
          error={error?.fieldError('offerPrice')}
        />

        {error && !error.fieldError('message') && !error.fieldError('offerPrice') && (
          <p role="alert" className="text-sm text-red-600">
            {error.detail}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Open WhatsApp
          </Button>
        </div>
      </form>
    </Modal>
  );
}
