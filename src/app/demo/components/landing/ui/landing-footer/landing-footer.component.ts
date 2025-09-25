import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss'
})
export class LandingFooterComponent {

  constructor(
    public router: Router
  ) { }

}
