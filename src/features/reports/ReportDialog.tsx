import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/shared/components/Modal';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { REPORT_REASONS, type ReportReason, type ReportTargetType } from '@/shared/types/enums';
import { humanizeEnum } from '@/shared/lib/format';
import { ReportService } from '@/features/reports/ReportService';

interface ReportDialogProps {
  open: boolean;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  onClose: () => void;
}

/**
 * Reusable report dialog for a listing, vendor, or review (PDR §2.7). Unauthenticated users are
 * redirected to login; on success it shows a brief confirmation then closes.
 */
export function ReportDialog({ open, targetType, targetId, targetLabel, onClose }: ReportDialogProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState<ReportReason>('Prohibited');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const { run, isLoading, error, reset } = useMutation(ReportService.create);

  if (open && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  function close() {
    reset();
    setNote('');
    setReason('Prohibited');
    setDone(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await run({ targetType, targetId, reason, note: note.trim() || undefined });
    setDone(true);
  }

  return (
    <Modal open={open} title={`Report ${targetType.toLowerCase()}`} onClose={close}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircleIcon className="h-10 w-10 text-accent-600" />
          <p className="text-sm text-slate-600">
            Thanks for the report. Our team will review it.
          </p>
          <Button onClick={close}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {targetLabel && (
            <p className="text-sm text-slate-600">
              Reporting <span className="font-medium text-slate-900">{targetLabel}</span>.
            </p>
          )}
          <Select
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            options={REPORT_REASONS.map((r) => ({ value: r, label: humanizeEnum(r) }))}
            error={error?.fieldError('reason')}
          />
          <Textarea
            label="Details (optional)"
            rows={3}
            maxLength={500}
            placeholder="Tell us what's wrong…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={error?.fieldError('note')}
          />
          {error && Object.keys(error.fieldErrors).length === 0 && (
            <p role="alert" className="text-sm text-red-600">
              {error.detail}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={close}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Submit report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
