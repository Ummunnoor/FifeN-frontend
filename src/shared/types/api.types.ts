/** Cross-cutting API contract types shared by every feature service. */

/** A single page of results. Note: the API sends `total` (item count), not a page count. */
export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** RFC 7807 error body returned by the backend on every non-2xx response. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  /** Present only on 400 validation failures; keyed by PascalCase DTO property name. */
  errors?: Record<string, string[]>;
}

/** Standard pagination request params. */
export interface PageParams {
  page?: number;
  pageSize?: number;
}
