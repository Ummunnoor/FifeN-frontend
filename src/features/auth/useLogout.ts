import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { AuthService } from '@/features/auth/AuthService';
import { useNotificationStore } from '@/features/notifications/notificationStore';

/**
 * Logs the user out: best-effort server revoke, then clears local session and redirects to login.
 * The server call is fire-and-forget — local state is cleared regardless so the UI never gets stuck.
 */
export function useLogout() {
  const navigate = useNavigate();

  return useCallback(async () => {
    const { refreshToken, clear } = useAuthStore.getState();
    if (refreshToken) {
      try {
        await AuthService.logout(refreshToken);
      } catch {
        // Ignore — we clear locally regardless.
      }
    }
    clear();
    useNotificationStore.getState().reset();
    navigate('/login', { replace: true });
  }, [navigate]);
}
