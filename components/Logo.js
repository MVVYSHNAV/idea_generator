'use client';

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Logo = ({ className = "", size = "md" }) => {
    const sizes = {
        sm: "h-6 w-6",
        md: "h-10 w-10",
        lg: "h-14 w-14",
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-5 h-5",
        lg: "w-8 h-8",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${sizes[size]} rounded-xl gradient-bg flex items-center justify-center shadow-glow relative overflow-hidden group`}
            > */}
            {/* Gloss effect */}
            {/* <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div> */}
            <span className={`font-display font-bold tracking-tight text-foreground ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
                profzer<span className="text-primary font-black ml-0.5">AI</span>
            </span>
        </div>
    );
};

export default Logo;
