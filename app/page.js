'use client';

import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, RotateCcw, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjects, createNewProject, setActiveProject } from "@/lib/project-storage";
import { useEffect, useState } from "react";
import { useAlert } from "@/context/AlertContext";

export default function Home() {
  const router = useRouter();
  const [hasProjects, setHasProjects] = useState(false);
  const [recentProject, setRecentProject] = useState(null);
  const { confirm } = useAlert();

  useEffect(() => {
    const projects = getProjects();
    if (projects.length > 0) {
      setHasProjects(true);
      // Projects are sorted by date in storage, so index 0 is recent
      setRecentProject(projects[0]);
    }
  }, []);

  const handleNewProject = () => {
    setActiveProject(null);
    router.push('/idea');
  };

  const handleResume = () => {
    if (recentProject) {
      setActiveProject(recentProject.id);
      router.push("/discuss");
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
            {hasProjects ? "Welcome back" : "Ready to plan your next big thing?"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {hasProjects
              ? `Pick up where you left off with "${recentProject?.title}" or start something new.`
              : "It takes 2 minutes. No sign-up required."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasProjects && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleResume}
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
              >
                <RotateCcw className="mr-2 w-5 h-5" />
                Resume Last
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNewProject}
              className="w-full sm:w-auto gradient-bg text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-glow hover:opacity-90 transition-opacity"
            >
              Start New Project
              {hasProjects ? <Plus className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/world-generator')}
              className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all group"
            >
              Enter New World
              <Sparkles className="ml-2 w-5 h-5 text-purple-500 group-hover:text-purple-400 transition-colors" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
