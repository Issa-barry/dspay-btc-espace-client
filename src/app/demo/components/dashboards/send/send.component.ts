import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { finalize, Subject, takeUntil } from 'rxjs';

import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
import { Transfert, TransfertCreateDto } from 'src/app/demo/models/transfert';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

type ModeReception = 'orange_money' | 'ewallet' | 'retrait_cash';

interface BeneficiaireOption {
  id: number;
  label: string;
  phone: string;
}

@Component({
  selector: 'app-send',
  standalone: false,
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class SendComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly MAX_EUR = 1000;
  private readonly FRAIS_RATE = 0.05;

  // Montants & taux
  montantEuro = 0;
  montantGNF = 0;
  tauxConversion = 10700;

  // Sélections
  beneficiairesOptions: BeneficiaireOption[] = [];
  selectedBeneficiaireId: number | null = null;
  selectedTauxId = 1;
  readonly modesReception: Array<{ label: string; value: ModeReception }> = [
    { label: 'Retrait cash', value: 'retrait_cash' },
    { label: 'Orange Money', value: 'orange_money' },
    { label: 'eWallet', value: 'ewallet' },
  ];
  selectedModeReception: ModeReception = 'retrait_cash';

  // Frais & total
  includeFrais = true;
  frais = 0;
  total_ttc = 0;

  // UI
  envoieDialog = false;
  ticketDialog = false;
  loading = false;
  submitted = false;
  errors: Record<string, string> = {};
  transfert: Transfert = new Transfert();
  items: MenuItem[] = [];
  activeIndex = 0;

  // Paiement → données passées à l’enfant
  payementDialog = false;
  payLoading = false;
  clientSecret = '';                          // laissé vide : l’enfant crée le PI
  orderId = '';                               // idempotence Stripe
  paymentMetadata: Record<string, any> = {};  // metadata pour le webhook
  currency: 'eur' | 'usd' = 'eur';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly beneficiaireService: BeneficiaireService,
    private readonly transfertService: TransfertService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaires();
    this.prefillFromQuery();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────── Pré-remplissage ─────────
  private prefillFromQuery(): void {
    const p = this.route.snapshot.queryParamMap;

    const sendAmount = Number(p.get('sendAmount') ?? p.get('amountInput'));
    const receive = Number(p.get('receive'));
    const included = p.get('feesIncluded');

    if (!Number.isNaN(sendAmount) && sendAmount > 0) {
      this.montantEuro = Math.min(sendAmount, this.MAX_EUR);
    }

    if (!Number.isNaN(receive) && receive > 0) {
      this.montantGNF = receive;
    } else {
      this.convertirDepuisEuro();
    }

    if (included !== null) this.includeFrais = included === 'true';

    this.majFraisTotal_ttc();
  }

  // ───────── Bénéficiaires ─────────
  private toOption(b: Partial<Beneficiaire>): BeneficiaireOption {
    const label =
      (b.nom_complet?.trim()) ||
      [b.prenom, b.nom].filter(Boolean).join(' ').trim() ||
      (b as any).phone;

    return {
      id: Number(b.id),
      label: label ?? '—',
      phone: (b as any).phone ?? '',
    };
  }

  private loadBeneficiaires(search = '', limit = 50, preselectId?: number): void {
    this.loading = true;
    this.beneficiaireService
      .listForSelect(search, limit)
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.beneficiairesOptions = options;
          if (preselectId && options.some((o) => o.id === preselectId)) {
            this.selectedBeneficiaireId = preselectId;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.message || 'Impossible de charger les bénéficiaires',
          });
        },
      });
  }

  // ───────── Getters validation ─────────
  get selectedBeneficiaireLabel(): string {
    return this.beneficiairesOptions.find(o => o.id === this.selectedBeneficiaireId)?.label ?? '—';
  }
  get selectedBeneficiairePhone(): string {
    return this.beneficiairesOptions.find(o => o.id === this.selectedBeneficiaireId)?.phone ?? '—';
  }
  get isMontantValide(): boolean {
    const eur = Number(this.montantEuro);
    return !Number.isNaN(eur) && eur > 0 && eur <= this.MAX_EUR;
  }
  get isBeneficiaireValide(): boolean {
    const id = this.selectedBeneficiaireId;
    return id != null && this.beneficiairesOptions.some(o => o.id === id);
  }
  get canContinue(): boolean {
    if (this.activeIndex === 0) return this.isMontantValide;
    if (this.activeIndex === 2) return this.isBeneficiaireValide;
    return true;
  }

  // ───────── Montants / frais ─────────
  majFraisTotal_ttc(): void {
    const eur = Math.max(0, +this.montantEuro || 0);
    this.frais = this.round2(eur * this.FRAIS_RATE);
    const totalEur = this.includeFrais ? (eur + this.frais) : eur;
    this.total_ttc = this.round2(totalEur);
  }
  convertirDepuisEuro(): void {
    if (this.montantEuro == null) {
      this.montantGNF = 0;
      this.majFraisTotal_ttc();
      return;
    }
    this.montantEuro = Math.min(Math.max(this.montantEuro, 0), this.MAX_EUR);
    this.montantGNF = Math.floor(this.montantEuro * this.tauxConversion);
    this.majFraisTotal_ttc();
  }
  convertirDepuisGNF(): void {
    if (this.montantGNF == null) {
      this.montantEuro = 0;
      this.majFraisTotal_ttc();
      return;
    }
    const euro = Math.max(0, this.montantGNF / this.tauxConversion);
    if (euro > this.MAX_EUR) {
      this.montantEuro = this.MAX_EUR;
      this.montantGNF = this.MAX_EUR * this.tauxConversion;
    } else {
      this.montantEuro = euro;
    }
    this.majFraisTotal_ttc();
  }
  private round2(n: number): number { return Math.round(n * 100) / 100; }

  // ───────── Navigation étapes ─────────
  onBeneficiaireChange(id: number | null): void { this.selectedBeneficiaireId = id; }
  next(): void { const nextIndex = Math.min(this.activeIndex + 1, 3); if (nextIndex === 2) this.majFraisTotal_ttc(); this.activeIndex = nextIndex; }
  prev(): void { this.activeIndex = Math.max(this.activeIndex - 1, 0); }

  // ───────── CRUD bénéficiaire ─────────
  beneficiaires: Beneficiaire[] = [];
  beneficiaire: Beneficiaire = new Beneficiaire();
  beneficiaireDialog = false;
  onpenBeneficiaireDialog(): void { this.beneficiaireDialog = true; }
  hideBeneficiaireDialog(): void { this.beneficiaireDialog = false; this.submitted = false; this.loading = false; }

  saveBeneficiaire(): void {
    this.submitted = true;
    if (!this.beneficiaire?.phone || (!this.beneficiaire.nom && !this.beneficiaire.nom_complet)) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez saisir au moins le Nom (ou Nom complet) et le Téléphone.', life: 3000 });
      return;
    }
    const payload = { nom: this.beneficiaire.nom ?? '', prenom: this.beneficiaire.prenom ?? '', phone: this.beneficiaire.phone ?? '' };
    const isUpdate = typeof this.beneficiaire.id === 'number' && this.beneficiaire.id > 0;

    this.loading = true;
    const call$ = isUpdate ? this.beneficiaireService.update(this.beneficiaire.id!, payload) : this.beneficiaireService.create(payload);

    call$.pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const b = res?.data ?? res?.beneficiaire ?? res;
          const id = Number(b?.id);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: isUpdate ? 'Bénéficiaire mis à jour avec succès' : 'Bénéficiaire créé avec succès' });
          this.hideBeneficiaireDialog();
          const opt = this.toOption(b);
          const exists = this.beneficiairesOptions.some(o => o.id === id);
          this.beneficiairesOptions = exists ? this.beneficiairesOptions.map(o => (o.id === id ? opt : o)) : [opt, ...this.beneficiairesOptions];
          this.selectedBeneficiaireId = id;
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.message || "L'opération a échoué", life: 3000 }),
      });
  }

  // ───────── Simulation création Transfert (sans paiement) ─────────
  save(): void {
    this.submitted = true;
    this.errors = {};

    if (!this.isBeneficiaireValide) {
      this.messageService.add({ severity: 'warn', summary: 'Bénéficiaire', detail: 'Veuillez sélectionner un bénéficiaire.' });
      return;
    }
    if (!this.isMontantValide) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: `Veuillez saisir un montant en EUR (1 à ${this.MAX_EUR} €).` });
      return;
    }

    this.montantEuro = Math.min(this.montantEuro, this.MAX_EUR);

    const dto: TransfertCreateDto = {
      beneficiaire_id: this.selectedBeneficiaireId!,
      taux_echange_id: this.selectedTauxId,
      montant_envoie: this.round2(this.montantEuro),
      mode_reception: this.selectedModeReception,
    };

    this.loading = true;
    this.transfertService.createTransfert(dto)
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (t) => {
          this.transfert = t;
          this.frais = (t as any)?.frais ?? 0;
          this.total_ttc = Number((t as any)?.total_ttc ?? 0);
          this.montantGNF = Number((t as any)?.montant_gnf ?? 0);

          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Transfert effectué. Vérifiez votre boite E-mail', life: 4000 });

          const id = (t as any)?.id ?? (t as any)?.data?.id ?? (t as any)?.transfert?.id ?? (t as any)?.transfert_id;
          this.hideDialog();
          setTimeout(() => {
            if (id) this.router.navigate(['/dashboard/transfert/detail', id], { replaceUrl: true });
            else this.router.navigate(['/dashboard/transfert']);
          }, 2500);
        },
        error: (err) => {
          this.errors = err?.validationErrors || {};
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.message || 'Échec de l’envoi.' });
        }
      });
  }

  // ───────── Paiement (PI + 3DS gérés par l’enfant) ─────────
  openPayement() {
    if (!this.isMontantValide) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: `Montant invalide (1 à ${this.MAX_EUR} €).` });
      return;
    }
    if (!this.isBeneficiaireValide) {
      this.messageService.add({ severity: 'warn', summary: 'Bénéficiaire', detail: 'Veuillez sélectionner un bénéficiaire.' });
      return;
    }

    this.majFraisTotal_ttc();
    if (Math.round((this.total_ttc || 0) * 100) < 50) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: 'Minimum 0,50 €.' });
      return;
    }

    // Metadata pour le webhook (création du Transfert côté back)
    this.paymentMetadata = {
      beneficiaire_id: this.selectedBeneficiaireId!,
      taux_echange_id: this.selectedTauxId,
      montant_envoie: this.round2(this.montantEuro), // EUR (decimal)
      mode_reception: this.selectedModeReception,
      frais_eur: this.frais,
      total_ttc: this.total_ttc,
    };

    // Idempotence / rapprochement
    this.orderId = `trf_${this.selectedBeneficiaireId}_${Date.now()}`;

    // L’enfant crée/récupère le client_secret et confirme
    this.clientSecret = '';
    this.payementDialog = true;
  }

  onPaymentCancel() { this.payementDialog = false; }

  onPaymentSuccess(e: { paymentIntentId: string }) {
    this.payementDialog = false;
    this.messageService.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement confirmé ✅', life: 3000 });
    // Le webhook termine : création Transfert + Facture + Mail.
  }

  onPaymentFail(e: { message: string }) {
    this.messageService.add({ severity: 'error', summary: 'Paiement', detail: e?.message || 'Paiement refusé', life: 4000 });
  }

  public hideDialog(): void {
  this.envoieDialog = false;
  this.ticketDialog = false;
  this.payementDialog = false;
  this.beneficiaireDialog = false; // ← ferme aussi celui du bénéficiaire
  this.submitted = false;
}

}
