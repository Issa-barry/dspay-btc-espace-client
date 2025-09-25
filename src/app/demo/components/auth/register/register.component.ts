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

 

  private clearFieldError(field: string) {
    if (!this.errors[field]) return;
    const { [field]: _, ...rest } = this.errors;
    this.errors = rest;
  }

   // ----------------- Helpers erreurs champ -----------------
  private setFieldError(field: string, message: string) {
    this.errors = { ...this.errors, [field]: [message] };
  }

  private clearAllErrors() {
    this.errors = {};
  }

  // ----------------- Helpers validation -----------------
  private isValidEmail(email: string): boolean {
    // simple mais robuste
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  private passwordIssues(pwd: string): string | null {
    if (!pwd || pwd.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins 1 lettre et 1 chiffre.';
    }
    return null;
  }

  private isValidISODate(d: string): boolean {
    if (!d) return false;
    // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    const dt = new Date(d);
    return !isNaN(dt.getTime()) && d === dt.toISOString().slice(0, 10);
  }

  /** Valide tous les champs côté front, alimente this.errors, retourne true si OK */
  private validateFront(): boolean {
    this.clearAllErrors();

    // nom / prenom
    if (!this.contact.nom || this.contact.nom.trim().length < 2) {
      this.setFieldError('nom', 'Le nom est requis (min. 2 caractères).');
    }
    if (!this.contact.prenom || this.contact.prenom.trim().length < 2) {
      this.setFieldError('prenom', 'Le prénom est requis (min. 2 caractères).');
    }

    // email
    if (!this.contact.email) {
      this.setFieldError('email', 'L’email est requis.');
    } else if (!this.isValidEmail(this.contact.email)) {
      this.setFieldError('email', 'Format d’email invalide.');
    }

    // pays
    if (!this.selectedCountry) {
      this.setFieldError('adresse.pays', 'Le pays est requis.');
    }

    // mot de passe
    const pwdIssue = this.passwordIssues(this.contact.password || '');
    if (pwdIssue) {
      this.setFieldError('password', pwdIssue);
    }

    // confirmation
    if ((this.contact.password || '') !== (this.contact.password_confirmation || '')) {
      this.setFieldError('password_confirmation', 'La confirmation ne correspond pas au mot de passe.');
    }

    // date de naissance (optionnelle, mais si renseignée on vérifie la forme)
    if (this.contact.date_naissance && this.contact.date_naissance !== '9999-01-01') {
      if (!this.isValidISODate(this.contact.date_naissance)) {
        this.setFieldError('date_naissance', 'La date doit être au format YYYY-MM-DD.');
      }
    }

    // téléphone : on fait une 1ère vérif simple (présence)
    if (!this.contact.phone || !this.contact.phone.toString().trim()) {
      this.setFieldError('phone', 'Le téléphone est requis.');
    }

    return Object.keys(this.errors).length === 0;
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

       // 1) validation front
    const frontOk = this.validateFront();
    if (!frontOk) {
      return; // on laisse l’utilisateur corriger les erreurs inline
    }

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
