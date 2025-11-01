import { Component, OnInit } from '@angular/core';
// Pas besoin d'importer FormsModule ici si le composant n'est pas standalone
// FormsModule doit être importé dans le module parent (dashboard.module.ts)

interface Beneficiaire {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
}

@Component({
  selector: 'app-depot',
  standalone: false,  // Le composant n'est pas standalone
  templateUrl: './depot.component.html',
  styleUrl: './depot.component.scss'
})
export class DepotComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadBeneficiaires();
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

  // ==================== Step 3: Bénéficiaire ====================
  loadBeneficiaires(): void {
    // Simuler le chargement depuis l'API
    // À remplacer par un vrai appel API
    this.beneficiaires = [
      { id: 1, nom: 'Diallo', prenom: 'Mamadou', phone: '+224 666 14 58 75' },
      { id: 2, nom: 'Bah', prenom: 'Aissatou', phone: '+224 622 33 44 55' },
      { id: 3, nom: 'Sylla', prenom: 'Ibrahim', phone: '+224 655 66 77 88' },
      { id: 4, nom: 'Camara', prenom: 'Fatoumata', phone: '+224 611 22 33 44' },
    ];
    this.filteredBeneficiaires = [...this.beneficiaires];
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