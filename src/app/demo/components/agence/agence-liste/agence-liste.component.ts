import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Agence } from 'src/app/demo/models/agence';
import { AgenceService } from 'src/app/demo/service/agence/agence.service';
import { Statut } from 'src/app/demo/enums/statut.enum';

@Component({
    selector: 'app-agence-liste',
    templateUrl: './agence-liste.component.html',
    styleUrl: './agence-liste.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class AgenceListeComponent implements OnInit {
    agences: Agence[] = [];
    selectedAgences: Agence[] = [];
    agence: Agence = new Agence();

    agenceDialog = false;
    deleteAgenceDialog = false;
    deleteAgencesDialog = false;

    apiErrors: { [key: string]: string[] } = {};
    submitted = false;
    loading = false;

    isValidPhone = true;
    isValidPays = true;
    isValidCodePostal = true;
    isCodePostalDisabled = false;

    rowsPerPageOptions = [5, 10, 20];
    optionPays = [
        { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
        { label: 'FRANCE', value: 'France' },
    ];

    constructor(
        private agenceService: AgenceService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.getAllAgences();
    }

    // 🔁 Navigation
    onGotToNewAgence() {
        this.router.navigate(['/dashboard/agence/new-agence']);
    }

    onGotToEditAgence(agence: Agence) {
        this.router.navigate(['/dashboard/agence/agence-edit', agence.id]);
    }

    onGotToContactAgence(agence: Agence) {
        this.router.navigate(['/dashboard/contact/contact-detail', agence.id]);
    }

    skeletonRows = Array.from({ length: 5 }, () => ({}));
    //  CRUD
   getAllAgences() {
    this.loading = true;
    this.agenceService.getAgences().subscribe({
        next: (res) => {
            this.agences = res;
            this.loading = false;
        },
        error: (err) => {
            console.error('Erreur de chargement :', err);
            this.loading = false;
        },
    });
} 
    openEditAgence(agence: Agence) {
        this.agence = { ...agence };
        this.agenceDialog = true;
    }

    openDeleteAgence(agence: Agence) {
        this.agence = { ...agence };
        this.deleteAgenceDialog = true;
    }

    deleteSelectedAgences() {
        this.deleteAgencesDialog = true;
    }

    confirmDeleteSelected() {
        this.deleteAgencesDialog = false;
        this.showMessage('success', 'Suppression multiple', 'Agences supprimées.');
    }

    confirmDelete() {
        this.deleteAgenceDialog = false;
        if (!this.agence.id) return;

        this.agenceService.deleteAgence(this.agence.id).subscribe({
            next: () => {
                this.showMessage('success', 'Succès', 'Agence supprimée.');
                this.agenceDialog = false;
                this.getAllAgences();
            },
            error: () => {
                this.showMessage('error', 'Erreur', 'Suppression échouée.');
            },
        });
    }

    // 🔁 Statuts avec Enum
    validerAgence(agence: Agence) {
        this.updateStatutAgence(agence, Statut.ACTIVE, 'success', 'validée');
    }

    bloquerAgence(agence: Agence) {
        this.updateStatutAgence(agence, Statut.BLOQUE, 'warn', 'bloquée');
    }

    debloquerAgence(agence: Agence) {
        this.updateStatutAgence(agence, Statut.ACTIVE, 'info', 'débloquée');
    }

    private updateStatutAgence(agence: Agence, statut: Statut, severity: string, action: string) {
        if (!agence.id) return;

        this.agenceService.updateStatut(agence.id, statut).subscribe({
            next: (updated) => {
                this.showMessage(severity, 'Statut modifié', `Agence "${updated.nom_agence}" ${action}.`);
                this.getAllAgences();
            },
            error: (err) => {
                this.showMessage('error', 'Erreur', err.message || `Échec de la modification du statut.`);
            },
        });
    }

    // ✅ Validation formulaire
    validatePhone() {
        const regex = /^(?:\+|00)?(\d{1,3})[-.\s]?\d{10,}$/;
        this.isValidPhone = regex.test(this.agence.phone || '');
    }

    validatePays() {
        this.isValidPays = !!this.agence.adresse?.pays;
        if (this.agence.adresse?.pays === 'GUINEE-CONAKRY') {
            this.agence.adresse.code_postal = '00000';
            this.isCodePostalDisabled = true;
        } else {
            this.isCodePostalDisabled = false;
        }
    }

    validateCodePostal() {
        const cp = this.agence.adresse?.code_postal?.toString() || '';
        this.isValidCodePostal = /^\d{5}$/.test(cp);
    }

    // 🧠 Utilitaires
    hideDialog() {
        this.agenceDialog = false;
        this.submitted = false;
    }

    isFormInvalid(): boolean {
        const a = this.agence;
        return !a.nom_agence || !a.phone || !a.email || !a.adresse?.adresse || !a.adresse.code_postal || !a.adresse.ville;
    }

    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    handleApiErrors(err: any) {
        this.apiErrors = err.error?.errors || {};
        if (Object.keys(this.apiErrors).length) {
            for (const key in this.apiErrors) {
                this.showMessage('error', `Erreur champ ${key}`, this.apiErrors[key].join(', '));
            }
        } else {
            this.showMessage('error', 'Erreur', 'Une erreur inattendue est survenue.');
        }
    } 

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
