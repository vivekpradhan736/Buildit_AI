"use client";
import ChatView from "@/components/custom/ChatView";
import CodeView from "@/components/custom/CodeView";
import { useSidebar } from "@/components/ui/sidebar";
import React from "react";

function workspace() {
  const { toggleSidebar } = useSidebar();
  const { open } = useSidebar();
  return (
    <div className="p-3 pr-5 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/50 via-transparent to-transparent">
        <ChatView />
        <div
          className="col-span-2"
          onMouseEnter={() => {
            if (open) {
              toggleSidebar();
            }
          }}
        >
          <CodeView />
        </div>
      </div>
    </div>
  );
}

export default workspace;
