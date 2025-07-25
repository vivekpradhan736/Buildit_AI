"use client";
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Link, Loader2Icon, PanelLeftOpen, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SidebarProvider, useSidebar } from '../ui/sidebar';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion"
import { NumericFormat } from "react-number-format";

export const countToken = (inputText) =>{
  return inputText.trim().split(/\s+/).filter(word=> word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const router = useRouter();
  const { userDetail,setUserDetail} = useContext(UserDetailContext);
  const { messages,setMessages,imageFile,setImageFile } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const [imageUploadLoading,setImageUploadLoading]=useState(false);
  const {toggleSidebar}=useSidebar();
  const {open}=useSidebar()
  const [userImageInput,setUserImageInput]=useState(null);
  const UpdateTokens=useMutation(api.users.UpdateToken);
  const [isShowTokens, setIsShowTokens] = useState(false);

  async function uploadImageToCloudinary(imageFile) {
    const CLOUDINARY_NAME = "dfzbbx31u";
    const CLOUDINARY_API_KEY = "736842653849378";
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;
  
    // Create a form data object
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Buildit_AI"); // Replace with your upload preset
    formData.append("api_key", CLOUDINARY_API_KEY);
  
    try {
      // Make the POST request to Cloudinary
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Return the uploaded image URL
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error;
    }
  }

  const handleImageChange = async (e) => {
    try {
      setImageUploadLoading(true);
      setUserImageInput(e.target.files[0]);
      setImageFile(e.target.files[0]);
      let Url;
      
      if (e.target.files[0]) { // Ensure a file is selected
        Url = await uploadImageToCloudinary(e.target.files[0]);
        setImageURL(Url);
        setImageUploadLoading(false);
      } else {
        console.warn("No file selected for upload.");
        setImageUploadLoading(false);
      }
    } catch (error) {
      setImageUploadLoading(false);
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image. Please try again.");
    }
  };

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  console.log("id ", id)

  useEffect(()=>{
      const ShowTokens = localStorage.getItem("ShowTokens")
      if(ShowTokens){
        setIsShowTokens(JSON.parse(ShowTokens))
      }
     },[])

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
        workspaceId:id
    });
  setMessages(result?.messages)
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
      let PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;

      // If an image file is attached, include it in the request
      const formData = new FormData();
      formData.append('prompt', PROMPT);
      if (imageFile) {
        formData.append('imageFile', imageFile); // Attach the image file
      }

      const result = await axios.post('/api/ai-chat', formData
        , {
        headers: {
          'Content-Type': 'multipart/form-data', // Set headers for file upload
        }}
      );
      setLoading(false);
      setImageFile([]);
      const aiResp = { role: 'ai', content: result.data.result };
      setMessages((prev) => [...prev, aiResp]);
      
      await UpdateMessages({ 
        messages: [...messages, aiResp], 
        workspaceId: id,
      });

      const token=Number(userDetail?.token)-Number (countToken(JSON.stringify(aiResp)));
      const newPerDayToken=Number(userDetail?.perDayToken)-Number (countToken(JSON.stringify(aiResp)));
      //update tokens
      setUserDetail(prev=>({
        ...prev,
        token:token,
        perDayToken: newPerDayToken
      }))
      await UpdateTokens({
        userId:userDetail?._id,
        token:token,
        perDayToken:newPerDayToken
      })
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = (input) => {
    if (input?.trim()) {
      setMessages((prev) => [...prev, { role: 'user', content: input, image: imageURL || null }]);
      setUserInput('');
      setImageURL(null)
      setUserImageInput(null)
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
                <div className='mt-2'>
                {
                  msg?.role == 'user' && msg?.image != null && (
                    <Dialog>
      <DialogTrigger asChild>
        <button className="relative inline-block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md overflow-hidden">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-md overflow-hidden">
            <img src={msg?.image || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0">
      <DialogTitle></DialogTitle>
        <div className="relative w-full h-full">
          <div
            className={cn(
              "relative w-full",
              "aspect-square sm:aspect-video md:aspect-[4/3] lg:aspect-[16/9]",
              "max-h-[80vh] rounded-md overflow-hidden",
            )}
          >
            <img src={msg?.image || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
                  )}
              <ReactMarkdown className="flex flex-col text-sm">
                {msg.content || 'Your Data'}
              </ReactMarkdown>
              </div>
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
     <div className="w-full max-w-2xl">
      <div className="relative rounded-lg border border-gray-800 bg-[#1a1a1a] text-gray-200 overflow-hidden">
      <AnimatePresence>
          {isShowTokens && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className=""
            >
              <div className="px-4 py-1 flex gap-2 items-center justify-between text-xs text-nowrap">
                <span className="text-gray-300">
                <NumericFormat
          value={userDetail?.perDayToken}
          thousandsGroupStyle="lakh"
          thousandSeparator=","
          displayType="text"
          className='text-xs'
          renderText={(value) => <b>{value} </b>}
        /> daily tokens remaining.</span>
                <a className="text-blue-400 transition-colors hover:underline cursor-pointer" onClick={() => {
                  router.push('/pricing');
                }}>
                  Upgrade Plan
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      <div
        className="p-5 border rounded-xl max-w-xl w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/50 via-transparent to-transparent"
        style={{
                    // backgroundColor: Colors.BACKGROUND,
                    borderColor: 'rgba(0, 255, 255, 0.4)', // Default border color for fallback
                  }}>
          {/* Image Preview */}
  {userImageInput && (
    <>
              <div className="relative inline-block">
                <div className="relative h-16 w-16 rounded">
                  <img
                    src={URL.createObjectURL(userImageInput) || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  {imageUploadLoading === true ? (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"><Loader2Icon className="animate-spin h-3 w-3" /></div>
                  ) : (
                    <button
                    onClick={() => {
                      setUserImageInput(null)
                      setImageURL(null)
                    }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  )}
                </div>
              </div>
              <Separator className="bg-[#0a7a80] mb-3" />
              </>
            )}
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
        <div className="mt-2">
                  <label className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden" // Hide the file input, style the label instead
            />
            <span><Link className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"/></span> {/* Add an icon or text here for better UI */}
          </label>
                  </div>
      </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default ChatView;