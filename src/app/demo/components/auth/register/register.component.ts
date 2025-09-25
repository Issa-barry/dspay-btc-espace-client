import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { Contact } from 'src/app/demo/models/contact';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { formatPhoneOnType, toE164 } from 'src/app/shared/utils/phone.util';

type CountryOption = { name: string; code: string };

@Component({
  templateUrl: './register.component.html',
  providers: [MessageService, ConfirmationService]
})
export class RegisterComponent implements OnInit {
  confirmed = false;
  contact: Contact = new Contact();
  errorMessage = '';
  successMessage = '';
  errors: { [key: string]: string[] } = {};

  nom = '';
  prenom = '';
  email = '';
  phone = '';
  password = '';
  password_confirmation = '';
  role = 'client';
  date_naissance = '9999-01-01';

  // États UI
  isSubmitting = false;
  showSuccess = false;
  createdEmail = '';

  countries: CountryOption[] = [];
  selectedCountry!: CountryOption;

  constructor(
    public router: Router,
    private authService: AuthService,
    private layoutService: LayoutService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  ngOnInit() {
    const EU_AF_COUNTRIES: CountryOption[] = [
      { name: 'France', code: 'FR' },
      { name: 'Allemagne', code: 'DE' },
      { name: 'Autriche', code: 'AT' },
      { name: 'Belgique', code: 'BE' },
      { name: 'Bulgarie', code: 'BG' },
      { name: 'Chypre', code: 'CY' },
      { name: 'Croatie', code: 'HR' },
      { name: 'Danemark', code: 'DK' },
      { name: 'Espagne', code: 'ES' },
      { name: 'Estonie', code: 'EE' },
      { name: 'Finlande', code: 'FI' },
      { name: 'Grèce', code: 'GR' },
      { name: 'Hongrie', code: 'HU' },
      { name: 'Irlande', code: 'IE' },
      { name: 'Italie', code: 'IT' },
      { name: 'Lettonie', code: 'LV' },
      { name: 'Lituanie', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Malte', code: 'MT' },
      { name: 'Pays-Bas', code: 'NL' },
      { name: 'Pologne', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Roumanie', code: 'RO' },
      { name: 'Royaume-Uni', code: 'GB' },
      { name: 'Slovaquie', code: 'SK' },
      { name: 'Suisse', code: 'CH' },
      { name: 'Suède', code: 'SE' },
      { name: 'Tchéquie', code: 'CZ' },
      { name: 'Guinée-Conakry', code: 'GN' },

      // DROM-COM & collectivités
      { name: 'La Réunion', code: 'RE' },
      { name: 'Guadeloupe', code: 'GP' },
      { name: 'Martinique', code: 'MQ' },
      { name: 'Guyane française', code: 'GF' },
      { name: 'Saint-Pierre-et-Miquelon', code: 'PM' },
      { name: 'Wallis-et-Futuna', code: 'WF' },
      { name: 'Nouvelle-Calédonie', code: 'NC' },
      { name: 'Polynésie française', code: 'PF' }
    ].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    this.countries = EU_AF_COUNTRIES;
    this.selectedCountry = this.countries.find(c => c.code === 'FR')!;
    this.syncAddressFromCountry(this.selectedCountry);
  }

  // --- Helpers erreurs champ ---
  private setFieldError(field: string, message: string) {
    this.errors = { ...this.errors, [field]: [message] };
  }

  private clearFieldError(field: string) {
    if (!this.errors[field]) return;
    const { [field]: _, ...rest } = this.errors;
    this.errors = rest;
  }

  // --- UI / formatage ---
  onPhoneInput(event: Event) {
    const target = event?.target as HTMLInputElement | null;
    const raw = target?.value ?? '';
    this.contact.phone = formatPhoneOnType(raw, this.selectedCountry?.code);
    this.clearFieldError('phone');
  }

  onCountryChange(c: CountryOption) {
    this.selectedCountry = c;
    this.syncAddressFromCountry(c);
    if (this.contact.phone) {
      this.contact.phone = formatPhoneOnType(this.contact.phone, c.code);
    }
    this.clearFieldError('phone');
  }

  private syncAddressFromCountry(c?: CountryOption) {
    if (!c) return;
    this.contact.adresse.pays = c.name;
    this.contact.adresse.code = c.code;
  }

  // --- Submit ---
  onRegister() {
    this.errorMessage = '';
    // this.errors = {}; // décommente si tu veux repartir à zéro à chaque submit

    // conf auto du password_confirmation
    this.contact.password_confirmation = this.contact.password;

    // anti-double-clic
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // normalisation téléphone
    const e164 = toE164(this.contact.phone || '', this.selectedCountry?.code);
    if (!e164) {
      this.isSubmitting = false;
      this.setFieldError(
        'phone',
        `Le numéro n'est pas valide pour ${this.selectedCountry?.name || 'ce pays'}.`
      );
      return;
    }
    this.clearFieldError('phone');
    this.contact.phone = e164;

    this.authService
      .register(this.contact)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.createdEmail = this.contact.email || '';
          this.successMessage =
            'Compte créé avec succès. Un email de vérification vous a été envoyé.';
          // On garde le toast de succès si tu veux un feedback global
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.successMessage,
            life: 4000
          });
          this.showSuccess = true;
          this.router.navigate(['/auth/registersuccess']);
        },
        error: (err) => {
          // On fusionne les erreurs API dans ton modèle d’erreurs
           this.errors = err?.error?.data ?? {};
          // Si l’API renvoie un message global, tu peux l’exposer ici :
          // this.errorMessage = err?.error?.message ?? '';
          // (évite le toast ici si tu veux rester 100% inline)
          console.log('ERROR', this.errors);
        }
      });
  }

  goToLogin() {
    this.showSuccess = false;
    this.router.navigate(['/auth/login']);
  }
}
