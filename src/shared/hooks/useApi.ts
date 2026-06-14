import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/shared/lib/apiError';

interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  /** Re-run the request (e.g. after a filter change or a retry button). */
  reload: () => void;
}

/**
 * Declarative data fetching with built-in loading and error state. Pass a factory that returns the
 * service promise; it re-runs whenever `deps` change. Stale responses are discarded so rapid
 * filter changes never flash old data.
 */
export function useApi<T>(factory: () => Promise<T>, deps: unknown[]): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  // Keep the latest factory without making it a dependency of the effect.
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    factoryRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(ApiError.from(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, isLoading, reload };
}

interface UseMutationResult<TArgs extends unknown[], TResult> {
  run: (...args: TArgs) => Promise<TResult>;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * Imperative companion to {@link useApi} for actions (submit, delete, etc.). Tracks loading + error
 * and surfaces a normalized ApiError. Re-throws so callers can react to success/failure.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
): UseMutationResult<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);
      try {
        return await action(...args);
      } catch (err) {
        const apiError = ApiError.from(err);
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => setError(null), []);

  return { run, isLoading, error, reset };
}
