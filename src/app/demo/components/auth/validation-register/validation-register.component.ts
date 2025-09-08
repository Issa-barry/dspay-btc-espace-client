import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-validation-register',
  templateUrl: './validation-register.component.html',
  styleUrl: './validation-register.component.scss'
})
export class ValidationRegisterComponent implements OnInit {
  loading = true;
  success = false;
  message = '';
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');

    if (redirectUrl) {
      this.http.get(redirectUrl).subscribe({
        next: (response: any) => {
          this.success = true;
          this.message = response.message;
          this.user = response.user;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur de vérification', err);
          this.message = 'Une erreur est survenue lors de la vérification.';
          this.success = false;
          this.loading = false;
        },
      });
    } else {
      this.message = 'Lien de vérification invalide.';
      this.loading = false;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
 