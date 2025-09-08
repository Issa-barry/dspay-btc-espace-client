import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    rememberMe: boolean = false;
    email: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(
        public router: Router,
        private authService: AuthService,
        private layoutService: LayoutService
    ) {}

    ngOnInit(): void {} 

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    login(): void {
        this.errorMessage = ''; // Réinitialiser le message d'erreur avant chaque tentative

        const credentials = { email: this.email, password: this.password };

        this.authService.login(credentials).subscribe({
            next: (response) => {
                this.router.navigate(['/dashboard']);
                console.clear();
            },
            error: (err) => {
                console.error('Erreur de connexion :', err);
                this.errorMessage = err.error.error.email || 'Identifiants incorrects.'; 
            },
        });
    }

    goToResetPassword(): void {
        this.router.navigate(['/auth/forgotpassword']);
    }

    handleFelloClick(): void {
        this.router.navigate(['/some-page']);
    }
}
