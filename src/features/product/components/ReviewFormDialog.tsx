import { useState, type FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Textarea } from '@/shared/components/Textarea';
import { Button } from '@/shared/components/Button';
import { StarRating } from '@/shared/components/StarRating';
import { FieldError } from '@/shared/components/FieldError';
import { useMutation } from '@/shared/hooks/useApi';
import { ProductService } from '@/features/product/ProductService';

interface ReviewFormDialogProps {
  productId: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

/**
 * New-review dialog. Reviews are interaction-gated server-side (must have contacted the vendor ≥48h
 * ago, one per buyer/product), so eligibility surfaces as a 422/409 on submit (PDR §2.5).
 */
export function ReviewFormDialog({ productId, open, onClose, onSubmitted }: ReviewFormDialogProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [ratingError, setRatingError] = useState<string>();
  const { run, isLoading, error, reset } = useMutation(ProductService.createReview);

  function close() {
    reset();
    setRating(0);
    setText('');
    setRatingError(undefined);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      setRatingError('Please pick a rating from 1 to 5.');
      return;
    }
    setRatingError(undefined);
    await run(productId, { rating, text: text.trim() || undefined });
    onSubmitted();
    close();
  }

  // 409 means the buyer has already reviewed this listing; surface a clearer message.
  const conflict = error?.status === 409;

  return (
    <Modal open={open} title="Write a review" onClose={close}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Your rating</span>
          <StarRating value={rating} onChange={setRating} size="lg" />
          <FieldError message={ratingError} />
        </div>

        <Textarea
          label="Review (optional)"
          rows={4}
          maxLength={500}
          placeholder="Share your experience with this vendor…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error?.fieldError('text')}
        />

        {error && Object.keys(error.fieldErrors).length === 0 && (
          <p role="alert" className="text-sm text-red-600">
            {conflict ? 'You have already reviewed this listing.' : error.detail}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Submit review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
