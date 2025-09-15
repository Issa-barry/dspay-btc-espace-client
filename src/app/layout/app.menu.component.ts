import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'MENU',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'Transfert',
                        icon: 'pi pi-fw pi-sort-alt-slash',
                        routerLink: ['/dashboard']
                    },
                    {
                        label: "Bénéficiaires",
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/dashboard/beneficiaire']
                    },
                    {
                        label: "Point de retrait",
                        icon: 'pi pi-fw pi-map-marker',
                        routerLink: ['/dashboard/agence']
                    },
                    {
                        label: "hostoriques",
                        icon: 'pi pi-fw pi-history',
                        routerLink: ['/dashboard/transfert/liste']
                    }
                ]
            },
           
            {
                label: 'AUTRE',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: "Nous-contacter",
                        icon: 'pi pi-fw pi-question-circle',
                        routerLink: ['/dashboard/pages/contact']
                    }
                ]
            }
        ];
    }
}
