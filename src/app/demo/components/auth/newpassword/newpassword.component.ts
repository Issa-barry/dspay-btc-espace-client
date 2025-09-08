import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PasswordService } from 'src/app/demo/service/auth/password/password.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './newpassword.component.html',
    providers: [MessageService, ConfirmationService],
})
export class NewPasswordComponent implements OnInit {
    password = '';
    confirmPassword = '';
    loading = false;
    submitted = false;
    token = ''; 
    email = '';
    errors: { [key: string]: string } = {};
    errorMessage = '';

    constructor(
        private passwordService: PasswordService,
        private layoutService: LayoutService,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const { token = '', email = '' } = this.route.snapshot.queryParams;
        this.token = token;
        this.email = email;
    }

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    resetPassword(): void {
        this.submitted = true;
        this.clearErrors();

        if (!this.isFormValid()) {
            this.errorMessage = 'Tous les champs sont obligatoires.';
            return;
        }

        this.loading = true;

        this.passwordService.resetPassword(this.buildResetData()).subscribe({
            next: (response) => this.showSuccessDialog(response.message),
            error: (error) => this.showValidationErrors(error),
        });
    }

    private isFormValid(): boolean {
        return this.password.trim() !== '' && this.confirmPassword.trim() !== '';
    }

    private buildResetData() {
        return {
            email: this.email,
            token: this.token,
            password: this.password,
            password_confirmation: this.confirmPassword,
        };
    }

    private showSuccessDialog(message: string): void {
        this.loading = false;
        this.submitted = false;

        this.confirmationService.confirm({
            // message: message,
            header: message,
            // icon: 'pi pi-check-circle',
            acceptLabel: 'Se connecter',
            rejectVisible: false,
            accept: () => this.router.navigate(['/auth/login']),
        });
    }

    private showValidationErrors(err: any): void {
        console.error(err);
        const validationErrors = err?.error?.data || {};
        this.errors = {};

        for (const field in validationErrors) {
            if (validationErrors.hasOwnProperty(field)) {
                this.errors[field] = validationErrors[field].join(' ');
            }
        }

        this.errorMessage = err?.error?.message || '';
        this.loading = false;
        this.submitted = false;
    }

    private clearErrors(): void {
        this.errors = {};
        this.errorMessage = '';
    }
}
