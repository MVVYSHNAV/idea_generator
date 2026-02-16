'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({ initialIdea, onComplete }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Send initial AI greeting based on idea
    useEffect(() => {
        const startChat = async () => {
            setIsTyping(true);

            const initialPrompt = `Hey! I just read your idea:\n\n"${initialIdea.slice(0, 120)}${initialIdea.length > 120 ? "..." : ""}"\n\nThis is exciting. Let me ask you a few questions to sharpen it. What's the core problem you're solving, and who feels this pain the most?`;

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
                    messages: updatedMessages.map(({ role, content }) => ({ role, content }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: data.content },
            ]);

            // If we've had a few exchanges, we could trigger the completion
            if (updatedMessages.length >= 6) {
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

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
                {messages.map((msg, i) => (
                    <ChatBubble key={msg.id} content={msg.content} role={msg.role} index={i} />
                ))}
                <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
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
