import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PasswordService } from 'src/app/demo/service/auth/password/password.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { TokenService } from 'src/app/demo/service/token/token.service';

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
    private router: Router,
    private auth: AuthService,
    private tokenService: TokenService
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
      next: (res) => this.showSuccessDialog(res?.message ?? 'Mot de passe réinitialisé.'),
      error: (err) => this.showValidationErrors(err),
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

  /**  Réaffiche une boîte de dialogue comme avant */
  private showSuccessDialog(message: string): void {
    this.loading = false;
    this.submitted = false;

    this.confirmationService.confirm({
      header: message,
      acceptLabel: 'Se connecter',
      rejectVisible: false,
      accept: () => this.onClickLogin(),
    });
  }

  /**  Se connecter automatiquement (token si dispo, sinon login silencieux) */
   onClickLogin(): void {
    this.loading = true;

    // Si le back a déjà renvoyé un token lors du reset
    const hasToken = this.tokenService.hasToken?.() ?? false;
    if (hasToken) {
      this.loading = false;
      this.router.navigate(['/dashboard']);
      return;
    }

    // Sinon, on fait un login silencieux avec l’email + le nouveau mot de passe
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
    });
  }

  private showValidationErrors(err: any): void {
    console.error(err);
    const validationErrors = err?.error?.data || {};
    this.errors = {};

    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        this.errors[field] = Array.isArray(validationErrors[field])
          ? validationErrors[field].join(' ')
          : String(validationErrors[field]);
      }
    }

    this.errorMessage = err?.error?.message || 'Une erreur est survenue.';
    this.loading = false;
    this.submitted = false;
  }

  private clearErrors(): void {
    this.errors = {};
    this.errorMessage = '';
  }
}
