"use client";
import workspace from '@/app/(main)/workspace/[id]/page';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { useSidebar } from '../ui/sidebar';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2Icon, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '../ui/separator';

function WorkspaceHistory() {
    const { id } = useParams();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const convex = useConvex();
    const [workspaceList, setWorkspaceList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { toggleSidebar } = useSidebar();
    const DeleteWorkspace = useMutation(api.workspace.DeleteWorkspace);
    const SearchWorkspaces = useMutation(api.workspace.SearchWorkspaces);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    useEffect(() => {
        if (userDetail) {
            GetAllWorkspace();
        }
    }, [userDetail, searchTerm]);

    const GetAllWorkspace = async () => {
        let result = await convex.query(api.workspace.GetAllWorkspace, {
            userId: userDetail?._id
        });
        const reversedResult = result.reverse();

        if (searchTerm.trim()) {
            const filteredResult = reversedResult.filter(workspace =>
                workspace?.messages[0]?.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setWorkspaceList(filteredResult);
        } else {
            setWorkspaceList(reversedResult);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const deleteWorkspace = async () => {
        setDeleteLoading(true);
        if (!selectedWorkspace) return;

        await DeleteWorkspace({ workspaceId: selectedWorkspace });
        GetAllWorkspace();
        setOpenDialog(false);
        setDeleteLoading(false);
        setSelectedWorkspace(null);
    };

    // 🔹 Function to format the chat creation date
    const getFormattedDate = (timestamp) => {
        const date = new Date(timestamp);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        if (differenceInDays(new Date(), date) <= 7) return "Last 7 Days";
        if (differenceInDays(new Date(), date) <= 30) return "Last 30 Days";
        if (differenceInYears(new Date(), date) > 0) {
            return format(date, "MMMM yyyy"); // Example: "January 2023"
        }
        return format(date, "MMMM"); // Example: "January"
    };

    // 🔹 Group workspaces by date category
    const groupedWorkspaces = workspaceList.reduce((groups, workspace) => {
        const formattedDate = getFormattedDate(workspace._creationTime);
        if (!groups[formattedDate]) {
            groups[formattedDate] = [];
        }
        groups[formattedDate].push(workspace);
        return groups;
    }, {});

    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="p-2 rounded border w-full"
                />
            </div>

            <h2 className="font-medium text-sm">Your Chats</h2>

            {workspaceList.length === 0 && searchTerm && (
                <div className="text-gray-500 text-center">No search results</div>
            )}

            {workspaceList.length > 0 ? (
                <div className="h-[180px] overflow-y-auto hide-scrollbar">
                    {Object.entries(groupedWorkspaces).map(([dateCategory, workspaces]) => (
                        <div key={dateCategory}>
                            <h3 className="text-[0.80rem] text-gray-500 font-semibold mt-2 mb-1">{dateCategory}</h3>
                            {workspaces.map((workspace, index) => (
                                <div key={index} className="w-full my-1">
                                    <div
                                        className={`flex items-center justify-between px-2 py-[6px] rounded ${
                                            workspace?._id === id ? 'bg-[#262626]' : ''
                                        } hover:bg-[#262626] link-container`}
                                    >
                                        <Link href={'/workspace/' + workspace?._id}>
                                            <h2
                                                onClick={toggleSidebar}
                                                className="text-sm text-gray-400 font-light cursor-pointer hover:text-white rounded line-clamp-1 w-full"
                                            >
                                                {workspace?.messages[0]?.content}
                                            </h2>
                                        </Link>
                                        <div className="icon-container">
                                            <Trash2
                                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-100"
                                                onClick={() => {
                                                    setSelectedWorkspace(workspace._id);
                                                    setOpenDialog(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-[180px]">
                    <img src="/not-found.png" alt="" className='w-20 h-20 opacity-40' />
                    <h2 className="text-sm">No chats</h2>
                </div>
            )}

            {/* 🔹 Delete Confirmation Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Chat?</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <DialogDescription className="text-[0.92rem] text-[#fdfdfdd6]">
                        You are about to delete
                        <span className="text-[0.92rem] font-semibold text-[#fdfdfd]"> {workspaceList?.find(ws => ws._id === selectedWorkspace)?.messages[0]?.content}.</span>
                    </DialogDescription>
                    <DialogDescription className="text-[0.92rem] text-[#fdfdfdd6]">
                        Are you sure you want to delete this chat?
                    </DialogDescription>
                    <DialogFooter>
                        <Button className="bg-[#343434] hover:bg-[#454545] text-[#fbfbfb]" onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#3a1b1b] hover:bg-[#422020] text-[#e74242]"
                            onClick={deleteWorkspace}
                        >
                            {deleteLoading ? (
                                <Loader2Icon className="animate-spin h-10 w-10 text-white" />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default WorkspaceHistory;
