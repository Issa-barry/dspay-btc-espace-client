import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  //  frais 
  readonly tauxDeFrais = 0.05;
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
 includeFrais: boolean = true; 

  transfert: Transfert = new Transfert();

  // Stepper
  items: MenuItem[] = [];
  activeIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private beneficiaireService: BeneficiaireService,
    private transfertService: TransfertService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaires();
    this.prefillFromQuery();
  }

  private prefillFromQuery(): void {
  const p = this.route.snapshot.queryParamMap;

  const sendAmount = Number(p.get('sendAmount') ?? p.get('amountInput'));
  const receive = Number(p.get('receive'));
  const included = p.get('feesIncluded');

  if (!Number.isNaN(sendAmount) && sendAmount > 0) {
    this.montantEuro = sendAmount;
  }
  if (!Number.isNaN(receive) && receive > 0) {
    this.montantGNF = receive;
  } else {
    this.convertirDepuisEuro();
  }

  if (included !== null) this.includeFrais = included === 'true';
  this.majFraisTotal();
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

  get selectedBeneficiaireLabel(): string {
  const b = this.beneficiairesOptions.find(o => o.id === this.selectedBeneficiaireId);
  return b?.label ?? '—';
}
get selectedBeneficiairePhone(): string {
  const b = this.beneficiairesOptions.find(o => o.id === this.selectedBeneficiaireId);
  return b?.phone ?? '—';
}

//formulaire envoie : 
get isMontantValide(): boolean {
  const eur = Number(this.montantEuro);
  return !Number.isNaN(eur) && eur > 0 && eur <= 1000;
}

get isBeneficiaireValide(): boolean {
  // vérifie qu’un id est sélectionné et existe dans la liste
  const id = this.selectedBeneficiaireId;
  return id != null && this.beneficiairesOptions.some(o => o.id === id);
}

// (optionnel) un seul getter pour le bouton principal si tu veux centraliser
get canContinue(): boolean {
  if (this.activeIndex === 0) return this.isMontantValide;
  if (this.activeIndex === 1) return this.isBeneficiaireValide;
  return true;
}

  /** Sélection d’un bénéficiaire */
  onBeneficiaireChange(id: number | null) {
    this.selectedBeneficiaireId = id;
  }
 
 // ---- calcule/maj frais & total
  majFraisTotal(): void {
  const eur = +(this.montantEuro || 0);
  // frais estimés (arrondi 2 décimales)
  this.frais = Math.round(eur * this.tauxDeFrais * 100) / 100;

  // total -> selon le switch
  const totalEur = this.includeFrais ? (eur + this.frais) : eur;
  this.total = Math.round(totalEur * 100) / 100;
}

// appelle déjà majFraisTotal() à la fin de ces 2 méthodes
convertirDepuisEuro() {
  if (this.montantEuro == null) { this.montantGNF = 0; this.majFraisTotal(); return; }
  if (this.montantEuro > 1000) this.montantEuro = 1000;
  this.montantGNF = Math.floor(this.montantEuro * this.tauxConversion);
  this.majFraisTotal();
}

convertirDepuisGNF() {
  if (this.montantGNF == null) { this.montantEuro = 0; this.majFraisTotal(); return; }
  const euro = this.montantGNF / this.tauxConversion;
  if (euro > 1000) { this.montantEuro = 1000; this.montantGNF = 1000 * this.tauxConversion; }
  else { this.montantEuro = euro; }
  this.majFraisTotal();
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
    beneficiaire_id: this.selectedBeneficiaireId!,
    taux_echange_id: this.selectedTauxId,
    montant_euro: Math.round(this.montantEuro * 100) / 100,
  };

  this.loading = true;
  this.transfertService.createTransfert(dto).subscribe({
    next: (t) => {
      this.loading = false;

      // si tu veux garder l'ancien récap à l'écran
      this.transfert = t;
      this.frais = (t as any)?.frais ?? 0;
      this.total = Number((t as any)?.total ?? 0);
      this.montantGNF = Number((t as any)?.montant_gnf ?? 0);
      this.messageService.add({ 
  severity: 'success', 
  summary: 'Succès', 
  detail: 'Transfert effectué.', 
  life: 4000   // 👉 timeout de 3 secondes
});



      // 👉 récupère l'identifiant renvoyé par l'API
      const id =
        (t as any)?.id ??
        (t as any)?.data?.id ??
        (t as any)?.transfert?.id ??
        (t as any)?.transfert_id;

      // ferme les modales si besoin
      this.hideDialog();

      // Redirige vers /dashboard/transfert/detail/:id
      if (id) {
      // ✅ Attendre la fin du toast avant redirection
      setTimeout(() => {
        this.router.navigate(['/dashboard/transfert/detail', id], {
          replaceUrl: true
        });
      }, 2500); // même durée que life
    } else {
      setTimeout(() => {
        this.router.navigate(['/dashboard/transfert']);
      }, 2500);
    }
    },
    error: (err) => {
      this.loading = false;
      this.errors = err?.validationErrors || {};
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.message || 'Échec de l’envoi.' });
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

  // si tu recalcules en arrivant au récap
next() {
  const nextIndex = Math.min(this.activeIndex + 1, 2);
  if (nextIndex === 2) this.majFraisTotal();
  this.activeIndex = nextIndex;
}
  prev() { this.activeIndex = Math.max(this.activeIndex - 1, 0); }
  prevBeneficiaire() { this.router.navigate(['steps/payment']); }
  canNext(): boolean { return this.activeIndex >= 0 && this.activeIndex <= 2 ? true : false; }
}
