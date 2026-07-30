import type { MetadataRoute } from "next";
import { canonicalBase, getSeo } from "@/lib/seo";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo();
  const base = canonicalBase(seo);

  // The admin noindex switch disallows crawling wholesale — same intent as the
  // per-page robots meta, applied at the site level.
  const rules = seo?.noindex
    ? { userAgent: "*", disallow: "/" }
    : { userAgent: "*", allow: "/" };

  return {
    rules,
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
