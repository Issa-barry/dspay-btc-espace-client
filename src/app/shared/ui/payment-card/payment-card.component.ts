import {
  Component, EventEmitter, Input, Output,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
  ViewChild, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  loadStripe, Stripe, StripeElements,
  StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement
} from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

import { PaiementService } from 'src/app/demo/service/paiement/paiement.service';
import { environment } from 'src/environements/environment.dev';

@Component({
  selector: 'app-payment-card',
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent implements AfterViewInit, OnDestroy, OnChanges {
  // --- Inputs / Outputs ---
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() amount: number | null = null;  // en EUR (affichage)
  @Input() currency: 'eur' | 'usd' = 'eur';
  @Input() clientSecret = '';             // peut arriver vide => on le crée
  @Input() orderId?: string;              // recommandé pour idempotence
  @Input() metadata: Record<string, any> = {};
  @Input() showHeader = false;

  @Input() loading = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ paymentIntentId: string }>();
  @Output() fail = new EventEmitter<{ message: string }>();

  // --- Hosts pour Elements ---
  @ViewChild('numberHost') numberHost!: ElementRef<HTMLDivElement>;
  @ViewChild('expiryHost') expiryHost!: ElementRef<HTMLDivElement>;
  @ViewChild('cvcHost')    cvcHost!: ElementRef<HTMLDivElement>;

  // --- Stripe runtime ---
  private stripe?: Stripe;
  private elements?: StripeElements;
  private elNumber?: StripeCardNumberElement;
  private elExpiry?: StripeCardExpiryElement;
  private elCvc?: StripeCardCvcElement;

  // --- Form + UI state ---
  payForm: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private pay: PaiementService) {
    this.payForm = this.fb.group({
      name: [''],
      number: [null, Validators.required],
      exp: [null, Validators.required],
      cvc: [null, Validators.required],
    });
  }

  // Helpers d’état
  get numberInvalid(): boolean {
    const c = this.payForm.get('number');
    return !!(c && c.invalid && c.touched);
  }
  get canSubmit(): boolean {
    return !!this.amount && this.payForm.valid && !this.loading;
  }

  // Lifecycle
  async ngAfterViewInit() {
    if (this.visible) await this.mountStripe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && !changes['visible'].firstChange) {
      if (this.visible) await this.mountStripe();
      else this.unmountStripe();
    }
  }

  ngOnDestroy() {
    this.unmountStripe();
  }

  // Stripe Elements mount/unmount
  private async mountStripe() {
    await Promise.resolve(); // laisser l’HTML s’afficher

    try {
      if (!this.stripe) {
        this.stripe = (await loadStripe(environment.stripePublicKey)) as Stripe;
      }
      if (!this.elements && this.stripe) {
        this.elements = this.stripe.elements({ locale: 'fr' });
      }

      const classes = { base: 'p-inputtext p-component w-full text-center' };

      if (!this.elNumber && this.elements) {
        this.elNumber = this.elements.create('cardNumber', { classes });
        this.elNumber.on('change', (ev: any) => this.applyStripeState('number', ev));
        this.elNumber.mount(this.numberHost.nativeElement);
      }
      if (!this.elExpiry && this.elements) {
        this.elExpiry = this.elements.create('cardExpiry', { classes });
        this.elExpiry.on('change', (ev: any) => this.applyStripeState('exp', ev));
        this.elExpiry.mount(this.expiryHost.nativeElement);
      }
      if (!this.elCvc && this.elements) {
        this.elCvc = this.elements.create('cardCvc', { classes });
        this.elCvc.on('change', (ev: any) => this.applyStripeState('cvc', ev));
        this.elCvc.mount(this.cvcHost.nativeElement);
      }
    } catch (e: any) {
      this.emitError(e?.message || 'Initialisation du formulaire de paiement impossible.');
    }
  }

  private unmountStripe() {
    try { this.elNumber?.unmount(); } catch {}
    try { this.elExpiry?.unmount(); } catch {}
    try { this.elCvc?.unmount(); } catch {}
    this.elNumber = this.elExpiry = this.elCvc = undefined;
  }

  private applyStripeState(
    ctrl: 'number' | 'exp' | 'cvc',
    ev: { complete: boolean; empty: boolean; error?: { message?: string } }
  ) {
    const c = this.payForm.get(ctrl)!;
    c.markAsTouched();
    c.setValue(ev.complete ? true : null);
    c.updateValueAndValidity({ emitEvent: false });
    this.errorMsg = (!ev.empty && ev.error) ? (ev.error.message ?? '') : '';
  }

  // ─────────── PaymentIntent (création si nécessaire) ───────────
  
  private async getOrCreateClientSecret(): Promise<string> {
  if (this.clientSecret) return this.clientSecret;

  if (this.amount == null) {
    throw new Error('Montant manquant.');
  }
  const amountInCents = Math.round(this.amount * 100);

  const payload = {
    amount: amountInCents,
    currency: this.currency || 'eur',
    order_id: this.orderId,
    metadata: this.metadata || {},
    dev: !environment.production,
  };

  const res = await firstValueFrom(this.pay.createPaymentIntent(payload));

  // --- Vérification mode cohérent ---
  const frontIsLive = environment.stripePublicKey?.startsWith('pk_live_');
  const backIsLive  = !!res?.data?.livemode || res?.data?.server_mode === 'live';
  if (frontIsLive !== backIsLive) {
    throw new Error('Configuration incohérente : clés Stripe front et back ne sont pas dans le même mode.');
  }
  // ---------------------------------

  if (!res?.success || !res?.data?.clientSecret) {
    throw new Error(res?.message || 'Impossible de créer le paiement.');
  }

  this.clientSecret = res.data.clientSecret;
  return this.clientSecret;
}

  // ─────────── Soumission paiement ───────────
  async onSubmit() {
    if (!this.stripe || !this.elNumber) {
      this.emitError("Le formulaire carte n'est pas prêt.");
      return;
    }
    if (!this.canSubmit) return;

    this.loading = true;
    this.errorMsg = '';

    try {
      const clientSecret = await this.getOrCreateClientSecret();

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.elNumber,
            billing_details: this.payForm.value.name
              ? { name: this.payForm.value.name }
              : undefined,
          },
        }
      );

      if (error) {
        this.emitError(error.message ?? 'Paiement refusé');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        this.success.emit({ paymentIntentId: paymentIntent.id });
        this.hide();
        return;
      }

      // Les actions 3DS sont normalement gérées par confirmCardPayment.
      this.emitError('Paiement non finalisé. Veuillez réessayer.');
    } catch (e: any) {
      this.emitError(e?.message ?? 'Erreur inconnue lors du paiement');
    } finally {
      this.loading = false;
    }
  }

  // ─────────── UI helpers ───────────
  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();

    this.unmountStripe();
    this.payForm.reset();
    this.errorMsg = '';
  }

  private emitError(msg: string) {
    this.errorMsg = msg;
    this.fail.emit({ message: msg });
  }
}
