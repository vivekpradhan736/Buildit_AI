import React, { useContext, useState } from 'react';
import Lookup from '@/data/Lookup';

import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { PayPalButtons } from '@paypal/react-paypal-js';

function PricingModel() {
  const { userDetail = {}, setUserDetail } = useContext(UserDetailContext); // Fallback to an empty object
  const UpdateToken = useMutation(api.users.UpdateToken);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false); // Track the updating state

  const onPaymentSuccess = async () => {
    if (!selectedOption) {
      console.error('No option selected for payment');
      return;
    }

    if (!userDetail?._id || userDetail?.token === undefined) {
      console.error('User details are incomplete or missing');
      return;
    }

    const newTokenCount = Number(userDetail.token) + Number(selectedOption.tokens);

    try {
      // Start updating process
      setIsUpdating(true);

      // Call the mutation to update the tokens in Convex
      const updatedUser = await UpdateToken({
        token: newTokenCount, // New token value
        userId: userDetail._id, // Pass the user ID to identify the correct user
      });


      // Update tokens locally
      setUserDetail((prev) => ({
        ...prev,
        token: newTokenCount, // Update local user token
      }));

    } catch (error) {
      console.error('Error updating tokens:', error);
    } finally {
      // Stop updating process
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Lookup.PRICING_OPTIONS.map((pricing, index) => (
        <div
          key={index}
          className={`border p-7 rounded-xl flex flex-col gap-3 ${
            selectedOption?.name === pricing.name ? 'border-blue-500' : ''
          }`}
          onClick={() => setSelectedOption(pricing)}
        >
          <h2 className="font-bold text-2xl">{pricing.name}</h2>
          <h2 className="font-medium text-lg">{pricing.tokens} Tokens</h2>
          <p className="text-gray-400">{pricing.desc}</p>
          <h2 className="font-bold text-4xl text-center mt-6">${pricing.price}</h2>

          <PayPalButtons
            style={{ layout: 'horizontal' }}
            onApprove={async () => {
              await onPaymentSuccess();
            }}
            onCancel={() => console.log('Payment canceled')}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: pricing.price.toFixed(2),
                      currency_code: 'USD',
                    },
                  },
                ],
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default PricingModel;
