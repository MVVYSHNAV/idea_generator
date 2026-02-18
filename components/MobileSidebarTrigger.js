'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const toggleSidebar = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-sidebar'));
    }
};

export default function MobileSidebarTrigger() {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden mr-2"
        >
            <Menu className="w-5 h-5" />
        </Button>
    );
}
