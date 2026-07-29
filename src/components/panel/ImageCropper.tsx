"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal } from "@/components/panel/Modal";
import { Button } from "@/components/landing/ui/Button";

/**
 * Square crop + client-side WebP encode. The point is to ship an already-tiny,
 * already-square file: a phone menu shows dozens of dish photos, so anything
 * heavier than this scrolls badly. The server re-crops as a safety net, but the
 * upload itself is small — which matters most on the slow venue wifi guests and
 * owners actually use.
 *
 * The pan position is kept as a focus point in [0,1] (0.5 = centred), not pixels,
 * so it needs no re-centring when the frame or image size changes — it maps to
 * pixels only at render, always within bounds.
 */

/** Guest thumbnails never exceed ~96px, so 800 is plenty and stays sharp on retina. */
const OUTPUT = 800;
const QUALITY = 0.82;
const MAX_ZOOM = 3;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ImageCropper({
  file,
  title,
  hint,
  zoomLabel,
  applyLabel,
  cancelLabel,
  onCancel,
  onDone,
}: {
  file: File;
  title: string;
  hint: string;
  zoomLabel: string;
  applyLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    px: number;
    py: number;
    fx: number;
    fy: number;
    slackX: number;
    slackY: number;
  } | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  // Viewport edge in CSS pixels — measured, because it is responsive.
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);

  // Decode the picked file once.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Measure the square frame and follow resizes.
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setView(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cover scale: the shorter side fills the frame; zoom multiplies from there.
  const natural = image ? { w: image.naturalWidth, h: image.naturalHeight } : null;
  const base = natural && view ? view / Math.min(natural.w, natural.h) : 0;
  const scale = base * zoom;
  const dw = natural ? natural.w * scale : 0;
  const dh = natural ? natural.h * scale : 0;
  // Pannable slack, then the focus point mapped to a top-left pixel offset.
  const slackX = Math.max(0, dw - view);
  const slackY = Math.max(0, dh - view);
  const offsetX = -slackX * focus.x;
  const offsetY = -slackY * focus.y;

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, fx: focus.x, fy: focus.y, slackX, slackY };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    // Dragging right moves the image right, i.e. reveals more of its left edge.
    setFocus({
      x: d.slackX > 0 ? clamp01(d.fx - (e.clientX - d.px) / d.slackX) : 0.5,
      y: d.slackY > 0 ? clamp01(d.fy - (e.clientY - d.py) / d.slackY) : 0.5,
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function apply() {
    if (!image || !view || busy) return;
    setBusy(true);
    try {
      // The frame maps to this square in source pixels.
      const srcSize = view / scale;
      const sx = -offsetX / scale;
      const sy = -offsetY / scale;
      // Never upscale past the source — same rule the server keeps.
      const edge = Math.min(OUTPUT, Math.round(srcSize));
      const canvas = document.createElement("canvas");
      canvas.width = edge;
      canvas.height = edge;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, sx, sy, srcSize, srcSize, 0, 0, edge, edge);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", QUALITY),
      );
      if (blob) onDone(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal label={title} title={title} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-soft">{hint}</p>

        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative mx-auto aspect-square w-full max-w-90 cursor-grab touch-none overflow-hidden rounded-2xl bg-ink/5 active:cursor-grabbing"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview on a canvas-style editor, not an optimizable asset
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute select-none"
              style={{ width: dw, height: dh, left: offsetX, top: offsetY, maxWidth: "none" }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold">
          <span className="shrink-0">{zoomLabel}</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </label>

        <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full py-3 sm:w-auto sm:px-7"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={apply}
            disabled={!image || busy}
            className="w-full py-3 sm:w-auto sm:px-7"
          >
            {applyLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
