'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import { useState, useEffect } from "react";

export default function DiscussPage() {
    const router = useRouter();
    const [idea, setIdea] = useState("");
    const [showRoadmapCTA, setShowRoadmapCTA] = useState(false);

    useEffect(() => {
        const savedIdea = localStorage.getItem('user-idea');
        if (savedIdea) {
            setIdea(savedIdea);
        } else {
            router.push('/idea');
        }
    }, [router]);

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
                <h1 className="font-display font-semibold text-sm sm:text-base">
                    Discussion with AI Co-Founder
                </h1>
                {showRoadmapCTA ? (
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
                ) : (
                    <div className="w-[130px]" />
                )}
            </header>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
                {idea && (
                    <ChatWindow initialIdea={idea} onComplete={() => setShowRoadmapCTA(true)} />
                )}
            </div>
        </div>
    );
}
