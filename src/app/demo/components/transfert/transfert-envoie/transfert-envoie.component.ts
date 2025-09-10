import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Transfert } from 'src/app/demo/models/transfert';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { TransfertService, TransfertCreateDto } from 'src/app/demo/service/transfert/transfert.service';

@Component({
  selector: 'app-transfert-envoie',
  templateUrl: './transfert-envoie.component.html',
  styleUrl: './transfert-envoie.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class TransfertEnvoieComponent implements OnInit {

  // Montants & taux (affichage)
  montantEuro = 0;
  montantGNF  = 0;
  tauxConversion = 9500; // juste pour l’aperçu côté front

  // Bénéficiaire + taux
  beneficiairesOptions: Array<{ id: number; label: string; phone: string }> = [];
  selectedBeneficiaireId: number | null = null;
  selectedTauxId = 1; // fixe (ou bind sur un dropdown de taux)

  // UI
  payementDialog = false;
  envoieDialog = false;
  ticketDialog = false;
  loading = false;
  submitted = false;
  errors: Record<string, string> = {};

  // Récap
  total = 0;
  frais  = 0;
  readonly tauxDeFrais = 0.05;

  transfert: Transfert = new Transfert();

  // Stepper
  items: MenuItem[] = [];
  activeIndex = 0;

  constructor(
    private router: Router,
    private beneficiaireService: BeneficiaireService,
    private transfertService: TransfertService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaires();
  }

  /** Charge les bénéficiaires pour le dropdown */
  private loadBeneficiaires(search = '', limit = 50): void {
    this.loading = true;
    this.beneficiaireService.listForSelect(search, limit).subscribe({
      next: (options) => {
        this.beneficiairesOptions = options; // {id,label,phone}[]
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les bénéficiaires'
        });
      }
    });
  }

  /** Sélection d’un bénéficiaire */
  onBeneficiaireChange(id: number | null) {
    this.selectedBeneficiaireId = id;
  }

  /** Conversion front-only pour l’aperçu */
  convertirDepuisEuro() {
    if (this.montantEuro == null) {
      this.montantGNF = 0;
      return;
    }
    if (this.montantEuro > 1000) this.montantEuro = 1000; // limite max
    this.montantGNF = Math.floor(this.montantEuro * this.tauxConversion);
  }

  convertirDepuisGNF() {
    if (this.montantGNF == null) {
      this.montantEuro = 0;
      return;
    }
    let euro = this.montantGNF / this.tauxConversion;
    if (euro > 1000) {
      this.montantEuro = 1000;
      this.montantGNF = 1000 * this.tauxConversion;
    } else {
      this.montantEuro = euro;
    }
  }

  /** Envoi du transfert (nouveau contrat API) */
  save(): void {
    this.submitted = true;
    this.errors = {};

    if (!this.selectedBeneficiaireId) {
      this.messageService.add({ severity: 'warn', summary: 'Bénéficiaire', detail: 'Veuillez sélectionner un bénéficiaire.' });
      return;
    }
    if (!this.montantEuro || this.montantEuro < 1) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: 'Veuillez saisir un montant en EUR (min 1€).' });
      return;
    }
    if (this.montantEuro > 1000) this.montantEuro = 1000;

    const dto: TransfertCreateDto = {
      beneficiaire_id: this.selectedBeneficiaireId,
      taux_echange_id: this.selectedTauxId,
      // toujours 2 décimales envoyées
      montant_euro: Math.round(this.montantEuro * 100) / 100,
    };

    this.loading = true;
    this.transfertService.createTransfert(dto).subscribe({
      next: (t) => {
        this.loading = false;
        this.transfert = t;
        // Maj du récap
        this.frais = t.frais ?? 0;
        this.total = Number(t.total ?? 0);
        this.montantGNF = Number((t as any).montant_gnf ?? 0);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Transfert effectué.' });
        this.openTicketDialog();
      },
      error: (err) => {
        this.loading = false;
        this.errors = err.validationErrors || {};
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.message || 'Échec de l’envoi.' });
      }
    });
  }

  /** UI helpers */
  openTicketDialog(): void { this.ticketDialog = true; }
  openPayement(): void { this.payementDialog = true; }
  hideDialog(): void {
    this.envoieDialog = false;
    this.ticketDialog = false;
    this.payementDialog = false;
    this.submitted = false;
  }
  hideTicketDialog(): void {}

  next() { this.activeIndex = Math.min(this.activeIndex + 1, 2); }
  prev() { this.activeIndex = Math.max(this.activeIndex - 1, 0); }
  prevBeneficiaire() { this.router.navigate(['steps/payment']); }
  canNext(): boolean { return this.activeIndex >= 0 && this.activeIndex <= 2 ? true : false; }
}
