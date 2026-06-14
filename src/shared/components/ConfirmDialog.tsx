import type { ReactNode } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import type { ApiError } from '@/shared/lib/apiError';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
  error?: ApiError | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** Reusable confirm prompt for actions; surfaces an inline API error if the action fails. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
  isLoading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-slate-600">{message}</div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error.detail}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={variant} fullWidth onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
