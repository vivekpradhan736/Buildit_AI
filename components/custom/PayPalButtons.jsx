<PayPalButtons
  disabled={!userDetail || !userDetail._id || isUpdating || !selectedOption}
  style={{ layout: 'horizontal' }}
  onApprove={async () => await onPaymentSuccess()}
  onCancel={() => console.log('Payment canceled')}
  createOrder={(data, actions) => {
    if (!selectedOption) {
      console.error('No pricing option selected');
      return;
    }
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: selectedOption.price.toFixed(2),
            currency_code: 'USD',
          },
        },
      ],
    });
  }}
/>
