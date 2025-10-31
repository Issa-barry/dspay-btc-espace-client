import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  transferts: any[] = [];

  ngOnInit() {
    this.transferts = [
      {
        id: 1,
        beneficiaire: 'Abdourahman DIALLO',
        phone: '+224 622 25 70 40',
        montant_recu: 5000000
      },
      {
        id: 2,
        beneficiaire: 'Adama Camara',
        phone: '+224 611 21 43 50',
        montant_recu: 2500000
      },
      {
        id: 3,
        beneficiaire: 'Aissatou Diallo',
        phone: '+224 627 75 59 33',
        montant_recu: 7500000
      },
      {
        id: 4,
        beneficiaire: 'Alpha Ousmane Barry',
        phone: '+224 622 22 21 98',
        montant_recu: 3200000
      },
      {
        id: 5,
        beneficiaire: 'Aminata DIALLO',
        phone: '+224 621 09 07 88',
        montant_recu: 1500000
      },
      {
        id: 6,
        beneficiaire: 'Bintou BARRY',
        phone: '+224 626 78 90 12',
        montant_recu: 4800000
      },
      {
        id: 7,
        beneficiaire: 'Mamadou Sow',
        phone: '+224 627 89 01 23',
        montant_recu: 6200000
      },
      {
        id: 8,
        beneficiaire: 'Fatoumata Conde',
        phone: '+224 628 90 12 34',
        montant_recu: 2900000
      }
    ];
  }

  getInitials(name: string): string {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
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
  }
}