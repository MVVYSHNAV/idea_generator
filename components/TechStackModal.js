import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Layers, Server, Code, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Since we saw 'button.js' in ui but not dialog, I will build a custom modal using framer-motion to be safe and dependency-free
// If shadcn/ui dialog existed we would use it, but 'list_dir' of ui only showed 'button.js'.
// So I will create a self-contained modal.

const FRONTEND_OPTIONS = [
    { id: 'nextjs', label: 'Next.js', icon: Layers },
    { id: 'react', label: 'React', icon: Code },
    { id: 'vue', label: 'Vuejs', icon: Code },
    { id: 'flutter', label: 'Flutter', icon: Layers },
    { id: 'svelte', label: 'Svelte', icon: Code },
    { id: 'other', label: 'Other', icon: Code },
];

const BACKEND_OPTIONS = [
    { id: 'node', label: 'Node.js', icon: Server },
    { id: 'python', label: 'Python (Django/FastAPI)', icon: Code },
    { id: 'frappe', label: 'Frappe (Python)', icon: Layers }, // Specific request
    { id: 'laravel', label: 'Laravel (PHP)', icon: Server },
    { id: 'go', label: 'Go', icon: Server },
    { id: 'supabase', label: 'Supabase', icon: Layers },
    { id: 'other', label: 'Other', icon: Server },
];

export default function TechStackModal({ isOpen, onClose, onConfirm }) {
    const [frontend, setFrontend] = useState('nextjs');
    const [backend, setBackend] = useState('node');
    const [customFrontend, setCustomFrontend] = useState('');
    const [customBackend, setCustomBackend] = useState('');

    const handleConfirm = () => {
        const finalFrontend = frontend === 'other' ? customFrontend : FRONTEND_OPTIONS.find(o => o.id === frontend)?.label;
        const finalBackend = backend === 'other' ? customBackend : BACKEND_OPTIONS.find(o => o.id === backend)?.label;

        if (!finalFrontend || !finalBackend) return; // simple validation

        onConfirm({
            frontend: finalFrontend,
            backend: finalBackend
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-card border border-border rounded-xl shadow-glow overflow-hidden"
            >
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold font-display">Choose Your Stack</h2>
                        <p className="text-muted-foreground text-sm">
                            Tailor the development guide to your preferred technologies.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Frontend Section */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Frontend Framework</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {FRONTEND_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setFrontend(option.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                                            frontend === option.id
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:bg-muted/50 text-muted-foreground"
                                        )}
                                    >
                                        <option.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            {frontend === 'other' && (
                                <input
                                    type="text"
                                    placeholder="e.g. SvelteKit, Angular..."
                                    value={customFrontend}
                                    onChange={(e) => setCustomFrontend(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* Backend Section */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Backend / Database</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {BACKEND_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setBackend(option.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                                            backend === option.id
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:bg-muted/50 text-muted-foreground"
                                        )}
                                    >
                                        <option.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            {backend === 'other' && (
                                <input
                                    type="text"
                                    placeholder="e.g. Ruby on Rails, Elixir..."
                                    value={customBackend}
                                    onChange={(e) => setCustomBackend(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 gradient-bg text-primary-foreground shadow-glow"
                            onClick={handleConfirm}
                            disabled={(frontend === 'other' && !customFrontend) || (backend === 'other' && !customBackend)}
                        >
                            Generate Plan
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function Label({ className, children }) {
    return <div className={cn("text-sm font-semibold mb-1.5", className)}>{children}</div>
}
