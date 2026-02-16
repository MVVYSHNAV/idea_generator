'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Map, Brain, FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import ProjectSummary from "@/components/ProjectSummary";
import ReplyLevelToggle from "@/components/ReplyLevelToggle";
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
    const [replyMode, setReplyMode] = useState('non-tech');

    useEffect(() => {
        // First priority: Restore from unified project storage
        const savedProject = getProjectState();
        if (savedProject && savedProject.idea) {
            setIdea(savedProject.idea);
            setInitialState(savedProject);
            if (savedProject.structuredRoadmap) setShowRoadmapCTA(true);
            if (savedProject.summary) setSummary(savedProject.summary);
            if (savedProject.replyMode) setReplyMode(savedProject.replyMode);
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
                    roadmap: projectState?.structuredRoadmap || null,
                    replyMode: replyMode
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

    const handleModeChange = (newMode) => {
        setReplyMode(newMode);
        const projectState = getProjectState();
        if (projectState) {
            saveProjectState({
                ...projectState,
                replyMode: newMode
            });
        }
    };

    const handleClearProject = () => {
        if (confirm("Starting a new project will clear your current progress. Continue?")) {
            clearProjectState();
            router.push('/idea');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-[40] flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/idea")}
                        className="text-muted-foreground px-2 sm:px-3"
                    >
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearProject}
                        className="text-muted-foreground hover:text-destructive transition-colors text-[10px] sm:text-xs px-2"
                    >
                        <Plus className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">New Project</span>
                        <span className="sm:hidden text-muted-foreground font-bold uppercase">New</span>
                    </Button>
                </div>

                <div className="hidden lg:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-2xl border border-border/20">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest whitespace-nowrap">AI Tone</span>
                    <ReplyLevelToggle mode={replyMode} onChange={handleModeChange} />
                </div>

                <h1 className="font-display font-bold text-xs sm:text-base truncate max-w-[80px] sm:max-w-none text-center px-2">
                    Co-Founder AI
                </h1>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMemoryOpen(true)}
                        className="text-muted-foreground hover:text-primary transition-colors h-8 w-8 sm:h-10 sm:w-10"
                    >
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    {showRoadmapCTA && (
                        <div className="flex gap-1 sm:gap-2">
                            <Button
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                                variant="outline"
                                size="sm"
                                className="border-primary/20 hover:bg-primary/5 h-8 px-2 sm:h-9 sm:px-4"
                            >
                                {isGeneratingSummary ? (
                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
                                )}
                                <span className="hidden sm:inline text-xs">Summary</span>
                            </Button>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <Button
                                    onClick={() => router.push("/roadmap")}
                                    size="sm"
                                    className="gradient-bg text-primary-foreground rounded-lg hover:opacity-90 shadow-sm h-8 px-2 sm:h-9 sm:px-4"
                                >
                                    <Map className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline text-xs">Roadmap</span>
                                    <span className="sm:hidden text-[10px]">PLAN</span>
                                </Button>
                            </motion.div>
                        </div>
                    )}
                    {!showRoadmapCTA && <div className="w-[32px] sm:w-[100px]" />}
                </div>
            </header>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
                {idea && (
                    <ChatWindow
                        initialIdea={idea}
                        initialState={initialState}
                        replyMode={replyMode}
                        onModeChange={handleModeChange}
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
