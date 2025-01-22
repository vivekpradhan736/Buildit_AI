"use client";
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Link, Loader2Icon, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SidebarProvider, useSidebar } from '../ui/sidebar';
import { toast } from 'sonner';

export const countToken = (inputText) =>{
  return inputText.trim().split(/\s+/).filter(word=> word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail,setUserDetail} = useContext(UserDetailContext);
  const { messages,setMessages } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const {toggleSidebar}=useSidebar();
  const {open}=useSidebar()
  const UpdateTokens=useMutation(api.users.UpdateToken);

  useEffect(() => {
    id&& GetWorkspaceData();
  }, [id]);

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
        workspaceId:id
    });
  setMessages(result?.messages)
  console.log(result);
}

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      const role = messages[messages.length - 1].role;
      if (role === 'user') {
        GetAiResponse();
      }
    }
  }, [messages]);

  const GetAiResponse = async () => {
    setLoading(true);
    try {
      const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
      const result = await axios.post('/api/ai-chat', { prompt: PROMPT });
      const aiResp = { role: 'ai', content: result.data.result };
      setMessages((prev) => [...prev, aiResp]);
      
      await UpdateMessages({ messages: [...messages, aiResp], workspaceId: id });

      const token=Number(userDetail?.token)-Number (countToken(JSON.stringify(aiResp)));
      //update tokens
      setUserDetail(prev=>({
        ...prev,
        token:token
      }))
      await UpdateTokens({
        userId:userDetail?._id,
        token:token
      })
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = (input) => {
    if (input?.trim()) {
      setMessages((prev) => [...prev, { role: 'user', content: input }]);
      setUserInput('');
    }
  };

  useEffect(() => {
    // Function to handle keydown event
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default behavior of new line
            onGenerate(userInput);
        }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [userInput, onGenerate]);

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className={`flex-1 overflow-y-scroll scrollbar-hide hide-scrollbar ${!open && 'pl-9'}`}>
          {messages?.length>0&&messages?.map((msg, index) => (
            <div
              key={index}
              className="p-3 rounded-lg mb-4 flex gap-2 items-start"
              style={{ backgroundColor: Colors.CHAT_BACKGROUND 
          }}>
              {msg?.role == 'user' && 
                <Image
                  src={userDetail?.picture || '/default-user.png'}
                  alt="userImage"
                  width={35}
                  height={35}
                  className="rounded-full"
                />}
              <ReactMarkdown className="flex flex-col text-sm">
                {msg.content || 'Your Data'}
              </ReactMarkdown>
            </div>
              ))}
        {loading && 
          <div
            className="p-5 rounded-lg mb-2 flex gap-2 items-center"
            style={{ backgroundColor: Colors.CHAT_BACKGROUND }}
          >
            <Loader2Icon className="animate-spin" />
            <h2>Generating response...</h2>
          </div>
        }
      </div>
     {/* input section */}
     <div className='flex gap-2 items-end'>
     {userDetail && !open && <div className='flex flex-col gap-4'>  <Image src={userDetail?.picture}
     className='rounded-full cursor-pointer'
     alt='user' width={30} height={30}/>
     {!open && (
     <PanelLeftOpen
     className='cursor-pointer'
        onClick={()=>{toggleSidebar()
        }} 
     />
    )}
     </div> }
      <div
        className="p-5 border rounded-xl max-w-xl w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/50 via-transparent to-transparent"
        style={{
                    // backgroundColor: Colors.BACKGROUND,
                    borderColor: 'rgba(0, 255, 255, 0.4)', // Default border color for fallback
                  }}>
        <div className="flex gap-2">
          <textarea
            placeholder={Lookup.INPUT_PLACEHOLDER || 'Type your message...'}
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            className="outline-none hide-scrollbar w-full h-24 bg-transparent bg-opacity-70 backdrop-filter backdrop-blur-lg"
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer"
            />
          )}
        </div>
        <Link className="h-5 w-5" />
      </div>
      </div>
    </div>
  );
}

export default ChatView;
