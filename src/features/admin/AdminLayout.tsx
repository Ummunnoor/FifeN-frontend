import { Outlet } from 'react-router-dom';
import { SubNav, type SubNavItem } from '@/shared/components/SubNav';

const ADMIN_TABS: SubNavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/vendors', label: 'Vendor requests' },
  { to: '/admin/listings', label: 'Listings' },
  { to: '/admin/reports', label: 'Reports' },
];

/** Admin shell: a sub-navigation across the moderation tools, plus the routed admin page. */
export function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Admin</h1>
      <SubNav items={ADMIN_TABS} />
      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  );
}
