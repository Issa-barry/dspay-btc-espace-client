import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Product } from '../../../api/product';
import { ProductService } from '../../../service/product.service';
import { Role } from 'src/app/demo/models/Role';
import { ActivatedRoute, Router } from '@angular/router';
import { Permission } from 'src/app/demo/models/Permission';
import { PermissionService } from 'src/app/demo/service/permission/permission.service';
import { RoleService } from 'src/app/demo/service/role/role.service';

@Component({
    selector: 'app-role-detail',
    standalone: false,
    // imports: [],
    templateUrl: './role-detail.component.html',
    styleUrl: './role-detail.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class RoleDetailComponent implements OnInit {
    isAdmin: boolean = false;
    loading: boolean = true; // Pour afficher un état de chargement

    roleId: number = this.activatedRoute.snapshot.params['id'];
    submitted: boolean = false;
    rowsPerPageOptions = [5, 10, 20];

    role: Role = new Role();

    permissions: any[] = [];
    permission: any = {};
    selectedPermissions: Permission[] = [];

    rolePermissions: any = {};
    permissionToRevoke: Permission = new Permission();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private roleService: RoleService,
        private permissionService: PermissionService,
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.getAllPermissions();
        this.getRoleById(this.roleId);
        this.getRolePermissionsById(this.roleId);
    }

    /**************************************************** *
* PERMISSIONS
/*********************************** */
    getAllPermissions(): void {
        this.permissionService.getPermissions().subscribe({
            next: (response) => {
                this.permissions = response;
                this.loading = false; // Désactiver l'état de chargement
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération des permissions:',
                    err
                );
                this.loading = false; // Désactiver l'état de chargement
            },
        });
    }

    getRolePermissionsById(id: number): void {
        this.permissionService.getRolePermissions(id).subscribe({
            next: (response) => {
                this.rolePermissions = response;
                this.selectedPermissions = [...this.rolePermissions]; //pre selection des permissions (celà sert à les cocher en IHM)
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération des permissions:',
                    err
                );
            },
        });
    }

    saveSelectedPermissions(): void {
        if (this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Eurreur',
                detail: "Erreur : Vous ne pouvez pas modifier les permissions d'un Admin. Ceci est géré uniquement coté back-end technique.",
                life: 3000,
            });
            return;
        }

        this.revokeNonSelectedPermissions();
        this.assignManyPermissionToRole(this.roleId);
        this.getAllPermissions();
        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Les assignations de permissions on été enregistré',
            life: 3000,
        });
    }

    assignManyPermissionToRole(id: number): void {
        let dataToAssigne = {
            permissions: this.selectedPermissions.map(
                (permission) => permission.name
            ),
        };
        this.permissionService
            .assigneRolePermissions(id, dataToAssigne)
            .subscribe({
                next: () => {
                    this.getAllPermissions();
                },
                error: (err) => {
                    console.error(
                        "Erreur lors de l'assignation de la permission:",
                        err
                    );
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Assignation de role a échouée',
                        life: 3000,
                    });
                },
            });
    }

    revokeNonSelectedPermissions(): void {
        // Filtrer les permissions non sélectionnées
        const dataNonSelected = this.rolePermissions.filter(
            (permission: Permission) =>
                !this.selectedPermissions.some(
                    (selected) => selected.id === permission.id
                )
        );
        dataNonSelected.forEach((permission: Permission) => {
            const dataToRevoke = { permission: permission.name };
            this.permissionService
                .revokeRolePermissions(this.roleId, dataToRevoke)
                .subscribe({
                    next: () => {},
                    error: (err) => {
                        console.error(
                            `Erreur lors de la révocation de la permission ${permission.name}:`,
                            err
                        );
                    },
                });
        });
    }

    /**************************************************** *
* ROLE
/*********************************** */

    getRoleById(id: number): void {
        this.roleService.getRoleById(id).subscribe({
            next: (response) => {
                this.role = response;
                // Vérifiez si le rôle est "Administrateur"
                this.isAdmin = this.role.name === 'Administrateur';
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération des permissions:',
                    err
                );
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    onGoToRoleListe() {
        this.router.navigate(['/dashboard/parametre/role-liste']);
    }
}
