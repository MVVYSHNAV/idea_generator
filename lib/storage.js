/**
 * Local Storage Utilities for Idea Navigator
 * Project state is handled as a single unified object to ensure consistency.
 */

const STORAGE_KEY = 'idea_navigator_project';

/**
 * Saves the current project state to localStorage
 * @param {Object} state - { chatMessages, activeMode, projectMemory, structuredRoadmap, lastUpdated }
 */
export const saveProjectState = (state) => {
    if (typeof window === 'undefined') return;

    try {
        const projectData = {
            ...state,
            lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
    } catch (error) {
        console.error('Failed to save project state to localStorage:', error);
    }
};

/**
 * Retrieves the saved project state from localStorage
 * @returns {Object|null}
 */
export const getProjectState = () => {
    if (typeof window === 'undefined') return null;

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to parse project state from localStorage:', error);
        return null;
    }
};

/**
 * Clears the project state from localStorage
 */
export const clearProjectState = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    // Also clear the legacy idea state used previously
    localStorage.removeItem('user-idea');
    localStorage.removeItem('project-roadmap');
};

/**
 * Checks if a project exists in storage
 * @returns {boolean}
 */
export const projectExists = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEY);
};
