'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdeaPage() {
    const [idea, setIdea] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleContinue = () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        // Use localStorage to pass the idea since Next.js app router 
        // doesn't have a direct equivalent to react-router-dom state in navigation easily
        localStorage.setItem('user-idea', idea.trim());

        setTimeout(() => {
            router.push("/discuss");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="p-4 sm:p-6">
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
                        />

                        <div className="flex items-center justify-between mt-6">
                            <span className="text-sm text-muted-foreground">
                                {idea.length > 0 ? `${idea.length} characters` : ""}
                            </span>
                            <Button
                                onClick={handleContinue}
                                disabled={!idea.trim() || isLoading}
                                size="lg"
                                className="gradient-bg text-primary-foreground rounded-xl px-8 hover:opacity-90 transition-opacity shadow-glow"
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
