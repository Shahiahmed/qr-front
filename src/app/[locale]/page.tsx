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
import { isLocale } from "@/content/locales";

// Hourly ISR (not force-static): the landing pulls admin-managed SEO and plans
// from the API, so it must be free to refresh. Must be a literal — Next reads
// segment config statically.
export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <LandingLocaleProvider locale={locale}>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Faq />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </LandingLocaleProvider>
  );
}
