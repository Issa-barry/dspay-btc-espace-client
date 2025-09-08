import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Transfert } from 'src/app/demo/models/transfert';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
    selector: 'app-transfert-edit',
    templateUrl: './transfert-edit.component.html',
    styleUrl: './transfert-edit.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class TransfertEditComponent {
    cities = [
        { name: 'Cosa / Conakry', code: 'NY' },
        { name: 'Banbeto / Conakry', code: 'RM' },
        { name: 'Foundin / Dabola', code: 'LDN' },
        { name: 'Hamdallaye / Dabola', code: 'IST' },
        { name: 'Abatoire / Mamou', code: 'PRS' },
    ];

    transfert: Transfert = new Transfert();

    envoieDialog: boolean = false; 
    submitted: boolean = false;
    loading: boolean = false;
    errors: { [key: string]: string } = {};
    id: number;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private transfertService: TransfertService,
        private confirmationService: ConfirmationService
    ) {
        this.id = this.activatedRoute.snapshot.params['id'];
    }

    ngOnInit(): void {
        this.getTransfertById();
    }

    /**
     * Vérifie que tous les champs obligatoires sont remplis
     */
    verifierChampsObligatoires(): boolean {
        const champsObligatoires = [
            'quartier',
            'receveur_phone',
            'receveur_nom_complet',
        ];
    
        this.errors = {}; // Réinitialisation des erreurs
    
        for (const champ of champsObligatoires) {
            const valeurChamp = this.transfert[champ as keyof Transfert];
    
            if (!valeurChamp || (typeof valeurChamp === 'string' && valeurChamp.trim() === '')) {
                this.errors[champ] = `Le champ ${champ} est obligatoire.`;
            }
        }
    
        if (Object.keys(this.errors).length > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: `Veuillez remplir tous les champs obligatoires.`,
                life: 3000,
            });
    
            return false;
        }
    
        return true;
    }
    
    

    hideDialog() {
        this.envoieDialog = false;
         this.submitted = false;
    }

    hideTicketDialog() {
         this.submitted = false;
    }

    verifierFormulaire() {
        this.submitted = true;
        this.errors = {};
        if (!this.verifierChampsObligatoires()) return;
        this.envoieDialog = true;
    }

    confirmationModificationReceveur() {
        this.submitted = true;
        if (!this.verifierChampsObligatoires()) {
            return;
        } else {
            this.confirmationService.confirm({
                message:
                    'Voulez-vous vraiment modifié les information du receveur?',
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui',
                rejectLabel: 'Non',
                acceptButtonStyleClass: 'p-button-danger',
                rejectButtonStyleClass: 'p-button-secondary',
                accept: () => this.save(),
                reject: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Annulation',
                        detail: 'La modification a été abandonnée.',
                    });
                },
            });
        }
    }

    save() {
        this.loading = true;
        const id = this.transfert.id!;

        console.log(this.transfert.id);

        this.transfertService
            .updateTransfertById(id, this.transfert)
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Transfert modifié avec succès',
                        life: 3000,
                    });
                    this.loading = false;
                    this.envoieDialog = false;
                 },
                error: (error) => {
                    console.error(
                        'Erreur lors de la modification du transfert:',
                        error
                    );
                    this.errors = error.validationErrors;
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'La modification du transfert a échoué. Vérifiez les champs.',
                        life: 5000,
                    });
                },
            });
    }

    getTransfertById(): void {
        this.transfertService.getTransfertById(this.id).subscribe({
            next: (resp) => {
                this.transfert = resp;
                // console.log("Transfert récupéré :", this.transfert);
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
}
