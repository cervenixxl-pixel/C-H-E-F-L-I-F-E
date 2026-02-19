import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Public Test Key (Standard Stripe Demo Key)
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface PaymentGatewayProps {
  amount: number;
  chefName: string;
  menuName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<PaymentGatewayProps> = ({ amount, chefName, menuName, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
        setLoading(false);
        return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error: stripeError, paymentMethod: createdPaymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
    } else {
      console.log('[PaymentMethod]', createdPaymentMethod);
      // Simulate Backend Confirmation Delay
      setTimeout(() => {
          setLoading(false);
          onSuccess();
      }, 1500);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#1f2937", // gray-900
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "14px",
        "::placeholder": {
          color: "#9ca3af", // gray-400
        },
        padding: "12px",
      },
      invalid: {
        color: "#ef4444", // red-500
        iconColor: "#ef4444",
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Secure Checkout</h2>
            <p className="mt-2 text-sm text-gray-600">Complete your booking with Chef {chefName}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-2xl sm:px-10 border border-gray-100">
            
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8 flex justify-between items-center border border-gray-100">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total to Pay</p>
                    <p className="text-2xl font-bold text-gray-900">£{amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase truncate max-w-[150px]">{menuName}</p>
                    <p className="text-sm font-medium text-gray-600">Reserved funds held</p>
                </div>
            </div>

            {/* Payment Methods Tabs */}
            <div className="flex space-x-4 mb-6">
                <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-brand-gold bg-brand-light text-brand-dark ring-1 ring-brand-gold' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <span className="font-bold text-sm">Card</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${paymentMethod === 'apple' ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.98-.4-2.06-.43-3.03.38-1.3.93-2.9 1.15-4.13-.53C5.53 18.73 3 13.9 5.7 10.3c1.33-1.68 3.52-2 5.05-1.57.98.24 1.76.73 2.53.76 1 .03 2.1-.8 3.5-.66 1.48.16 2.6.76 3.32 1.83-2.9 1.76-2.4 5.92.53 7.15-.3.65-.56 1.3-.96 1.95-.36.6-.74 1.16-1.12 1.52h-.01zm-3.8-15.6c.33 1.9-1.3 3.65-3.02 3.6-1.5-.04-2.96-1.74-2.6-3.76.22-1.8 2.05-3.46 3.8-3.37.5 0 1.05.15 1.5.4 0 .04.08.08.12.13.2.3.4.7.2 1z"/></svg>
                    <span className="font-bold text-sm">Pay</span>
                </button>
                 <button 
                    type="button"
                    onClick={() => setPaymentMethod('google')}
                    className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${paymentMethod === 'google' ? 'border-gray-300 bg-white text-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                     <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <span className="font-bold text-sm">Pay</span>
                </button>
            </div>

            {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Card Details</label>
                        <div className="border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-1 focus-within:ring-brand-gold focus-within:border-brand-gold transition-all">
                            <CardElement options={cardStyle} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cardholder Name</label>
                        <input 
                            type="text"
                            required
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="block w-full border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-sm"
                            placeholder="Full Name on Card"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={!stripe || loading}
                        className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-dark/20 hover:bg-black transition-all transform active:scale-[0.99] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                             <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                             </div>
                        ) : (
                            <span>Pay £{amount.toFixed(2)}</span>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                         <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         <span>Payments processed securely by Stripe</span>
                    </div>
                </form>
            )}

             {(paymentMethod === 'apple' || paymentMethod === 'google') && (
                <div className="text-center py-12">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <span className="text-2xl">{paymentMethod === 'apple' ? '🍎' : 'G'}</span>
                     </div>
                     <p className="text-gray-500 text-sm mb-6">Redirecting to {paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'} secure verification...</p>
                     <button 
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => { setLoading(false); onSuccess(); }, 1500);
                        }}
                        className="bg-black text-white px-8 py-3 rounded-full font-bold hover:opacity-80 transition-opacity"
                    >
                        Click to Simulate Success
                    </button>
                </div>
            )}

            <button onClick={onCancel} className="w-full text-center mt-6 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel Payment</button>
        </div>
      </div>
    </div>
  );
};

const PaymentGateway: React.FC<PaymentGatewayProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentGateway;