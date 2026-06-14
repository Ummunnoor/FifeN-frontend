import { Link } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/shared/components/Badge';
import { StarRating } from '@/shared/components/StarRating';
import { formatPrice, humanizeEnum } from '@/shared/lib/format';
import type { ProductSummary } from '@/features/discovery/discovery.types';

/** A single listing tile in the discovery grid. */
export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {product.coverUrl ? (
          <img
            src={product.coverUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <PhotoIcon className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{product.title}</h3>
        <p className="text-base font-semibold text-accent-700">
          {formatPrice(product.priceAmount, product.priceType)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-xs text-slate-500">
            {product.city}, {humanizeEnum(product.state)}
          </span>
          {product.averageRating > 0 && <StarRating value={product.averageRating} size="sm" />}
        </div>

        <div className="flex items-center gap-1 border-t border-slate-100 pt-2">
          <span className="truncate text-xs text-slate-600">{product.vendorName}</span>
          {product.vendorVerified && (
            <Badge tone="accent" className="shrink-0">
              <CheckBadgeIcon className="h-3.5 w-3.5" /> Verified
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
