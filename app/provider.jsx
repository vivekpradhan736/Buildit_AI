"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Header from "@/components/custom/Header";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppSideBar from "@/components/custom/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ActionContext } from "@/context/ActionContext";

function Provider({ children }) {
  const [messages, setMessages] = useState([]); // Initialize as an empty array
  const [imageFile, setImageFile] = useState([]);
  const [userDetail, setUserDetail] = useState(null); // Initialize as null
  const [action, setAction] = useState();
  const convex = useConvex();
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const CheckAndResetPerDayToken=useMutation(api.users.CheckAndResetPerDayToken);

  // Function to check authentication
  const isAuthenticated = async () => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.email) {
        try {
          setUserDetailLoading(true)
          const result = await convex.query(api.users.GetUser, {
            email: user.email,
          });
          setUserDetail(result);
          setUserDetailLoading(false)
        } catch (error) {
          setUserDetailLoading(false)
          console.error("Error fetching user details:", error);
        }
      }
    }
  };

  useEffect(() => {
    isAuthenticated();
  }, []);

  useEffect(() => {
    if (!userDetail || !userDetail._id) return;
  
    const resetTokenDate = userDetail?.lastResetTokenDate;
    const today = new Date().toISOString().split("T")[0];
  
    if (resetTokenDate !== today) {
      resetTokenAndDate(userDetail._id);
    }
  }, [userDetail]);

  const resetTokenAndDate = async (userID) => {
    if (!userID) {
      console.error("Error: Missing user ID. Cannot reset token.");
      return;
    }
  
    const resetTokenDate = userDetail?.lastResetTokenDate;
    const today = new Date().toISOString().split("T")[0];
  
    if (resetTokenDate === today) {
      console.log("Per Day Token already reset today");
    } else {
      try {
        await CheckAndResetPerDayToken({ userId: userID });
        console.log("Per Day Token reset successfully");
      } catch (error) {
        console.error("Error resetting per day token:", error);
      }
    }
  };
  

  return (
    <div>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}
      >
        <PayPalScriptProvider
          options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}
        >
          <UserDetailContext.Provider value={{ userDetail, setUserDetail, userDetailLoading }}>
            <MessagesContext.Provider value={{ messages, setMessages, imageFile, setImageFile }}>
              <ActionContext.Provider value={{action,setAction}}>
              <NextThemesProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                <SidebarProvider defaultOpen={false}>
                  <AppSideBar />
                  {children}
                </SidebarProvider>
              </NextThemesProvider>
              </ActionContext.Provider>
            </MessagesContext.Provider>
          </UserDetailContext.Provider>
        </PayPalScriptProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default Provider;