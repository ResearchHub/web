'use client';

import { useState, useEffect } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest, PaymentRequestPaymentMethodEvent } from '@stripe/stripe-js';
import { Button } from '@/components/ui/Button';
import { StripeProvider } from './StripeProvider';
import { PaymentService } from '@/services/payment.service';
import { ID } from '@/types/root';

interface PaymentRequestButtonProps {
  /** Amount in cents */
  amountCents: number;
  /** Amount in RSC for creating payment intent */
  amountInRsc: number;
  /** Fundraise ID for the contribution */
  fundraiseId: ID;
  /** Label shown in the payment sheet */
  label?: string;
  /** Button text to show when payment method is not available */
  unavailableText?: string;
  /** Called when payment succeeds */
  onSuccess?: () => void;
  /** Called when payment fails */
  onError?: (error: string) => void;
  /** Called when payment method availability is determined */
  onAvailabilityChange?: (available: boolean, type?: 'applePay' | 'googlePay') => void;
}

/**
 * Stripe Payment Request Button for Apple Pay and Google Pay.
 * This component handles the entire payment flow including payment intent creation.
 */
function PaymentRequestButtonInner({
  amountCents,
  amountInRsc,
  fundraiseId,
  label = 'Fund Research',
  unavailableText = 'Not available on this device',
  onSuccess,
  onError,
  onAvailabilityChange,
}: PaymentRequestButtonProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null); // null = checking
  const [isProcessing, setIsProcessing] = useState(false);

  // Create and configure payment request
  useEffect(() => {
    if (!stripe || amountCents <= 0) {
      return;
    }

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label,
        amount: amountCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if the Payment Request is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
        // Determine which payment method is available
        const type = result.applePay ? 'applePay' : 'googlePay';
        onAvailabilityChange?.(true, type);
      } else {
        setCanMakePayment(false);
        onAvailabilityChange?.(false);
      }
    });

    return () => {
      // Cleanup
      setPaymentRequest(null);
    };
  }, [stripe, amountCents, label, onAvailabilityChange]);

  // Update payment request amount when it changes
  useEffect(() => {
    if (paymentRequest && amountCents > 0) {
      paymentRequest.update({
        total: {
          label,
          amount: amountCents,
        },
      });
    }
  }, [paymentRequest, amountCents, label]);

  // Handle payment method event
  useEffect(() => {
    if (!paymentRequest) return;

    const handlePaymentMethod = async (event: PaymentRequestPaymentMethodEvent) => {
      setIsProcessing(true);

      try {
        // Create payment intent on our backend
        const { clientSecret } = await PaymentService.createPaymentIntent(amountInRsc, fundraiseId);

        // Confirm the payment with the payment method from Apple Pay/Google Pay
        const { error: confirmError, paymentIntent } = await stripe!.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          event.complete('fail');
          onError?.(confirmError.message || 'Payment failed');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'requires_action') {
          // Handle 3D Secure if required
          const { error: actionError } = await stripe!.confirmCardPayment(clientSecret);
          if (actionError) {
            event.complete('fail');
            onError?.(actionError.message || 'Payment authentication failed');
            setIsProcessing(false);
            return;
          }
        }

        // Payment succeeded
        event.complete('success');
        onSuccess?.();
      } catch (err) {
        event.complete('fail');
        onError?.('Something went wrong. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    paymentRequest.on('paymentmethod', handlePaymentMethod);

    return () => {
      paymentRequest.off('paymentmethod', handlePaymentMethod);
    };
  }, [paymentRequest, stripe, amountInRsc, fundraiseId, onSuccess, onError]);

  // Still checking availability
  if (canMakePayment === null) {
    return (
      <Button type="button" variant="default" disabled className="w-full h-12 text-base">
        Checking availability...
      </Button>
    );
  }

  // Not available on this device
  if (!canMakePayment || !paymentRequest) {
    return (
      <Button type="button" variant="default" disabled className="w-full h-12 text-base">
        {unavailableText}
      </Button>
    );
  }

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

// Check if Stripe key is configured
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Payment Request Button component wrapper.
 * Provides Apple Pay and Google Pay support via Stripe.
 */
export function PaymentRequestButton(props: PaymentRequestButtonProps) {
  if (!STRIPE_KEY) {
    return (
      <Button type="button" variant="default" disabled className="w-full h-12 text-base">
        {props.unavailableText || 'Not available'}
      </Button>
    );
  }

  return (
    <StripeProvider>
      <PaymentRequestButtonInner {...props} />
    </StripeProvider>
  );
}
