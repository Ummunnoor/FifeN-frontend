import type { PriceType } from '@/shared/types/enums';

const ngn = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** Formats a listing price, honouring the "Contact for price" price type. */
export function formatPrice(amount: number, priceType: PriceType): string {
  if (priceType === 'ContactForPrice') return 'Contact for price';
  const value = ngn.format(amount);
  return priceType === 'Negotiable' ? `${value} (Neg.)` : value;
}

const dateFmt = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Date unavailable';

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateFmt.format(date);
}

/** "Lagos" stays "Lagos"; "AkwaIbom" → "Akwa Ibom" for display. Coerces defensively to a string. */
export function humanizeEnum(value: string): string {
  return String(value).replace(/([a-z])([A-Z])/g, '$1 $2');
}
