import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Transfert } from 'src/app/demo/models/transfert';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
    selector: 'app-transfert-envoie',
    templateUrl: './transfert-envoie.component.html',
    styleUrl: './transfert-envoie.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class TransfertEnvoieComponent implements OnInit {
    cities = [
        { name: 'Cosa / Conakry', code: 'NY' },
        { name: 'Banbeto / Conakry', code: 'RM' },
        { name: 'Foundin / Dabola', code: 'LDN' },
        { name: 'Hamdallaye / Dabola', code: 'IST' },
        { name: 'Abatoire / Mamou', code: 'PRS' },
    ];

    transfert: Transfert = new Transfert();
    total = 0;
    frais = 0; 
    readonly tauxDeFrais = 0.05; // 5%
    montantConverti = 0;
    readonly tauxConversion = 9500; // 1 euro = 9500 GNF
    envoieDialog = false;
    ticketDialog = false;
    submitted = false;
    loading = false;
    errors: Record<string, string> = {};

    constructor(
        private router: Router,
        private transfertService: TransfertService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {}

    /** Vérifie et affiche un message si le montant est insuffisant */
    private verifierMontant(): boolean {
        if (!this.transfert.montant_expediteur || this.transfert.montant_expediteur < 20) {
            this.afficherMessage('warn', 'Montant insuffisant', 'Le montant minimum est de 20€.');
            return false;
        }
        return true;
    }

    /** Vérifie si tous les champs obligatoires sont remplis */
    private verifierChampsObligatoires(): boolean {
        const champsObligatoires = [
            'quartier', 'montant_expediteur', 'receveur_phone', 'receveur_nom_complet',
            'expediteur_phone', 'expediteur_nom_complet', 'expediteur_email'
        ];
        
        if (this.transfert.expediteur_email && !this.validateEmail(this.transfert.expediteur_email)) {
            this.errors['expediteur_email'] = 'Veuillez saisir une adresse email valide.';
            return false;
        }
        
        for (const champ of champsObligatoires) {
            if (!this.transfert[champ as keyof Transfert]) {
                this.afficherMessage('warn', 'Attention', `Le champ ${champ.replace('_', ' ')} est obligatoire.`);
                return false;
            }
        }
        return true;
    }

    /** Vérifie le format d'un email */
    private validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /** Calcule les frais et le total */
    calculFraisTotal(): void {
        this.frais = Math.floor(this.transfert.montant_expediteur * this.tauxDeFrais);
        this.total = this.transfert.montant_expediteur + this.frais;
        this.calculMontantConverti();
    }

    /** Convertit le montant en devise cible */
    private calculMontantConverti(): void {
        this.montantConverti = Math.floor(this.transfert.montant_expediteur * this.tauxConversion);
        this.transfert.montant_receveur = this.montantConverti;
    }

    /** Affiche un message via MessageService */
    private afficherMessage(severity: string, summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    /** Vérifie le formulaire et ouvre le dialogue d'envoi */
    verifierFormulaire(): void {
        this.submitted = true;
        this.errors = {};

        if (!this.verifierMontant() || !this.verifierChampsObligatoires()) return;
        this.envoieDialog = true;
    }

    /** Enregistre le transfert */
    save(): void {
        this.loading = true;
        this.transfertService.createTransfert(this.transfert).subscribe({
            next: () => {
                this.afficherMessage('success', 'Succès', 'Transfert effectué avec succès');
                this.loading = false;
                this.envoieDialog = false;
                this.openTicketDialog();
            },
            error: (error) => {
                console.error('Erreur lors du transfert:', error);
                this.errors = error.validationErrors;
                this.loading = false;
                this.afficherMessage('error', 'Erreur', 'L’envoi du transfert a échoué. Vérifiez les champs.');
            },
        });
    }
 
    /** Ouvre le dialogue du ticket */
    openTicketDialog(): void {
        this.ticketDialog = true;
    }

    /** Ferme tous les dialogues et réinitialise le formulaire */
    hideDialog(): void {
        this.envoieDialog = false;
        this.ticketDialog = false;
        this.submitted = false;
    }

    /** Ferme le ticket et réinitialise le formulaire */
    hideTicketDialog(): void {
        this.ticketDialog = false;
        this.resetForm();
    }

    /** Réinitialise le formulaire */
    private resetForm(): void {
        this.transfert = new Transfert();
        this.submitted = false;
        this.montantConverti = 0;
        this.frais = 0;
        this.total = 0;
        this.errors = {};
        this.loading = false;
    }
}