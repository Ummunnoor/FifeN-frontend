import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import {
  NIGERIAN_STATES,
  type NigerianState,
  type ProductSort,
} from '@/shared/types/enums';
import { humanizeEnum } from '@/shared/lib/format';
import type { CategoryResponse, ProductQuery } from '@/features/discovery/discovery.types';

interface DiscoveryFiltersProps {
  categories: CategoryResponse[];
  value: ProductQuery;
  onChange: (next: ProductQuery) => void;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

// Keep these lists local and easy to extend as the marketplace catalogue grows.
const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '40', '41', '42', '43', '44', 'Free Size',
];
const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Brown', 'Grey', 'Multicolor',
];

/**
 * The discovery filter panel. Search text is debounced; structured filters apply immediately.
 * Every change resets to page 1 (handled by the parent merging `page: 1`).
 */
export function DiscoveryFilters({ categories, value, onChange }: DiscoveryFiltersProps) {
  const [search, setSearch] = useState(value.q ?? '');

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if ((value.q ?? '') !== search) onChange({ ...value, q: search || undefined, page: 1 });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function set<K extends keyof ProductQuery>(key: K, v: ProductQuery[K]) {
    onChange({ ...value, [key]: v || undefined, page: 1 });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="Search listings"
          placeholder="Search listings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        label="Category"
        placeholder="All categories"
        value={value.categoryId ?? ''}
        onChange={(e) => set('categoryId', e.target.value)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />

      <Select
        label="State"
        placeholder="All states"
        value={value.state ?? ''}
        onChange={(e) => set('state', e.target.value as NigerianState)}
        options={NIGERIAN_STATES.map((s) => ({ value: s, label: humanizeEnum(s) }))}
      />

      <Input
        label="City"
        placeholder="e.g. Ikeja"
        value={value.city ?? ''}
        onChange={(e) => set('city', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min price"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="₦"
          value={value.minPrice ?? ''}
          onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Max price"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="₦"
          value={value.maxPrice ?? ''}
          onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <Select
        label="Size"
        placeholder="All sizes"
        value={value.size ?? ''}
        onChange={(e) => set('size', e.target.value)}
        options={SIZE_OPTIONS.map((size) => ({ value: size, label: size }))}
      />

      <Select
        label="Color"
        placeholder="All colors"
        value={value.color ?? ''}
        onChange={(e) => set('color', e.target.value)}
        options={COLOR_OPTIONS.map((color) => ({ value: color, label: color }))}
      />

      <Select
        label="Sort by"
        value={value.sort ?? 'recent'}
        onChange={(e) => set('sort', e.target.value as ProductSort)}
        options={SORT_OPTIONS}
      />

      <Button
        variant="ghost"
        fullWidth
        size="sm"
        onClick={() => {
          setSearch('');
          onChange({ sort: 'recent', page: 1, pageSize: value.pageSize });
        }}
      >
        Clear filters
      </Button>
    </div>
  );
}
