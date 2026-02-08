'use client';

import { useState, useEffect, useRef } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest, PaymentRequestPaymentMethodEvent } from '@stripe/stripe-js';
import { PaymentService } from '@/services/payment.service';
import { ID } from '@/types/root';

interface PaymentRequestButtonProps {
  /** Stripe PaymentRequest object from usePaymentRequest hook */
  paymentRequest: PaymentRequest;
  /** Amount in RSC for creating payment intent */
  amountInRsc: number;
  /** Fundraise ID for the contribution */
  fundraiseId: ID;
  /** Called when payment succeeds */
  onSuccess?: () => void;
  /** Called when payment fails */
  onError?: (error: string) => void;
}

/**
 * Stripe Payment Request Button for Apple Pay, Google Pay, and Link.
 *
 * Renders the Stripe PaymentRequestButtonElement and handles the payment flow
 * (creating payment intents, confirming payments, handling 3D Secure).
 *
 * The PaymentRequest object and availability checking are handled externally
 * by the `usePaymentRequest` hook. This component must be rendered inside
 * a StripeProvider context.
 */
export function PaymentRequestButton({
  paymentRequest,
  amountInRsc,
  fundraiseId,
  onSuccess,
  onError,
}: PaymentRequestButtonProps) {
  const stripe = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  // Use refs for callbacks and values that change with each render
  // so the paymentmethod event handler always has the latest values
  // without needing to re-register the listener.
  const amountInRscRef = useRef(amountInRsc);
  amountInRscRef.current = amountInRsc;
  const fundraiseIdRef = useRef(fundraiseId);
  fundraiseIdRef.current = fundraiseId;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Handle payment method event
  useEffect(() => {
    if (!paymentRequest || !stripe) return;

    const handlePaymentMethod = async (event: PaymentRequestPaymentMethodEvent) => {
      setIsProcessing(true);

      try {
        // Create payment intent on our backend
        const { clientSecret } = await PaymentService.createPaymentIntent(
          amountInRscRef.current,
          fundraiseIdRef.current
        );

        // Confirm the payment with the payment method from Apple Pay/Google Pay/Link
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          event.complete('fail');
          onErrorRef.current?.(confirmError.message || 'Payment failed');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'requires_action') {
          // Handle 3D Secure if required
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            event.complete('fail');
            onErrorRef.current?.(actionError.message || 'Payment authentication failed');
            setIsProcessing(false);
            return;
          }
        }

        // Payment succeeded
        event.complete('success');
        onSuccessRef.current?.();
      } catch {
        event.complete('fail');
        onErrorRef.current?.('Something went wrong. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    paymentRequest.on('paymentmethod', handlePaymentMethod);

    return () => {
      paymentRequest.off('paymentmethod', handlePaymentMethod);
    };
  }, [paymentRequest, stripe]);

  return (
    <div className="w-full">
      {isProcessing ? (
        <div className="h-12 flex items-center justify-center bg-gray-100 rounded-lg">
          <span className="text-sm text-gray-600">Processing payment...</span>
        </div>
      ) : (
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: '48px',
              },
            },
          }}
        />
      )}
    </div>
  );
}
