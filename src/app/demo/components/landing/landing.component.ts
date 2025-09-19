import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CustomerService } from '../../service/customer.service';
import { ProductService } from '../../service/product.service';
import { Customer, Representative } from '../../api/customer';
import { Product } from '../../api/product';
import { AuthService } from '../../service/auth/auth.service';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class LandingComponent implements OnDestroy,OnInit {
navOpen = false;
    subscription: Subscription;
    darkMode: boolean = false;
    isLoggedIn: boolean = false; 
   

    constructor(
        private authService:AuthService,
        private customerService: CustomerService,
         private productService: ProductService,
         public router: Router,
         private layoutService: LayoutService) {
          this.subscription = this.layoutService.configUpdate$.subscribe(config => {
            this.darkMode = config.colorScheme === 'dark' || config.colorScheme === 'dim' ? true : false;
        });
    }
 
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    customers1: Customer[] = [];

    customers2: Customer[] = [];

    customers3: Customer[] = [];

    selectedCustomers1: Customer[] = [];

    selectedCustomer: Customer = {};

    representatives: Representative[] = [];

    statuses: any[] = [];

    products: Product[] = [];

    rowGroupMetadata: any;

    expandedRows: expandedRows = {};

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = true;

    @ViewChild('filter') filter!: ElementRef;


    ngOnInit() {
        this.recalc();
        this.isLoged();
        this.customerService.getCustomersLarge().then(customers => {
            this.customers1 = customers;
            this.loading = false;
            // @ts-ignore
            this.customers1.forEach(customer => customer.date = new Date(customer.date));
        });
        this.customerService.getCustomersMedium().then(customers => this.customers2 = customers);
        this.customerService.getCustomersLarge().then(customers => this.customers3 = customers);
        this.productService.getProductsWithOrdersSmall().then(data => this.products = data);

        this.representatives = [
            { name: 'Amy Elsner', image: 'amyelsner.png' },
            { name: 'Anna Fali', image: 'annafali.png' },
            { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
            { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
            { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
            { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
            { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
            { name: 'Onyama Limba', image: 'onyamalimba.png' },
            { name: 'Stephen Shaw', image: 'stephenshaw.png' },
            { name: 'XuXue Feng', image: 'xuxuefeng.png' }
        ];

        this.statuses = [
            { label: 'Fermé', value: 'fermé' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Ouvert', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ];
    }

    onSort() {
        this.updateRowGroupMetaData();
    }

    updateRowGroupMetaData() {
        this.rowGroupMetadata = {};

        if (this.customers3) {
            for (let i = 0; i < this.customers3.length; i++) {
                const rowData = this.customers3[i];
                const representativeName = rowData?.representative?.name || '';

                if (i === 0) {
                    this.rowGroupMetadata[representativeName] = { index: 0, size: 1 };
                }
                else {
                    const previousRowData = this.customers3[i - 1];
                    const previousRowGroup = previousRowData?.representative?.name;
                    if (representativeName === previousRowGroup) {
                        this.rowGroupMetadata[representativeName].size++;
                    }
                    else {
                        this.rowGroupMetadata[representativeName] = { index: i, size: 1 };
                    }
                }
            }
        }
    }

    expandAll() {
        if (!this.isExpanded) {
            this.products.forEach(product => product && product.name ? this.expandedRows[product.name] = true : '');

        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
    
    isLoged(){
        if (this.authService.isAuthenticated()) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }
    
    goToLogin() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/auth/login']); 
        }
    }

    goToDashboard() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/auth/login']); 
        }
      }

    //   ***********************************IBA
    // EUR -> GNF fixe
amountInput = 0;          // valeur saisie
feesIncluded = true;      // switch "Frais inclus ?"

feePercent = 0.05;       // 2,5% (à adapter ou charger via API)
minFeeEUR = 0;            // optionnel: frais minimum ; laisse 0 si inutile

rateBase = 9500;          // taux de base
rate = this.rateBase;     // taux courant (peut être promo)
promo = false;            // active un taux promo si besoin

// valeurs calculées
fees = 0;                 // en EUR
sendAmountEUR = 0;        // montant envoyé (EUR)
totalToPay = 0;           // total débité (EUR)
receiveGNF = 0;           // reçu en GNF

  
// --- state pour savoir quel champ a été modifié en dernier (optionnel)
lastEdited: 'send' | 'receive' = 'send';

// appelé quand "Vous envoyez" change
onAmountInput(): void {
  this.lastEdited = 'send';
  this.recalcFromSend();
}

// appelé quand "Le destinataire reçoit" change
onReceiveInput(): void {
  this.lastEdited = 'receive';
  this.recalcFromReceive();
}

// === Calcul quand on saisit le montant envoyé (EUR)
recalcFromSend(): void {
  const p = Number(this.feePercent) || 0;
  const montant = Number(this.amountInput) || 0;

  // frais toujours calculés de la même façon : p * base
  this.fees = Math.max(this.minFeeEUR, montant * p);

  if (this.feesIncluded) {
    // frais AJOUTÉS AU TOTAL (switch ON)
    this.sendAmountEUR = montant;
    this.totalToPay = montant + this.fees;
  } else {
    // frais INCLUS dans le montant saisi (switch OFF)
    this.sendAmountEUR = Math.max(0, montant - this.fees);
    this.totalToPay = montant;
  }

  const r = Number(this.rate) || 0;
  this.receiveGNF = Math.round(this.sendAmountEUR * r);
}

// === Calcul inverse quand on saisit le montant reçu (GNF)
recalcFromReceive(): void {
  const p = Number(this.feePercent) || 0;
  const r = Number(this.rate) || 0;
  const gnf = Math.max(0, Number(this.receiveGNF) || 0);

  const netEUR = r > 0 ? gnf / r : 0; // net que doit recevoir le bénéficiaire en EUR

  if (this.feesIncluded) {
    // frais AJOUTÉS AU TOTAL (switch ON)
    // montant saisi = net envoyé ; total = net + frais(net)
    this.sendAmountEUR = netEUR;
    this.fees = Math.max(this.minFeeEUR, this.sendAmountEUR * p);
    this.amountInput = this.sendAmountEUR;
    this.totalToPay = this.sendAmountEUR + this.fees;
  } else {
    // frais INCLUS dans le montant saisi (switch OFF)
    // on veut: send = amountInput - p*amountInput = amountInput*(1-p) = netEUR
    const denom = (1 - p) || 1e-9; // garde-fou si p=1
    this.amountInput = netEUR / denom;
    this.fees = Math.max(this.minFeeEUR, this.amountInput * p);
    this.sendAmountEUR = Math.max(0, this.amountInput - this.fees);
    this.totalToPay = this.amountInput;
  }
}

// === appelé au init et quand on change le switch
recalc(): void {
  if (this.lastEdited === 'receive') this.recalcFromReceive();
  else this.recalcFromSend();
}


startTransfer(): void {
  const params = {
    from: 'EUR',
    to: 'GNF',
    amountInput: this.amountInput,
    feesIncluded: this.feesIncluded,
    feePercent: this.feePercent,
    fees: this.fees.toFixed(2),
    sendAmount: this.sendAmountEUR.toFixed(2),
    totalToPay: this.totalToPay.toFixed(2),
    rate: this.rate,
    receive: Math.round(this.receiveGNF)
  };

  const urlTree = this.router.createUrlTree(
    ['/dashboard/transfert/envoie'],
    { queryParams: params }
  );
  const redirectUrl = urlTree.toString();

  if (this.authService.isAuthenticated()) {
    this.router.navigateByUrl(redirectUrl);
  } else {
    sessionStorage.setItem('pendingTransferParams', JSON.stringify(params));
    sessionStorage.setItem('redirectUrl', redirectUrl);
    this.router.navigate(['/auth/login'], { queryParams: { redirect: redirectUrl } });
  }
}

// startTransfer(): void {
//   // Redirige vers la page d’envoi avec les infos préremplies
//   this.router.navigate(['/dashboard/transfert/envoie'], {
//     queryParams: {
//       from: 'EUR',
//       to: 'GNF',
//       amountInput: this.amountInput,
//       feesIncluded: this.feesIncluded,
//       feePercent: this.feePercent,
//       fees: this.fees.toFixed(2),
//       sendAmount: this.sendAmountEUR.toFixed(2),
//       totalToPay: this.totalToPay.toFixed(2),
//       rate: this.rate,
//       receive: Math.round(this.receiveGNF)
//     }
//   });
// }


}
 