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

function CodeView() {
  const {id}=useParams();
  const [activeTab,setActiveTab]=useState('code');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userDetail,setUserDetail } = useContext(UserDetailContext);
  const [files,setFiles]=useState(Lookup?.DEFAULT_FILE);
  const {messages,setMessages}=useContext(MessagesContext);
  const UpdateFiles=useMutation(api.workspace.UpdateFiles)
  const convex=useConvex();
  const [loading,setLoading]=useState(false);
  const UpdateTokens=useMutation(api.users.UpdateToken);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { action, setAction } = useContext(ActionContext);
  const [isLineWrapping, setIsLineWrapping] = useState(false);

  useEffect(()=>{
   id&&GetFiles();
  },[id])


  useEffect(()=>{
    const LineWrapping = localStorage.getItem("LineWrapping")
    if(LineWrapping){
      setIsLineWrapping(JSON.parse(LineWrapping))
    }
   },[localStorage.getItem("LineWrapping")])

  useEffect(()=>{
    setActiveTab('preview')
   },[action])

  const GetFiles= async()=>{
    setLoading(true);
    const result=await convex.query(api.workspace.GetWorkspace,{
      workspaceId:id
    });
    const mergedFiles={...Lookup.DEFAULT_FILE,...result?.fileData}
    setFiles(mergedFiles);
    setLoading(false);
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
    setLoading(true)
    setActiveTab('code')
    const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
    const result=await axios.post('/api/gen-ai-code',{
      prompt:PROMPT
    });
    const aiResp=result.data;

    const mergedFiles={...Lookup.DEFAULT_FILE,...aiResp?.files}
    setFiles(mergedFiles);
    await UpdateFiles({
     workspaceId:id,
     files:aiResp?.files
    });

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


        setLoading(false);
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

  return (
    <div className=''>
      <div className="bg-[#181818] relative w-full p-2 border z-10">
        <div className="flex items-center flex-wrap shrink-0 bg-black p-1 justify-center rounded-full w-[130px] gap-3">
          <h2
            onClick={() => setActiveTab('code')}
            className={`text-sm cursor-pointer ${activeTab == 'code' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}
          >
            Code
          </h2>
          <h2
            onClick={() => setActiveTab('preview')}
            className={`text-sm cursor-pointer ${activeTab == 'preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}
          >
            Preview
          </h2>
        </div>
      </div>
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
      {loading === true ? (
        <div className=" bg-gray-900 opacity-80 rounded-lg h-screen flex justify-center">
          {/* <Loader2Icon className="animate-spin h-10 w-10 text-white" />
          <h2 className="text-white">Generating your files...</h2> */}
          {/* Left Sidebar - File Explorer */}
      <div className="w-40 border-r border-border bg-muted/10 p-4 space-y-4">
        {/* Folder Structure */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" /> {/* public */}
          <div className="pl-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        {/* File List */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" /> {/* App.css */}
          <Skeleton className="h-3 w-14" /> {/* App.js */}
          <Skeleton className="h-3 w-16" /> {/* index.js */}
          <Skeleton className="h-3 w-24" /> {/* package.json */}
          <Skeleton className="h-3 w-32" /> {/* postcss.config.js */}
          <Skeleton className="h-3 w-20" /> {/* styles.css */}
          <Skeleton className="h-3 w-28" /> {/* tailwind.config.js */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-6 overflow-hidden">
        {/* Tab Bar */}
        <div className="flex gap-2 border-b border-border pb-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Code Editor Content */}
        <div className="space-y-2">
          {/* Import statements */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Function declaration */}
          <Skeleton className="h-4 w-32 mt-4" />

          {/* Function content */}
          <div className="pl-4 space-y-1 mt-2">
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* More code blocks */}
          <div className="space-y-1 mt-4">
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </div>
      </div>
        </div>
      ) : (
        <SandpackLayout>
          {activeTab == 'code' ? (
            <>
              <SandpackFileExplorer style={{ height: '80vh' }} />
              <SandpackCodeEditor style={{ height: '80vh' }} wrapContent={isLineWrapping} />
            </>
          ) : (
            <SandpackPreviewClient customActions={customActions} height='80vh' width='80vw' />
          )}
        </SandpackLayout>
      )}
      </SandpackProvider>

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