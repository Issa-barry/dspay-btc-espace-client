// paiement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Stripe,
  StripeCardNumberElement,
  StripeCardElement,
  PaymentIntentResult,
} from '@stripe/stripe-js';
import { environment } from 'src/environements/environment.dev';

export interface CheckoutSessionPayload {
  amount: number;                  // en centimes
  currency?: 'eur' | 'usd';
  success_url: string;
  cancel_url: string;
  customer_email?: string | null;
  order_id?: string | null;
  metadata?: Record<string, any>;
}

export interface CheckoutLookup {
  session_id: string;
  status: 'pending'|'processing'|'succeeded'|'failed'|'canceled'|string;
  amount: number;            // centimes
  currency: string;
  processed_at?: string | null;
  metadata: any;
  transfert_id?: number | null;
  transfert?: any | null;
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CheckoutData {
  id: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class PaiementService {
  // Sécurise l'URL (enlève un éventuel / final)
  private apiUrl = environment.apiUrl.replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  /**
   * Crée un PaymentIntent côté Laravel.
   * POST  {apiUrl}/payments/stripe/create-payment-intent
   */
  createPaymentIntent(payload: {
    amount: number;                   // en centimes
    currency?: string;                // 'eur' par défaut si non fourni
    order_id?: string;
    metadata?: Record<string, any>;
    dev?: boolean;
    force_new?: boolean;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/payments/stripe/create-payment-intent`,
      payload
    );
  }

  /**
   * Confirme le paiement AVEC LA MÊME INSTANCE STRIPE
   * qui a créé les Elements (obligatoire).
   */
  confirmCardPayment(
    stripe: Stripe,
    clientSecret: string,
    cardElement: StripeCardNumberElement | StripeCardElement,
    billing?: { name?: string }
  ): Promise<PaymentIntentResult> {
    if (!stripe) {
      return Promise.reject(new Error('Instance Stripe manquante'));
    }
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billing,
      },
    });
    // 3DS est géré automatiquement par confirmCardPayment
  }


  createCheckoutSession(payload: CheckoutSessionPayload) {
    return this.http.post<{ id: string; url: string }>(
      `${this.apiUrl}/payments/stripe/checkout-session`,
      payload
    );
  }

  getCheckoutStatus(sessionId: string) {
  return this.http.get<ApiResponse<CheckoutLookup>>(
    `${this.apiUrl}/payments/stripe/checkout-session/${sessionId}`
  );
}
}
