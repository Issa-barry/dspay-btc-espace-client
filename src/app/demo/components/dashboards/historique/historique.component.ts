import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Transfert } from 'src/app/demo/models/transfert';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
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
    ) {}
 

  ngOnInit() {
       this.getTransfertsByUser();
  }

   /** Récupérer la liste des transferts */
  getTransfertsByUser(): void {
      this.loading = true;

    this.transfertService.getByUserAuth().subscribe({
      next: (response: any) => {
        this.transferts = response;
        this.loading = false;
        console.log("historique", this.transferts); 
        
      },
      error: (err: any) => {
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

  // *****
  getInitials(name: string): string {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    /**Multicolor avatar */
    const colors = [
      '#E91E63', // Rose
      '#2196F3', // Bleu
      '#FF9800', // Orange
      '#4CAF50', // Vert
      '#9C27B0', // Violet
      '#FF5722', // Rouge-orange
      '#00BCD4', // Cyan
      '#FFC107'  // Jaune-orange
    ];
    
    const index = name.length % colors.length;
    return colors[index];

    /**couleur unique avatar */
    //  return '#00BCD4';
  }


    goToTransfertDetail(transfert: Transfert) {    
    this.router.navigate(['/dashboard/transfert/detail', transfert.id]);  
  }

}