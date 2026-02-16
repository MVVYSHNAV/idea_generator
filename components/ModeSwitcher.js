'use client';

import { motion } from "framer-motion";
import { Lightbulb, Rocket, AlertTriangle, Map, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
    {
        id: 'brainstorm',
        name: 'Brainstorm',
        icon: Lightbulb,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        description: 'Fresh ideas & creative exploration'
    },
    {
        id: 'mvp',
        name: 'MVP Planning',
        icon: Rocket,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        description: 'Define leanest possible product'
    },
    {
        id: 'risk',
        name: 'Risk Analysis',
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        description: 'Identify killers & assumptions'
    },
    {
        id: 'roadmap',
        name: 'Roadmap',
        icon: Map,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        description: 'Execute strategic milestones'
    },
    {
        id: 'investor',
        name: 'Investor Think',
        icon: TrendingUp,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        description: 'Business model & growth loops'
    }
];

export default function ModeSwitcher({ activeMode, onModeChange }) {
    return (
        <div className="flex sm:flex-wrap gap-2 p-2 bg-card/50 backdrop-blur-md border border-border rounded-2xl overflow-x-auto no-scrollbar max-w-full scroll-smooth">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;

                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group relative shrink-0",
                            isActive
                                ? "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-border"
                                : "hover:bg-card"
                        )}
                        title={mode.description}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? mode.color : "text-muted-foreground")} />
                        <span className={cn(
                            "text-xs font-medium whitespace-nowrap",
                            isActive ? mode.color : "text-muted-foreground"
                        )}>
                            {mode.name}
                        </span>

                        {isActive && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 border-2 border-primary/20 rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                );
            })}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
