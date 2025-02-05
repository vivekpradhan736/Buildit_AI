import { HelpCircle, LogOut, PanelLeftClose, Settings, Wallet, X } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { UserDetailContext } from '@/context/UserDetailContext';
import Colors from '@/data/Colors';
import { useSidebar } from '../ui/sidebar';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import Modal from '../ui/Modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Setting from './Setting';

function SideBarFooter() {
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("Chat")
  const [showTokenUsage, setShowTokenUsage] = React.useState(false)

  const options = [
    {
      name: 'Settings',
      icon: Settings,
      action: () => {
        setOpen(true); // Open the settings modal
        toggleSidebar();
      },
    },
    {
      name: 'Help Center',
      icon: HelpCircle,
    },
    {
      name: 'My Subscription',
      icon: Wallet,
      path: '/pricing',
    },
    {
      name: 'Sign Out',
      icon: LogOut,
      action: () => {
        localStorage.removeItem('user'); // Clear user data
        router.push('/'); // Redirect to the first page
        setTimeout(() => {
          window.location.reload(); // Refresh the page after logout
        }, 500);
      },
    },
  ];

  const onOptionClick = (option) => {
    if (option.action) {
      option.action(); // Execute the custom action if defined
    } else if (option.path) {
      router.push(option.path); // Navigate to the specified path
    } else {
      console.error('No action or path defined for this option.');
    }
  };

  return (
    <div className="p-2 mb-3 position-absolute bg-black">
      {options.map((option, index) => (
        <Button
          variant="ghost"
          onClick={() => onOptionClick(option)}
          key={index}
          className="w-full flex justify-start my-1 cursor-pointer"
        >
          <option.icon className="w-5 h-5 mr-2" />
          <span>{option.name}</span>
        </Button>
      ))}
      <div className="mt-4">
        <Separator className="my-2" />
        {userDetail && (
          <div className="flex justify-center items-center gap-1 px-3 w-full">
            <div className="w-[20%]">
              <Image src={userDetail?.picture} className="rounded-full cursor-pointer" alt="user" width={30} height={30} />
            </div>
            <div className="w-[80%]">
              <h1 className="text-[17px]">{userDetail?.name}</h1>
              <h2 className="text-sm text-gray-500 line-clamp-1">{userDetail?.email}</h2>
            </div>
          </div>
        )}
        <Separator className="my-2" />
        <div className="px-3">
          <PanelLeftClose className="cursor-pointer" onClick={toggleSidebar} />
        </div>
      </div>

      {/* Settings Modal */}
      <Setting open={open} setOpen={setOpen}/>
    </div>
  );
}

export default SideBarFooter;
