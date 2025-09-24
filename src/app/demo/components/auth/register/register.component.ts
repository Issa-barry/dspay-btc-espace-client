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
  confirmed: boolean = false;
  contact: Contact = new Contact();
  errorMessage: string = '';
  successMessage: string = '';
  errors: { [key: string]: string[] } = {};

  nom: string = '';
  prenom: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  password_confirmation: string = '';
  role: string = "client";
  date_naissance: string = "9999-01-01";

   // États UI
  isSubmitting = false;
   showSuccess = false;
  createdEmail = '';

countries: CountryOption[] = [];
selectedCountry!: CountryOption;              // <-- modèle du dropdown


  constructor(
    public router: Router,
    private authService: AuthService,
    private layoutService: LayoutService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) { }

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  ngOnInit() {
    const EU_AF_COUNTRIES: CountryOption[]  = [
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
  
    this.countries = EU_AF_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    // France par défaut
    this.selectedCountry = this.countries.find(c => c.code === 'FR')!;
    this.syncAddressFromCountry(this.selectedCountry);
  }

  onPhoneInput(event: any) {
  const raw = event?.target?.value ?? '';
  this.contact.phone = formatPhoneOnType(raw, this.selectedCountry?.code);
}
  onCountryChange(c: CountryOption) {
  this.selectedCountry = c;
  this.syncAddressFromCountry(c);
  if (this.contact.phone) {
    this.contact.phone = formatPhoneOnType(this.contact.phone, c.code);
  }
}
  private syncAddressFromCountry(c?: CountryOption) {
    if (!c) return;
    this.contact.adresse.pays = c.name;   // <-- nom du pays
    this.contact.adresse.code = c.code;   // <-- code ISO
  }

  onRegister() {
    this.errors = {};
    this.errorMessage = '';

    // conf auto du password_confirmation
    this.contact.password_confirmation = this.contact.password;

    // anti-double-clic
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    
  const e164 = toE164(this.contact.phone || '', this.selectedCountry?.code);
  if (!e164) {
    this.isSubmitting = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Téléphone invalide',
      detail: `Le numéro n'est pas valide pour ${this.selectedCountry?.name}`,
      life: 5000
    });
    return;
  }
  this.contact.phone = e164;

    console.log(this.contact);
    

    this.authService
      .register(this.contact)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.createdEmail = this.contact.email || '';
          this.successMessage = 'Compte créé avec succès. Un email de vérification vous a été envoyé.';
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.successMessage,
            life: 4000
          });
          this.showSuccess = true; // affiche la modale
        },
        error: (err) => {
          // mapping des erreurs de validation Laravel: { data: { field: [...] }, message: "" }
          this.errors = err?.error?.data || {};
          const msg =
            err?.error?.message ||
            'Échec de l’inscription. Merci de vérifier les champs puis réessayer.';
          this.errorMessage = msg;

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: msg,
            life: 5000
          });
          console.error('register error', err);
        }
      });
  }

  goToLogin() {
    this.showSuccess = false;
    this.router.navigate(['/auth/login']);
  }
}
