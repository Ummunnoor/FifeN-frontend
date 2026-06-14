import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import { ChatBubbleLeftRightIcon, FlagIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useApi } from '@/shared/hooks/useApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { StarRating } from '@/shared/components/StarRating';
import { LoadingState, ErrorState } from '@/shared/components/StateViews';
import { formatDate, formatPrice, humanizeEnum } from '@/shared/lib/format';
import { ProductService } from '@/features/product/ProductService';
import { ImageGallery } from '@/features/product/components/ImageGallery';
import { ExpressInterestDialog } from '@/features/product/components/ExpressInterestDialog';
import { ReviewList } from '@/features/product/components/ReviewList';
import { ReviewFormDialog } from '@/features/product/components/ReviewFormDialog';
import { ReportDialog } from '@/features/reports/ReportDialog';

/** Public listing detail with gallery, vendor info, reviews, and the WhatsApp lead CTA (PDR §2.3). */
export function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [interestOpen, setInterestOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewReloadKey, setReviewReloadKey] = useState(0);

  const { data: product, error, isLoading, reload } = useApi(
    () => ProductService.getById(id),
    [id],
  );

  if (isLoading) return <LoadingState label="Loading listing…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
        {error.status === 404 && (
          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to browse
            </Button>
          </div>
        )}
      </div>
    );
  }
  if (!product) return null;

  const isOwnListing = product.isOwnListing;

  function handleInterest() {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }
    setInterestOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={product.imageUrls} alt={product.title} />

        <div className="space-y-5">
          <div>
            <Badge tone="neutral">{product.categoryName}</Badge>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{product.title}</h1>
            <p className="mt-2 text-3xl font-bold text-accent-700">
              {formatPrice(product.priceAmount, product.priceType)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {product.city}, {humanizeEnum(product.state)}
            </span>
            <Badge tone="neutral">{product.condition}</Badge>
            {product.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <StarRating value={product.averageRating} size="sm" />
                <span>
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </span>
            )}
          </div>

          <Card className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{product.vendorName}</span>
              {product.vendorVerified && (
                <Badge tone="accent">
                  <CheckBadgeIcon className="h-3.5 w-3.5" /> Verified
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/vendors/${product.vendorId}`)}>
              View shop
            </Button>
          </Card>

          {!isOwnListing && (
            <div className="space-y-2">
              <Button
                size="lg"
                fullWidth
                onClick={handleInterest}
                leftIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
              >
                I'm interested
              </Button>
              <button
                type="button"
                onClick={() => (isAuthenticated ? setReportOpen(true) : navigate('/login'))}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <FlagIcon className="h-4 w-4" /> Report this listing
              </button>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {product.description}
            </p>
          </div>

          <p className="text-xs text-slate-400">Listed {formatDate(product.createdAtUtc)}</p>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
          {!isOwnListing && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PencilSquareIcon className="h-4 w-4" />}
              onClick={() => (isAuthenticated ? setReviewOpen(true) : navigate(`/login?next=${encodeURIComponent(`/products/${id}`)}`))}
            >
              Write a review
            </Button>
          )}
        </div>
        <ReviewList productId={product.id} reloadKey={reviewReloadKey} />
      </section>

      <ExpressInterestDialog
        productId={product.id}
        productTitle={product.title}
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
      />
      <ReviewFormDialog
        productId={product.id}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => setReviewReloadKey((k) => k + 1)}
      />
      <ReportDialog
        open={reportOpen}
        targetType="Listing"
        targetId={product.id}
        targetLabel={product.title}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
