"use client";

import { useEffect, type ReactNode } from "react";

/** Shared shell for the panel's dialogs: backdrop, Escape, scroll lock. */
export function Modal({
  label,
  title,
  onClose,
  children,
}: {
  label: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        // Only a press that starts and ends on the backdrop closes it, so a
        // text selection dragged out of the form does not.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="my-auto w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(20,18,16,0.5)] sm:p-8"
      >
        <h2 className="mb-6 text-[24px] font-extrabold tracking-[-0.03em]">{title}</h2>
        {children}
      </div>
    </div>
  );
}
