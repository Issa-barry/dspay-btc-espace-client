import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'landing-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  isLoggedIn = false;
  navOpen = false;

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  goToLogin(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleNav() { this.navOpen = !this.navOpen; }
  closeNav()  { this.navOpen = false; }
}
