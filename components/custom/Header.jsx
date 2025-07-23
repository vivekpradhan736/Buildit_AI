'use client';

import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Colors from '@/data/Colors';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { LucideDownload, Rocket, Github, Copy, ArrowRight } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useCountUp } from "use-count-up";
import { ActionContext } from '@/context/ActionContext';
import SignInDialog from './SignInDialog';
import { createRepoAndPushCode } from '@/lib/github';
import { MessagesContext } from '@/context/MessagesContext';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { v } from 'convex/values';
import { mutation, query} from '../../convex/_generated/server';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { cn } from '@/lib/utils';
import VercelPublishCard from './VercelPublishCard';

function Header() {
  const router = useRouter();
  const path = usePathname();
  const params = useParams();
  const id = params?.id;
  const convex = useConvex();
  const { userDetail, setUserDetail, userDetailLoading, userGithubDetail, setUserGithubDetail } = useContext(UserDetailContext);
  const { action, setAction } = useContext(ActionContext);
  const { data: session, status: sessionStatus } = useSession();
  const [openDialog,setOpenDialog]=useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const {messages, generatedCode, setGeneratedCode, codeGeneratingLoading, setCodeGeneratingLoading}=useContext(MessagesContext);
  const storeGithubToken=useMutation(api.github.storeGithubToken)
  const [currentWorkspace, setCurrentWorkspace] = useState({});
  const UpdateGithubURL=useMutation(api.workspace.UpdateGithubURL)
  const [activeTab, setActiveTab] = useState('HTTPS');

  const userId = userDetail?._id;
  const githubInfo = useQuery(api.github.getGithubToken, userId ? { userId } : "skip");

  const GetWorkspace = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id
    });
    console.log("result",result)
    setCurrentWorkspace(result);
  };
  
  useEffect(() => {
    if (id) GetWorkspace();
  }, [id, generatedCode]);

  useEffect(() => {
  const saveGithubToken = async () => {
    if (!userId || !session || !session.accessToken) return;

    if (!githubInfo) {
      console.log("User not stored");
      const user = {
        userId,
        githubMail: session.user.email,
        accessToken: session.accessToken,
        githubUsername: session.githubUsername || '',
      };
      if(typeof window!==undefined)
        {
          localStorage.setItem('githubUserDetail',JSON.stringify(user))
        }
        setUserGithubDetail(user);
      await storeGithubToken({
        userId,
        githubMail: session.user.email,
        accessToken: session.accessToken,
        githubUsername: session.githubUsername || '',
      });
    } else {
      console.log("User already stored");
    }
   }
   saveGithubToken();
  }, [session, githubInfo, userId]);

  console.log("userGithubDetail",userGithubDetail)

  const handleGithubConnect = async () => {
    setLoading(true);
    try {
      await signIn('github', { callbackUrl: path });
    } catch (error) {
      console.error('GitHub connect error:', error);
      setLoading(false);
    }
  };

  const handleGithubDisconnect = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: path });
      localStorage.removeItem('githubUserDetail');
      setLoading(false);
    } catch (error) {
      console.error('GitHub disconnect error:', error);
      setLoading(false);
    }
  };

  const handlePushToGitHub = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Extract required values safely
      const userId = userDetail?._id;
      const projectName = generatedCode?.projectTitle;
      const accessToken = userGithubDetail?.accessToken;
  
      if (!userId || !projectName || !accessToken) {
        throw new Error("Missing required data: userId, project name, or GitHub access token.");
      }
  
      // Step 1: Push project to GitHub
      const { data: pushResult } = await axios.post('/api/github/push', {
        userId,
        projectName,
        generatedCode,
        accessToken,
      });
  
      const { repoOwner, repoName, repoUrl } = pushResult;
  
      if (!repoOwner || !repoName || !repoUrl) {
        throw new Error("Incomplete GitHub push response.");
      }
  
      console.log("✅ GitHub repository created:", pushResult);
  
      // Step 2: Update workspace with GitHub info
      await UpdateGithubURL({
        workspaceId: id,
        githubUsername: repoOwner,
        repoName,
        githubURL: repoUrl,
      });
  
      console.log("✅ Workspace updated with GitHub info");
  
      // Step 3: Refresh workspace data
      await GetWorkspace();
      console.log("✅ Workspace data refreshed");
  
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "An unknown error occurred.";
      console.error("❌ Error during GitHub push:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  

  const start = 0;
  const end = userDetail?.perDayToken;
  const duration = 1;
  const easing = "linear";
  const decimalPlaces = 0;

  const { value, reset } = useCountUp({
    isCounting: true,
    start,
    end,
    duration,
    easing,
    decimalPlaces
  });

  useEffect(() => {
    reset();
  }, [userDetail?.perDayToken])
  

  const onActionBtn = (action) => {
    setAction({
      actionType: action,
      timeStamp: Date.now(),
    });
  };

  const handleStartNewChat = () => {
    router.push("/"); // Redirect to the first page (home or main)
  };

  const getCloneCommand = () => {
    switch (activeTab) {
      case 'HTTPS':
        return `https://github.com/${currentWorkspace?.githubUsername}/${currentWorkspace?.repoName}.git`;
      case 'SSH':
        return `git@github.com:${currentWorkspace?.githubUsername}/${currentWorkspace?.repoName}.git`;
      case 'GitHub CLI':
        return `gh repo clone ${currentWorkspace?.githubUsername}/${currentWorkspace?.repoName}`;
      default:
        return '';
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(getCloneCommand());
  };

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-800/90 via-transparent to-transparent">
      <Image
              src={"/logo2.svg"}
              alt="user"
              width={20}
              height={20}
              className="rounded-full w-[100px] cursor-pointer"
              onClick={handleStartNewChat}
            />

      {/* Authentication Buttons */}
      {!userDetail?.name ? (
        userDetailLoading ? (
          <h1> </h1>
        ) : (
          <div className="flex gap-5 bg-transparent">
            <Button variant="ghost" onClick={() => setOpenDialog(true)}>Sign In</Button>
            <Button
              onClick={() => setOpenDialog(true)}
              className="text-white"
              style={{ backgroundColor: Colors.BLUE }}
            >
              Get Started
            </Button>
          </div>
        )
      ) : path?.includes('workspace') ? (
        <div className="flex items-center gap-2">
          <Button className="hover:bg-[#5858584e]" variant="ghost" onClick={() => onActionBtn('export')}>
            <LucideDownload /> Export
          </Button>
          {/* <Button
            onClick={handleGithubDisconnect}
            disabled={loading}
            className="px-3 py-2 bg-[#2b2b2bfb] rounded hover:bg-[#5f5f5d] disabled:bg-gray-400 relative"
          >
            <Github className='text-white' />Signout
          </Button> */}
          {userGithubDetail?.accessToken ? (
            <TooltipProvider>
            <Tooltip>
            <TooltipTrigger asChild>
              <div>
            <Popover>
            <PopoverTrigger asChild>
            <Button
              className="px-3 py-2 bg-[#2b2b2bfb] rounded hover:bg-[#5f5f5d] disabled:bg-gray-400"
            >
              <Github className='text-white' />
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-[#1c1c1c]">
              {currentWorkspace?.githubURL ? (
              <div className="grid gap-4">
      <div className="flex items-center">
        <h2 className=" font-semibold">GitHub</h2>
      </div>
      
      <p className="text-gray-300 text-sm">
        This project is connected to{' '}
        <span className="font-semibold">{currentWorkspace?.githubUsername}/{currentWorkspace?.repoName}</span>.
        Buildit will commit changes to the <span className="font-semibold">main</span> branch.
      </p>
      
      <p className="text-gray-300 text-sm">
        Your source code only exists in your GitHub repository. Deleting it removes your work.
      </p>
      
      <div className="">
        <h3 className="font-semibold mb-1">Clone</h3>
        
        <div className="flex mb-2">
          {(['HTTPS', 'SSH', 'GitHub CLI']).map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-2 py-1 text-sm mr-2",
                activeTab === tab 
                  ? "text-white font-semibold border-b-2 border-white" 
                  : "text-gray-400 hover:text-gray-200"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center rounded-md mb-3 gap-2">
          <input
            type="text"
            value={getCloneCommand()}
            readOnly
            className="flex-grow bg-[#1c1c1c] px-3 py-2 text-gray-300 text-sm outline-none border border-[#404040] rounded-md"
          />
          <button 
            className="px-4 py-3 hover:bg-[#1f67db] text-blue-400 hover:text-white rounded-md"
            onClick={handleCopyClick}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <a 
          href="#" 
          className="flex text-sm items-center justify-between text-white hover:bg-[#1f67db] px-3 py-2 rounded-md transition-colors"
        >
          <span>Edit in VS Code</span>
          <ArrowRight className="h-4 w-4" />
        </a>
        
        <a 
          href={`https://github.com/${currentWorkspace?.githubUsername}/${currentWorkspace?.repoName}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex text-sm items-center justify-between text-white hover:bg-[#1f67db] px-3 py-2 rounded-md transition-colors"
        >
          <span>View on GitHub</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
              ) : (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold leading-none">GitHub</h4>
                    <p className="text-sm text-muted-foreground text-[#c5c1ba]">
                    Sync your project 2-way with GitHub to collaborate at source.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="lg:flex">
                      <Button
                        className="w-[70%] h-7 bg-[#272725] hover:bg-[#1f67db] border border-gray-700 text-white font-semibold"
                        onClick={handlePushToGitHub}
                        disabled={loading}
                      >
                        <Github className='text-white' /> Connect GitHub
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          </div>
      </TooltipTrigger>
      <TooltipContent>
      Sync your project to GitHub
      </TooltipContent>
    </Tooltip>
    </TooltipProvider>
          ) : (
            <Button
            onClick={handleGithubConnect}
            disabled={loading}
            className="px-3 py-2 bg-[#2b2b2bfb] rounded hover:bg-[#5f5f5d] disabled:bg-gray-400 relative"
          >
            <Github className='text-white' />
            {loading && (
              <div className="absolute text-white text-3xl left-8 top-7">
                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              </div>
            )}
          </Button>
          )}
          {!codeGeneratingLoading && (
            <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50">Publish</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
              <VercelPublishCard
        projectName="creative-dev-online-hub"
        userDetail={userDetail}
        currentWorkspace={currentWorkspace}
        setCurrentWorkspace={setCurrentWorkspace}
        handlePushToGitHub={handlePushToGitHub}
        userGithubDetail={userGithubDetail}
        initialDeployCompleted={currentWorkspace.deployStatus}
      />
              </div>
            </PopoverContent>
          </Popover>
      )}
      {status === "success" && <p className="text-green-600">✅ Deployment successful!</p>}
      {status === "error" && <p className="text-red-600">❌ Deployment failed.</p>}
          <button className="w-full flex items-center justify-between">
                    <div
                      className="flex items-center font-bold text-sm px-2 py-[2px] rounded border cursor-pointer"
                      style={{
                        borderColor: 'rgb(215, 211, 27)',
                        borderWidth: '1px',
                      }}
                    >
                      <Image
              src="/token.png"
              alt="user"
              width={30}
              height={30}
              className="rounded-full w-[30px]"
            />
                      {value || 0}
                    </div>
          </button>
          {userDetail && (
            <Image
              src={userDetail?.picture}
              alt="user"
              width={30}
              height={30}
              className="rounded-full w-[30px]"
            />
          )}
        </div>
      ) : null}
      <SignInDialog openDialog={openDialog} closeDialog={(v) => setOpenDialog(v)} />
    </div>
  );
}

export default Header;