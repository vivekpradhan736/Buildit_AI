import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Colors from '@/data/Colors';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useRouter, usePathname } from 'next/navigation';
import { LucideDownload, Rocket } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { useCountUp } from "use-count-up";
import { ActionContext } from '@/context/ActionContext';
import SignInDialog from './SignInDialog';

function Header() {
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { action, setAction } = useContext(ActionContext);
  const [openDialog,setOpenDialog]=useState(false);

  const path = usePathname();
  const start = 0;
  const end = userDetail?.token;
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
  }, [userDetail?.token])
  

  const onActionBtn = (action) => {
    setAction({
      actionType: action,
      timeStamp: Date.now(),
    });
  };

  const handleStartNewChat = () => {
    router.push("/"); // Redirect to the first page (home or main)
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
        <div className="flex gap-5 bg-transparent">
          <Button variant="ghost" onClick={() => setOpenDialog(true)} >Sign In</Button>
          <Button
          onClick={() => setOpenDialog(true)}
            className="text-white"
            style={{ backgroundColor: Colors.BLUE }}
          >
            Get Started
          </Button>
        </div>
      ) : path?.includes('workspace') ? (
        <div className="flex items-center gap-2">
          <Button className="hover:bg-[#5858584e]" variant="ghost" onClick={() => onActionBtn('export')}>
            <LucideDownload /> Export
          </Button>
          <Button
            className="text-white bg-blue-500 hover:bg-blue-600"
            onClick={() => onActionBtn('deploy')}
          >
            <Rocket /> Deploy
          </Button>
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