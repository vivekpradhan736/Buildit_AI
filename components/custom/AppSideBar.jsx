import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "../ui/button";
import { MessageCircleCode, PanelLeftOpen } from "lucide-react";
import WorkspaceHistory from "./WorkspaceHistory";
import SideBarFooter from "./SideBarFooter";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Separator } from "../ui/separator";

function AppSideBar() {
  const router = useRouter(); // Initialize the router
  const { toggleSidebar } = useSidebar();

  const handleStartNewChat = () => {
    router.push("/"); // Redirect to the first page (home or main)
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-3 bg-[#171717]">
        <Image
          src={"/logo2.svg"}
          alt="logo"
          width={90}
          height={90}
          className="cursor-pointer w-[100px]" // Added cursor-pointer
          onClick={handleStartNewChat} // Optional: Logo click navigates to the homepage
        />
        <Button
          className="flex items-center gap-2 mt-5 cursor-pointer" // Added cursor-pointer
          onClick={handleStartNewChat} // Add click handler for navigation
        >
          <MessageCircleCode className="cursor-pointer" />{" "}
          {/* Ensure icon has pointer */}
          Start New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-1 bg-[#171717]">
        <SidebarGroup>
          <WorkspaceHistory />
        </SidebarGroup>
      </SidebarContent>
      <Separator className="" />
      <SidebarFooter>
        <SideBarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSideBar;