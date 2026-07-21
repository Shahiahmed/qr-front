"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Modal } from "@/components/panel/Modal";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import {
  ApiError,
  createDish,
  updateDish,
  type Dish,
  type MenuCategory,
  type ValidationErrors,
} from "@/lib/api";
import { menuQueryKey } from "@/lib/menu";
import { toMajorUnits, toMinorUnits } from "@/lib/money";

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

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createDish>[1]) =>
      dish
        ? updateDish(establishmentId, dish.id, payload, locale)
        : createDish(establishmentId, payload, locale),
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

  return (
    <Modal label={title} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

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
