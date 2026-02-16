'use client';

import { motion } from "framer-motion";
import { User, Code } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReplyLevelToggle({ mode, onChange }) {
    return (
        <div className="flex bg-muted p-1 rounded-xl border border-border/50 shadow-inner relative overflow-hidden h-9 items-center">
            <motion.div
                animate={{
                    x: mode === 'non-tech' ? 0 : '100%'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm border border-border/20 pointer-events-none"
            />

            <button
                onClick={() => onChange('non-tech')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 z-10 transition-colors duration-200",
                    mode === 'non-tech' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <User className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Non-Tech</span>
            </button>

            <button
                onClick={() => onChange('tech')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 z-10 transition-colors duration-200",
                    mode === 'tech' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Code className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Tech</span>
            </button>
        </div>
    );
}
