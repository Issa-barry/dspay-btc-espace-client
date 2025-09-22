import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'landing-promo',
   templateUrl: './landing-promo.component.html',
  styleUrl: './landing-promo.component.scss'
})
export class LandingPromoComponent {

    constructor(public router: Router) {}  
   goHome() {
    this.router.navigate(['/landing'], { fragment: 'home' });
  }
}
