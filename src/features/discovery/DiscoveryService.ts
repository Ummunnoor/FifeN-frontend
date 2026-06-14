import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type {
  CategoryResponse,
  ProductQuery,
  ProductSummary,
} from '@/features/discovery/discovery.types';

/** Typed gateway for public discovery endpoints (PDR §2.2). */
export const DiscoveryService = {
  /** Searches and filters live listings. Empty params are dropped so the URL stays clean. */
  async search(query: ProductQuery): Promise<PagedResponse<ProductSummary>> {
    const { data } = await api.get<PagedResponse<ProductSummary>>('/products', {
      params: pruneEmpty(query),
    });
    return data;
  },

  /** "New this week" fresh-supply feed. */
  async newThisWeek(
    categoryId: string | undefined,
    page: number,
    pageSize: number,
  ): Promise<PagedResponse<ProductSummary>> {
    const { data } = await api.get<PagedResponse<ProductSummary>>('/products/new', {
      params: pruneEmpty({ categoryId, page, pageSize }),
    });
    return data;
  },

  async getCategories(): Promise<CategoryResponse[]> {
    const { data } = await api.get<CategoryResponse[]>('/categories');
    return data;
  },
};

/** Removes undefined/empty values so Axios doesn't serialize `?q=&state=` noise. */
function pruneEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  ) as Partial<T>;
}
