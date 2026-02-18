'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Map, Brain, FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import ProjectSummary from "@/components/ProjectSummary";
import ReplyLevelToggle from "@/components/ReplyLevelToggle";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";
import { getProjectState, clearProjectState, saveProjectState } from "@/lib/storage";
import { useAlert } from "@/context/AlertContext";
import MobileSidebarTrigger from "@/components/MobileSidebarTrigger";
import OnboardingTour from "@/components/OnboardingTour";

export default function DiscussPage() {
    const router = useRouter();
    const { confirm, showError, showSuccess, showInfo } = useAlert();
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
        const savedMode = localStorage.getItem('user-reply-mode');

        if (savedIdea) {
            setIdea(savedIdea);
            if (savedMode) setReplyMode(savedMode);
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
            showSuccess("Executive Summary Ready", replyMode === 'tech' ? "Technical background-aware report generated." : "Your project brief is ready for export.");

            // Persist the summary
            if (projectState) {
                saveProjectState({
                    ...projectState,
                    summary: data.summary
                });
            }
        } catch (error) {
            console.error('Summary Error:', error);
            showError("Synthesis Failed", replyMode === 'tech' ? "Unstable LLM connection. Please retry the request." : "Sorry, I couldn't wrap up your vision just yet. Please try again.");
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
                        id="onboarding-back-btn"
                    >
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </div>

                <div className="hidden lg:flex items-center" id="onboarding-reply-toggle">
                    <ReplyLevelToggle mode={replyMode} onChange={handleModeChange} />
                </div>

                <Logo size="sm" className="hidden sm:flex" />
                <h1 className="font-display font-bold text-xs sm:hidden truncate max-w-[80px]">
                    profzer AI
                </h1>

                <div className="flex items-center gap-1 sm:gap-2">
                    <OnboardingTour tourId="discuss" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMemoryOpen(true)}
                        className="text-muted-foreground hover:text-primary transition-colors h-8 w-8 sm:h-10 sm:w-10"
                        id="onboarding-memory-btn"
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
