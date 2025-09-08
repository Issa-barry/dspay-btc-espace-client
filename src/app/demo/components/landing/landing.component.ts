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

}
 