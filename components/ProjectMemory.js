'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, Cloud, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectMemory({ memory, isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 bg-card/80 backdrop-blur-xl border-l border-border z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                <h2 className="font-display font-bold text-lg">Project Memory</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Decisions */}
                            <section>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Decisions Made
                                </div>
                                <ul className="space-y-3">
                                    {memory.decisions.length > 0 ? (
                                        memory.decisions.map((item, i) => (
                                            <motion.li
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={i}
                                                className="text-sm p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-foreground leading-relaxed"
                                            >
                                                {item}
                                            </motion.li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No decisions tracked yet.</p>
                                    )}
                                </ul>
                            </section>

                            {/* Assumptions */}
                            <section>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    <Cloud className="w-3 h-3" />
                                    Key Assumptions
                                </div>
                                <ul className="space-y-3">
                                    {memory.assumptions.length > 0 ? (
                                        memory.assumptions.map((item, i) => (
                                            <motion.li
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={i}
                                                className="text-sm p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-foreground leading-relaxed"
                                            >
                                                {item}
                                            </motion.li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Identify core assumptions with the AI.</p>
                                    )}
                                </ul>
                            </section>

                            {/* Scope */}
                            <section>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    <Target className="w-3 h-3" />
                                    Scope Boundaries
                                </div>
                                <ul className="space-y-3">
                                    {memory.scope.length > 0 ? (
                                        memory.scope.map((item, i) => (
                                            <motion.li
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={i}
                                                className="text-sm p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-foreground leading-relaxed"
                                            >
                                                {item}
                                            </motion.li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">What's IN and what's OUT?</p>
                                    )}
                                </ul>
                            </section>
                        </div>

                        <div className="p-6 border-t border-border bg-card/50">
                            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter font-semibold">
                                Updated in real-time by AI Co-Founder
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
