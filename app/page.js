'use client';

import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorks />

      {/* Final CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
            Ready to plan your next big thing?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            It takes 2 minutes. No sign-up required.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/idea")}
            className="gradient-bg text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-glow hover:opacity-90 transition-opacity"
          >
            Start Planning
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
