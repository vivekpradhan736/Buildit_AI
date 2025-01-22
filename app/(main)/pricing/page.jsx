"use client";

import PricingModel from '@/components/custom/PricingModel';
import { UserDetailContext } from '@/context/UserDetailContext';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import React, { useContext, useState } from 'react';

function Pricing() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext); // Ensure setUserDetail is used for state updates
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTokenUpdate = (newTokenCount) => {
    setIsUpdating(true);

    // Update the token count locally
    setUserDetail((prev) => ({
      ...prev,
      token: newTokenCount,
    }));

    setIsUpdating(false);
    console.log('Tokens successfully updated locally:', newTokenCount);
  };

  return (
    <div className="mt-10 flex flex-col items-center w-full px-10 md:px-32 lg:px-48">
      <h2 className="font-bold text-5xl">Pricing</h2>
      <p className="text-gray-400 max-w-xl text-center mt-4">
        {Lookup?.PRICING_DESC}
      </p>

      <div
        className="p-5 border rounded-xl w-full flex justify-between mt-7 items-center"
        style={{
          backgroundColor: Colors.BACKGROUND,
        }}
      >
        <h2 className="text-lg">
          <span className="font-bold">{userDetail?.token || 0}</span>: Tokens Left
        </h2>
        <div className="">
          <h2 className="font-medium">Need more tokens?</h2>
          <p>Upgrade your plan below</p>
        </div>
      </div>
      {/* Pass the handler to the PricingModel */}
      <PricingModel onTokenUpdate={handleTokenUpdate} isUpdating={isUpdating} />
    </div>
  );
}

export default Pricing;
