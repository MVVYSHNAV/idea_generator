'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "./ChatBubble";
import ModeSwitcher from "./ModeSwitcher";
import ProjectMemory from "./ProjectMemory";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({ initialIdea, onComplete, isMemoryOpen, onToggleMemory }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMode, setSelectedMode] = useState('brainstorm');
    const [memory, setMemory] = useState({
        decisions: [],
        assumptions: [],
        scope: []
    });
    const scrollRef = useRef(null);

    // Send initial AI greeting based on idea
    useEffect(() => {
        const startChat = async () => {
            setIsTyping(true);

            const initialPrompt = `Hey! I just read your vision:\n\n"${initialIdea}"\n\nI'm ready to dive in as your co-founder. I've started in **Brainstorm Mode** to explore the possibilities, but feel free to switch to **MVP Planning** or **Risk Analysis** whenever you're ready to get more tactical. What's the main goal you have for this idea right now?`;

            setMessages([
                {
                    id: Date.now(),
                    role: "assistant",
                    content: initialPrompt,
                },
            ]);
            setIsTyping(false);
        };

        if (initialIdea) {
            startChat();
        }
    }, [initialIdea]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsTyping(true);

        try {
            // Send to our Next.js API route
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(({ role, content }) => ({ role, content })),
                    selectedMode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();

            // Check if response contains JSON roadmap
            let cleanContent = data.content;
            try {
                // Try to find JSON block in the response
                const jsonMatch = data.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const potentialJson = JSON.parse(jsonMatch[0]);
                    if (potentialJson.roadmap_phases) {
                        localStorage.setItem('project-roadmap', JSON.stringify(potentialJson));
                        cleanContent = data.content.replace(jsonMatch[0], "").trim();
                        if (!cleanContent) cleanContent = "I've generated your strategic roadmap! You can view it by clicking the button in the top right.";
                        onComplete?.();
                    }
                }
            } catch (e) {
                console.log("Not a JSON response or failed to parse", e);
            }

            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: cleanContent },
            ]);

            // Simple logic to extract "decisions" or "assumptions" based on keywords
            // In a more advanced version, we would do this via a separate LLM call or regex
            const content = data.content.toLowerCase();
            if (content.includes("i've decided") || content.includes("we've agreed")) {
                const decision = data.content.split(/[.!?]/).find(s =>
                    s.toLowerCase().includes("decided") || s.toLowerCase().includes("agreed")
                );
                if (decision) setMemory(prev => ({ ...prev, decisions: [...new Set([...prev.decisions, decision.trim()])] }));
            }

            if (content.includes("assuming") || content.includes("assumption")) {
                const assumption = data.content.split(/[.!?]/).find(s =>
                    s.toLowerCase().includes("assum")
                );
                if (assumption) setMemory(prev => ({ ...prev, assumptions: [...new Set([...prev.assumptions, assumption.trim()])] }));
            }

            // If we've had a few exchanges, we could trigger the completion
            if (updatedMessages.length >= 8) {
                onComplete?.();
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: "Sorry, I ran into an issue connecting to my brain. Please check your connection or try again." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const getThinkingText = () => {
        switch (selectedMode) {
            case 'brainstorm': return 'Expanding possibilities...';
            case 'mvp': return 'Defining lean core...';
            case 'risk': return 'Challenging assumptions...';
            case 'roadmap': return 'Structuring phases...';
            case 'investor': return 'Analyzing business model...';
            default: return 'Thinking...';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            <ProjectMemory
                memory={memory}
                isOpen={isMemoryOpen}
                onClose={() => onToggleMemory(false)}
            />
            {/* Mode Switcher Overlay */}
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
                <div className="pointer-events-auto shadow-2xl">
                    <ModeSwitcher activeMode={selectedMode} onModeChange={setSelectedMode} />
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 pt-24">
                {messages.map((msg, i) => (
                    <ChatBubble key={msg.id} content={msg.content} role={msg.role} index={i} />
                ))}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-start mb-4"
                        >
                            <div className="bg-card border border-border px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                                <span className="block text-xs font-medium text-muted-foreground mb-2">AI Co-Founder</span>
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs italic text-primary/70">{getThinkingText()}</span>
                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-primary/40"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-3 max-w-3xl mx-auto"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your thoughts..."
                        className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                        disabled={isTyping}
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        size="icon"
                        className="rounded-xl w-12 h-12 gradient-bg text-primary-foreground shrink-0 shadow-lg hover:opacity-90"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
