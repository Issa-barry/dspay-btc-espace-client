import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, debounceTime } from 'rxjs';
import { Product } from 'src/app/demo/api/product';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { Contact } from 'src/app/demo/models/contact';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
    templateUrl: './ecommerce.dashboard.component.html',
})
export class EcommerceDashboardComponent implements OnInit {
     me$!: Observable<Contact | null>; 
      loading = false;
      errors: { [key: string]: string } = {};
        contact: Contact = new Contact();
 
    constructor(
        private productService: ProductService,
        private layoutService: LayoutService,
        private contactService: ContactService,
        private router: Router, 
        private authService: AuthService,
    ) {
         
    }

    ngOnInit(): void {
        this.getContactById(1);
         this.me$ = this.authService.currentUser$;
        this.loadUserAuth()    
    }

    loadUserAuth(){
        if (!this.authService.currentUserValue) {
      this.loading = true;
      this.authService.getMe().subscribe({
        next: () => {
            this.loading = false
            },
        error: () => (this.loading = false),
      });
    }
    }


       getContactById(id: number): void {
        this.contactService.getContactById(id).subscribe({
            next: (response) => {
                this.contact = response
                console.log('contact', this.contact);
            },
            error: (err) =>
                console.error(
                    'Erreur lors de la récupération du contact:',
                    err
                ),
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
 

    // iba

    items: MenuItem[] = [];
        activeIndex = 0;
        next() {
            this.activeIndex = Math.min(
                this.activeIndex + 1,
             );
            console.log(this.activeIndex);
            
        }
        prev() {
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
            console.log(this.activeIndex);
            
        }

           canNext(): boolean {
        if (this.activeIndex >= 0) return true ;
        if (this.activeIndex <=2) return true;
        return false;
      }


         cities = [
        { name: 'Moussa DIALLO', code: 'NY' },
        { name: 'Houleymatou BAH', code: 'RM' },
        { name: 'Thierno BARRY', code: 'LDN' },
        { name: 'Amadou SYLLA', code: 'IST' },
        { name: 'Alpha ousmane BARRY', code: 'PRS' },
    ];

}
