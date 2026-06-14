import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

type Role = 'vendor' | 'admin';

/**
 * Route guard for role-restricted areas. Unauthenticated users go to login; authenticated users
 * lacking the role are sent home. These gates are cosmetic — the API enforces every rule, and
 * admin pages additionally require the `amr=mfa` claim (handled by surfacing a 403 in-page).
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { isAuthenticated, isVendor, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const allowed = role === 'vendor' ? isVendor : isAdmin;
  if (!allowed) return <Navigate to="/" replace />;

  return <>{children}</>;
}
