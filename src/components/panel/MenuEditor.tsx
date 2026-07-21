"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import { CategoryDialog } from "@/components/panel/CategoryDialog";
import { DishDialog } from "@/components/panel/DishDialog";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import {
  deleteCategory,
  deleteDish,
  updateDish,
  type Dish,
  type MenuCategory,
} from "@/lib/api";
import { menuQueryKey, useMenu } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

type DialogState =
  | { kind: "none" }
  | { kind: "category"; category?: MenuCategory }
  | { kind: "dish"; categoryId: number; dish?: Dish };

export function MenuEditor({
  locale,
  establishmentId,
  currency,
}: {
  locale: Locale;
  establishmentId: number;
  currency: string;
}) {
  const copy = menuByLocale[locale];
  const queryClient = useQueryClient();
  const { data: categories, isPending, error } = useMenu(establishmentId);

  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: menuQueryKey(establishmentId) });

  /*
   * The stop list is sold as one tap, so it cannot wait on a round trip:
   * flip the dish in the cache immediately and reconcile afterwards. A
   * waiter marking a dish as run out during service is on venue wifi.
   */
  const toggleStop = useMutation({
    mutationFn: (dish: Dish) =>
      updateDish(establishmentId, dish.id, { is_available: !dish.is_available }, locale),

    onMutate: async (dish: Dish) => {
      const key = menuQueryKey(establishmentId);
      // Stop an in-flight refetch from landing on top of the optimistic edit.
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (categories) =>
        categories?.map((category) => ({
          ...category,
          dishes: category.dishes?.map((item) =>
            item.id === dish.id ? { ...item, is_available: !item.is_available } : item,
          ),
        })),
      );

      return { previous };
    },

    onError: (_error, _dish, context) => {
      // Put the menu back rather than leaving a lie on screen.
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  const removeDish = useMutation({
    mutationFn: (id: number) => deleteDish(establishmentId, id),
    onSuccess: invalidate,
  });

  const removeCategory = useMutation({
    mutationFn: (id: number) => deleteCategory(establishmentId, id),
    onSuccess: invalidate,
  });

  if (isPending) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-surface-2" />;
  }

  if (error) {
    // A venue that is not yours answers 404 — say so instead of an empty menu.
    return (
      <p className="rounded-[20px] border border-border bg-white p-6 text-muted">
        {String(error instanceof Error ? error.message : error)}
      </p>
    );
  }

  const list = categories ?? [];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={() => setDialog({ kind: "category" })}
          className="py-2.5 text-[15px]"
        >
          <FolderPlus size={17} />
          {copy.addCategory}
        </Button>
        <Link
          href={`/${locale}/dashboard`}
          className="text-[15px] font-semibold text-muted transition-colors hover:text-foreground"
        >
          ← {copy.backToVenues}
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border-strong bg-white/60 p-10 text-center">
          <p className="text-[17px] font-bold">{copy.empty}</p>
          <p className="mt-1.5 text-[15px] text-muted">{copy.emptyHint}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        {list.map((category) => (
          <section
            key={category.id}
            className="rounded-[20px] border border-border bg-white p-5"
          >
            <header className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">
                {category.name_ru}
              </h2>
              {category.name_kk ? (
                <span className="text-[15px] text-muted-soft">· {category.name_kk}</span>
              ) : null}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setDialog({ kind: "dish", categoryId: category.id })}
                  className="px-3 py-2 text-sm"
                >
                  <Plus size={15} />
                  {copy.addDish}
                </Button>

                <IconButton
                  label={copy.editCategory}
                  onClick={() => setDialog({ kind: "category", category })}
                >
                  <Pencil size={15} />
                </IconButton>

                <IconButton
                  label={copy.deleteCategory}
                  danger
                  onClick={() => {
                    if (window.confirm(copy.deleteCategoryConfirm)) {
                      removeCategory.mutate(category.id);
                    }
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </header>

            {(category.dishes ?? []).length === 0 ? (
              <p className="py-2 text-[15px] text-muted-soft">{copy.noDishes}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {(category.dishes ?? []).map((dish) => (
                  <li
                    key={dish.id}
                    className={`flex flex-wrap items-center gap-3 py-3 ${
                      dish.is_available ? "" : "opacity-60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{dish.name_ru}</span>
                        {!dish.is_available ? (
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                            {copy.outOfStockBadge}
                          </span>
                        ) : null}
                      </div>
                      {dish.description_ru ? (
                        <p className="truncate text-sm text-muted-soft">
                          {dish.description_ru}
                        </p>
                      ) : null}
                    </div>

                    <span className="whitespace-nowrap font-extrabold text-accent-hover">
                      {formatPrice(dish.price, currency)}
                    </span>

                    {/* Point of the stop list: one tap, no dialog. */}
                    <IconButton
                      label={dish.is_available ? copy.outOfStock : copy.inStock}
                      onClick={() => toggleStop.mutate(dish)}
                    >
                      {dish.is_available ? <Ban size={15} /> : <Check size={15} />}
                    </IconButton>

                    <IconButton
                      label={copy.editDish}
                      onClick={() =>
                        setDialog({ kind: "dish", categoryId: category.id, dish })
                      }
                    >
                      <Pencil size={15} />
                    </IconButton>

                    <IconButton
                      label={copy.deleteDish}
                      danger
                      onClick={() => {
                        if (window.confirm(copy.deleteDishConfirm)) {
                          removeDish.mutate(dish.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {dialog.kind === "category" ? (
        <CategoryDialog
          locale={locale}
          establishmentId={establishmentId}
          category={dialog.category}
          onClose={() => setDialog({ kind: "none" })}
        />
      ) : null}

      {dialog.kind === "dish" ? (
        <DishDialog
          locale={locale}
          establishmentId={establishmentId}
          categories={list}
          categoryId={dialog.categoryId}
          dish={dialog.dish}
          onClose={() => setDialog({ kind: "none" })}
        />
      ) : null}
    </>
  );
}

function IconButton({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-strong text-muted transition-colors ${
        danger
          ? "hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          : "hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
