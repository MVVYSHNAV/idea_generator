/**
 * Local Storage Utilities for Idea Navigator
 * ADAPTER: Wraps the new multi-project storage to maintain backward compatibility.
 * Operates on the ACTIVE project.
 */

import {
    getActiveProject,
    updateProject,
    deleteProject,
    STORAGE_KEY_ACTIVE_ID
} from './project-storage';

/**
 * Saves the current project state to localStorage (Active Project)
 * @param {Object} state - { chatMessages, activeMode, projectMemory, structuredRoadmap, lastUpdated, idea, summary, replyMode }
 */
export const saveProjectState = (state) => {
    if (typeof window === 'undefined') return;

    const activeProject = getActiveProject();
    if (!activeProject) return;

    // Map the flat state back to the structured project object
    updateProject({
        id: activeProject.id,
        messages: state.chatMessages || activeProject.messages,
        memory: state.projectMemory || activeProject.memory,
        roadmap: state.structuredRoadmap || activeProject.roadmap,
        summary: state.summary || activeProject.summary,
        replyLevel: state.replyMode || activeProject.replyLevel,
        idea: state.idea || activeProject.idea,
        // Helper to keep title in sync with idea if needed, or just let it diverge
        title: state.idea ? (state.idea.slice(0, 30) + (state.idea.length > 30 ? '...' : '')) : activeProject.title
    });
};

/**
 * Retrieves the saved project state from localStorage (Active Project)
 * @returns {Object|null}
 */
export const getProjectState = () => {
    if (typeof window === 'undefined') return null;

    const activeProject = getActiveProject();
    if (!activeProject) return null;

    // Map the structured project object back to the flat state expected by components
    return {
        idea: activeProject.idea,
        chatMessages: activeProject.messages,
        projectMemory: activeProject.memory,
        structuredRoadmap: activeProject.roadmap,
        summary: activeProject.summary,
        replyMode: activeProject.replyLevel,
        lastUpdated: new Date(activeProject.updatedAt).getTime()
    };
};

/**
 * Clears the project state from localStorage (Deletes Active Project)
 */
export const clearProjectState = () => {
    if (typeof window === 'undefined') return;

    const activeProject = getActiveProject();
    if (activeProject) {
        deleteProject(activeProject.id);
    }
};

/**
 * Checks if a project exists in storage
 * @returns {boolean}
 */
export const projectExists = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEY_ACTIVE_ID); // Check if there is an active project ID
};
