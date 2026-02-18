import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Copy, Terminal, Layers, List, Cloud, ChevronDown, ChevronUp, BookOpen, Clock, AlertTriangle, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'steps', label: 'Step-by-Step', icon: List },
    { id: 'deployment', label: 'Deployment', icon: Cloud },
];

export default function DevGuideDisplay({ guide, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedStep, setExpandedStep] = useState(null);

    if (!guide) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast logic could go here
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-semibold text-sm">Timeline</span>
                                </div>
                                <p className="text-sm font-medium">{guide.estimated_timeline}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <div className="flex items-center gap-2 text-amber-500 mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-semibold text-sm">Key Risks</span>
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                    <ReactMarkdown>{guide.risk_analysis}</ReactMarkdown>
                                </div>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <div className="flex items-center gap-2 text-blue-500 mb-2">
                                    <GitBranch className="w-4 h-4" />
                                    <span className="font-semibold text-sm">Git Strategy</span>
                                </div>
                                <p className="text-sm font-medium">{guide.git_strategy}</p>
                            </div>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{guide.overview}</ReactMarkdown>
                        </div>
                    </motion.div>
                );
            case 'architecture':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-sm dark:prose-invert max-w-none"
                    >
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    return !inline ? (
                                        <div className="relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(String(children))}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        </div>
                                    ) : (
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {guide.architecture}
                        </ReactMarkdown>
                    </motion.div>
                );
            case 'steps':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {guide.steps.map((step, index) => (
                            <div key={index} className="border border-border/40 rounded-xl overflow-hidden bg-card/50">
                                <button
                                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <h3 className="font-semibold text-sm sm:text-base">{step.title}</h3>
                                    </div>
                                    {expandedStep === index ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </button>
                                <AnimatePresence>
                                    {expandedStep === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 pt-0 text-sm text-muted-foreground border-t border-border/40">
                                                <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                                                    <ReactMarkdown>{step.description}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                );
            case 'deployment':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-sm dark:prose-invert max-w-none"
                    >
                        <ReactMarkdown>{guide.deployment}</ReactMarkdown>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg font-display">Development Guide</h2>
                </div>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                )}
            </div>

            <div className="flex border-b border-border shrink-0 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                                isActive
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
}
