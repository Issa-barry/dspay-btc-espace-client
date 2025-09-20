import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
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
  tauxConversion = 9500;

  // Bénéficiaire + taux
  beneficiairesOptions: Array<{ id: number; label: string; phone: string }> = [];
  selectedBeneficiaireId: number | null = null;
  selectedTauxId = 1;

  // Frais
  readonly tauxDeFrais = 0.05;

  // UI
  payementDialog = false;
  envoieDialog = false;
  ticketDialog = false;
  loading = false;
  submitted = false;
  errors: Record<string, string> = {};

  // Récap
  total_ttc = 0;
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
    this.majFraisTotal_ttc();
  }

  /** Construit l'option dropdown depuis un objet bénéficiaire */
  private toOption(b: any) {
    const label =
      (b.nom_complet?.trim()) ||
      [b.prenom, b.nom].filter(Boolean).join(' ').trim() ||
      b.phone;
    return {
      id: Number(b.id),
      label,
      phone: b.phone ?? ''
    };
  }

  /** Charge les bénéficiaires pour le dropdown (avec pré-sélection possible) */
  private loadBeneficiaires(search = '', limit = 50, preselectId?: number): void {
    this.loading = true;
    this.beneficiaireService.listForSelect(search, limit).subscribe({
      next: (options) => {
        this.beneficiairesOptions = options; // {id,label,phone}[]
        if (preselectId && options.some(o => o.id === preselectId)) {
          this.selectedBeneficiaireId = preselectId;
        }
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

  // formulaire envoie :
  get isMontantValide(): boolean {
    const eur = Number(this.montantEuro);
    return !Number.isNaN(eur) && eur > 0 && eur <= 1000;
  }

  get isBeneficiaireValide(): boolean {
    const id = this.selectedBeneficiaireId;
    return id != null && this.beneficiairesOptions.some(o => o.id === id);
  }

  get canContinue(): boolean {
    if (this.activeIndex === 0) return this.isMontantValide;
    if (this.activeIndex === 1) return this.isBeneficiaireValide;
    return true;
  }

  /** Sélection d’un bénéficiaire */
  onBeneficiaireChange(id: number | null) {
    this.selectedBeneficiaireId = id;
  }

  // ---- calcule/maj frais & total_ttc
  majFraisTotal_ttc(): void {
    const eur = +(this.montantEuro || 0);
    this.frais = Math.round(eur * this.tauxDeFrais * 100) / 100;
    const total_ttcEur = this.includeFrais ? (eur + this.frais) : eur;
    this.total_ttc = Math.round(total_ttcEur * 100) / 100;
  }

  convertirDepuisEuro() {
    if (this.montantEuro == null) { this.montantGNF = 0; this.majFraisTotal_ttc(); return; }
    if (this.montantEuro > 1000) this.montantEuro = 1000;
    this.montantGNF = Math.floor(this.montantEuro * this.tauxConversion);
    this.majFraisTotal_ttc();
  }

  convertirDepuisGNF() {
    if (this.montantGNF == null) { this.montantEuro = 0; this.majFraisTotal_ttc(); return; }
    const euro = this.montantGNF / this.tauxConversion;
    if (euro > 1000) { this.montantEuro = 1000; this.montantGNF = 1000 * this.tauxConversion; }
    else { this.montantEuro = euro; }
    this.majFraisTotal_ttc();
  }

  /** Envoi du transfert */
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
      montant_envoie: Math.round(this.montantEuro * 100) / 100,
    };

    this.loading = true;
    this.transfertService.createTransfert(dto).subscribe({
      next: (t) => {
        this.loading = false;

        this.transfert = t;
        this.frais = (t as any)?.frais ?? 0;
        this.total_ttc = Number((t as any)?.total_ttc ?? 0);
        this.montantGNF = Number((t as any)?.montant_gnf ?? 0);

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Transfert effectué.',
          life: 4000
        });

        const id =
          (t as any)?.id ??
          (t as any)?.data?.id ??
          (t as any)?.transfert?.id ??
          (t as any)?.transfert_id;

        this.hideDialog();

        if (id) {
          setTimeout(() => {
            this.router.navigate(['/dashboard/transfert/detail', id], { replaceUrl: true });
          }, 2500);
        } else {
          setTimeout(() => this.router.navigate(['/dashboard/transfert']), 2500);
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

  next() {
    const nextIndex = Math.min(this.activeIndex + 1, 2);
    if (nextIndex === 2) this.majFraisTotal_ttc();
    this.activeIndex = nextIndex;
  }
  prev() { this.activeIndex = Math.max(this.activeIndex - 1, 0); }
  prevBeneficiaire() { this.router.navigate(['steps/payment']); }
  canNext(): boolean { return this.activeIndex >= 0 && this.activeIndex <= 2 ? true : false; }

  // **************************** bénéficiaire (dialog)
  beneficiaires: Beneficiaire[] = [];
  beneficiaire: Beneficiaire = new Beneficiaire();
  beneficiaireDialog = false;

  onpenBeneficiaireDialog(): void { this.beneficiaireDialog = true; }
  hideBeneficiaireDialog(): void {
    this.beneficiaireDialog = false;
    this.submitted = false;
  }

  /** Crée / met à jour puis auto-sélectionne le bénéficiaire dans le dropdown */
  saveBeneficiaire(): void {
    this.submitted = true;

    if (!this.beneficiaire?.phone || (!this.beneficiaire.nom && !this.beneficiaire.nom_complet)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs requis',
        detail: 'Veuillez saisir au moins le Nom (ou Nom complet) et le Téléphone.',
        life: 3000
      });
      return;
    }

    const payload = {
      nom: this.beneficiaire.nom ?? '',
      prenom: this.beneficiaire.prenom ?? '',
      phone: this.beneficiaire.phone ?? ''
    };

    const isUpdate = typeof this.beneficiaire.id === 'number' && this.beneficiaire.id > 0;

    const serviceCall = isUpdate
      ? this.beneficiaireService.update(this.beneficiaire.id!, payload)
      : this.beneficiaireService.create(payload);

    serviceCall.subscribe({
      next: (res: any) => {
        // Récupère l'objet + id
        const b = res?.data ?? res?.beneficiaire ?? res;
        const id = Number(b?.id);

        // Ferme le dialog + toast
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: isUpdate ? 'Bénéficiaire mis à jour avec succès' : 'Bénéficiaire créé avec succès'
        });
        this.hideBeneficiaireDialog();

        // Met à jour la liste locale (sans requête) puis sélectionne
        const opt = this.toOption(b);
        const exists = this.beneficiairesOptions.some(o => o.id === id);
        this.beneficiairesOptions = exists
          ? this.beneficiairesOptions.map(o => (o.id === id ? opt : o))
          : [opt, ...this.beneficiairesOptions];

        this.selectedBeneficiaireId = id; // ✅ auto-sélection
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.message || "L'opération a échoué",
          life: 3000
        });
      }
    });
  }
}
