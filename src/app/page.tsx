import { Benefits } from "@/components/landing/Benefits";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Demo } from "@/components/landing/Demo";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingLocaleProvider } from "@/components/landing/LandingLocaleProvider";
import { Pricing } from "@/components/landing/Pricing";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <LandingLocaleProvider>
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
