import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLogout } from '@/features/auth/useLogout';
import { Button } from '@/shared/components/Button';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { cn } from '@/shared/lib/cn';

interface NavItem {
  to: string;
  label: string;
  show: boolean;
}

/**
 * Top navigation. Items are gated by the cached user flags — `isVendor` for the vendor area,
 * `isAdmin` for the admin area (PDR §3.2). These gates are cosmetic; the API re-checks every call.
 */
export function AppHeader() {
  const { isAuthenticated, isVendor, isAdmin, user } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = [
    { to: '/', label: 'Browse', show: true },
    { to: '/vendor/apply', label: 'Sell on TradeNaija', show: isAuthenticated && !isVendor },
    { to: '/vendor/listings', label: 'My listings', show: isVendor },
    { to: '/vendor/leads', label: 'Leads', show: isVendor },
    { to: '/vendor/profile', label: 'Profile', show: isVendor },
    { to: '/notifications', label: 'Notifications', show: isAuthenticated },
    { to: '/admin', label: 'Admin', show: isAdmin },
  ];
  const visible = items.filter((i) => i.show);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-sm font-bold text-white">
              TN
            </span>
            <span className="text-lg font-semibold text-slate-900">TradeNaija</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {visible.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent-50 text-accent-700' : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <span className="text-sm text-slate-600">{user?.displayName}</span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 px-4 py-3 md:hidden">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-accent-50 text-accent-700' : 'text-slate-700 hover:bg-slate-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <Button variant="secondary" size="sm" fullWidth onClick={logout}>
                Sign out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button size="sm" fullWidth>
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
