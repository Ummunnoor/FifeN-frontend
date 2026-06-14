import { Link } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

/**
 * Shown when an admin endpoint returns 403 because the session lacks the `amr=mfa` claim — i.e. the
 * admin hasn't enrolled (or refreshed after enrolling) two-factor authentication (PDR §2.13, §3.1).
 */
export function AdminMfaRequired() {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <LockClosedIcon className="h-10 w-10 text-accent-600" />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Two-factor authentication required</h2>
        <p className="mt-1 text-sm text-slate-600">
          The admin area needs an active second factor. Set it up, then sign in again to continue.
        </p>
      </div>
      <Link to="/admin/mfa">
        <Button>Set up two-factor auth</Button>
      </Link>
    </Card>
  );
}
