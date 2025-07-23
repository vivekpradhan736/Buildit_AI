'use client';

import React, { useEffect, useReducer, useCallback } from 'react';
import { ArrowRight, Check, Github, Link, RefreshCw, FolderPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { useParams } from 'next/navigation';

// Reducer for state management
const initialState = {
  githubCreated: false,
  deployStatus: 'not_started', // not_started, deploying, completed, failed
  deploymentId: null,
  deployProgress: 0,
  deployUrl: '',
  buildStatus: 'UNKNOWN',
  errorMessage: null,
  isPolling: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_GITHUB_CREATED':
      return { ...state, githubCreated: action.payload };
    case 'START_DEPLOYMENT':
      return {
        ...state,
        deployStatus: 'deploying',
        deploymentId: action.payload.deploymentId,
        deployUrl: action.payload.deploymentUrl || '',
        deployProgress: 0,
        errorMessage: null,
        isPolling: true,
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        deployStatus: action.payload.status,
        buildStatus: action.payload.buildStatus || 'UNKNOWN',
        deployProgress: action.payload.progress,
        deployUrl: action.payload.deploymentUrl || state.deployUrl,
        errorMessage: action.payload.errorMessage,
        isPolling: action.payload.isPolling !== undefined ? action.payload.isPolling : state.isPolling,
      };
    case 'SET_ERROR':
      return {
        ...state,
        deployStatus: 'failed',
        errorMessage: action.payload,
        isPolling: false,
        deployProgress: 0,
      };
    case 'RESET_DEPLOYMENT':
      return {
        ...state,
        deployStatus: 'not_started',
        deploymentId: null,
        deployProgress: 0,
        buildStatus: 'UNKNOWN',
        errorMessage: null,
        isPolling: false,
      };
    default:
      return state;
  }
};

const VercelPublishCard = ({
  projectName,
  userDetail,
  currentWorkspace,
  setCurrentWorkspace,
  handlePushToGitHub,
  userGithubDetail,
  initialDeployCompleted,
  initialGithubCreated = false,
}) => {
  const params = useParams();
  const id = params?.id;
  const convex = useConvex();
  const UpdateVercelURL = useMutation(api.workspace.UpdateVercelURL);
  const UpdateDeployStatus = useMutation(api.workspace.UpdateDeployStatus);
  const { toast } = useToast();

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    githubCreated: initialGithubCreated,
    deployStatus: initialDeployCompleted || 'not_started',
  });

  console.log("state",state)

  // Fetch workspace data
  const GetWorkspace = useCallback(async () => {
    if (!id) return;
    try {
      const result = await convex.query(api.workspace.GetWorkspace, { workspaceId: id });
      setCurrentWorkspace(result);
      const vercelUrl = result?.vercelURL ? `https://${result.vercelURL}` : '';
      dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: result.deployStatus || 'not_started',
          progress: 0,
          deploymentUrl: vercelUrl,
          buildStatus: 'UNKNOWN',
          errorMessage: null,
          isPolling: false, // Ensure polling doesn't start unless explicitly triggered
        },
      });
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch workspace data.',
        variant: 'destructive',
      });
    }
  }, [id, convex, setCurrentWorkspace, toast]);

  useEffect(() => {
    GetWorkspace();
  }, [GetWorkspace]);

  // Polling for deployment status
  useEffect(() => {
    if (!state.isPolling || !state.deploymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/vercel/deployment-status?deploymentId=${state.deploymentId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch deployment status');
        }

        // Map Vercel status to progress
        const statusToProgress = {
          QUEUED: 10,
          BUILDING: 40,
          DEPLOYING: 80,
          READY: 100,
          ERROR: 0,
        };

        const progress = statusToProgress[data.status] || 0;
        const isTerminalState = data.status === 'READY' || data.status === 'ERROR';

        dispatch({
          type: 'UPDATE_STATUS',
          payload: {
            status: data.status,
            buildStatus: data.buildStatus || 'UNKNOWN',
            progress,
            deploymentUrl: data.deploymentUrl || state.deployUrl,
            errorMessage: data.errorMessage,
            isPolling: !isTerminalState, // Stop polling on terminal states
          },
        });

        // Update Convex with the final status
        if (isTerminalState) {
          await UpdateDeployStatus({
            workspaceId: id,
            deployStatus: data.status === 'READY' ? 'completed' : 'failed',
          });
          if (data.status === 'READY') {
            await UpdateVercelURL({
              workspaceId: id,
              vercelURL: data.deploymentUrl?.replace('https://', '') || '',
            });
            toast({
              title: 'Deployment Successful',
              description: 'Your project is now live!',
            });
            await GetWorkspace();
          } else if (data.status === 'ERROR') {
            dispatch({
              type: 'SET_ERROR',
              payload: data.errorMessage || 'Deployment failed',
            });
            toast({
              title: 'Deployment Failed',
              description: data.errorMessage || 'Failed to deploy to Vercel.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch deployment status' });
        await UpdateDeployStatus({
          workspaceId: id,
          deployStatus: 'failed',
        });
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch deployment status.',
          variant: 'destructive',
        });
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval); // Cleanup on unmount or when polling stops
  }, [state.isPolling, state.deploymentId, id, UpdateDeployStatus, UpdateVercelURL, toast, GetWorkspace]);

  // Handle deployment (initial deploy or update)
  const handleDeployOrUpdate = async (isUpdate = false) => {
    if (state.deployStatus === 'deploying') return;

    dispatch({ type: 'START_DEPLOYMENT', payload: { deploymentId: null, deploymentUrl: '' } });

    try {
      await UpdateDeployStatus({
        workspaceId: id,
        deployStatus: 'deploying',
      });

      toast({
        title: isUpdate ? 'Update Started' : 'Deployment Started',
        description: 'Your project is being deployed to Vercel...',
      });

      const response = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userDetail?._id,
          repoOwner: currentWorkspace?.githubUsername,
          repoName: currentWorkspace?.repoName,
          githubAccessToken: userGithubDetail?.accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      dispatch({
        type: 'START_DEPLOYMENT',
        payload: {
          deploymentId: data.deploymentId,
          deploymentUrl: data.deploymentUrl || '',
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to deploy to Vercel' });
      await UpdateDeployStatus({
        workspaceId: id,
        deployStatus: 'failed',
      });
      toast({
        title: isUpdate ? 'Update Failed' : 'Deployment Failed',
        description: error.message || 'Failed to deploy to Vercel.',
        variant: 'destructive',
      });
    }
  };

  const handleDeploy = () => handleDeployOrUpdate(false);
  const handleUpdate = () => handleDeployOrUpdate(true);

  const handleRetry = () => {
    dispatch({ type: 'RESET_DEPLOYMENT' });
    handleDeploy();
  };

  return (
    <div className="bg-black text-white rounded-lg shadow-xl p-6">
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-semibold">Vercel Publish</h2>
      </div>

      {/* Step 1: GitHub Repository */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center mr-3 font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-medium">GitHub Repository</h3>
        </div>

        {!currentWorkspace?.githubURL ? (
          <div className="ml-9">
            <p className="text-gray-300 mb-3 text-xs">
              Create a GitHub repository to store your project code.
            </p>
            <Button
              onClick={handlePushToGitHub}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FolderPlus className="h-4 w-4" />
              Create Repository
            </Button>
          </div>
        ) : (
          <div className="ml-9">
            <p className="text-gray-300 mb-2 text-sm">Repository created successfully.</p>
            <div className="flex items-center rounded-md mb-3 gap-2">
              <input
                type="text"
                value={currentWorkspace?.githubURL}
                readOnly
                className="flex-grow bg-[#1c1c1c] px-3 py-2 text-gray-300 text-sm outline-none border border-[#404040] rounded-md"
              />
              <a href={currentWorkspace?.githubURL} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-3 hover:bg-[#1f67db] text-blue-400 hover:text-white rounded-md">
                  <Link className="h-4 w-4 text-blue-400" />
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Deploy */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center mr-3 font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-medium">Deploy to Vercel</h3>
        </div>

        <div className="ml-9">
          {!currentWorkspace?.githubURL ? (
            <p className="text-gray-400 italic text-sm">Complete the previous step first.</p>
          ) : state.deployStatus === 'not_started' ? (
            <>
              <p className="text-gray-300 mb-3 text-sm">
                Deploy your project to make it available online.
              </p>
              <Button
                onClick={handleDeploy}
                className="flex items-center gap-2 bg-[#1f67db] hover:bg-[#1e58b4] text-white"
              >
                <ArrowRight className="h-4 w-4" />
                Deploy to Vercel
              </Button>
            </>
          ) : state.deployStatus === 'deploying' ? (
            <>
              <p className="text-gray-300 mb-2">
                Deploying your project...{' '}
                <span className="inline-block animate-spin">⌀</span>
              </p>
              <p className="text-gray-400 text-xs mb-1">
                Status: {state.buildStatus.toLowerCase()}
              </p>
              <Progress value={state.deployProgress} className="h-2 mb-1" />
              <p className="text-xs text-gray-400">{state.deployProgress}% complete</p>
            </>
          ) : state.deployStatus === 'completed' ? (
            <>
              <p className="text-gray-300 mb-2">
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Deployment successful!
                </span>
              </p>
              <div className="flex items-center rounded-md mb-3 gap-2">
                <input
                  type="text"
                  value={state.deployUrl}
                  readOnly
                  className="flex-grow bg-[#1c1c1c] px-3 py-2 text-gray-300 text-sm outline-none border border-[#404040] rounded-md"
                />
                <a href={state.deployUrl} target="_blank" rel="noopener noreferrer">
                  <button className="px-4 py-3 hover:bg-[#1f67db] text-blue-400 hover:text-white rounded-md">
                    <Link className="h-4 w-4 text-blue-400" />
                  </button>
                </a>
              </div>
              <Button
                onClick={handleUpdate}
                variant="outline"
                className="flex items-center gap-2 border-gray-700 hover:bg-gray-800 text-gray-200 justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Update Deployment
              </Button>
            </>
          ) : (
            <>
              <p className="text-red-400 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Deployment failed: {state.errorMessage || 'Unknown error'}
              </p>
              <Button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Deployment
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VercelPublishCard;