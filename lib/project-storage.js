import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY_PROJECTS = 'idea_navigator_projects';
export const STORAGE_KEY_ACTIVE_ID = 'idea_navigator_active_project_id';

// Types (JsDoc for better IDE support in JS project)
/**
 * @typedef {Object} Message
 * @property {'user' | 'assistant'} role
 * @property {string} content
 */

/**
 * @typedef {Object} IdeaNavigatorProject
 * @property {string} id
 * @property {string} title
 * @property {string} idea
 * @property {'tech' | 'non-tech'} replyLevel
 * @property {Message[]} messages
 * @property {Object} memory
 * @property {Object} [roadmap]
 * @property {string} [summary]
 * @property {Object} [devGuide]
 * @property {string} [framework]
 * @property {string} [language]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// Helper to check if window exists (SSR safety)
const isBrowser = () => typeof window !== 'undefined';

/**
 * Migrates existing single-project data to new multi-project format
 */
const migrateLegacyProject = () => {
    if (!isBrowser()) return;

    try {
        const legacyKey = 'idea_navigator_project';
        const legacyData = localStorage.getItem(legacyKey);

        if (legacyData) {
            const parsed = JSON.parse(legacyData);
            // Create a new project from legacy data
            const newProject = {
                id: uuidv4(),
                title: parsed.idea ? parsed.idea.slice(0, 30) + (parsed.idea.length > 30 ? '...' : '') : 'Legacy Project',
                idea: parsed.idea || '',
                replyLevel: parsed.replyMode || 'tech',
                messages: parsed.chatMessages || [],
                memory: parsed.projectMemory || {},
                roadmap: JSON.parse(localStorage.getItem('project-roadmap') || 'null'),
                summary: parsed.summary || '',
                devGuide: null, // Legacy might not have this stored in same object
                framework: 'Next.js', // Default for legacy
                language: 'JavaScript',
                createdAt: new Date(parsed.lastUpdated || Date.now()).toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save to new storage
            const projects = [newProject];
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
            localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newProject.id);

            // Clear legacy
            localStorage.removeItem(legacyKey);
            localStorage.removeItem('project-roadmap');

            return projects;
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
    return [];
};

/**
 * Get all projects
 * @returns {IdeaNavigatorProject[]}
 */
export const getProjects = () => {
    if (!isBrowser()) return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
        if (data) return JSON.parse(data);

        // If empty, try migration
        return migrateLegacyProject();
    } catch (e) {
        console.error("Failed to get projects", e);
        return [];
    }
};

/**
 * Get the active project
 * @returns {IdeaNavigatorProject | null}
 */
export const getActiveProject = () => {
    if (!isBrowser()) return null;
    try {
        const projects = getProjects();
        if (projects.length === 0) return null;

        const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
        if (!activeId) return projects[0]; // Default to first if no active ID

        return projects.find(p => p.id === activeId) || projects[0];
    } catch (e) {
        console.error("Failed to get active project", e);
        return null; // Don't crash
    }
};

/**
 * Create a new project
 * @param {string} idea 
 * @param {'tech' | 'non-tech'} replyLevel 
 * @returns {IdeaNavigatorProject}
 */
export const createNewProject = (idea, replyLevel = 'tech') => {
    if (!isBrowser()) throw new Error("Browser only");

    const newProject = {
        id: uuidv4(),
        title: idea.slice(0, 30) + (idea.length > 30 ? '...' : ''),
        idea,
        replyLevel,
        messages: [],
        memory: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const projects = getProjects();
    // Prepend to list (newest first)
    const updatedProjects = [newProject, ...projects];

    saveProjects(updatedProjects);
    setActiveProject(newProject.id);

    return newProject;
};

/**
 * Update an existing project
 * @param {Partial<IdeaNavigatorProject> & { id: string }} updates 
 */
export const updateProject = (updates) => {
    if (!isBrowser()) return;

    const projects = getProjects();
    const index = projects.findIndex(p => p.id === updates.id);

    if (index === -1) return; // Project not found

    const updatedProject = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    // Move updated project to top? Requirement says "sorted by updatedAt DESC"
    // So usually yes.
    const otherProjects = projects.filter(p => p.id !== updates.id);
    const newProjectsList = [updatedProject, ...otherProjects];

    saveProjects(newProjectsList);
    return updatedProject;
};

/**
 * Delete a project by ID
 * @param {string} id 
 */
export const deleteProject = (id) => {
    if (!isBrowser()) return;

    const projects = getProjects();
    const newProjects = projects.filter(p => p.id !== id);

    saveProjects(newProjects);

    // If we deleted the active project, switch to another
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (activeId === id) {
        if (newProjects.length > 0) {
            setActiveProject(newProjects[0].id);
        } else {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
        }
    }
};

/**
 * Set the active project ID
 * @param {string} id 
 */
export const setActiveProject = (id) => {
    if (!isBrowser()) return;
    if (id === null) {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    } else {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    }
};

// Internal helper
const saveProjects = (projects) => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
};
