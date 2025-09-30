import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from 'src/environements/environment.dev';
 
@Injectable({
  providedIn: 'root'
})
export class PaiementService {
    private apiUrl = `${environment.apiUrl}`;
   private stripePromise = loadStripe(environment.stripePublicKey); // Clé publique depuis environment

  constructor(private http: HttpClient) {}

  /**
   * Demande au backend Laravel de créer un PaymentIntent
   * @param amount Montant en centimes (ex: 1000 = 10,00 €)
   */
  createPaymentIntent(amount: number) {
    return this.http.post<{ clientSecret: string }>(
      'http://localhost:8000/api/create-payment-intent',
      { amount }
    );
  }

  /**
   * Confirme un paiement avec Stripe Elements
   * @param clientSecret renvoyé par le backend
   * @param cardElement l’élément carte Stripe monté dans le DOM
   */
  async confirmCardPayment(clientSecret: string, cardElement: any) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error(' Le paiement  n’a pas pu être chargé');

    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });
  }
}
