import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
import { PaginationMeta } from 'src/app/demo/models/PaginationMeta';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { DepotService } from 'src/app/demo/service/depots/depots.service';
// Pas besoin d'importer FormsModule ici si le composant n'est pas standalone
// FormsModule doit être importé dans le module parent (dashboard.module.ts)

 
interface BeneficiaireOption {
  id: number;
  label: string;
  phone: string;
}

@Component({
  selector: 'app-depot',
  standalone: false,  // Le composant n'est pas standalone
  templateUrl: './depot.component.html',
  styleUrl: './depot.component.scss'
})
export class DepotComponent implements OnInit {

   page = 1;
    perPage = 10; 
    searchTerm = '';
     meta: PaginationMeta | null = null;
  // 

  beneficiairesOptions: BeneficiaireOption[] = [];
  selectedBeneficiaireId: number | null = null;
  loading = false;
  submitted = false;
    private readonly destroy$ = new Subject<void>();

  // fin
  // Étape courante
  currentStep: number = 1;

  // Step 1: Montant
  selectedCurrency: string = 'EUR';
  amount: number = 0;
  exchangeRate: number = 10700;

  // Step 2: Wallet
  selectedWallet: string = '';
  wallets = [
    { id: 'orange-money', name: 'Orange Money', icon: 'pi-mobile', desc: 'eWallet', colorClass: 'orange' },
    { id: 'momo', name: 'MTN MoMo', icon: 'pi-mobile', desc: 'eWallet', colorClass: 'yellow' },
    { id: 'KS-PAY', name: 'KS-PAY', icon: 'pi-wallet', desc: 'eWallet', colorClass: 'blue' },
    { id: 'soutrat-money', name: 'Soutrat Money', icon: 'pi-mobile', desc: 'eWallet', colorClass: 'green' },
    { id: 'payCard', name: 'PayCard', icon: 'pi-credit-card', desc: 'eWallet', colorClass: 'purple' }
  ];

  // Step 3: Bénéficiaire
  selectedBeneficiaire: Beneficiaire | null = null;
  searchBeneficiaire: string = '';
  beneficiaires: Beneficiaire[] = [];
  filteredBeneficiaires: Beneficiaire[] = [];
  accountId: string = '';
  customerPhone: string = '';

  // Step 4: Confirmation
   isProcessing: boolean = false;

   constructor( 
        private depotService : DepotService,
        private readonly beneficiaireService: BeneficiaireService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
     
   ){}

  ngOnInit(): void {
    this.loadBeneficiaires();
  }

  
    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    
  loadBeneficiaires(): void {
    this.loading = true;

    this.beneficiaireService
      .list({ page: this.page, per_page: this.perPage, search: this.searchTerm || undefined })
      .subscribe({
        next: ({ items, meta }) => {
          this.beneficiaires = items;
          this.meta = meta;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.showMessage('error', 'Erreur', err.message || 'Échec du chargement des bénéficiaires.');
        }
      });
  }


  // ==================== Navigation Steps ====================
  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.currentStep = step;
    }
  }

  // ==================== Step 1: Montant ====================
  selectCurrency(currency: string): void {
    this.selectedCurrency = currency;
  }

  getConvertedAmount(): number {
    if (this.selectedCurrency === 'EUR') {
      return this.amount * this.exchangeRate;
    } else {
      return this.amount / this.exchangeRate;
    }
  }

  getTotalAmount(): number {
    const fees = 2; // Frais en EUR
    return this.selectedCurrency === 'EUR' ? this.amount + fees : (this.amount / this.exchangeRate) + fees;
  }

  // ==================== Step 2: Wallet ====================
  selectWallet(wallet: string): void {
    this.selectedWallet = wallet;
  }

  getWalletName(walletId: string): string {
    const wallet = this.wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : walletId;
  }
 


  selectBeneficiaire(beneficiaire: Beneficiaire): void {
    this.selectedBeneficiaire = beneficiaire;
    // Pré-remplir le téléphone pour les wallets nécessitant account ID
    if (this.selectedWallet === 'KS-PAY' || this.selectedWallet === 'payCard') {
      this.customerPhone = beneficiaire.phone;
    }
  }

  filterBeneficiaires(): void {
    const search = this.searchBeneficiaire.toLowerCase().trim();
    if (!search) {
      this.filteredBeneficiaires = [...this.beneficiaires];
      return;
    }

    this.filteredBeneficiaires = this.beneficiaires.filter(b => 
      b.nom.toLowerCase().includes(search) ||
      b.prenom.toLowerCase().includes(search) ||
      b.phone.includes(search)
    );
  }

  getInitials(nom?: string, prenom?: string): string {
    if (!nom && !prenom) return '?';
    const n = nom ? nom.charAt(0).toUpperCase() : '';
    const p = prenom ? prenom.charAt(0).toUpperCase() : '';
    return n + p;
  }

  openAddBeneficiaire(): void {
    // Ouvrir une modal ou naviguer vers la page d'ajout
    console.log('Ouvrir le formulaire d\'ajout de bénéficiaire');
    // this.router.navigate(['/beneficiaires/nouveau']);
    // ou
    // this.showAddBeneficiaireModal = true;
  }

  // ==================== Step 4: Paiement ====================
  processPayment(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    // Préparer les données du dépôt
    const depotData = {
      serviceId: this.selectedWallet,
      amount: this.selectedCurrency === 'EUR' ? this.amount : this.amount / this.exchangeRate,
      recipientTel: this.selectedBeneficiaire?.phone || '',
      accountId: this.accountId || this.selectedBeneficiaire?.phone || '',
      customerPhoneNumber: this.customerPhone || this.selectedBeneficiaire?.phone || '',
      currency: this.selectedCurrency,
      beneficiaireId: this.selectedBeneficiaire?.id
    };

    console.log('Données du dépôt:', depotData);

    // Simuler un appel API
    // À remplacer par un vrai appel à votre backend
    setTimeout(() => {
      // this.depotService.createDepot(depotData).subscribe({
      //   next: (response) => {
      //     console.log('Dépôt créé avec succès', response);
      //     // Rediriger vers Stripe pour le paiement
      //     this.redirectToStripePayment(response.sessionId);
      //   },
      //   error: (error) => {
      //     console.error('Erreur lors de la création du dépôt', error);
      //     this.isProcessing = false;
      //     // Afficher un message d'erreur
      //   }
      // });

      // Pour la démo
      alert('Dépôt créé avec succès! Redirection vers le paiement...');
      this.isProcessing = false;
    }, 2000);
  }

  redirectToStripePayment(sessionId: string): void {
    // Rediriger vers Stripe Checkout
    // window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
  }

  // ==================== Utilitaires ====================
  calculateFees(): number {
    // Logique de calcul des frais basée sur le montant
    return 2.00; // Frais fixes pour la démo
  }

  getAmountInEUR(): number {
    return this.selectedCurrency === 'EUR' ? this.amount : this.amount / this.exchangeRate;
  }

  getAmountInGNF(): number {
    return this.selectedCurrency === 'EUR' ? this.amount * this.exchangeRate : this.amount;
  }
}