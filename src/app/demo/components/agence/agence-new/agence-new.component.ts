import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { Agence } from 'src/app/demo/models/agence';
import { Contact } from 'src/app/demo/models/contact';
import { Role } from 'src/app/demo/models/Role';
import { AgenceService } from 'src/app/demo/service/agence/agence.service';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { RoleService } from 'src/app/demo/service/role/role.service';

@Component({
    selector: 'app-agence-new',
    templateUrl: './agence-new.component.html',
    styleUrl: './agence-new.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class AgenceNewComponent implements OnInit {
    submitted: boolean = false;
    loading: boolean = false;
    isGuineeSelected: boolean = false;
    cols: any[] = [];
    errorMessage: string = '';
 
    statuses: any[] = [];
    countries: any[] = [];

    rowsPerPageOptions = [5, 10, 20];

    agences: Agence[] = [];
    selectedAgences: Agence[] = [];
    agence: Agence = new Agence();
    agenceDialog: boolean = false;
    optionPays: any[] = [];
    deleteAgenceDialog: boolean = false;
    deleteAgencesDialog: boolean = false;
    apiErrors: { [key: string]: string[] } = {};
    errors: { [key: string]: string } = {};

    constructor(
        private agenceService: AgenceService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}
    ngOnInit() {
        this.countries = [
            { name: 'GUINEE-CONAKRY', code: 'GN', value: 'GUINEE-CONAKRY' },
            { name: 'France', code: 'FR', value: 'FRANCE' },
        ];
    }

    onCountryChange(event: any) {
        const selectedCountry = event.value;

        if (selectedCountry && selectedCountry === 'GUINEE-CONAKRY') {
            this.isGuineeSelected = true;
            this.agence.adresse.adresse = 'GUINEE-CONAKRY';
            this.agence.adresse.code_postal = '00224';
        } else {
            this.isGuineeSelected = false;
            this.agence.adresse.ville = '';
            this.agence.adresse.quartier = '';
        }
    }

    isFormInvalid(): boolean {
        return (
            !this.agence.nom_agence ||
            !this.agence.phone ||
            !this.agence.email ||
            !this.agence.adresse ||
            !this.agence.adresse.adresse ||
            !this.agence.adresse.code_postal ||
            !this.agence.adresse.ville
        );
    }
 
    isValidPhone: boolean = true;
    validatePhone() {
        if (this.agence.phone) {
      const phoneRegex = /^(?:\+|00)?(\d{1,3})[-.\s]?\d{10,}$/;
            this.isValidPhone = phoneRegex.test(this.agence.phone);
        } else {
            this.isValidPhone = false;
        }
    }

    isValidPays: boolean = true;

    isValidCodePostal: boolean = true;

    validateCodePostal() {
        if (
            this.agence.adresse &&
            this.agence.adresse.code_postal !== undefined
        ) {
            const codePostalStr = String(this.agence.adresse.code_postal);
            this.isValidCodePostal = /^\d{5}$/.test(codePostalStr);
        } else {
            this.isValidCodePostal = false;
        }
    }

    isCodePostalDisabled: boolean = false;

    validatePays() {
        this.isValidPays = !!this.agence.adresse.pays;
        // Si le pays sélectionné est "Guinée-Conakry", fixer le code postal à "00000" et le rendre non modifiable
        if (this.agence.adresse.pays === 'GUINEE-CONAKRY') {
            this.agence.adresse.code_postal = '00000';
            this.isCodePostalDisabled = true;
        } else {
            this.isCodePostalDisabled = false;
        }
    }

    saveAgence() {
        this.submitted = true;
        
        // this.validatePays();
        // this.validateCodePostal();
        // this.validatePhone();
        const codePostalStr = String(this.agence.adresse.code_postal);

        if (!this.isValidCodePostal) { return; }
         if (this.agence.adresse && this.agence.adresse.code_postal !== undefined ) {
            this.agence.adresse.code_postal = String( this.agence.adresse.code_postal );
        }
         if (
            this.agence.responsable_reference &&
            this.agence.nom_agence &&
            this.agence.phone &&
            this.agence.email &&
            this.agence.adresse.ville
        ) {
            this.agenceService.createAgence(this.agence).subscribe({
                next: (res) => {
                     console.log("Agence créée avec succès:", res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Agence créée avec succès',
                        life: 3000,
                    });
                },
                error: (err) => {
  this.loading = false;

  if (err.validationErrors) {
    this.apiErrors = err.validationErrors;
    this.errorMessage = err.message;
  } else {
    this.errorMessage = err.message || "Une erreur est survenue.";
  }

  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: this.errorMessage,
    life: 5000,
  });
}

            });
         }
    }
}
