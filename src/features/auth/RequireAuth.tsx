import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Route guard for authenticated pages. Presence of a refresh token counts as authenticated — on a
 * fresh reload the access token is re-minted lazily by the API interceptor on the first 401.
 * Unauthenticated users are sent to login with a `next` param so they return after signing in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
