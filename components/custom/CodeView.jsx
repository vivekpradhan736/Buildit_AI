"use client"
import React, { useContext, useEffect, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from '@/data/Lookup';
import axios from 'axios';
import { MessagesContext } from '@/context/MessagesContext';
import Prompt from '@/data/Prompt';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Loader2Icon, Maximize, Minimize } from 'lucide-react';
import { countToken } from './ChatView';
import { UserDetailContext } from '@/context/UserDetailContext';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/context/ActionContext';
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from 'next-auth/react';

function CodeView() {
  const {id, workspaceId}=useParams();
  const [activeTab,setActiveTab]=useState('code');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userDetail, setUserDetail, userGithubDetail, setUserGithubDetail } = useContext(UserDetailContext);
  const [files,setFiles]=useState(Lookup?.DEFAULT_FILE);
  const {messages,setMessages, generatedCode, setGeneratedCode, codeGeneratingLoading, setCodeGeneratingLoading}=useContext(MessagesContext);
  const UpdateFiles=useMutation(api.workspace.UpdateFiles)
  const convex=useConvex();
  const UpdateTokens=useMutation(api.users.UpdateToken);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { action, setAction } = useContext(ActionContext);
  const [isLineWrapping, setIsLineWrapping] = useState(false);
  const { data: session, status: sessionStatus } = useSession();


  useEffect(()=>{
    const LineWrapping = localStorage.getItem("LineWrapping")
    if(LineWrapping){
      setIsLineWrapping(JSON.parse(LineWrapping))
    }
   },[])

  useEffect(()=>{
    setActiveTab('preview')
   },[action])

  const GetFiles= async()=>{
    setCodeGeneratingLoading(true);
    const result=await convex.query(api.workspace.GetWorkspace,{
      workspaceId:id
    });
    const mergedFiles={...Lookup.DEFAULT_FILE,...result?.fileData}
    setFiles(mergedFiles);
    setCodeGeneratingLoading(false);
  }

 useEffect(() => {
     if (Array.isArray(messages) && messages.length > 0) {
       const role = messages[messages.length - 1].role;
       if (role === 'ai') {
         GenerateAiCode();
       }
     }
   }, [messages]);
  
  const GenerateAiCode=async()=>{
    setCodeGeneratingLoading(true)
    setActiveTab('code')
    const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
    const result=await axios.post('/api/gen-ai-code',{
      prompt:PROMPT
    });
    const aiResp=result.data;
    console.log("aiResp ",aiResp)

    const mergedFiles={...Lookup.DEFAULT_FILE,...aiResp?.files}
    console.log("mergedFiles",mergedFiles)
    setFiles(mergedFiles);
    await UpdateFiles({
     workspaceId:id,
     files:aiResp?.files
    });

    setGeneratedCode(aiResp);

      const token=Number(userDetail?.token)-Number(countToken(JSON.stringify(aiResp)));
      const newPerDayToken=Number(userDetail?.perDayToken)-Number (countToken(JSON.stringify(aiResp)));
         //update tokens
         await UpdateTokens({
           userId:userDetail?._id,
           token:token,
           perDayToken:newPerDayToken
         })

         setUserDetail(prev=>({
          ...prev,
          token:token,
          perDayToken:newPerDayToken
        }))


        setCodeGeneratingLoading(false);
        setActiveTab('preview')
   }

   const customActions = (
    <div className='hidden md:block'>
      {isFullScreen === false ? (
        <Maximize onClick={()=> setIsFullScreen(!isFullScreen)} className='text-[#c5c5c5] hover:text-white hover:p-[3px] bg-[#2f2f2f] rounded p-[4px] cursor-pointer' />
      ) : (
        <Minimize onClick={()=> setIsFullScreen(!isFullScreen)} className='text-[#c5c5c5] hover:text-white hover:p-[3px] bg-[#2f2f2f] rounded p-[4px] cursor-pointer' />
      )}
    </div>
);
console.log("my code file",files)

  return (
    <div className=''>
      <div className="bg-[#181818] relative w-full p-2 border z-10">
        <div className="flex items-center justify-center gap-3 bg-black p-1 rounded-full w-fit mx-auto mt-2">
  {['code', 'preview'].map((tab) => (
    <h2
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`text-sm cursor-pointer px-3 py-1 rounded-full transition ${
        activeTab === tab
          ? 'bg-blue-500 bg-opacity-25 text-blue-500'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </h2>
  ))}
</div>
      </div>
      {codeGeneratingLoading ? (
  // Loading UI (unchanged)
  <div className="flex">
    <div className="w-1/5 border-r border-border bg-muted/10 p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="pl-4 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>

    <div className="flex-1 p-4 space-y-6 overflow-hidden">
      <div className="flex gap-2 border-b border-border pb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-4 w-32 mt-4" />
        <div className="pl-4 space-y-1 mt-2">
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-1 mt-4">
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>
    </div>
  </div>
) : activeTab === "code" ? (
  <SandpackProvider
    files={files}
    template="react"
    theme="dark"
    customSetup={{
      dependencies: {
        ...Lookup.DEPENDANCY,
      },
    }}
    options={{
      externalResources: ["https://cdn.tailwindcss.com"],
    }}
  >
    <SandpackLayout className="flex w-full min-h-[80vh]">
      <div className="flex w-full">
        {/* Sidebar/File Tree */}
        <div className="w-[200px] border-r border-zinc-800">
          <SandpackFileExplorer style={{ height: "80vh" }} />
        </div>
        {/* Code Editor */}
        <div className="flex-1 overflow-auto">
          <SandpackCodeEditor
            style={{ height: "80vh" }}
            wrapContent={isLineWrapping}
          />
        </div>
      </div>
    </SandpackLayout>
  </SandpackProvider>
) : (
  <SandpackProvider
    files={files}
    template="react"
    theme="dark"
    customSetup={{
      dependencies: {
        ...Lookup.DEPENDANCY,
      },
    }}
    options={{
      externalResources: ["https://cdn.tailwindcss.com"],
    }}
  >
    <SandpackLayout className="flex w-full min-h-[80vh]">
      <div className="w-full">
        <SandpackPreviewClient
          customActions={customActions}
          height="80vh"
          width="100%"
        />
      </div>
    </SandpackLayout>
  </SandpackProvider>
)}


      {/* Dialog for full-screen preview */}
      {isFullScreen && (
      <div className="bg-gray-900 opacity-100 absolute top-0 left-0 w-full h-full z-50">
        <SandpackProvider
        files={files}
        template="react"
        theme={'dark'}
        customSetup={{
          dependencies: {
            ...Lookup.DEPENDANCY,
          },
        }}
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
        }}
        >
        <SandpackLayout>
          <SandpackPreviewClient customActions={customActions} height='100vh' width='100vw' />
        </SandpackLayout>
        </SandpackProvider>
      </div>
      )}
    </div>
  )
}

export default CodeView