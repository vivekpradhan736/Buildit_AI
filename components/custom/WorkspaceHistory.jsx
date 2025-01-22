"use client"
import workspace from '@/app/(main)/workspace/[id]/page';
import { UserDetailContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

function WorkspaceHistory() {
    const { id } = useParams();
    const {userDetail,setUserDetail}=useContext(UserDetailContext);
    const convex=useConvex();
    const [workspaceList,setWorkspaceList]=useState();
    const [searchTerm, setSearchTerm] = useState("");
    const {toggleSidebar}=useSidebar(); 
    const DeleteWorkspace=useMutation(api.workspace.DeleteWorkspace)
    const SearchWorkspaces=useMutation(api.workspace.SearchWorkspaces)

    useEffect(()=>{
        if (userDetail) {
            GetAllWorkspace();
        }
    },[userDetail, searchTerm])

    // Function to fetch all workspaces or filtered workspaces based on search term
    const GetAllWorkspace = async () => {
        let result = await convex.query(api.workspace.GetAllWorkspace, {
            userId: userDetail?._id
        });
        const reversedResult = result.reverse();

        // If there's a search term, filter workspaces by it
        if (searchTerm.trim()) {
            const filteredResult = reversedResult.filter(workspace =>
                workspace?.messages[0]?.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setWorkspaceList(filteredResult);
        } else {
            setWorkspaceList(reversedResult);
        }
    };

    // Handle search term change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const deleteWorkspace = async(workspaceId) => {
        const result = await DeleteWorkspace({
            workspaceId:workspaceId
        })
        GetAllWorkspace();
    }

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
            {workspaceList && workspaceList.length === 0 && searchTerm && (
                <div className="text-gray-500 text-center h-[0px]">No search results</div>
            )}
            {workspaceList && (
            <div className="h-[180px] overflow-y-auto hide-scrollbar">
                {workspaceList && workspaceList.map((workspace, index) => (
                    <div key={index} className="w-full my-1">
                        <div
                            className={`flex items-center justify-between px-2 py-[6px] rounded ${
                                workspace?._id === id ? 'bg-[#262626]' : ''
                            } hover:bg-[#262626] link-container`}
                        >
                            <Link href={'/workspace/' + workspace?._id}>
                                <h2
                                    onClick={toggleSidebar}
                                    className={`text-sm text-gray-400 font-light cursor-pointer hover:text-white rounded line-clamp-1 w-full`}
                                >
                                    {workspace?.messages[0]?.content}
                                </h2>
                            </Link>
                            <div className="icon-container">
                                <Trash2
                                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-100"
                                    onClick={() => deleteWorkspace(workspace._id)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
  )
}

export default WorkspaceHistory