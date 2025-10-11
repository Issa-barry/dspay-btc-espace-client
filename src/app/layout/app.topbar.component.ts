import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {

  @ViewChild('menubutton') menuButton!: ElementRef;

  initialesProfil: string = '?';

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 👉 essaie de récupérer depuis ton AuthService
    const user = this.authService.getMe ? this.authService.getMe() : null;

    // ou si ton user est stocké dans localStorage :
    const userData = user || JSON.parse(localStorage.getItem('user') || '{}');

    const nomComplet = userData?.nom_complet || 'Utilisateur';
    this.initialesProfil = this.getInitials(nomComplet);
  }

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

  onProfileButtonClick() {
    this.layoutService.showProfileSidebar();
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  private getInitials(nomComplet: string): string {
    if (!nomComplet) return '?';
    const parts = nomComplet.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  }
}
