"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  FolderPlus,
  MapPin,
  Palette,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/landing/ui/Button";
import { CategoryDialog } from "@/components/panel/CategoryDialog";
import { DishDialog } from "@/components/panel/DishDialog";
import { RowMenu } from "@/components/panel/RowMenu";
import { VenueDesignPanel } from "@/components/panel/VenueDesignPanel";
import type { Locale } from "@/content/landing";
import { menuByLocale, type MenuCopy } from "@/content/menu";
import {
  applyMenuStarter,
  deleteCategory,
  deleteDish,
  reorderCategories,
  updateDish,
  type Dish,
  type Establishment,
  type MenuCategory,
} from "@/lib/api";
import { menuQueryKey, useMenu } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

type DialogState =
  | { kind: "none" }
  | { kind: "category"; category?: MenuCategory }
  | { kind: "dish"; categoryId: number; dish?: Dish };

type EditorTab = "menu" | "look" | "contacts";

export function MenuEditor({
  locale,
  establishmentId,
  currency,
  slug,
  venue,
}: {
  locale: Locale;
  establishmentId: number;
  currency: string;
  slug?: string;
  /** Loaded lazily from the venue list; design tabs wait on it. */
  venue?: Establishment;
}) {
  const copy = menuByLocale[locale];
  const queryClient = useQueryClient();
  const { data: categories, isPending, error } = useMenu(establishmentId);

  const [tab, setTab] = useState<EditorTab>("menu");
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: menuQueryKey(establishmentId) });

  const fillStarter = useMutation({
    mutationFn: () => applyMenuStarter(establishmentId, locale),
    onSuccess: (menu) => {
      queryClient.setQueryData(menuQueryKey(establishmentId), menu);
    },
  });

  /*
   * The stop list is sold as one tap, so it cannot wait on a round trip:
   * flip the dish in the cache immediately and reconcile afterwards.
   */
  const toggleStop = useMutation({
    mutationFn: (dish: Dish) =>
      updateDish(establishmentId, dish.id, { is_available: !dish.is_available }, locale),

    onMutate: async (dish: Dish) => {
      const key = menuQueryKey(establishmentId);
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
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  const toggleVisible = useMutation({
    mutationFn: (dish: Dish) =>
      updateDish(establishmentId, dish.id, { is_visible: !dish.is_visible }, locale),

    onMutate: async (dish: Dish) => {
      const key = menuQueryKey(establishmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (categories) =>
        categories?.map((category) => ({
          ...category,
          dishes: category.dishes?.map((item) =>
            item.id === dish.id ? { ...item, is_visible: !item.is_visible } : item,
          ),
        })),
      );

      return { previous };
    },

    onError: (_error, _dish, context) => {
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  /*
   * Section order is optimistic like the stop list — the arrows must feel
   * instant. Reorder the cache now, send the new id order, reconcile after.
   */
  const reorder = useMutation({
    mutationFn: (ids: number[]) => reorderCategories(establishmentId, ids, locale),

    onMutate: async (ids: number[]) => {
      const key = menuQueryKey(establishmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (cats) => {
        if (!cats) return cats;
        const byId = new Map(cats.map((c) => [c.id, c]));
        return ids
          .map((id) => byId.get(id))
          .filter((c): c is MenuCategory => Boolean(c));
      });

      return { previous };
    },

    onError: (_error, _ids, context) => {
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

  const list = categories ?? [];

  const moveCategory = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((c) => c.id));
  };

  const tabs: { id: EditorTab; label: string; icon: ReactNode }[] = [
    {
      id: "menu",
      label: copy.tabMenu,
      icon: <UtensilsCrossed size={16} strokeWidth={2.25} />,
    },
    {
      id: "look",
      label: copy.tabLook,
      icon: <Palette size={16} strokeWidth={2.25} />,
    },
    {
      id: "contacts",
      label: copy.tabContacts,
      icon: <MapPin size={16} strokeWidth={2.25} />,
    },
  ];

  return (
    <>
      {/* One header row: which venue on the left, the two real actions on the
          right. The "back" link is dropped — the global "Venues" tab above
          already goes there, and the section is named by the tabs below. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-extrabold tracking-[-0.03em] sm:text-[26px]">
          {venue?.name ?? copy.title}
        </h1>

        <div className="flex items-center gap-2">
          {slug ? (
            <a
              href={`/m/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-[13px] font-bold transition-colors hover:border-foreground"
            >
              {copy.openGuestMenu}
              <ExternalLink size={14} className="text-accent-hover" />
            </a>
          ) : null}
        </div>
      </div>

      <nav
        aria-label={copy.title}
        className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-1 scrollbar-none"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors sm:text-[14px] ${
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {tab === "look" ? (
        venue ? (
          <VenueDesignPanel locale={locale} venue={venue} section="look" />
        ) : (
          <div className="h-48 animate-pulse rounded-[20px] bg-surface-2" />
        )
      ) : null}

      {tab === "contacts" ? (
        venue ? (
          <VenueDesignPanel locale={locale} venue={venue} section="contacts" />
        ) : (
          <div className="h-48 animate-pulse rounded-[20px] bg-surface-2" />
        )
      ) : null}

      {tab === "menu" ? (
        <MenuSections
          copy={copy}
          isPending={isPending}
          error={error}
          list={list}
          currency={currency}
          limits={venue?.menu_limits}
          fillStarter={fillStarter}
          moveCategory={moveCategory}
          onAddCategory={() => setDialog({ kind: "category" })}
          onEditCategory={(category) => setDialog({ kind: "category", category })}
          onDeleteCategory={(id) => {
            if (window.confirm(copy.deleteCategoryConfirm)) {
              removeCategory.mutate(id);
            }
          }}
          onAddDish={(categoryId) => setDialog({ kind: "dish", categoryId })}
          onEditDish={(categoryId, dish) =>
            setDialog({ kind: "dish", categoryId, dish })
          }
          onDeleteDish={(id) => {
            if (window.confirm(copy.deleteDishConfirm)) {
              removeDish.mutate(id);
            }
          }}
          onToggleStop={(dish) => toggleStop.mutate(dish)}
          onToggleVisible={(dish) => toggleVisible.mutate(dish)}
        />
      ) : null}

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

function MenuSections({
  copy,
  isPending,
  error,
  list,
  currency,
  limits,
  fillStarter,
  moveCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddDish,
  onEditDish,
  onDeleteDish,
  onToggleStop,
  onToggleVisible,
}: {
  copy: MenuCopy;
  isPending: boolean;
  error: Error | null;
  list: MenuCategory[];
  currency: string;
  /** Content caps from the effective plan; free tier limits sections/dishes. */
  limits?: { categories: number | null; dishes_per_category: number | null };
  fillStarter: {
    mutate: () => void;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  moveCategory: (index: number, dir: -1 | 1) => void;
  onAddCategory: () => void;
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (id: number) => void;
  onAddDish: (categoryId: number) => void;
  onEditDish: (categoryId: number, dish: Dish) => void;
  onDeleteDish: (id: number) => void;
  onToggleStop: (dish: Dish) => void;
  onToggleVisible: (dish: Dish) => void;
}) {
  if (isPending) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-surface-2" />;
  }

  if (error) {
    return (
      <p className="rounded-[20px] border border-border bg-white p-6 text-muted">
        {String(error.message)}
      </p>
    );
  }

  // Free-tier caps. `null` = unlimited; the button dims and a hint appears when
  // the count reaches the cap (the server is the real gate — see controllers).
  const categoryLimit = limits?.categories ?? null;
  const dishLimit = limits?.dishes_per_category ?? null;
  const categoryLimitReached =
    categoryLimit !== null && list.length >= categoryLimit;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={onAddCategory}
          disabled={categoryLimitReached}
          className="py-2.5 text-[15px]"
        >
          <FolderPlus size={17} />
          {copy.addCategory}
        </Button>
        {categoryLimitReached ? (
          <p className="text-[13px] font-medium text-muted">
            {copy.categoryLimitReached.replace("{n}", String(categoryLimit))}
          </p>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border-strong bg-white/60 p-10 text-center">
          <p className="text-[17px] font-bold">{copy.empty}</p>
          <p className="mx-auto mt-1.5 max-w-md text-[15px] text-muted">
            {copy.emptyHint}
          </p>
          <Button
            variant="primary"
            onClick={() => fillStarter.mutate()}
            disabled={fillStarter.isPending}
            className="mt-5 py-2.5 text-[15px]"
          >
            <Sparkles size={17} />
            {fillStarter.isPending ? copy.fillingStarter : copy.fillStarter}
          </Button>
          {fillStarter.isError ? (
            <p className="mt-3 text-sm text-red-600">
              {fillStarter.error instanceof Error
                ? fillStarter.error.message
                : String(fillStarter.error)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        {list.map((category, index) => {
          const dishCount = (category.dishes ?? []).length;
          const dishLimitReached =
            dishLimit !== null && dishCount >= dishLimit;
          return (
          <section
            key={category.id}
            className="rounded-[20px] border border-border bg-white p-5"
          >
            <header className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <div className="flex shrink-0 flex-col">
                <IconButton
                  label={copy.moveUp}
                  disabled={index === 0}
                  onClick={() => moveCategory(index, -1)}
                  small
                >
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  label={copy.moveDown}
                  disabled={index === list.length - 1}
                  onClick={() => moveCategory(index, 1)}
                  small
                >
                  <ArrowDown size={15} />
                </IconButton>
              </div>

              <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">
                {category.name_ru}
              </h2>
              {category.name_kk ? (
                <span className="text-[15px] text-muted-soft">· {category.name_kk}</span>
              ) : null}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onAddDish(category.id)}
                  disabled={dishLimitReached}
                  aria-label={copy.addDish}
                  className="px-2.5 py-2 text-sm sm:px-3"
                >
                  <Plus size={15} />
                  {/* Label collapses to a bare "+" on phones so the header
                      stays one line; child span, so the §7 hidden-on-Button
                      quirk doesn't apply. */}
                  <span className="hidden sm:inline">{copy.addDish}</span>
                </Button>

                <IconButton
                  label={copy.editCategory}
                  onClick={() => onEditCategory(category)}
                >
                  <Pencil size={15} />
                </IconButton>

                <IconButton
                  label={copy.deleteCategory}
                  danger
                  onClick={() => onDeleteCategory(category.id)}
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </header>

            {dishLimitReached ? (
              <p className="mb-3 text-[13px] font-medium text-muted">
                {copy.dishLimitReached.replace("{n}", String(dishLimit))}
              </p>
            ) : null}

            {(category.dishes ?? []).length === 0 ? (
              <p className="py-2 text-[15px] text-muted-soft">{copy.noDishes}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {(category.dishes ?? []).map((dish) => (
                  <li
                    key={dish.id}
                    className={`flex items-center gap-2 py-2.5 ${
                      dish.is_available && dish.is_visible ? "" : "opacity-60"
                    }`}
                  >
                    {/* Tap the row to edit — the primary, most frequent action. */}
                    <button
                      type="button"
                      onClick={() => onEditDish(category.id, dish)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 pr-1 text-left transition-colors hover:bg-surface"
                    >
                      {dish.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, not an optimizable asset
                        <img
                          src={dish.image_url}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-muted-soft">
                          <UtensilsCrossed size={18} aria-hidden />
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-bold">{dish.name_ru}</span>
                          {dish.name_kk ? (
                            <span className="text-sm text-muted-soft">· {dish.name_kk}</span>
                          ) : null}
                          {!dish.is_visible ? (
                            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                              {copy.hiddenBadge}
                            </span>
                          ) : null}
                        </span>
                        {dish.description_ru ? (
                          <span className="mt-0.5 block truncate text-sm text-muted-soft">
                            {dish.description_ru}
                          </span>
                        ) : null}
                      </span>

                      <span className="whitespace-nowrap font-extrabold text-accent-hover">
                        {formatPrice(dish.price, currency)}
                      </span>
                    </button>

                    {/* One-tap stop-list toggle — the second action worth surfacing. */}
                    <button
                      type="button"
                      onClick={() => onToggleStop(dish)}
                      aria-label={dish.is_available ? copy.toStop : copy.fromStop}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors ${
                        dish.is_available
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          dish.is_available ? "bg-green-500" : "bg-red-500"
                        }`}
                        aria-hidden
                      />
                      <span className="hidden xs:inline">
                        {dish.is_available ? copy.inStock : copy.outOfStock}
                      </span>
                    </button>

                    <RowMenu
                      label={copy.moreActions}
                      items={[
                        {
                          label: copy.editDish,
                          icon: <Pencil size={16} />,
                          onClick: () => onEditDish(category.id, dish),
                        },
                        {
                          label: dish.is_visible ? copy.hideDish : copy.showDish,
                          icon: dish.is_visible ? <EyeOff size={16} /> : <Eye size={16} />,
                          onClick: () => onToggleVisible(dish),
                        },
                        {
                          label: copy.deleteDish,
                          icon: <Trash2 size={16} />,
                          onClick: () => onDeleteDish(dish.id),
                          danger: true,
                        },
                      ]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
          );
        })}
      </div>
    </>
  );
}

function IconButton({
  label,
  danger = false,
  small = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  /** Compact height, used for the stacked reorder arrows. */
  small?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-9 shrink-0 items-center justify-center border-border-strong text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ${
        small ? "h-6 rounded-md border" : "h-9 rounded-lg border"
      } ${
        danger
          ? "hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          : "hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
