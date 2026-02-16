'use client';

import { motion } from "framer-motion";
import { Lightbulb, MessageSquare, BarChart3, Zap } from "lucide-react";

const features = [
    {
        icon: Lightbulb,
        title: "Think Out Loud",
        description: "No structure needed. Just type your raw, messy ideas and let the AI help you make sense of them.",
    },
    {
        icon: MessageSquare,
        title: "Natural Conversation",
        description: "It feels like talking to a smart co-founder who asks the right questions at the right time.",
    },
    {
        icon: BarChart3,
        title: "Instant Roadmap",
        description: "Your conversation transforms into a clear, phased roadmap with features, risks, and timelines.",
    },
    {
        icon: Zap,
        title: "API-Ready",
        description: "Built to scale. Plug in your own AI model, export to your tools, and ship faster.",
    },
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 px-4 bg-background">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                        From chaos to clarity in <span className="gradient-text">3 steps</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        No templates. No rigid frameworks. Just a natural flow from idea to action.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -2 }}
                            className="p-8 rounded-2xl bg-card shadow-soft border border-border"
                        >
                            <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center mb-4">
                                <feature.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
