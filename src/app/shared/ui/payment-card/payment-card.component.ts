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
import { PaiementService } from 'src/app/demo/service/paiement/paiement.service';
import { environment } from 'src/environements/environment.dev';

@Component({
  selector: 'app-payment-card',
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() amount: number | null = null;   // en EUR (affichage)
  @Input() currency: string = 'eur';
  @Input() clientSecret = '';              // peut être vide : on le créera au clic
  @Input() orderId?: string;               // optionnel (idempotence)
  @Input() metadata: Record<string, any> = {};

  @Input() loading = false;
  @Input() showHeader = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ paymentIntentId: string }>();
  @Output() fail = new EventEmitter<{ message: string }>();

  @ViewChild('numberHost') numberHost!: ElementRef<HTMLDivElement>;
  @ViewChild('expiryHost') expiryHost!: ElementRef<HTMLDivElement>;
  @ViewChild('cvcHost') cvcHost!: ElementRef<HTMLDivElement>;

  private stripe?: Stripe;
  private elements?: StripeElements;
  private elNumber?: StripeCardNumberElement;
  private elExpiry?: StripeCardExpiryElement;
  private elCvc?: StripeCardCvcElement;

  payForm!: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private pay: PaiementService) {
    this.payForm = this.fb.group({
      name: [''],
      number: [null, Validators.required],
      exp:    [null, Validators.required],
      cvc:    [null, Validators.required],
    });
  }

  get numberInvalid(): boolean {
    const c = this.payForm.get('number');
    return !!(c && c.invalid && c.touched);
  }
  get canSubmit(): boolean {
    return !!this.amount && this.payForm.valid && !this.loading;
  }

  async ngAfterViewInit() {
    if (this.visible) await this.mountStripe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ('visible' in changes && !changes['visible'].firstChange) {
      if (this.visible) await this.mountStripe();
      else this.unmountStripe();
    }
  }

  private async mountStripe() {
    await Promise.resolve();

    try {
      if (!this.stripe) this.stripe = (await loadStripe(environment.stripePublicKey)) as Stripe;
      if (!this.elements && this.stripe) this.elements = this.stripe.elements({ locale: 'fr' });

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
      this.errorMsg = e?.message || 'Impossible d’initialiser le formulaire de paiement.';
      this.fail.emit({ message: this.errorMsg });
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

   async onSubmit() {
  if (!this.clientSecret) {
    this.errorMsg = "Client secret manquant. Veuillez réessayer.";
    this.fail.emit({ message: this.errorMsg });
    return;
  }
  if (!this.stripe || !this.elNumber) {
    this.errorMsg = "Le formulaire carte n'est pas prêt.";
    this.fail.emit({ message: this.errorMsg });
    return;
  }

  this.loading = true;
  this.errorMsg = '';

  try {
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.elNumber,
          billing_details: this.payForm.value.name ? { name: this.payForm.value.name } : undefined,
        },
      }
    );

    if (error) {
      this.errorMsg = error.message ?? 'Paiement refusé';
      this.fail.emit({ message: this.errorMsg });
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      this.success.emit({ paymentIntentId: paymentIntent.id });
      this.hide();
    } else if (paymentIntent?.status === 'requires_action') {
      this.errorMsg = 'Action 3-D Secure requise.';
      this.fail.emit({ message: this.errorMsg });
    }
  } catch (e: any) {
    this.errorMsg = e?.message ?? 'Erreur inconnue lors du paiement';
    this.fail.emit({ message: this.errorMsg });
  } finally {
    this.loading = false;
  }
}


  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.unmountStripe();
    this.payForm.reset();
    this.errorMsg = '';
  }

  ngOnDestroy() { this.unmountStripe(); }
}
