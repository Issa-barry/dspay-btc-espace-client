import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({ templateUrl: './login.component.html' })
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;

  errorMessage = '';
  loading = false;
  submited = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private layoutService: LayoutService
  ) {}

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  ngOnInit(): void {
    // Prefill email si rememberMe était activé
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }

    const qp = this.route.snapshot.queryParamMap;
    const urlAfter =
      qp.get('redirect') || sessionStorage.getItem('redirectUrl') || '/dashboard';

    // 1) si token => direct
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(urlAfter, { replaceUrl: true });
      return;
    }

    // 2) sinon, teste la session cookie via /users/me (intercepteur => withCredentials)
    this.authService.getMe().subscribe({
      next: () => this.router.navigateByUrl(urlAfter, { replaceUrl: true }),
      error: () => {
        // rester sur login
      },
    });
  }

  login(): void {
    this.errorMessage = '';
    this.submited = true;

    const email = (this.email || '').trim();
    const password = (this.password || '').trim();

    if (!email || !password) {
      this.errorMessage = 'Veuillez saisir votre email et votre mot de passe.';
      return;
    }

    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        // Remember me: on conserve uniquement l'email (jamais le mot de passe)
        if (this.rememberMe) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }

        this.handlePostLoginRedirect();
        this.loading = false;
        this.submited = false;
      },
      error: (err: Error) => {
        this.errorMessage = err?.message || 'Identifiants incorrects';
        this.loading = false;
        this.submited = false;
      },
    });
  }

  goToResetPassword(): void {
    this.router.navigate(['/auth/forgotpassword']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  // ---------- PRIVÉ ----------
  private handlePostLoginRedirect(): void {
    const qp = this.route.snapshot.queryParamMap;
    const urlAfter =
      qp.get('redirect') || sessionStorage.getItem('redirectUrl') || '/dashboard';
    const pendingJson = sessionStorage.getItem('pendingTransferParams');

    // nettoyage
    sessionStorage.removeItem('redirectUrl');

    if (pendingJson && urlAfter.startsWith('/dashboard/transfert/envoie')) {
      const params = this.safeParse(pendingJson);
      sessionStorage.removeItem('pendingTransferParams');
      this.router.navigate(['/dashboard/transfert/envoie'], {
        queryParams: params,
        replaceUrl: true,
      });
    } else {
      this.router.navigateByUrl(urlAfter, { replaceUrl: true });
    }
  }

  private safeParse(json: string | null): any {
    try {
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }
}
