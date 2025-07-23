"use client"
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup'
import { ArrowRight, Link, Loader2Icon, PanelLeftOpen, PlusCircle, X } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import SignInDialog from './SignInDialog';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useSidebar } from '../ui/sidebar';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import axios from 'axios';

function Hero() {
  const {toggleSidebar}=useSidebar();
  const {open}=useSidebar()
  const [userInput,setUserInput]=useState();
  const [userImageInput,setUserImageInput]=useState(null);
  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  const {messages,setMessages,imageFile,setImageFile}=useContext(MessagesContext);
  const [imageUploadLoading,setImageUploadLoading]=useState(false);
  const [openDialog,setOpenDialog]=useState(false);
  const CreateWorkspace=useMutation(api.workspace.CreateWorkspace)
  const router=useRouter();
  const [imageURL, setImageURL] = useState('');

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

  const onGenerate=async(input)=>{
    if(!userDetail?.name)
    {
      setOpenDialog(true);
      return;
    }

    if(userDetail?.token<10)
      {
        toast('You Dont Have Enough Token! ');
        return;
      }

    const msg={
      role:'user',
    content:input,
    image: imageURL || null,
    }
   setMessages(msg);

   if(userImageInput)
   {
    setImageFile(userImageInput);
   }

   const workspaceId = await CreateWorkspace({
    user:userDetail._id,
    messages:[msg]
   });
   router.push('/workspace/'+workspaceId);
  }

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
    <div className="flex h-[75vh]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16 flex flex-col items- justify-end py-4">
        <div className="flex gap-4">

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center mt-8">
            {userDetail && !open &&(
              <> <div className='p-2 rounded-lg  transition-colors'>  <Image src={userDetail?.picture}
                 className='w-6 h-6 rounded-full cursor-pointer'
                 alt='user' width={30} height={30}/>
                 </div>
                 {!open && (
                  <div className="p-2 rounded-lg transition-colors">
                 <PanelLeftOpen
                 className='w-6 h-6 text-gray-400 hover:text-white cursor-pointer'
                    onClick={()=>{toggleSidebar()
                    }} 
                 />
                 </div>
                )} </>) }
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col items-center ${open ? "w-[calc(100vw-26rem)]" : "w-[calc(100vw-6rem)]"} gap-2 mt-16 sm:mt-20 md:mt-24 lg:mt-28 xl:mt-32 px-4 sm:px-6 lg:px-8 ml-16`} onMouseEnter={() => {
            if (open) {
              toggleSidebar();
            }
          }}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">{Lookup.HERO_HEADING}</h2>
        <p className="font-medium text-gray-400 text-center text-sm sm:text-base md:text-lg max-w-2xl">
          {Lookup.HERO_DESC}
        </p>

        <div
          className="w-full max-w-xl p-3 sm:p-4 md:p-5 mt-3 border rounded-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"
          style={{
            borderColor: "rgba(0, 255, 255, 0.4)",
          }}
        >
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
                    onClick={() => setUserImageInput(null)}
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
              placeholder={Lookup.INPUT_PLACEHOLDER}
              onChange={(event) => setUserInput(event.target.value)}
              className="w-full h-24 sm:h-28 md:h-32 bg-transparent outline-none resize-none sm:resize-y max-h-56 text-sm sm:text-base"
            />
            {userInput && (
              <button
                onClick={() => onGenerate(userInput)}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-md cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Generate"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
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

        <div className="flex flex-wrap items-center justify-center max-w-2xl gap-2 sm:gap-3 mt-6 sm:mt-8">
          {Lookup?.SUGGSTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onGenerate(suggestion)}
              className="p-1 px-2 text-xs sm:text-sm text-gray-400 border rounded-full cursor-pointer hover:text-white hover:border-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <SignInDialog openDialog={openDialog} closeDialog={(v) => setOpenDialog(v)} />
      </div>
    </div>

   
  )
}

export default Hero