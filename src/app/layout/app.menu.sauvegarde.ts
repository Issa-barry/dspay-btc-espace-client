import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { PermissionService } from 'src/app/demo/service/permission/permission.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { ContactService } from '../demo/service/contact/contact.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {
    
    model: any[] = [];
    userAuthenticated: any = {};
    userPermissions: string[] = [];

    permissionsMap: { [key: string]: string } = {
        canViewRole: 'afficher Roles',
        canViewDashboardCa: 'afficher Dashboard-CA',
        canViewDashboardRh: 'afficher Dashboard-RH',
        canViewTransfert: 'afficher Transfert',
        canViewFactures: 'afficher Factures',
        canViewContact: 'afficher Contact',
        canViewAgence: 'afficher Agence'
    };

    permissionStates: { [key: string]: boolean } = {};

    constructor(
        private permissionService: PermissionService,
        private authService: AuthService,
        private contactService: ContactService,
    ) {}

    ngOnInit() {
        this.getAuthenticatedContact();
    }

    /**
     * Récupérer les informations de l'utilisateur authentifié
     */
    getAuthenticatedContact(): void {
        const userId = Number(this.authService.getUserId());
        if (!userId) {
            this.buildMenu();
            return;
        }

        this.contactService.getContactById(userId).subscribe({
            next: (response) => {
                this.userAuthenticated = response;
                // console.log("Utilisateur authentifié :", this.userAuthenticated);
                this.checkPermissions(this.userAuthenticated.role_id);
            },
            error: (err) => {
                console.error('Erreur lors de la récupération du USER:', err);
                this.buildMenu(); // Construire le menu même en cas d'erreur
            },
        });
    }

    /**
     * Vérifier les permissions de l'utilisateur
     */
    checkPermissions(userId: number): void {
        this.permissionService.getRolePermissions(userId).subscribe({
            next: (permissions) => {
                this.userPermissions = permissions.map((p: any) => p.name);

                // Mettre à jour l'état des permissions dynamiquement
                Object.keys(this.permissionsMap).forEach(key => {
                    this.permissionStates[key] = this.userPermissions.includes(this.permissionsMap[key]);
                });

                this.buildMenu(); // Construire le menu après avoir obtenu les permissions
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des permissions :', err);
                this.buildMenu(); // Construire le menu même si la récupération des permissions échoue
            }
        });
    }

    /**
     * Construire dynamiquement le menu en fonction des permissions
     */
    buildMenu() {
        this.model = [
            { 
                label: 'Dashboards',
                icon: 'pi pi-home',
                items: [ 
                    ...(this.permissionStates['canViewDashboardRh'] ? [{
                        label: 'Statistique-RH',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/dashboard']
                    }] : []),
                    ...(this.permissionStates['canViewDashboardCa'] ? [{
                        label: 'Chiffre-d\'affaire',
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/dashboard/dashboard-banking']
                    }] : [])
                ]
            },
            { 
                label: 'MENU',
                icon: 'pi pi-fw pi-star-fill',
                items: [
                    ...(this.permissionStates['canViewTransfert'] ? [{
                        label: 'Transfert',
                        icon: 'pi pi-fw pi-arrow-right-arrow-left',
                        routerLink: ['/dashboard/transfert']
                    }] : []),
                    // ...(this.permissionStates['canViewFactures'] ? [{
                    //     label: 'Facturation',
                    //     icon: 'pi pi-fw pi-calculator',
                    //     routerLink: ['/dashboard/facturation']
                    // }] : []),
                    ...(this.permissionStates['canViewContact'] ? [{
                        label: 'Contact',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/dashboard/contact']
                    }] : []),
                    ...(this.permissionStates['canViewAgence'] ? [{
                        label: 'Agence',
                        icon: 'pi pi-fw pi-map-marker',
                        routerLink: ['/dashboard/agence']
                    }] : [])
                ]
            },  
            {
                label: 'AUTRE', 
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Paramètre',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            {
                                label: 'Générale',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/dashboard/parametre']
                            },
                            ...(this.permissionStates['canViewRole'] ? [{
                                label: 'Role & Permission',
                                icon: 'pi pi-fw pi-lock-open',
                                routerLink: ['/dashboard/parametre/role-liste']
                            }] : []),
                        ]
                    }, 
                ]
            },
        ];
    }
     
}
