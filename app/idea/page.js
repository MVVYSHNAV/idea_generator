'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Code2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileSidebarTrigger from "@/components/MobileSidebarTrigger";
import { cn } from "@/lib/utils";
import { createNewProject } from "@/lib/project-storage";
import OnboardingTour from "@/components/OnboardingTour";

export default function IdeaPage() {
    const [idea, setIdea] = useState("");
    const [replyMode, setReplyMode] = useState("non-tech");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleContinue = () => {
        if (!idea.trim()) return;
        setIsLoading(true);

        // Create the new project immediately
        // This sets it as active in storage
        createNewProject(idea.trim(), replyMode);

        // Clear legacy temp storage just in case
        localStorage.removeItem('user-idea');
        localStorage.removeItem('user-reply-mode');

        // Small delay for UX feel
        setTimeout(() => {
            router.push("/discuss");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 p-4 sm:p-6 bg-background/50 backdrop-blur-md border-b border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MobileSidebarTrigger />
                    <OnboardingTour tourId="idea" />
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="text-muted-foreground"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </header>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-4xl font-bold font-display mb-3"
                        >
                            What's your idea?
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground text-lg"
                        >
                            Don't worry about structure. Just dump your thoughts.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g. I want to build an app that helps freelancers track their time and automatically generate invoices. Maybe it could integrate with Stripe for payments and have a dashboard showing monthly earnings..."
                            className="w-full h-48 sm:h-56 rounded-2xl border border-border bg-card p-5 text-foreground text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground/60 shadow-soft"
                            autoFocus
                            id="onboarding-idea-input"
                        />

                        <div className="mt-8 mb-8" id="onboarding-reply-mode">
                            <label className="text-sm font-medium text-muted-foreground mb-4 block">
                                How should I talk to you?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setReplyMode('non-tech')}
                                    className={cn(
                                        "relative group flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                                        replyMode === 'non-tech'
                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                            : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-lg shrink-0 transition-colors",
                                        replyMode === 'non-tech' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
                                    )}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground mb-1">Visionary</div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Focus on the business, features, and user experience. Handle the tech details for me.
                                        </p>
                                    </div>
                                    {replyMode === 'non-tech' && (
                                        <div className="absolute top-4 right-4 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={() => setReplyMode('tech')}
                                    className={cn(
                                        "relative group flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                                        replyMode === 'tech'
                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                            : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-lg shrink-0 transition-colors",
                                        replyMode === 'tech' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
                                    )}>
                                        <Code2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground mb-1">Technical</div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Let's talk checks, stacks, and architecture. I want to build it myself.
                                        </p>
                                    </div>
                                    {replyMode === 'tech' && (
                                        <div className="absolute top-4 right-4 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {idea.length > 0 ? `${idea.length} chars` : ""}
                            </span>
                            <Button
                                onClick={handleContinue}
                                disabled={!idea.trim() || isLoading}
                                size="lg"
                                className="gradient-bg text-primary-foreground rounded-xl px-8 hover:opacity-90 transition-opacity shadow-glow w-full sm:w-auto"
                                id="onboarding-continue-btn"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
