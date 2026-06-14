import { AxiosError } from 'axios';
import type { ProblemDetails } from '@/shared/types/api.types';

/**
 * A normalized, throwable representation of any failed API call. Wraps the backend's RFC 7807
 * ProblemDetails so UI code can branch on `status`, surface `detail`, and map `fieldErrors`
 * inline — without ever touching the raw Axios error.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly traceId?: string;
  /** Field-level validation messages, keyed by camelCased field name. */
  readonly fieldErrors: Record<string, string[]>;

  constructor(params: {
    status: number;
    title: string;
    detail: string;
    traceId?: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(params.detail || params.title);
    this.name = 'ApiError';
    this.status = params.status;
    this.title = params.title;
    this.detail = params.detail;
    this.traceId = params.traceId;
    this.fieldErrors = params.fieldErrors ?? {};
  }

  /** The first message for a given form field (case-insensitive), if any. */
  fieldError(field: string): string | undefined {
    const key = Object.keys(this.fieldErrors).find(
      (k) => k.toLowerCase() === field.toLowerCase(),
    );
    return key ? this.fieldErrors[key]?.[0] : undefined;
  }

  /** Builds an ApiError from a thrown Axios error (or any unknown). */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof AxiosError) {
      const problem = error.response?.data as ProblemDetails | undefined;
      const status = error.response?.status ?? 0;

      if (status === 0) {
        return new ApiError({
          status: 0,
          title: 'Network error',
          detail: 'Could not reach the server. Check your connection and try again.',
        });
      }

      return new ApiError({
        status,
        title: problem?.title ?? 'Request failed',
        detail: problem?.detail ?? error.message,
        traceId: problem?.traceId,
        fieldErrors: normalizeFieldErrors(problem?.errors),
      });
    }

    return new ApiError({
      status: 0,
      title: 'Unexpected error',
      detail: error instanceof Error ? error.message : 'Something went wrong.',
    });
  }
}

/** Lowercases the first letter of each PascalCase key so `PhoneNumber` matches a `phoneNumber` field. */
function normalizeFieldErrors(
  errors: Record<string, string[]> | undefined,
): Record<string, string[]> {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      messages,
    ]),
  );
}
