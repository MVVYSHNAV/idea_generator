'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Map, Brain, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import ProjectSummary from "@/components/ProjectSummary";
import { useState, useEffect } from "react";
import { getProjectState, clearProjectState, saveProjectState } from "@/lib/storage";

export default function DiscussPage() {
    const router = useRouter();
    const [idea, setIdea] = useState("");
    const [initialState, setInitialState] = useState(null);
    const [showRoadmapCTA, setShowRoadmapCTA] = useState(false);
    const [isMemoryOpen, setIsMemoryOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    useEffect(() => {
        // First priority: Restore from unified project storage
        const savedProject = getProjectState();
        if (savedProject && savedProject.idea) {
            setIdea(savedProject.idea);
            setInitialState(savedProject);
            if (savedProject.structuredRoadmap) setShowRoadmapCTA(true);
            if (savedProject.summary) setSummary(savedProject.summary);
            return;
        }

        // Fallback: Check for legacy idea
        const savedIdea = localStorage.getItem('user-idea');
        if (savedIdea) {
            setIdea(savedIdea);
        } else {
            router.push('/idea');
        }
    }, [router]);

    const handleGenerateSummary = async () => {
        if (summary) {
            setIsSummaryOpen(true);
            return;
        }

        setIsGeneratingSummary(true);
        try {
            const projectState = getProjectState();
            const response = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: idea,
                    memory: projectState?.projectMemory || {},
                    roadmap: projectState?.structuredRoadmap || null
                }),
            });

            if (!response.ok) throw new Error('Failed to generate summary');

            const data = await response.json();
            setSummary(data.summary);
            setIsSummaryOpen(true);

            // Persist the summary
            if (projectState) {
                saveProjectState({
                    ...projectState,
                    summary: data.summary
                });
            }
        } catch (error) {
            console.error('Summary Error:', error);
            alert("Failed to generate summary. Please try again.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleClearProject = () => {
        if (confirm("Are you sure you want to clear this project and start fresh? This cannot be undone.")) {
            clearProjectState();
            router.push('/idea');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/idea")}
                    className="text-muted-foreground"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleClearProject}
                    className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                >
                    Clear Project
                </Button>
                <h1 className="font-display font-semibold text-sm sm:text-base">
                    Discussion with AI Co-Founder
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMemoryOpen(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Brain className="w-5 h-5" />
                    </Button>
                    {showRoadmapCTA && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                                variant="outline"
                                size="sm"
                                className="border-primary/20 hover:bg-primary/5 hidden sm:flex"
                            >
                                {isGeneratingSummary ? (
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                ) : (
                                    <FileText className="w-4 h-4 mr-1.5" />
                                )}
                                Final Summary
                            </Button>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <Button
                                    onClick={() => router.push("/roadmap")}
                                    size="sm"
                                    className="gradient-bg text-primary-foreground rounded-lg hover:opacity-90 shadow-sm"
                                >
                                    <Map className="w-4 h-4 mr-1.5" />
                                    View Roadmap
                                </Button>
                            </motion.div>
                        </div>
                    )}
                    {!showRoadmapCTA && <div className="w-[100px]" />}
                </div>
            </header>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
                {idea && (
                    <ChatWindow
                        initialIdea={idea}
                        initialState={initialState}
                        onComplete={() => setShowRoadmapCTA(true)}
                        isMemoryOpen={isMemoryOpen}
                        onToggleMemory={setIsMemoryOpen}
                    />
                )}
            </div>

            {/* Modal */}
            {summary && (
                <ProjectSummary
                    summary={summary}
                    isOpen={isSummaryOpen}
                    onClose={() => setIsSummaryOpen(false)}
                />
            )}
        </div>
    );
}
