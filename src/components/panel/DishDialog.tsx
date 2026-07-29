"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { ImageCropper } from "@/components/panel/ImageCropper";
import { Modal } from "@/components/panel/Modal";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import {
  ApiError,
  createDish,
  deleteDishImage,
  updateDish,
  uploadDishImage,
  type Dish,
  type MenuCategory,
  type ValidationErrors,
} from "@/lib/api";
import { menuQueryKey } from "@/lib/menu";
import { toMajorUnits, toMinorUnits } from "@/lib/money";

/** Reject an oversized source before we try to decode it in the browser. */
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;

export function DishDialog({
  locale,
  establishmentId,
  categories,
  categoryId,
  dish,
  onClose,
}: {
  locale: Locale;
  establishmentId: number;
  categories: MenuCategory[];
  /** Section the dish is being added to. */
  categoryId: number;
  dish?: Dish;
  onClose: () => void;
}) {
  const copy = menuByLocale[locale];
  const auth = authByLocale[locale];
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    menu_category_id: dish?.menu_category_id ?? categoryId,
    name_ru: dish?.name_ru ?? "",
    name_kk: dish?.name_kk ?? "",
    description_ru: dish?.description_ru ?? "",
    description_kk: dish?.description_kk ?? "",
    // Shown in tenge; converted on submit.
    price: dish ? toMajorUnits(dish.price) : "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Photo state. A staged blob is a freshly cropped image not yet uploaded (the
  // upload waits until the dish is saved — a new dish has no id before then).
  // `photoRemoved` marks an existing photo for deletion on save.
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [stagedBlob, setStagedBlob] = useState<Blob | null>(null);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // The preview URL is created in the handler that stages the blob; this just
  // frees it when it is replaced or the dialog unmounts.
  useEffect(() => {
    if (!stagedUrl) return;
    return () => URL.revokeObjectURL(stagedUrl);
  }, [stagedUrl]);

  const photoUrl = stagedUrl ?? (photoRemoved ? null : dish?.image_url ?? null);

  const mutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createDish>[1]) => {
      const saved = dish
        ? await updateDish(establishmentId, dish.id, payload, locale)
        : await createDish(establishmentId, payload, locale);

      // Photo side-effects run against the saved dish's id (which a brand-new
      // dish only gets here). A staged crop wins over a removal.
      if (stagedBlob) {
        await uploadDishImage(establishmentId, saved.id, stagedBlob, locale);
      } else if (dish && photoRemoved && dish.image_url) {
        await deleteDishImage(establishmentId, saved.id, locale);
      }

      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey(establishmentId) });
      onClose();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setFormError(error.isValidation ? null : error.message);
        return;
      }
      setFormError(auth.networkError);
    },
  });

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_SOURCE_BYTES) {
      setPhotoError(copy.imageTooBig);
      return;
    }

    setPhotoError(null);
    setCropFile(file);
  }

  function onCropped(blob: Blob) {
    setStagedBlob(blob);
    setStagedUrl(URL.createObjectURL(blob));
    setPhotoRemoved(false);
    setCropFile(null);
  }

  function removePhoto() {
    setStagedBlob(null);
    setStagedUrl(null);
    setPhotoRemoved(true);
    setPhotoError(null);
  }

  function update(field: keyof typeof values, value: string | number) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const price = toMinorUnits(values.price);

    if (price === null) {
      // Caught here rather than sent: the API would answer in terms of тиыны,
      // which is not what the owner typed.
      setErrors({ price: [copy.dishPriceHint] });
      return;
    }

    mutation.mutate({
      menu_category_id: Number(values.menu_category_id),
      name_ru: values.name_ru,
      name_kk: values.name_kk || null,
      description_ru: values.description_ru || null,
      description_kk: values.description_kk || null,
      price,
    });
  }

  const title = dish ? copy.editDish : copy.addDish;

  // While cropping, show only the cropper: the form's values live in component
  // state, so they survive the swap and reappear when the crop is done.
  if (cropFile) {
    return (
      <ImageCropper
        file={cropFile}
        title={copy.cropTitle}
        hint={copy.cropHint}
        zoomLabel={copy.cropZoom}
        applyLabel={copy.cropApply}
        cancelLabel={copy.cancel}
        onCancel={() => setCropFile(null)}
        onDone={onCropped}
      />
    );
  }

  return (
    <Modal label={title} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{copy.dishPhoto}</span>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob/remote preview, not an optimizable asset
              <img
                src={photoUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-muted-soft">
                <ImagePlus size={22} aria-hidden />
              </div>
            )}
            <div className="flex flex-col items-start gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-accent hover:bg-accent/10"
              >
                {photoUrl ? copy.changePhoto : copy.addPhoto}
              </button>
              {photoUrl ? (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  {copy.removePhoto}
                </button>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-muted-soft">{copy.dishPhotoHint}</p>
          {photoError ? <p className="text-sm text-red-700">{photoError}</p> : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />
        </div>

        <Field
          label={copy.dishNameRu}
          name="name_ru"
          required
          placeholder="Плов ташкентский"
          value={values.name_ru}
          errors={errors.name_ru}
          onChange={(e) => update("name_ru", e.target.value)}
        />

        <Field
          label={copy.dishNameKk}
          name="name_kk"
          hint={copy.kkOptional}
          placeholder="Ташкент палауы"
          value={values.name_kk ?? ""}
          errors={errors.name_kk}
          onChange={(e) => update("name_kk", e.target.value)}
        />

        <Field
          label={copy.dishPrice}
          name="price"
          required
          inputMode="decimal"
          hint={copy.dishPriceHint}
          placeholder="2490"
          value={values.price}
          errors={errors.price}
          onChange={(e) => update("price", e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dish-category" className="text-sm font-semibold">
            {copy.dishCategory}
          </label>
          <select
            id="dish-category"
            value={values.menu_category_id}
            onChange={(e) => update("menu_category_id", Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_ru}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dish-desc" className="text-sm font-semibold">
            {copy.dishDescRu}
          </label>
          <textarea
            id="dish-desc"
            rows={2}
            value={values.description_ru ?? ""}
            onChange={(e) => update("description_ru", e.target.value)}
            className="w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dish-desc-kk" className="text-sm font-semibold">
            {copy.dishDescKk}
          </label>
          <textarea
            id="dish-desc-kk"
            rows={2}
            value={values.description_kk ?? ""}
            onChange={(e) => update("description_kk", e.target.value)}
            className="w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          <p className="text-sm text-muted-soft">{copy.kkOptional}</p>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full py-3 sm:w-auto sm:px-7"
          >
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
            className="w-full py-3 sm:w-auto sm:px-7"
          >
            {mutation.isPending ? copy.saving : dish ? copy.save : copy.add}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
