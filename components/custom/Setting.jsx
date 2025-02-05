"use client"

import React, { useContext, useState } from "react";
import { Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Brush, Code, Coins, FlaskConical, History, Lightbulb, Network, Settings, X } from "lucide-react";
import { Separator } from "../ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from 'next/navigation';
import { NumericFormat } from "react-number-format";

const navItems = [
  { id: "general", label: "General", icon: <Settings /> },
  { id: "appearance", label: "Appearance", icon: <Brush /> },
  { id: "editor", label: "Editor", icon: <Code /> },
  { id: "tokens", label: "Tokens", icon: <Coins /> },
  { id: "featurePreviews", label: "Feature Previews", icon: <FlaskConical /> },
  { id: "knowledge", label: "Knowledge", icon: <Lightbulb /> },
  { id: "network", label: "Network", icon: <Network /> },
  { id: "backups", label: "Backups", icon: <History /> },
];

const sectionContent = (setOpen, router, userDetail, openDeleteDialog, setOpenDeleteDialog, deleteLoading, lineWrapping, handleToggle, showTokens, handleShowTokens) => ({
  general: (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Delete all chats</h3>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-red-400"
                onClick={() => {
                    setOpenDeleteDialog(true);
                }}
              >
                Delete all
              </Button>
              <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete all chats?</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <DialogDescription className="text-[0.92rem] text-[#fdfdfdd6]">
                    You are about to delete all chats.
                    </DialogDescription>
                    <DialogDescription className="text-[0.92rem] text-[#fdfdfdd6]">
                    This cannot be undone. Would you like to proceed?
                    </DialogDescription>
                    <DialogFooter>
                        <Button className="bg-[#343434] hover:bg-[#454545] text-[#fbfbfb]" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#3a1b1b] hover:bg-[#422020] text-[#e74242]"
                        >
                            {deleteLoading ? (
                                <Loader2Icon className="animate-spin h-10 w-10 text-white" />
                            ) : (
                                "Delete all"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Show token usage in chat</h3>
        <Switch id="airplane-mode" checked={showTokens} onCheckedChange={handleShowTokens} />
      </div>
    </div>
  ), 
  appearance: (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Theme</h3>
        <Select>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="apple">Light</SelectItem>
          <SelectItem value="banana">Dark</SelectItem>
          <SelectItem value="blueberry">System</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
        </div>
    </div>
  ), 
  editor: (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Line Wrapping</h3>
        <Switch id="line-wrapping-switch" checked={lineWrapping} onCheckedChange={handleToggle} />
        </div>
    </div>
  ), 
  tokens: (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Per day</h3>
        <h3 className="text-sm font-medium text-white">
          <NumericFormat
                    value={userDetail?.perDayToken}
                    thousandsGroupStyle="lakh"
                    thousandSeparator=","
                    displayType="text"
                    className='text-xs'
                    renderText={(value) => <b>{value} </b>}
                  /> / 150,000</h3>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Remaining token</h3>
        <h3 className="text-sm font-medium text-white">
        <NumericFormat
                    value={userDetail?.token}
                    thousandsGroupStyle="lakh"
                    thousandSeparator=","
                    displayType="text"
                    className='text-xs'
                    renderText={(value) => <b>{value} </b>}
                  /> / 1,000,000</h3>
      </div>
      <Button
                variant="destructive"
                size="sm"
                className="bg-[#1488fc] hover:bg-[#0d6fe8] text-white hover:text-white text-sm"
                onClick={() => {
                  router.push('/pricing');
                  setOpen(false);
                }}
              >
                Upgrade for more tokens
              </Button>
    </div>
  ),
  featurePreviews: (
    <div className="space-y-6">
      <h3 className="text-[0.82rem] font-medium text-white">Preview and provide feedback on upcoming enhancements to Buildit.</h3>
      <div className="bg-[#2e2416] px-4 py-2 border-l-2 border-[#f79009]">
        <h1 className="text-[0.82rem] font-medium text-[#e7870a]">Experimental features are only available on paid plans. <a className="text-blue-400 transition-colors hover:underline cursor-pointer" onClick={() => {
                  router.push('/pricing');
                  setOpen(false);
                }}>
                  Upgrade
                </a> to a paid account to get access.</h1>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Diffs</h3>
        <Switch id="line-wrapping-switch" disabled />
        </div>
        <h3 className="text-[0.75rem] font-medium text-[#999999]">Buildit will use a diff-based approach to editing existing files rather than re-writing the entire file for each change.</h3>
    </div>
  ),
  backups: (
    <div className="space-y-6">
      <h3 className="text-[0.82rem] font-medium text-white">Start chatting with Buildit and your backups will show up here</h3>
    </div>
  ),
});

function SettingsDialog({open, setOpen}) {
  const router = useRouter();
  const { userDetail,setUserDetail} = useContext(UserDetailContext);
  const [activeSection, setActiveSection] = useState("general");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lineWrapping, setLineWrapping] = useState(() => {
    return localStorage.getItem("LineWrapping") === "true";
});
const [showTokens, setShowTokens] = useState(() => {
  return localStorage.getItem("ShowTokens") === "true";
});

const handleToggle = () => {
  const newValue = !lineWrapping;
  setLineWrapping(newValue);
  localStorage.setItem("LineWrapping", newValue);
};

const handleShowTokens = () => {
  const newValue = !showTokens;
  setShowTokens(newValue);
  localStorage.setItem("ShowTokens", newValue);
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl p-0 bg-[#171717] text-white border-[#2a2a2a]">
        <div className="flex h-[550px]">
          <Sidebar navItems={navItems} activeSection={activeSection} setActiveSection={setActiveSection} />
          <MainContent setOpen={setOpen} router={router} userDetail={userDetail} activeSection={activeSection} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} deleteLoading={deleteLoading} lineWrapping={lineWrapping} handleToggle={handleToggle} showTokens={showTokens} handleShowTokens={handleShowTokens} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Sidebar({ navItems, activeSection, setActiveSection }) {
  return (
    <div className="w-48 border-r border-[#2a2a2a] bg-black p-2 space-y-1">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={`w-full justify-start gap-2 ${activeSection === item.id ? "bg-[#2a2a2a] text-white" : "text-gray-400"}`}
          onClick={() => setActiveSection(item.id)}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  );
}

function MainContent({ setOpen, router, userDetail, activeSection, openDeleteDialog, setOpenDeleteDialog, deleteLoading, lineWrapping, handleToggle, showTokens, handleShowTokens }) {
  return (
    <div className="flex-1 p-6">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-xl font-semibold text-white">
          {navItems.find((item) => item.id === activeSection)?.label}
        </DialogTitle>
      </DialogHeader>
      {sectionContent(setOpen, router, userDetail, openDeleteDialog, setOpenDeleteDialog, deleteLoading, lineWrapping, handleToggle, showTokens, handleShowTokens)[activeSection]}
    </div>
  );
}

function Section({ title }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-white">{title}</h3>
    </div>
  );
}

export default SettingsDialog;
