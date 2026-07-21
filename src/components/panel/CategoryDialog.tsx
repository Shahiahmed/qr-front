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
  createCategory,
  updateCategory,
  type MenuCategory,
  type ValidationErrors,
} from "@/lib/api";
import { menuQueryKey } from "@/lib/menu";

export function CategoryDialog({
  locale,
  establishmentId,
  category,
  onClose,
}: {
  locale: Locale;
  establishmentId: number;
  category?: MenuCategory;
  onClose: () => void;
}) {
  const copy = menuByLocale[locale];
  const auth = authByLocale[locale];
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    name_ru: category?.name_ru ?? "",
    name_kk: category?.name_kk ?? "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: typeof values) =>
      category
        ? updateCategory(establishmentId, category.id, payload, locale)
        : createCategory(establishmentId, payload, locale),
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

  function update(field: keyof typeof values, value: string) {
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
    mutation.mutate(values);
  }

  const title = category ? copy.editCategory : copy.addCategory;

  return (
    <Modal label={title} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <Field
          label={copy.categoryNameRu}
          name="name_ru"
          required
          placeholder="Горячее"
          value={values.name_ru}
          errors={errors.name_ru}
          onChange={(e) => update("name_ru", e.target.value)}
        />

        <Field
          label={copy.categoryNameKk}
          name="name_kk"
          hint={copy.kkOptional}
          placeholder="Ыстық"
          value={values.name_kk ?? ""}
          errors={errors.name_kk}
          onChange={(e) => update("name_kk", e.target.value)}
        />

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
            {mutation.isPending ? copy.saving : category ? copy.save : copy.add}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
