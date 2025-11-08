import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, finalize, takeUntil } from 'rxjs';

import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
import { PaginationMeta } from 'src/app/demo/models/PaginationMeta';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { DepotService } from 'src/app/demo/service/depots/depots.service';
import { PaiementService } from 'src/app/demo/service/paiement/paiement.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

import { formatPhoneOnType, toE164 } from 'src/app/shared/utils/phone.util';

@Component({
  selector: 'app-depot',
  standalone: false,
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.scss'],
})
export class DepotComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // ====== Constants / fees / limits ======
  private readonly EXCHANGE_RATE = 10700;
  private readonly FEES_FIXED_EUR = 2.0;
  private readonly MIN_EUR_FOR_CHECKOUT = 0.5; // Stripe min ~0,50 €
  private readonly MAX_EUR = 1000;

  // ====== Pagination / Recherche (serveur) ======
  page = 1;
  perPage = 10;
  searchTerm = '';
  meta: PaginationMeta | null = null;

  // ====== Etat UI global ======
  loading = false;               // chargement liste
  isProcessing = false;          // paiement
  submitted = false;

  // ====== Dialog: création/édition de bénéficiaire ======
  beneficiaireDialog = false;
  beneficiaireLoading = false;
  beneficiaire: Beneficiaire = new Beneficiaire();

  // ====== Steps ======
  currentStep = 1;

  // Step 1: Montant
  selectedCurrency: 'EUR' | 'GNF' = 'EUR';
  amount = 0; // valeur saisie (en EUR si selectedCurrency=EUR, sinon en GNF)

  // Step 2: Wallet
  selectedWallet = '';
  wallets = [
    { id: 'orange-money', name: 'Orange Money', icon: 'pi-mobile', desc: 'eWallet', colorClass: 'orange' },
    { id: 'momo',         name: 'MTN MoMo',     icon: 'pi-mobile', desc: 'eWallet', colorClass: 'yellow' },
    { id: 'KS-PAY',       name: 'KS-PAY',       icon: 'pi-wallet', desc: 'eWallet', colorClass: 'blue' },
    { id: 'soutrat-money',name: 'Soutrat Money',icon: 'pi-mobile', desc: 'eWallet', colorClass: 'green' },
    { id: 'payCard',      name: 'PayCard',      icon: 'pi-credit-card', desc: 'eWallet', colorClass: 'purple' },
  ];

  // Step 3: Bénéficiaire (liste + filtre local)
  beneficiaires: Beneficiaire[] = [];
  filteredBeneficiaires: Beneficiaire[] = [];
  searchBeneficiaire = '';
  selectedBeneficiaire: Beneficiaire | null = null;

  // Champs “infos compte” (affichés uniquement sur demande)
  showAccountFields = false;
  accountId = '';
  customerPhone = '';

  // User
  currentUserEmail?: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly depotService: DepotService,
    private readonly beneficiaireService: BeneficiaireService,
    private readonly paiementService: PaiementService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly authService: AuthService,
  ) {}

  // ==================== Lifecycle ====================
  ngOnInit(): void {
    this.loadBeneficiaires();
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.currentUserEmail = u?.email || null;
    });
    this.handleStripeReturn();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Utils messages ====================
  private toast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string, life = 3000) {
    this.messageService.add({ severity, summary, detail, life });
  }

  // ==================== API: Liste bénéficiaires ====================
  loadBeneficiaires(): void {
    this.loading = true;
    this.beneficiaireService
      .list({ page: this.page, per_page: this.perPage, search: this.searchTerm || undefined })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ items, meta }) => {
          this.beneficiaires = items;
          this.filteredBeneficiaires = [...items];
          this.meta = meta;
        },
        error: (err) => {
          this.toast('error', 'Erreur', err?.message || 'Échec du chargement des bénéficiaires.');
        },
      });
  }

  // ==================== Steps nav ====================
  nextStep(): void {
    if (this.currentStep === 1 && !this.isAmountValid()) {
      this.toast('warn', 'Montant', `Saisir un montant valide (min 0,50 €; max ${this.MAX_EUR} €).`);
      return;
    }
    if (this.currentStep === 2 && !this.selectedWallet) {
      this.toast('warn', 'Wallet', 'Veuillez choisir un wallet.');
      return;
    }
    if (this.currentStep === 3 && !this.selectedBeneficiaire) {
      this.toast('warn', 'Bénéficiaire', 'Veuillez sélectionner un destinataire.');
      return;
    }
    if (this.currentStep < 4) this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 4) this.currentStep = step;
  }

  // ==================== Step 1: Montant / conversions ====================
  private eurFromInput(): number {
    return this.selectedCurrency === 'EUR' ? Number(this.amount || 0) : Number(this.amount || 0) / this.EXCHANGE_RATE;
  }
  private gnfFromInput(): number {
    return this.selectedCurrency === 'EUR' ? Math.floor(Number(this.amount || 0) * this.EXCHANGE_RATE) : Number(this.amount || 0);
  }

  getConvertedAmount(): number {
    // affichage instantané de l’autre devise
    return this.selectedCurrency === 'EUR'
      ? this.amount * this.EXCHANGE_RATE
      : this.amount / this.EXCHANGE_RATE;
  }

  private clampEUR(eur: number): number {
    if (!Number.isFinite(eur) || eur < 0) return 0;
    return Math.min(eur, this.MAX_EUR);
  }

  private rounded2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  private totalEUR(): number {
    const eur = this.clampEUR(this.eurFromInput());
    const total = eur + this.FEES_FIXED_EUR;
    return this.rounded2(total);
  }

  isAmountValid(): boolean {
    const eur = this.clampEUR(this.eurFromInput());
    return eur >= this.MIN_EUR_FOR_CHECKOUT && eur <= this.MAX_EUR;
  }

  selectCurrency(currency: 'EUR' | 'GNF'): void {
    this.selectedCurrency = currency;
  }

  // ==================== Step 2: Wallet ====================
  selectWallet(wallet: string): void {
    this.selectedWallet = wallet;
    this.showAccountFields = false;
  }

  getWalletName(walletId: string): string {
    return this.wallets.find(w => w.id === walletId)?.name ?? walletId;
  }

  // ==================== Step 3: Bénéficiaire ====================
  selectBeneficiaire(beneficiaire: Beneficiaire): void {
    this.selectedBeneficiaire = beneficiaire;
  }

  filterBeneficiaires(): void {
    const s = this.searchBeneficiaire.trim().toLowerCase();
    if (!s) {
      this.filteredBeneficiaires = [...this.beneficiaires];
      return;
    }
    this.filteredBeneficiaires = this.beneficiaires.filter(b =>
      (b.nom ?? '').toLowerCase().includes(s) ||
      (b.prenom ?? '').toLowerCase().includes(s) ||
      (b.phone ?? '').includes(s)
    );
  }

  getInitials(nom?: string, prenom?: string): string {
    const n = (nom?.trim()?.[0] ?? '').toUpperCase();
    const p = (prenom?.trim()?.[0] ?? '').toUpperCase();
    return (n + p) || '?';
  }

  // ==================== Dialog Bénéficiaire ====================
  openBeneficiaireDialog(): void {
    this.beneficiaire = new Beneficiaire();
    this.submitted = false;
    this.beneficiaireDialog = true;
  }

  hideDialog(): void {
    this.beneficiaireDialog = false;
    this.submitted = false;
  }

  onBenefPhoneInput(event: Event) {
    const target = event?.target as HTMLInputElement | null;
    const raw = target?.value ?? '';
    const digitsOnly = raw.replace(/\D+/g, '');
    this.beneficiaire.phone = formatPhoneOnType(digitsOnly, 'GN');
  }

  onBenefPhoneKeyDown(event: KeyboardEvent) {
    const allowedCtrl = event.ctrlKey || event.metaKey;
    const key = event.key;
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter', 'Escape'];
    if (controlKeys.includes(key) || (allowedCtrl && ['a', 'c', 'v', 'x'].includes(key.toLowerCase()))) return;
    if (!/^[0-9]$/.test(key)) event.preventDefault();
  }

  saveBeneficiaire(): void {
    this.submitted = true;

    if (!this.beneficiaire?.phone || (!this.beneficiaire.nom && !this.beneficiaire.nom_complet)) {
      this.toast('warn', 'Champs requis', 'Veuillez saisir au moins le Nom (ou Nom complet) et le Téléphone.');
      return;
    }

    const e164 = toE164(this.beneficiaire.phone || '', 'GN');
    if (!e164) {
      this.toast('warn', 'Téléphone invalide', `Le numéro n'est pas valide pour la Guinée-Conakry.`);
      return;
    }

    const payload = {
      nom: this.beneficiaire.nom ?? '',
      prenom: this.beneficiaire.prenom ?? '',
      phone: e164,
    };
    const isUpdate = typeof this.beneficiaire.id === 'number' && this.beneficiaire.id > 0;

    this.beneficiaireLoading = true;
    const call$ = isUpdate
      ? this.beneficiaireService.update(this.beneficiaire.id!, payload)
      : this.beneficiaireService.create(payload);

    call$
      .pipe(
        finalize(() => (this.beneficiaireLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          const b = res?.data ?? res?.beneficiaire ?? res;
          const id = Number(b?.id);
          this.toast('success', 'Succès', isUpdate ? 'Bénéficiaire mis à jour' : 'Bénéficiaire créé');
          this.hideDialog();

          // recharge liste
          this.loadBeneficiaires();

          // Optionnel: reselection
          if (id) {
            const found = this.beneficiaires.find(x => x.id === id);
            if (found) this.selectedBeneficiaire = found;
          }
        },
        error: (err: any) => {
          this.toast('error', 'Erreur', err?.message || "L'opération a échoué");
        },
      });
  }

  // ==================== Stripe: retour success/cancel ====================
  private handleStripeReturn(): void {
    const qp = this.route.snapshot.queryParamMap;
    const success = qp.get('session_id'); // Stripe ajoute ?session_id=...
    const canceled = qp.get('canceled');

    if (success) {
      this.toast('success', 'Paiement', 'Paiement confirmé. Traitement en cours…', 3500);
    } else if (canceled === '1') {
      this.toast('warn', 'Paiement annulé', 'Vous avez quitté la page Stripe.', 3500);
    }
  }

  // ==================== Stripe: Checkout ====================
  payWithStripeCheckout(): void {
    if (this.isProcessing) return;
    this.submitted = true;

    // validations
    if (!this.isAmountValid()) {
      this.toast('warn', 'Montant', `Montant invalide (0,50 € – ${this.MAX_EUR} €).`);
      return;
    }
    if (!this.selectedWallet) {
      this.toast('warn', 'Wallet', 'Veuillez choisir un wallet.');
      return;
    }
    if (!this.selectedBeneficiaire) {
      this.toast('warn', 'Bénéficiaire', 'Veuillez sélectionner un destinataire.');
      return;
    }

    // Montants
    const eur = this.clampEUR(this.eurFromInput());
    const totalEur = this.totalEUR();
    const amountCents = Math.round(totalEur * 100);
    if (!Number.isFinite(amountCents) || amountCents < Math.round(this.MIN_EUR_FOR_CHECKOUT * 100)) {
      this.toast('warn', 'Montant', 'Minimum 0,50 €.');
      return;
    }

    // Order + metadata (pour webhook)
    const orderId = `depot_${this.selectedWallet}_${this.selectedBeneficiaire.id}_${Date.now()}`;
    const metadata = {
      type: 'depot',
      service_id: this.selectedWallet,
      beneficiaire_id: this.selectedBeneficiaire.id,
      beneficiaire_phone: this.selectedBeneficiaire.phone || '',
      amount_eur: this.rounded2(eur),
      amount_gnf: this.gnfFromInput(),
      exchange_rate: this.EXCHANGE_RATE,
      fees_eur: this.FEES_FIXED_EUR,
      total_ttc_eur: totalEur,
      currency_input: this.selectedCurrency,
      // champs compte (facultatifs)
      account_id: this.accountId || this.selectedBeneficiaire.phone || '',
      customer_phone: this.customerPhone || this.selectedBeneficiaire.phone || '',
    };

    // URLs (absolues)
    const base = window.location.origin;
    const successUrl = `${base}/dashboard/success`;
    const cancelUrl  = `${base}/dashboard/depot?canceled=1`;

    this.isProcessing = true;
    this.paiementService.createCheckoutSession({
      amount: amountCents,
      currency: 'eur',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: (this.currentUserEmail && /\S+@\S+\.\S+/.test(this.currentUserEmail)) ? this.currentUserEmail : null,
      order_id: orderId,
      metadata,
    })
    .pipe(finalize(() => (this.isProcessing = false)), takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const url = res?.data?.url ?? res?.url;
        if (url) {
          window.location.assign(url);
        } else {
          this.toast('error', 'Stripe', res?.message || 'Réponse inattendue du serveur (url manquante).', 4000);
        }
      },
      error: (err) => {
        const valErrs = err?.error?.data?.errors;
        const apiMsg  = err?.error?.message || err?.message;
        if (valErrs) {
          const first = (Object.values(valErrs).flat().find(Boolean) as string | undefined) ?? 'Erreur de validation.';
          this.toast('warn', 'Validation', first);
        } else {
          this.toast('error', 'Stripe', apiMsg || 'Échec de création de la session.', 4000);
        }
      },
    });
  }
}
