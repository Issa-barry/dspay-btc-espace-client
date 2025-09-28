import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | '';

@Component({
  selector: 'app-payment-card',
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent implements OnInit {
  /** Ouverture/fermeture du dialog (lié avec [(visible)]) */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Titre + montant éventuel (pour le pill “Pay amount”) */
  @Input() header = 'Paiement par carte';
  @Input() amount: number | null = null;

 
  /** Bouton payer en état chargement */
  @Input() loading = false;

  /** Événements sortants */
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    brand: string;
    name?: string;
  }>();

  payForm!: FormGroup;

  brand: CardBrand = '';
  numberMask = '9999 9999 9999 9999';
  cvcMask = '999'; // Amex: 4
  /** Optionnel: conserver un nom si tu ajoutes un champ 'name' plus tard */
  private holderName?: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.payForm = this.fb.group({
      number: ['', [Validators.required, this.cardNumberValidator.bind(this)]],
      exp: ['', [Validators.required, this.expiryValidator]], // "MM/YY"
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      // name: [''] // si tu décides d'afficher le titulaire, décommente et utilise-le
    });

    this.payForm.get('number')?.valueChanges.subscribe((v: string) => {
      const raw = (v || '').replace(/\s+/g, '');
      this.detectBrand(raw);
    });
  }

  /** UI helpers */
  get numberInvalid(): boolean {
    const c = this.payForm.get('number');
    return !!(c && c.invalid && c.touched);
  }

  hide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.payForm.reset();
    this.brand = '';
    this.numberMask = '9999 9999 9999 9999';
    this.cvcMask = '999';
  }

  onSubmit(): void {
    if (this.payForm.invalid) {
      this.payForm.markAllAsTouched();
      return;
    }

    const expValue: string = this.payForm.value.exp || '';
    const [mmNum, yyNum] = expValue.split('/').map((x: string) => parseInt(x, 10));
    const exp_month = (mmNum ?? 0).toString().padStart(2, '0');
    const exp_year = (yyNum ?? 0).toString(); // sur 2 chiffres, conforme au masque

    this.submit.emit({
      number: this.payForm.value.number.replace(/\s+/g, ''),
      exp_month,
      exp_year,
      cvc: this.payForm.value.cvc,
      brand: this.brand || '',
      name: this.holderName // ou this.payForm.value.name si tu ajoutes le champ
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Validators & Brand detection
  // ────────────────────────────────────────────────────────────────────────────

  private detectBrand(digits: string): void {
    if (/^4\d{0,15}$/.test(digits)) {
      this.brand = 'Visa';
      this.numberMask = '9999 9999 9999 9999';
      this.cvcMask = '999';
    } else if (/^(5[1-5]|2[2-7])\d{0,14}$/.test(digits)) {
      this.brand = 'Mastercard';
      this.numberMask = '9999 9999 9999 9999';
      this.cvcMask = '999';
    } else if (/^3[47]\d{0,13}$/.test(digits)) {
      this.brand = 'Amex';
      this.numberMask = '9999 999999 99999'; // 15 chiffres (4-6-5)
      this.cvcMask = '9999';
    } else {
      this.brand = '';
      this.numberMask = '9999 9999 9999 9999';
      this.cvcMask = '999';
    }
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(value)) return { pattern: true };
    if (!this.luhnCheck(value)) return { luhn: true };
    return null;
  }

  private expiryValidator(control: AbstractControl): ValidationErrors | null {
    const v: string = (control.value || '').trim();
    if (!/^\d{2}\/\d{2}$/.test(v)) return { pattern: true };

    const [mm, yy] = v.split('/').map((x: string) => parseInt(x, 10));
    if (mm < 1 || mm > 12) return { month: true };

    const now = new Date();
    const curYY = parseInt(now.getFullYear().toString().slice(-2), 10);
    const curMM = now.getMonth() + 1;

    if (yy < curYY || (yy === curYY && mm < curMM)) return { expired: true };
    return null;
  }

  private luhnCheck(num: string): boolean {
    let sum = 0;
    let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }
}
