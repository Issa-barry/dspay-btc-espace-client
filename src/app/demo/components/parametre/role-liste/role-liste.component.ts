import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Product } from '../../../api/product';
import { ProductService } from '../../../service/product.service';
import { Role } from 'src/app/demo/models/Role';
import { Router } from '@angular/router';
import { RoleService } from 'src/app/demo/service/role/role.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { PermissionService } from 'src/app/demo/service/permission/permission.service';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { el } from '@fullcalendar/core/internal-common';

@Component({
    selector: 'app-role-liste',
    standalone: false,
    // imports: [],
    templateUrl: './role-liste.component.html',
    styleUrl: './role-liste.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class RoleListeComponent implements OnInit {
    isAdmin: boolean = false;
    canEdit: boolean = false;
    canCreate: boolean = false;
    canDelete: boolean = false;
    loading: boolean = true;
    roles: Role[] = [];
    role: Role = new Role();
    optionPays: any[] = [];
    roleDialog: boolean = false;
    deleteRoleDialog: boolean = false;
    deleteRolesDialog: boolean = false;
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];

    userAuthenticated: any = {};
    userAuthenticatedRole: any = {};
    userAuthenticatedRoleID: number = 0;

    rowsPerPageOptions = [5, 10, 20];

    selectedRoles: Product[] = [];
    products: Product[] = [];

    product: Product = {};

    permissions: any[] = [];
    permission: any = {};
    rolePermissions: any = {};

    constructor(
        private router: Router,
        private contactService: ContactService,
        private authService: AuthService,
        private roleService: RoleService,
        private productService: ProductService,
        private messageService: MessageService,
        private permissionService: PermissionService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.optionPays = [
            { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
            { label: 'FRANCE', value: 'France' },
        ];

        this.getAllRoles();
        this.getAutenticatedContact();
    }

    /******************************************************
     *   USERS
     ******************************************************/
    getAutenticatedContact(): void {
        const id = Number(this.authService.getUserId());
        this.contactService.getContactById(id).subscribe({
            next: (response) => {
                this.userAuthenticated = response;
                this.userAuthenticatedRole = this.userAuthenticated.roles;
                this.getRolePermissionsById(this.userAuthenticatedRole[0].id);
                // console.log(this.userAuthenticated);
            },
            error: (err) => {
                console.error('Erreur lors de la récupération du USER:', err);
            },
        });
    }

    /******************************************************
     *   PERMISSIONS
     ******************************************************/

    getRolePermissionsById(id: number): void {
        this.permissionService.getRolePermissions(id).subscribe({
            next: (response) => {
                this.rolePermissions = response;
                this.canEdit = this.rolePermissions.some(
                    (permission: any) => permission.name === 'modifier Roles'
                );
                this.canCreate = this.rolePermissions.some(
                    (permission: any) => permission.name === 'créer Roles'
                );
                this.canDelete = this.rolePermissions.some(
                    (permission: any) => permission.name === 'supprimer Roles'
                );
                // console.log('Permissions du role:', this.rolePermissions);
                
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération des permissions:',
                    err
                ); 
            }, 
        });
    }

    /******************************************************
     *   ROLE
     ******************************************************/
    getAllRoles(): void {
        this.roleService.getRoles().subscribe({
            next: (response) => {
                this.roles = response;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des roles:', err);
            },
        });
    }

    saveRole() {
        this.submitted = true;

        if (this.role.id && this.canEdit) {
            // Modification
            this.roleService.updateRole(this.role.id, this.role).subscribe({
                next: () => {
                    this.getAllRoles();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Role modifié avec succès',
                        life: 3000,
                    });
                },
                error: (err) => {
                    console.error("Erreur lors de la création de l'role:", err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: "Modification de l'role échouée",
                        life: 3000,
                    });
                },
            });
            this.roleDialog = false;
        } else if (this.canCreate && this.role.name ) {
            // Création
            this.roleService.createRole(this.role).subscribe({
                next: () => {
                    this.getAllRoles();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Role créée avec succès',
                        life: 3000,
                    });
                },
                error: (err) => {
                    console.error("Erreur lors de la création de l'role:", err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: "Création de l'role échouée",
                        life: 3000,
                    });
                },
            });
            this.roleDialog = false;
        }
    }

    /******************************************************
     *   UTILS
     ******************************************************/

    openNew() {
        if (!this.canCreate) {
            this.messageService.add({
                severity: 'error',
                summary: 'Accès refusé',
                detail: "Vous n'avez pas la permission de créer des rôles.",
                life: 3000,
            });
            return;
        }
        this.role = new Role();
        this.submitted = false;
        this.roleDialog = true;
    }

    hideDialog() {
        this.roleDialog = false;
        this.submitted = false;
    }

    deleteSelectedRoles() {
        this.deleteRolesDialog = true;
    }

    editRole(role: Role) {
        if (!this.canEdit) {
            this.messageService.add({
                severity: 'error',
                summary: 'Accès refusé',
                detail: "Vous n'avez pas la permission pour modifier les rôles.",
                life: 3000,
            });
            return;
        } else if (role.name === 'Administrateur') {
            this.messageService.add({
                severity: 'error',
                summary: 'Accès refusé',
                detail: 'Vous ne pouvez pas modifier le rôle Administrateur.',
                life: 3000,
            });
            return;
        }
        this.role = { ...role };
        this.roleDialog = true;
    }

    deleteRole(role: Role) {
        if (!this.canDelete) {
            this.messageService.add({
                severity: 'error',
                summary: 'Accès refusé',
                detail: "Vous n'avez pas la permission pour supprimer les rôles.",
                life: 3000,
            });
            return;
        } else if (role.name === 'Administrateur') {
            this.messageService.add({
                severity: 'error',
                summary: 'Accès refusé',
                detail: 'Vous ne pouvez pas supprimer le rôle Administrateur.',
                life: 3000,
            });
            return;
        }
        this.deleteRoleDialog = true;
        this.role = { ...role };
    }

    confirmDeleteSelected() {
        this.deleteRolesDialog = false;
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Role Deleted',
            life: 3000,
        });
        this.selectedRoles = [];
    }

    confirmDelete() {
        this.deleteRoleDialog = false;
        if (this.role.id !== undefined && this.canDelete) {
            // Vérification que l'ID est défini
            this.roleService.deleteRole(this.role.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Rôle supprimé avec succès.',
                        life: 3000,
                    });
                    this.getAllRoles(); // Rechargez la liste des rôles après suppression
                },
                error: (err) => {
                    console.error(
                        'Erreur lors de la suppression du rôle:',
                        err
                    );

                    // Utilisez le message d'erreur renvoyé par le backend (si disponible)
                    const backendMessage =
                        err.error?.message ||
                        'Une erreur est survenue lors de la suppression du rôle.';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: backendMessage, // Afficher le message détaillé du backend
                        life: 5000,
                    });
                },
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Impossible de supprimer le rôle : ID non défini ou vous n'avez pas la permission.",
                life: 3000,
            });
        }
    }

    createId(): string {
        let id = '';
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    onGoToDetail(id: number) {
        this.router.navigate(['/dashboard/parametre/role-detail', id]);
    }
}
