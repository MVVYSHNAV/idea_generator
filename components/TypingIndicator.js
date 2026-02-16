'use client';

import { motion } from "framer-motion";

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex justify-start mb-4"
    >
        <div className="bg-card border border-border px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
            <span className="block text-xs font-medium text-muted-foreground mb-2">AI Co-Founder</span>
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
        </div>
    </motion.div>
);

export default TypingIndicator;
