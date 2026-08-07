import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Same-origin proxy for a venue's logo, used by the QR constructor.
 *
 * The logo lives on the API host (api.qr-menu.kz), a different origin from the
 * app (qr-menu.kz). Reading it in the browser to bake into a canvas would need
 * CORS headers on `/storage`, which nginx serves statically without them — so
 * a `fetch` from the client taints the canvas and PNG/SVG export fails.
 *
 * Fetching server-side (no CORS between servers) and streaming the bytes back
 * from our own origin sidesteps that entirely: the browser then sees a
 * same-origin image it can freely rasterise.
 */
const API_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
  } catch {
    return "";
  }
})();

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "missing src" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "bad src" }, { status: 400 });
  }

  // Only ever our own API host — never a general-purpose open proxy (SSRF).
  if (!API_ORIGIN || target.origin !== API_ORIGIN) {
    return NextResponse.json({ error: "forbidden origin" }, { status: 403 });
  }

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "not an image" }, { status: 415 });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
