'use client';

import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectExists, clearProjectState } from "@/lib/storage";
import { useEffect, useState } from "react";
import { useAlert } from "@/context/AlertContext";

export default function Home() {
  const router = useRouter();
  const [hasProject, setHasProject] = useState(false);
  const { confirm, showSuccess } = useAlert();

  useEffect(() => {
    setHasProject(projectExists());
  }, []);

  const handleNewProject = async () => {
    if (hasProject) {
      const ok = await confirm({
        title: "Start New Project?",
        message: "Starting a new project will clear your current progress. This cannot be undone.",
        confirmText: "Start Fresh",
        variant: "destructive"
      });

      if (ok) {
        clearProjectState();
        showSuccess("Project Cleared", "Ready for your next big idea!");
        router.push("/idea");
      }
    } else {
      router.push("/idea");
    }
  };

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
            {hasProject ? "Resume your vision" : "Ready to plan your next big thing?"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {hasProject
              ? "You have an active session saved. Pick up where you left off or start fresh."
              : "It takes 2 minutes. No sign-up required."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasProject && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/discuss")}
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
              >
                <RotateCcw className="mr-2 w-5 h-5" />
                Resume Project
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNewProject}
              className="w-full sm:w-auto gradient-bg text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-glow hover:opacity-90 transition-opacity"
            >
              {hasProject ? "Start fresh" : "Start Planning"}
              {hasProject ? <Plus className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
