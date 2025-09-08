import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Transfert } from 'src/app/demo/models/transfert';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
    selector: 'app-transfert-retrait',
    templateUrl: './transfert-retrait.component.html',
    styleUrl: './transfert-retrait.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class TransfertRetraitComponent implements OnInit {
  

    transfert: Transfert = new Transfert();
    retraitDialog: boolean = false;
    codeRecuperer: boolean = false;
    errorMessage: string | null = null;
    loading: boolean = false;
    isValideCode: boolean = false;
    code: string = '';


    constructor(
        private router: Router,
        private transfertService: TransfertService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {}

    /***************************** */

    onCodeRecuperer() {
          if (!this.code.trim()) {
            this.errorMessage = "Veuillez saisir un code valide.";
            return;
        }

        this.loading = true;
        this.errorMessage = null;
        this.isValideCode = false;

        this.transfertService.getTransfertByCode(this.code).subscribe({
            next: (response) => {
                this.transfert = response;
                this.codeRecuperer = true;
                this.loading = false;
                this.isValideCode = response.statut !== 'retiré' && response.statut !== 'annulé';
                 
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération du transfert:', err );
                this.transfert = new Transfert(); // Réinitialise les données
                this.codeRecuperer = false;
                this.loading = false;
                this.errorMessage = err.message || "Une erreur est survenue lors de la récupération du transfert.";
              },
        });
    }

    
    openRetraitDialog() {
      if (!this.isValideCode) {
          let message = "Ce transfert ne peut pas être retiré.";
  
          if (this.transfert?.statut === 'retiré') {
              message = "Ce transfert a déjà été retiré.";
          } else if (this.transfert?.statut === 'annulé') {
              message = "Ce transfert a été annulé et ne peut pas être retiré.";
          }
  
          this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: message,
              life: 3000
          });
          return;
      }
  
      this.retraitDialog = true;
  }

 
    hideDialog() {
        this.retraitDialog = false;
    }

    confirmRetrait() {
      if (!this.transfert) {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun transfert sélectionné.', life: 3000 });
          return;
      }

       this.loading = true;
      this.transfertService.validerRetrait(this.code as string).subscribe({
          next: (response) => {
              this.transfert!.statut = 'retiré'; // Met à jour le statut localement
              this.retraitDialog = false;
              this.onCodeRecuperer();
              this.loading = false;
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: response.message });
          },
          error: (err) => {
              console.error('Erreur lors du retrait:', err);
              this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.message });
          }
      });
  }
}
