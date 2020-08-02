import React, { useState, useEffect } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios';

import OrderStepper from './OrderStepper';

const NewOrder = () => {

  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const generateStripePromise = async () => {
      await axios.get('http://18.219.44.193:5000/stripe-key')
        .then(async response => {
          const data = response.data;
          console.log(data);
          const pubKey = data['publishableKey'];
          const stripe = await loadStripe(pubKey);
          setStripePromise(stripe);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    generateStripePromise();
  }, [])

  return  <div>
    {stripePromise
      ? <Elements stripe={stripePromise}>
        <OrderStepper />
      </Elements>
      : null
    }
  </div>
}

export default NewOrder;
