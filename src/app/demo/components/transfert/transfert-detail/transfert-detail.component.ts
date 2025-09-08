import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Agence } from 'src/app/demo/models/agence';
import { Transfert } from 'src/app/demo/models/transfert';
import { AgenceService } from 'src/app/demo/service/agence/agence.service';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
    selector: 'app-transfert-detail',
    templateUrl: './transfert-detail.component.html',
    styleUrl: './transfert-detail.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class TransfertDetailComponent implements OnInit {
    retraitTransfertsDialog: boolean = false;
    transfert: Transfert = new Transfert();
    agent: any = {};
    agence: Agence = new Agence();
    submited: boolean = false;
    id: number;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private transfertService: TransfertService,
        private confirmationService: ConfirmationService,
        private contactService: ContactService,
        private agenceService: AgenceService
    ) {
        this.id = this.activatedRoute.snapshot.params['id']; // Initialisation directe
    }

    ngOnInit() {
        this.getTransfertById();
    }

    // ============================
    // Gestion des Transferts
    // ============================

    /** Récupérer un transfert par ID */
    getTransfertById(): void {
        this.transfertService.getTransfertById(this.id).subscribe({
            next: (resp) => {
                this.transfert = resp;
                console.log('Transfert récupéré :', this.transfert.agent_id);
                const agent_id = this.transfert.agent_id!;
                this.getAgentById(agent_id);
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération du transfert:',
                    err
                );
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de récupérer le transfert.',
                });
            },
        });
    }

    getAgentById(id: number) {
        this.contactService.getContactById(id).subscribe({
            next: (res) => {
                this.agent = res;
                const agence_id = this.agent.agence_id;

                console.log('agent', this.agent);

                this.getAgenceById(1);
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération du transfert:',
                    err
                );
            },
        });
    }

    getAgenceById(id: number) {
        this.agenceService.getAgenceById(id).subscribe({
            next: (res) => {
                this.agence = res;
                console.log('agence', this.agence);
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération du transfert:',
                    err
                );
            },
        });
    }

    /** Annuler un transfert */
    annulerTransfert(): void {
        if (this.transfert.statut !== 'en_cours') {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Seuls les transferts en cours peuvent être annulés.',
            });
            return;
        }

        this.transfertService.annulerTransfert(this.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Le transfert a été annulé avec succès.',
                    life: 4500,
                });

                this.getTransfertById(); // Rafraîchir les données
            },
            error: (err) => {
                console.error('Erreur lors de l’annulation du transfert:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail:
                        err.message ||
                        'Une erreur est survenue lors de l’annulation.',
                    life: 4500,
                });
            },
        });
    }

    // ============================
    //  Dialogues & Confirmations
    // ============================

    /**  Confirmer l’annulation d’un transfert */
    confirmAnnulationTransfert(): void {
        if (!this.transfert || this.transfert.statut !== 'en_cours') {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Seuls les transferts en cours peuvent être annulés.',
            });
            return;
        }

        this.confirmationService.confirm({
            message:
                'Voulez-vous vraiment annuler ce transfert ? Cette action est irréversible.',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => this.annulerTransfert(),
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulation',
                    detail: "L'annulation a été abandonnée.",
                });
            },
        });
    }

    /** Ouvrir la boîte de dialogue de retrait */
    openRetraitDialog(): void {
        this.retraitTransfertsDialog = true;
    }

    /** Fermer la boîte de dialogue de retrait */
    hideRetraitDialog(): void {
        this.retraitTransfertsDialog = false;
    }

    /** Rediriger vers la modification du transfert */
    goToEditTransfert(): void {
        if (this.transfert.statut === 'retiré') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Modification non autorisée',
                detail: 'Ce transfert a déjà été retiré et ne peut plus être modifié.',
            });
            return;
        } else if (this.transfert.statut === 'annulé') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Modification non autorisée',
                detail: 'Ce transfert a déjà été annulé et ne peut plus être modifié.',
            });
            return;
        } else {
            this.router.navigate(['/dashboard/transfert/edit/', this.id]);
        }
    }

    /** Rediriger vers la liste des transferts */
    goToTransfertList(): void {
        this.router.navigate(['/dashboard/transfert']);
    }
}
