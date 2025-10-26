import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'landing-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  // isLoggedIn!: Observable<boolean>; 
     isLoggedIn: boolean = false; 
  navOpen = false;        // menu desktop (si tu l’utilises encore)
  mobileMenu = false;     // sidebar mobile

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
      this.isLoged()    
  }

    isLoged(){
        if (this.authService.isAuthenticated()) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }
 
  goToLogin(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

    goToRegister(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/register']);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  openMobileMenu(): void {
    this.mobileMenu = true;
  } 

  closeMobileMenu(): void {
    this.mobileMenu = false;
  }
}
