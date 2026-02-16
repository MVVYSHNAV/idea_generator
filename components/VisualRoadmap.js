'use client';

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { CheckCircle2, Circle, Layout, ShieldAlert, Users, Zap } from "lucide-react";

export default function VisualRoadmap({ data }) {
    const containerRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        if (!data || !timelineRef.current) return;

        const ctx = gsap.context(() => {
            // Animate line growth
            gsap.fromTo(".timeline-line",
                { scaleY: 0 },
                { scaleY: 1, duration: 1.5, ease: "power4.out" }
            );

            // Animate phases in sequence
            gsap.fromTo(".phase-card",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.5 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [data]);

    if (!data) return null;

    return (
        <div ref={containerRef} className="w-full max-w-5xl mx-auto p-6 md:p-12 bg-background">
            <header className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
                >
                    <Zap className="w-3 h-3" />
                    AI Generated Strategy
                </motion.div>
                <h1 className="text-4xl font-display font-bold mb-4">{data.problem_statement ? "Strategic Roadmap" : "Roadmap Planning"}</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {data.problem_statement || "Visualizing the path to execution."}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card icon={Users} title="Target Users" items={[data.target_users]} color="text-blue-500" />
                <Card icon={ShieldAlert} title="Top Risks" items={data.risks} color="text-red-500" />
                <Card icon={Layout} title="MVP Features" items={data.mvp_features} color="text-purple-500" />
            </div>

            <div className="relative pl-0 sm:pl-0">
                {/* Timeline Line */}
                <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border origin-top timeline-line block" />

                <div className="space-y-8 md:space-y-12 relative" ref={timelineRef}>
                    {data.roadmap_phases?.map((phase, i) => (
                        <div key={i} className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                            {/* Point on timeline */}
                            <div className="absolute left-[16.5px] md:left-1/2 md:-translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10" />

                            <div className="flex-1 w-full pl-10 md:pl-0 phase-card">
                                <div className="p-5 sm:p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                        {phase.phase}
                                    </h3>
                                    <ul className="space-y-2">
                                        {phase.tasks?.map((task, j) => (
                                            <li key={j} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                                                <Circle className="w-1.5 h-1.5 mt-1.5 fill-current opacity-30 shrink-0" />
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex-1 hidden md:block" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Card({ icon: Icon, title, items, color }) {
    return (
        <div className="p-6 bg-card/30 border border-border rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${color}`} />
                <h2 className="font-bold text-sm tracking-tight">{title}</h2>
            </div>
            <ul className="space-y-2">
                {items?.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed">{item}</li>
                ))}
            </ul>
        </div>
    );
}
