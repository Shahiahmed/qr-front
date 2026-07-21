import { notFound } from "next/navigation";
import { Benefits } from "@/components/landing/Benefits";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Demo } from "@/components/landing/Demo";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingLocaleProvider } from "@/components/landing/LandingLocaleProvider";
import { Pricing } from "@/components/landing/Pricing";
import { isLocale } from "@/content/locales";

export const dynamic = "force-static";

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
        <Demo />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </LandingLocaleProvider>
  );
}
