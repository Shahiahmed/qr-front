import { notFound } from "next/navigation";
import { Benefits } from "@/components/landing/Benefits";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Faq } from "@/components/landing/Faq";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingLocaleProvider } from "@/components/landing/LandingLocaleProvider";
import { Pricing } from "@/components/landing/Pricing";
import { PromoModal } from "@/components/landing/PromoModal";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { Testimonials } from "@/components/landing/Testimonials";
import { isLocale } from "@/content/locales";
import { getPromo, promoFieldsFor } from "@/lib/promo";

// Hourly ISR (not force-static): the landing pulls admin-managed SEO and plans
// from the API, so it must be free to refresh. Must be a literal — Next reads
// segment config statically.
export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  // Admin-managed promo pop-up. Fetched server-side; only mounted when active
  // and it has a title in this locale (empty scheduled content never leaks).
  const promo = await getPromo();
  const promoFields = promo ? promoFieldsFor(promo, locale) : null;

  return (
    <LandingLocaleProvider locale={locale}>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Faq />
        <Testimonials />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
      {promo && promoFields?.title ? (
        <PromoModal
          id={promo.id}
          badge={promoFields.badge}
          title={promoFields.title}
          body={promoFields.body}
          ctaLabel={promoFields.cta_label}
          ctaUrl={promo.cta_url}
        />
      ) : null}
    </LandingLocaleProvider>
  );
}
