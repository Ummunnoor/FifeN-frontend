import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { LoadingState } from '@/shared/components/StateViews';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import {
  NIGERIAN_STATES,
  PRICE_TYPES,
  type NigerianState,
  type PriceType,
} from '@/shared/types/enums';
import { humanizeEnum } from '@/shared/lib/format';
import { DiscoveryService } from '@/features/discovery/DiscoveryService';
import { ProductService } from '@/features/product/ProductService';
import { ListingService } from '@/features/listings/ListingService';
import { ImageUploader } from '@/features/listings/components/ImageUploader';

interface FormState {
  title: string;
  description: string;
  priceAmount: string;
  priceType: PriceType;
  categoryId: string;
  size: string;
  color: string;
  state: NigerianState | '';
  city: string;
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', '40', '41', '42', '43', '44', '45', 'Others'];
const COLOR_OPTIONS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Brown', 'Grey', 'Beige', 'Multicolor', 'Others'];

const EMPTY: FormState = {
  title: '',
  description: '',
  priceAmount: '',
  priceType: 'Fixed',
  categoryId: '',
  size: '',
  color: '',
  state: '',
  city: '',
};

/** Create or edit a listing. On create, any selected images are uploaded after the listing exists. */
export function ListingFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [local, setLocal] = useState<Record<string, string>>({});

  const { data: categories } = useApi(() => DiscoveryService.getCategories(), []);
  const { data: existing, isLoading: loadingExisting } = useApi(
    () => (isEdit ? ProductService.getById(id) : Promise.resolve(null)),
    [id],
  );

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description,
        priceAmount: String(existing.priceAmount),
        priceType: existing.priceType,
        categoryId: '', // category id is not in the detail projection; vendor re-selects on edit
        size: existing.size ?? '',
        color: existing.color ?? '',
        state: existing.state,
        city: existing.city,
      });
    }
  }, [existing]);

  const save = useMutation(async (state: FormState) => {
    const payload = {
      title: state.title.trim(),
      description: state.description.trim(),
      priceAmount: Number(state.priceAmount) || 0,
      priceType: state.priceType,
      categoryId: state.categoryId,
      size: state.size || undefined,
      color: state.color || undefined,
      state: state.state as NigerianState,
      city: state.city.trim(),
    };
    if (isEdit) return ListingService.update(id, payload);

    const created = await ListingService.create(payload);
    if (files.length > 0) await ListingService.uploadImages(created.id, files);
    return created;
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.length > 80) e.title = 'Title cannot exceed 80 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    else if (form.description.length > 1000) e.description = 'Description cannot exceed 1000 characters.';
    if (form.priceType !== 'ContactForPrice' && !(Number(form.priceAmount) > 0))
      e.priceAmount = 'Price must be greater than ₦0.';
    if (!form.categoryId) e.categoryId = 'A category is required.';
    if (!form.state) e.state = 'A valid Nigerian state is required.';
    if (!form.city.trim()) e.city = 'City is required.';
    setLocal(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const result = await save.run(form);
    // A probation vendor's new/edited listing is held for moderation (status Unavailable), so the
    // public product page would 404. Only jump to the public page when it's actually Live; otherwise
    // return to My Listings, where all statuses are visible.
    navigate(result.status === 'Live' ? `/products/${result.id}` : '/vendor/listings');
  }

  const err = (field: string) => save.error?.fieldError(field) ?? local[field];

  if (isEdit && loadingExisting) return <LoadingState />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={isEdit ? 'Edit listing' : 'New listing'} />
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input label="Title" value={form.title} maxLength={80} onChange={(e) => set('title', e.target.value)} error={err('title')} />
          <Textarea
            label="Description"
            rows={4}
            maxLength={1000}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            error={err('description')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Price type"
              value={form.priceType}
              onChange={(e) => set('priceType', e.target.value as PriceType)}
              options={PRICE_TYPES.map((p) => ({ value: p, label: humanizeEnum(p) }))}
            />
            <Input
              label="Price (₦)"
              type="number"
              inputMode="numeric"
              min={0}
              disabled={form.priceType === 'ContactForPrice'}
              value={form.priceAmount}
              onChange={(e) => set('priceAmount', e.target.value)}
              error={err('priceAmount')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              placeholder="Select a category"
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
              error={err('categoryId')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Size"
              placeholder="Select Size"
              value={form.size}
              onChange={(e) => set('size', e.target.value)}
              options={SIZE_OPTIONS.map((size) => ({ value: size, label: size }))}
            />
            <Select
              label="Color"
              placeholder="Select Color"
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              options={COLOR_OPTIONS.map((color) => ({ value: color, label: color }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="State"
              placeholder="Select a state"
              value={form.state}
              onChange={(e) => set('state', e.target.value as NigerianState)}
              options={NIGERIAN_STATES.map((s) => ({ value: s, label: humanizeEnum(s) }))}
              error={err('state')}
            />
            <Input label="City" value={form.city} maxLength={80} onChange={(e) => set('city', e.target.value)} error={err('city')} />
          </div>

          {!isEdit && <ImageUploader files={files} onChange={setFiles} />}

          {save.error && Object.keys(save.error.fieldErrors).length === 0 && (
            <p role="alert" className="text-sm text-red-600">
              {save.error.detail}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={save.isLoading}>
              {isEdit ? 'Save changes' : 'Publish listing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
