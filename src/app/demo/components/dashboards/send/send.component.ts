import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { finalize, Subject, takeUntil } from 'rxjs';

import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
import { Transfert, TransfertCreateDto } from 'src/app/demo/models/transfert';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { PaiementService } from 'src/app/demo/service/paiement/paiement.service';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';
import { formatPhoneOnType, toE164 } from 'src/app/shared/utils/phone.util';

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

  // utilisateur
  currentUserEmail?: string | null = null;

  // Montants & devises
  currency: 'eur' | 'usd' = 'eur';
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

  // Paiement (héritage, si tu gardes Elements plus tard)
  payementDialog = false;
  payLoading = false;
  clientSecret = '';
  orderId = '';
  paymentMetadata: Record<string, any> = {};

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly beneficiaireService: BeneficiaireService,
    private readonly transfertService: TransfertService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly paiementService: PaiementService,
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaires();
    this.prefillFromQuery();
    this.handleStripeReturn();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────── Gestion retour Stripe (success / cancel) ─────────
  private handleStripeReturn(): void {
    const qp = this.route.snapshot.queryParamMap;
    const sessionId = qp.get('session_id');
    const canceled  = qp.get('canceled');

    if (sessionId) {
      this.messageService.add({
        severity: 'success',
        summary: 'Paiement',
        detail: 'Paiement confirmé. Traitement en cours…',
        life: 3500,
      });
    } else if (canceled === '1') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Paiement annulé',
        detail: 'Vous avez quitté la page Stripe.',
        life: 3500,
      });
    }
  }

  // ───────── Clique sur "Payer" → Checkout Stripe ─────────
  payWithStripeCheckout(): void {
    this.submitted = true;

    if (!this.isMontantValide) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: `Montant invalide (1 à ${this.MAX_EUR} €).` });
      return;
    }
    if (!this.isBeneficiaireValide) {
      this.messageService.add({ severity: 'warn', summary: 'Bénéficiaire', detail: 'Veuillez sélectionner un bénéficiaire.' });
      return;
    }

    // Calcule total & centimes
    this.majFraisTotal_ttc();
    const totalTtc = Math.max(0, Number(this.total_ttc) || 0);
    const amountCents = Math.round(totalTtc * 100);
    if (!Number.isFinite(amountCents) || amountCents < 50) {
      this.messageService.add({ severity: 'warn', summary: 'Montant', detail: 'Minimum 0,50 €.', life: 3500 });
      return;
    }

    // Metadata pour le webhook
    this.paymentMetadata = {
      beneficiaire_id: this.selectedBeneficiaireId!,
      taux_echange_id: this.selectedTauxId,
      montant_envoie: Number(this.montantEuro.toFixed(2)),
      mode_reception: this.selectedModeReception,
      frais_eur: Number(this.frais.toFixed(2)),
      total_ttc: Number(this.total_ttc.toFixed(2)),
    };

    // Idempotence
    this.orderId = `trf_${this.selectedBeneficiaireId}_${Date.now()}`;

    // URLs absolues
    const base = window.location.origin;
    const successUrl = `${base}/dashboard/success`;
    const cancelUrl  = `${base}/dashboard/send?canceled=1`;

    this.loading = true;
    this.paiementService.createCheckoutSession({
      amount: amountCents,
      currency: this.currency,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: (this.currentUserEmail && /\S+@\S+\.\S+/.test(this.currentUserEmail)) ? this.currentUserEmail : null,
      order_id: this.orderId,
      metadata: this.paymentMetadata,
    })
    .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
    .subscribe({
       next: (res: any) => {
        const url = res?.data?.url ?? res?.url;
        if (url) {
          window.location.assign(url);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Stripe',
            detail: res?.message || 'Réponse inattendue du serveur (url manquante).',
            life: 4000,
          });
        }
      },
      error: (err) => {
        console.log('Erreur création session Stripe', err); 
        
        const valErrs = err?.error?.data?.errors;
        const apiMsg  = err?.error?.message || err?.message;

        if (valErrs) {
          const first = (Object.values(valErrs).flat().find(Boolean) as string | undefined) ?? 'Erreur de validation.';
          this.messageService.add({ severity: 'warn', summary: 'Validation', detail: first });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Stripe', detail: apiMsg || 'Échec de création de la session.', life: 4000 });
        }
      },
    });
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
    const eur = Math.max(0, Number(this.montantEuro) || 0);
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
    // Normaliser le téléphone au format E.164 pour la Guinée (GN)
    const e164 = toE164(this.beneficiaire.phone || '', 'GN');
    if (!e164) {
      this.messageService.add({ severity: 'warn', summary: 'Téléphone invalide', detail: `Le numéro n'est pas valide pour la Guinée-Conakry.`, life: 3000 });
      return;
    }
    const payload = { nom: this.beneficiaire.nom ?? '', prenom: this.beneficiaire.prenom ?? '', phone: e164 };
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

  // Saisie téléphone (bénéficiaire): chiffres uniquement + format GN
  onBenefPhoneInput(event: Event) {
    const target = event?.target as HTMLInputElement | null;
    const raw = target?.value ?? '';
    const digitsOnly = raw.replace(/\D+/g, '');
    this.beneficiaire.phone = formatPhoneOnType(digitsOnly, 'GN');
  }
  onBenefPhoneKeyDown(event: KeyboardEvent) {
    const allowedCtrl = event.ctrlKey || event.metaKey;
    const key = event.key;
    const controlKeys = [ 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter', 'Escape' ];
    if (controlKeys.includes(key) || (allowedCtrl && ['a','c','v','x'].includes(key.toLowerCase()))) return;
    if (!/^[0-9]$/.test(key)) event.preventDefault();
  }

  // ───────── Simulation Transfert (sans paiement) ─────────
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

  // ───────── Ancien flux Elements (conservé si besoin) ─────────
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

    this.paymentMetadata = {
      beneficiaire_id: this.selectedBeneficiaireId!,
      taux_echange_id: this.selectedTauxId,
      montant_envoie: this.round2(this.montantEuro),
      mode_reception: this.selectedModeReception,
      frais_eur: this.frais,
      total_ttc: this.total_ttc,
    };

    this.orderId = `trf_${this.selectedBeneficiaireId}_${Date.now()}`;
    this.clientSecret = '';
    this.payementDialog = true;
  }

  onPaymentCancel() { this.payementDialog = false; }
  onPaymentSuccess(e: { paymentIntentId: string }) {
    this.payementDialog = false;
    this.messageService.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement confirmé ✅', life: 3000 });
  }
  onPaymentFail(e: { message: string }) {
    this.messageService.add({ severity: 'error', summary: 'Paiement', detail: e?.message || 'Paiement refusé', life: 4000 });
  }

  public hideDialog(): void {
    this.envoieDialog = false;
    this.ticketDialog = false;
    this.payementDialog = false;
    this.beneficiaireDialog = false;
    this.submitted = false;
  }
}
