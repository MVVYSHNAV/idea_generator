'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Download, RefreshCw, Palette, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function WorldGenerator() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [style, setStyle] = useState('Realistic');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

    const styles = [
        "Realistic", "Anime", "Cyberpunk", "Steampunk", "Watercolor",
        "Oil Painting", "Comic Book", "Cartoon", "Pixel Art", "3D Render",
        "Sketch", "Vintage", "Pop Art", "Impressionism", "Surrealism",
        "Noir", "Fantasy", "Sci-Fi", "Abstract", "Origami",
        "Claymation", "Low Poly", "Vaporwave", "Gothic"
    ];

    const handleGenerate = async () => {
        if (!prompt) return;

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, style }),
            });

            const data = await response.json();

            if (data.imageUrl) {
                setGeneratedImage(data.imageUrl);
            } else {
                console.error('Failed to generate image:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background/90 to-background z-10" />
                <motion.div
                    className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px]"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-white/5 bg-background/50 backdrop-blur-md">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="hover:bg-primary/10 transition-colors"
                >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                </Button>
                <div className="flex items-center gap-2 font-display font-semibold text-xl">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="hidden sm:inline">World Generator</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Palette className="w-5 h-5" />
                </Button>
            </nav>

            <div className="flex flex-1 max-w-7xl mx-auto w-full relative z-10 overflow-hidden">

                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Style Library
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {styles.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${style === s
                                        ? 'bg-primary/20 text-primary border border-primary/20 shadow-glow-sm'
                                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {s}
                                {style === s && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Sidebar - Mobile Overlay */}
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden flex flex-col p-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" /> Select Style
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>Close</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-20">
                            {styles.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setStyle(s); setIsSidebarOpen(false); }}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${style === s
                                            ? 'bg-primary text-primary-foreground shadow-glow'
                                            : 'bg-muted/30 text-muted-foreground'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto w-full">
                    <div className="max-w-4xl mx-auto w-full space-y-8 flex flex-col h-full justify-center">

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground mb-2">
                                <span>Selected Style:</span>
                                <span className="text-primary font-medium">{style}</span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight">
                                Visualize Your <span className="gradient-text">New World</span>
                            </h1>
                        </motion.div>

                        {/* Main Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="relative group max-w-2xl mx-auto w-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative bg-card rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl">
                                    <input
                                        type="text"
                                        placeholder="Describe your dream world..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                        className="flex-1 bg-transparent border-none text-lg px-4 py-3 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
                                    />
                                    <Button
                                        size="lg"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt}
                                        className="gradient-bg shadow-glow hover:opacity-90 px-8 py-6 rounded-xl text-lg transition-all"
                                    >
                                        {isGenerating ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-5 h-5" />
                                        )}
                                        <span className="ml-2 hidden sm:inline">Generate</span>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Result Area */}
                        <motion.div
                            layout
                            className="w-full aspect-video relative rounded-3xl overflow-hidden bg-muted/30 border border-white/10 shadow-2xl flex items-center justify-center group mx-auto max-h-[500px]"
                        >
                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                                    <div className="loading-spinner mb-4"></div>
                                    <p className="text-white/80 animate-pulse font-medium">Painting in {style} style...</p>
                                </div>
                            )}

                            {generatedImage ? (
                                <>
                                    <img
                                        src={generatedImage}
                                        alt="Generated World"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
                                        <Button variant="secondary" size="sm" className="rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20" onClick={() => window.open(generatedImage, '_blank')}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-12 text-muted-foreground/40">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <Palette className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Select a style and describe your world</p>
                                </div>
                            )}
                        </motion.div>

                    </div>
                </main>
            </div>
        </div>
    );
}
