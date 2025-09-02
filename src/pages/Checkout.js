import React from 'react'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "../components/CheckoutForm";
import { useMySQLAuth } from '../context/MySQLAuthContext';
import { Navigate } from 'react-router-dom';

const Checkout = () => {
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key');
    const { currentUser } = useMySQLAuth();

          if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <section className="checkout-wrapper">
            <Elements stripe={stripePromise}>
                <section>
                    <h2>Time to Checkout?</h2>
                    <CheckoutForm />
                </section>
            </Elements>
        </section>
    )
}

export default Checkout
