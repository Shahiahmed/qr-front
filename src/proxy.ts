import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/content/locales";

/**
 * Every page lives under a locale prefix, so a request without one has to be
 * sent somewhere. Kazakh is offered when the browser asks for it; otherwise
 * Russian, which is what most of the market reads.
 *
 * Note: in Next.js 16 this file convention is `proxy`, not `middleware`.
 */
function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";

  // `kk` is the language tag for Kazakh; `kz` only ever appears as a region.
  const wantsKazakh = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .some((tag) => tag === "kk" || tag.startsWith("kk-"));

  return wantsKazakh ? "kz" : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * The guest menu sits outside the locale prefixes: its address is printed
   * on a table tent, so it has to stay short and stable, and the guest picks
   * a language inside the menu rather than in the URL.
   */
  if (pathname === "/m" || pathname.startsWith("/m/")) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  /*
   * Skip Next internals and anything with a file extension — favicon, images,
   * robots.txt and sitemap.xml must not be pushed under a locale.
   */
  matcher: ["/((?!_next|.*\\..*).*)"],
};
