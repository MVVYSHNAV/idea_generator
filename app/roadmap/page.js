'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VisualRoadmap from "@/components/VisualRoadmap";
import DevGuideDisplay from "@/components/DevGuideDisplay";
import TechStackModal from "@/components/TechStackModal";
import { useAlert } from "@/context/AlertContext";
import MobileSidebarTrigger from "@/components/MobileSidebarTrigger";

export default function RoadmapPage() {
    const router = useRouter();
    const { showSuccess, showError } = useAlert();
    const [roadmapData, setRoadmapData] = useState(null);
    const [devGuide, setDevGuide] = useState(null);
    const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
    const [isStackModalOpen, setIsStackModalOpen] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('project-roadmap');
        if (savedData) {
            try {
                setRoadmapData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse roadmap data", e);
                router.push('/discuss');
            }
        } else {
            router.push('/discuss');
        }
    }, [router]);

    const exportToMarkdown = () => {
        if (!roadmapData) return;

        let md = `# Strategy Roadmap: ${roadmapData.problem_statement || 'Project Plan'}\n\n`;
        md += `## Target Users\n${roadmapData.target_users}\n\n`;
        md += `## Key Assumptions\n${roadmapData.key_assumptions?.map(a => `- ${a}`).join('\n')}\n\n`;
        md += `## MVP Features\n${roadmapData.mvp_features?.map(f => `- ${f}`).join('\n')}\n\n`;
        md += `## Execution Phases\n\n`;
        roadmapData.roadmap_phases?.forEach(phase => {
            md += `### ${phase.phase}\n${phase.tasks?.map(t => `- ${t}`).join('\n')}\n\n`;
        });
        md += `## Top Risks\n${roadmapData.risks?.map(r => `- ${r}`).join('\n')}\n\n`;
        md += `## Open Questions\n${roadmapData.open_questions?.map(q => `- ${q}`).join('\n')}\n`;

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadmap-${Date.now()}.md`;
        a.click();
        showSuccess("Roadmap Exported", "Your strategic plan is ready in your downloads.");
    };

    const handleGenerateClick = () => {
        setIsStackModalOpen(true);
    };

    const handleConfirmGenerate = async ({ frontend, backend }) => {
        setIsStackModalOpen(false);
        setIsGeneratingGuide(true);
        try {
            const projectState = localStorage.getItem('idea_navigator_project')
                ? JSON.parse(localStorage.getItem('idea_navigator_project'))
                : null;

            const response = await fetch('/api/dev-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: projectState?.idea || roadmapData.problem_statement,
                    memory: projectState?.projectMemory || {},
                    roadmap: roadmapData,
                    summary: projectState?.summary || "",
                    language: "JavaScript/TypeScript", // General default, specific stack passed below
                    framework: frontend, // User selected value
                    backend_tech: backend, // User selected value - we'll need to update API to use this
                    replyLevel: projectState?.replyMode || "tech"
                }),
            });

            if (!response.ok) throw new Error('Failed to generate guide');

            const data = await response.json();
            setDevGuide(data.guide);
            showSuccess("Blueprint Ready", `Development guide for ${frontend} + ${backend} generated.`);

            // Scroll to guide
            setTimeout(() => {
                document.getElementById('dev-guide-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error(error);
            showError("Generation Failed", "Could not create the development guide. Please try again.");
        } finally {
            setIsGeneratingGuide(false);
        }
    };

    if (!roadmapData) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <MobileSidebarTrigger />
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/discuss")}
                            className="text-muted-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Chat
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button
                            size="sm"
                            onClick={exportToMarkdown}
                            className="gradient-bg text-primary-foreground shadow-glow"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Markdown
                        </Button>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 space-y-12">
                <VisualRoadmap data={roadmapData} />

                {/* Dev Guide Section */}
                <section id="dev-guide-section" className="border-t border-border pt-12">
                    <div className="flex flex-col items-center justify-center mb-8 text-center">
                        <h2 className="text-2xl font-bold font-display mb-2">Ready to Build?</h2>
                        <p className="text-muted-foreground mb-6 max-w-lg">
                            Turn this roadmap into a concrete engineering plan.
                            Get a step-by-step guide tailored to your tech stack.
                        </p>

                        {!devGuide && (
                            <Button
                                onClick={handleGenerateClick}
                                disabled={isGeneratingGuide}
                                size="lg"
                                className="gradient-bg text-primary-foreground shadow-glow"
                            >
                                {isGeneratingGuide ? (
                                    <>Processing...</>
                                ) : (
                                    <>Generate Development Plan</>
                                )}
                            </Button>
                        )}
                    </div>

                    {devGuide && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <DevGuideDisplay guide={devGuide} onClose={() => setDevGuide(null)} />
                        </motion.div>
                    )}
                </section>

                <TechStackModal
                    isOpen={isStackModalOpen}
                    onClose={() => setIsStackModalOpen(false)}
                    onConfirm={handleConfirmGenerate}
                />
            </main>

            {/* Footer / Disclaimer */}
            <footer className="py-12 border-t border-border bg-card/30 text-center">
                <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
                    This roadmap was generated by profzer AI based on your vision and collaborative discussion.
                </p>
            </footer>
        </div>
    );
}
