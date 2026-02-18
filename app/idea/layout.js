import ProjectSidebar from "@/components/ProjectSidebar";

export default function IdeaLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <ProjectSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                {/* 
                  Add padding on mobile to account for the sidebar toggle button 
                  or ensure the children have their own header that handles it.
                  The ProjectSidebar toggle is fixed/absolute, so we just need to ensure 
                  content doesn't get hidden behind it if sidebar is overlaid.
                  But ProjectSidebar is responsive.
                */}
                <div className="flex-1 h-full w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
