import { create } from 'zustand';

/** Identity summary returned inline by the API on verify/refresh (replaces a GetMe call). */
export interface UserSummary {
  id: string;
  displayName: string;
  isVendor: boolean;
  isAdmin: boolean;
}

/** The full authenticated session as returned by `auth/otp/verify` and `auth/refresh`. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: UserSummary;
}

const STORAGE_KEY = 'tradenaija.session';

/**
 * Persists only the refresh token + user summary (the long-lived, reload-surviving parts).
 * The short-lived access token is kept in memory and re-minted via the refresh flow on reload.
 */
interface PersistedSession {
  refreshToken: string;
  user: UserSummary;
}

function loadPersisted(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

function persist(session: PersistedSession | null): void {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserSummary | null;
  /** True while we hold a refresh token but have not yet minted an access token (e.g. on reload). */
  isHydrating: boolean;
  setSession: (session: Session) => void;
  /** Replaces tokens after a refresh without disrupting the user object. */
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
  finishHydration: () => void;
}

const persisted = loadPersisted();

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: persisted?.refreshToken ?? null,
  user: persisted?.user ?? null,
  isHydrating: persisted !== null,

  setSession: (session) => {
    persist({ refreshToken: session.refreshToken, user: session.user });
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      isHydrating: false,
    });
  },

  updateTokens: (accessToken, refreshToken) => {
    const { user } = get();
    if (user) persist({ refreshToken, user });
    set({ accessToken, refreshToken });
  },

  clear: () => {
    persist(null);
    set({ accessToken: null, refreshToken: null, user: null, isHydrating: false });
  },

  finishHydration: () => set({ isHydrating: false }),
}));

/** Non-reactive accessors for use inside the Axios interceptor (outside React). */
export const authStore = {
  getState: useAuthStore.getState,
};
