'use client';

import { motion } from "framer-motion";

const ChatBubble = ({ content, role, index }) => {
    const isAi = role === "assistant" || role === "ai";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
            className={`flex ${isAi ? "justify-start" : "justify-end"} mb-4`}
        >
            <div
                className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${isAi
                        ? "bg-card border border-border text-foreground rounded-bl-md shadow-sm"
                        : "gradient-bg text-primary-foreground rounded-br-md shadow-md"
                    }`}
            >
                {isAi && (
                    <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                        AI Co-Founder
                    </span>
                )}
                {content}
            </div>
        </motion.div>
    );
};

export default ChatBubble;
