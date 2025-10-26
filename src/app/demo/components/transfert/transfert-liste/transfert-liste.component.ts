import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Transfert } from 'src/app/demo/models/transfert';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
  selector: 'app-transfert-liste',
  templateUrl: './transfert-liste.component.html',
  styleUrl: './transfert-liste.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class TransfertListeComponent implements OnInit {
   
  transferts: Transfert[] = [];
  selectedTransferts: Transfert[] = [];
  transfertDialog: boolean = false;
  deleteTransfertsDialog: boolean = false;
  transfert!: Transfert;
   loading = false;
   skeletonRows = Array.from({ length: 5 }, () => ({}));

  constructor(
    private router: Router, 
    private transfertService: TransfertService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.getTransfertsByUser();
  }


  /** Récupérer la liste des transferts */
  getTransfertsByUser(): void {
      this.loading = true;

    this.transfertService.getByUserAuth().subscribe({
      next: (response) => {
        this.transferts = response;
        this.loading = false;
        // console.log(this.transferts); 
        
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des transferts:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger les transferts.",
        });
        this.loading = false;
      }
    });
  }

  /** 🔹 Navigation */
  goToTransfertEnvoie() {
    this.router.navigate(['/dashboard/transfert/envoie']);
  }

  goToTransfertRetrait() {
    this.router.navigate(['/dashboard/transfert/retrait']);
  }

  goToTransfertDetail(transfert: Transfert) {    
    this.router.navigate(['/dashboard/transfert/detail', transfert.id]);  
  }

  /** 🔹 Confirmer la suppression d'un transfert */
  confirmDeleteTransfert(transfert: Transfert): void {
    this.confirmationService.confirm({
      message: "Êtes-vous sûr de vouloir supprimer ce transfert ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptButtonStyleClass: "p-button-danger",
      rejectButtonStyleClass: "p-button-secondary",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => this.deleteTransfert(transfert),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulation',
          detail: 'La suppression a été annulée.',
        });
      }
    });
  }

  /** 🔹 Supprimer un transfert par ID ou par Code */
  deleteTransfert(transfert: Transfert): void {
    const deleteObservable = transfert.code 
      ? this.transfertService.deleteTransfertByCode(transfert.code) 
      : this.transfertService.deleteTransfertById(transfert.id as number);

    deleteObservable.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Transfert supprimé avec succès.',
          life: 4500,
        });
        this.getTransfertsByUser();
      },
      error: (err) => {
        console.error("Erreur lors de la suppression :", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || "Échec de la suppression.",
        });
      }
    });
  }

  /** 🔹 Confirmer la suppression multiple */
  confirmDeleteSelectedTransferts(): void {
    if (!this.selectedTransferts || this.selectedTransferts.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Aucun transfert sélectionné.",
      });
      return;
    }

    this.confirmationService.confirm({
      message: "Voulez-vous supprimer les transferts sélectionnés ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => this.deleteSelectedTransferts(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulation',
          detail: "La suppression multiple a été annulée.",
        });
      }
    });
  }

  /** 🔹 Suppression multiple */
  deleteSelectedTransferts(): void {
    this.selectedTransferts.forEach(transfert => this.deleteTransfert(transfert));
    this.selectedTransferts = [];
  }

  /** 🔹 Filtrage global */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  statusSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
  switch ((statut || '').toLowerCase()) {
    case 'retiré':
    case 'retire':
      return 'success';
    case 'envoyé':
    case 'envoye':
      return 'info';
    case 'bloqué':
    case 'bloque':
      return 'warning';
    case 'annulé':
    case 'annule':
      return 'danger';
    default:
      return undefined;
  }
}

modeLabel(mode?: string): string {
  switch (mode) {
    case 'orange_money': return 'Orange Money';
    case 'ewallet':      return 'E-Wallet';
    case 'retrait_cash': return 'Retrait cash';
    default:             return '—';
  }
}

}
