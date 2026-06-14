import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Reactive view of the current session for components: the user summary plus derived role flags.
 * Security is enforced by the API; these flags only drive what UI we show (PDR §3).
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  return {
    user,
    isAuthenticated: refreshToken !== null,
    isVendor: user?.isVendor ?? false,
    isAdmin: user?.isAdmin ?? false,
    isHydrating,
  };
}
