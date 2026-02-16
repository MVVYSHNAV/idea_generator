'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, MessageCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const HeroSection = () => {
    const router = useRouter();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-background">
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl gradient-bg"
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ top: "-10%", right: "-10%" }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl bg-accent"
                    animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ bottom: "0%", left: "-5%" }}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Logo & Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-6 mb-12"
                >
                    <Logo size="lg" />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm text-secondary-foreground text-sm font-medium border border-border/10">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI-Powered Project Planning
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6"
                >
                    Turn messy ideas into{" "}
                    <span className="gradient-text">clear roadmaps</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Chat with profzer AI. Brainstorm freely, refine ideas together,
                    and get a structured project plan — all in minutes.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        size="lg"
                        onClick={() => router.push("/idea")}
                        className="gradient-bg text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-glow animate-pulse-glow hover:opacity-90 transition-opacity"
                    >
                        Start Planning
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-lg px-8 py-6 rounded-xl"
                    >
                        See How It Works
                    </Button>
                </motion.div>

                {/* Steps preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                >
                    {[
                        { icon: Sparkles, title: "Capture Ideas", desc: "Dump your raw thoughts freely" },
                        { icon: MessageCircle, title: "Discuss & Refine", desc: "Chat with profzer AI" },
                        { icon: Map, title: "Get Roadmap", desc: "Structured plan, ready to execute" },
                    ].map((step, i) => (
                        <motion.div
                            key={step.title}
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-2xl bg-card shadow-soft text-center"
                        >
                            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                                <step.icon className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-1">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
