import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/shared/components/AppHeader';

/** Shell for all public/authenticated pages: sticky header + routed content. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <Outlet />
    </div>
  );
}
