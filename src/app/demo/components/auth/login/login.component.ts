// src/app/demo/components/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  loading = false;
  submited: boolean = false;

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
    // Déjà connecté ? Aller directement vers la cible (ou dashboard)
    if (this.authService.isAuthenticated()) {
      const qp = this.route.snapshot.queryParamMap;
      const urlAfter = qp.get('redirect') || sessionStorage.getItem('redirectUrl') || '/dashboard';
      this.router.navigateByUrl(urlAfter, { replaceUrl: true });
    }
  }

  login(): void {
    this.errorMessage = '';
    this.submited = true;
    this.loading = true;

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        // Si ton AuthService ne stocke pas la session ici, fais-le :
        // this.authService.setSession(res);
        this.handlePostLoginRedirect();
        this.loading = false;
        this.submited = false;
      },
      error: (err) => {
        this.loading = false;
        const apiMsg =
          err?.error?.message ||
          err?.error?.error ||
          err?.error?.error?.email ||
          err?.error?.errors?.email?.[0] ||
          err?.error?.errors?.password?.[0];
        this.errorMessage = apiMsg || 'Identifiants incorrects';
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
    const urlAfter = qp.get('redirect') || sessionStorage.getItem('redirectUrl') || '/dashboard';
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
