'use client';

import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare, Menu, X, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    getProjects,
    createNewProject,
    deleteProject,
    setActiveProject,
    getActiveProject
} from "@/lib/project-storage";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectSidebar({ className }) {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProjectState] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Load projects on mount and when interactions happen
    const refreshProjects = () => {
        const all = getProjects();
        setProjects(all);
        const active = getActiveProject();
        setActiveProjectState(active);
    };

    useEffect(() => {
        refreshProjects();

        // Listen for storage changes
        const handleStorageChange = () => refreshProjects();
        window.addEventListener('storage', handleStorageChange);

        // Listen for mobile sidebar open event
        const handleOpenSidebar = () => setIsMobileOpen(prev => !prev);
        window.addEventListener('open-sidebar', handleOpenSidebar);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('open-sidebar', handleOpenSidebar);
        };
    }, []);

    const handleNewProject = () => {
        try {
            setActiveProject(null); // Clear active project so we start fresh
            refreshProjects();
            router.push('/idea');
            if (window.innerWidth < 768) setIsMobileOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSwitchProject = (id) => {
        setActiveProject(id);
        refreshProjects();
        // Reload current page to reflect new project state
        // Or navigate to discuss if on a specific tool
        window.location.href = '/discuss';
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            deleteProject(id);
            refreshProjects();
            // If active was deleted, refresh calculation handles it
        }
    };

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed bottom-4 left-4 z-50">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="rounded-full shadow-lg border border-border"
                >
                    <Menu className="w-6 h-6" />
                </Button>
            </div>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
                isOpen ? "w-64" : "w-16 hidden md:flex",
                isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
            )}>

                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-border/50">
                    {isOpen && <span className="font-display font-bold text-lg">My Projects</span>}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="hidden md:flex ml-auto"
                    >
                        {isOpen ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                    {/* Mobile Close */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden ml-auto"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* New Project Button */}
                <div className="p-4">
                    <Button
                        onClick={handleNewProject}
                        className={cn(
                            "w-full gradient-bg text-primary-foreground shadow-glow transition-all",
                            !isOpen && "px-0 w-10 h-10 rounded-full flex items-center justify-center p-0"
                        )}
                    >
                        <Plus className={cn("w-5 h-5", isOpen && "mr-2")} />
                        {isOpen && "New Project"}
                    </Button>
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => handleSwitchProject(project.id)}
                            className={cn(
                                "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors relative",
                                activeProject?.id === project.id
                                    ? "bg-secondary text-secondary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            title={project.title}
                        >
                            <Folder className={cn(
                                "w-5 h-5 shrink-0",
                                activeProject?.id === project.id ? "text-primary" : "text-muted-foreground"
                            )} />

                            {isOpen && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{project.title || "Untitled Project"}</p>
                                        <p className="text-xs opacity-70 truncate">{new Date(project.updatedAt).toLocaleDateString()}</p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => handleDelete(e, project.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* User / Settings Footer (Optional) */}
                <div className="p-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            P
                        </div>
                        {isOpen && (
                            <div className="text-sm">
                                <p className="font-medium">Pro User</p>
                                <p className="text-xs text-muted-foreground">Free Plan</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
