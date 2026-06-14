import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-5xl font-bold text-accent-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6">
        <Button>Back to browse</Button>
      </Link>
    </div>
  );
}
