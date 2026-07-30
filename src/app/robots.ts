import type { MetadataRoute } from "next";
import { canonicalBase, getSeo } from "@/lib/seo";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = canonicalBase(await getSeo());

  // The site is always crawlable — there is deliberately no noindex switch, so
  // the live landing can never be hidden from search by an admin mistake.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
