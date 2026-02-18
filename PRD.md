# Product Requirements Document (PRD)
## Project Name: Idea Navigator Next (Profzer AI)

## 1. Executive Summary
Idea Navigator Next (branded as Profzer AI) is an AI-powered web application designed to help entrepreneurs, freelancers, and creators refine their raw business ideas into actionable strategic plans. By leveraging an interactive AI chat, the tool helps users clarify their vision, identify risks, and generate a comprehensive roadmap and executive summary without requiring any sign-up.

## 2. Problem Statement
Aspiring founders often have "napkin ideas" but struggle to structure them into viable business plans. They lack a sparring partner to challenge their assumptions and a structured way to visualize the path from idea to execution.

## 3. Product Goals
-   **Lower Barrier to Entry:** Allow users to start planning immediately with no account creation (Privacy-first, LocalStorage based).
-   **Interactive Refinement:** Use AI to ask clarifying questions and shape the idea dynamically.
-   **Actionable Output:** Generate a visual roadmap and a professional executive summary that can be exported.
-   **Visual Excellence:** Provide a high-quality, modern, and trustworthy user interface.

## 4. User Personas
-   **The Solo Founder:** Has a tech/business idea but needs help fleshing out the details.
-   **The Freelancer:** Wants to launch a new service offering and needs a go-to-market plan.
-   **The Student/Hobbyist:** Exploring feasibility of a passion project.

## 5. User Stories
-   As a **User**, I want to enter my raw idea into a simple text box so that I can get started quickly.
-   As a **User**, I want to chat with an AI that asks me specific questions to refine my idea.
-   As a **User**, I want to toggle between "Technical" and "Non-Technical" language so the AI speaks my language.
-   As a **User**, I want to see a visual roadmap of my project's phases (MVP, Growth, etc.).
-   As a **User**, I want to export my roadmap to Markdown to save it.
-   As a **User**, I want to generate an Executive Summary to share with potential co-founders or investors.
-   As a **User**, I want my progress saved automatically so I can resume later if I close the tab.

## 6. Functional Requirements

### 6.1 Landing Page
-   **Hero Section:** Clear value proposition ("Turn ideas into plans").
-   **Project State Detection:** Check LocalStorage for existing projects.
    -   If exists: Show "Resume Project" and "Start New" (with confirmation to wipe).
    -   If new: Show "Start Planning".

### 6.2 Idea Input
-   **Input:** Large text area for "brain dumping".
-   **Processing:** Seamless transition to the chat interface upon submission.

### 6.3 Interactive Chat (Core)
-   **Interface:** Chat-style UI.
-   **AI Persona:** "Profzer AI" - constructive, critical, but encouraging.
-   **Memory:** Sidebar or modal to show "Project Memory" (key decisions made so far).
-   **Controls:**
    -   **Reply Level Toggle:** Switch between "Tech" (jargon-heavy, architectural) and "Non-Tech" (business-focused, simple).
    -   **Memory Toggle:** View context the AI has gathered.
-   **Roadmap Trigger:** Option to "Generate Roadmap" after sufficient information is gathered.

### 6.4 Roadmap Generation
-   **Visual Display:** Timeline or kanban-style view of phases (Validation, MVP, Launch, Scale).
-   **Content:**
    -   Target Users
    -   Key Assumptions
    -   MVP Features
    -   Risks & Open Questions
-   **Export:** Download as Markdown file.

### 6.5 Project Summary
-   **Feature:** Generate a professional "Executive Summary".
-   **Format:** Modal popup with copy/download options.
-   **Adaptability:** Tone matches the selected "Reply Level" (Tech vs Non-Tech).

### 6.6 Data Management
-   **Storage:** All data (Messages, Roadmap, Summary) stored in Browser's `localStorage` (`idea_navigator_project`).
-   **Privacy:** No data sent to server for permanent storage (Client-side only persistence).
-   **Reset:** Option to wipe data and start fresh.

## 7. Technical Requirements

### 7.1 Tech Stack
-   **Framework:** Next.js 14+ (App Router).
-   **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`.
-   **Animations:** Framer Motion, GSAP.
-   **Icons:** Lucide React.
-   **AI Integration:**
    -   OpenAI API (for chat and summarization).
    -   HuggingFace Inference (potential fallback or specialized tasks).

### 7.2 API Endpoints
-   `POST /api/chat`: Handles the conversation logic.
-   `POST /api/summary`: Generates the executive summary.
-   `POST /api/roadmap` (Likely part of chat or separate): Generates structured roadmap data.

### 7.3 Performance
-   **Loading States:** Skeleton loaders or spinners during AI generation.
-   **Optimistic UI:** Immediate feedback for user actions.

## 8. Design & UX Guidelines
-   **Theme:** Modern, maybe dark mode or high-contrast clean look.
-   **Typography:** Readable sans-serif fonts (Inter/Geist).
-   **Feedback:** Toast notifications for success/error (e.g., "Roadmap Exported").

## 9. Future Considerations (V2)
-   User Accounts / Cloud Sync.
-   PDF Export.
-   Integration with project management tools (Trello/Jira).
-   Multiple project support.
