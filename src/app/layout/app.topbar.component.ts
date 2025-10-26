import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { firstValueFrom } from 'rxjs';

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

  async ngOnInit() {
    try {
      // ✅ Récupération du profil depuis l'API
      const me = await firstValueFrom(this.authService.getMe());

      const nomComplet =
        me.nom_complet ||
        `${me.prenom ?? ''} ${me.nom ?? ''}`.trim() ||
        'Utilisateur';

      this.initialesProfil = this.getInitials(nomComplet);

      // Sauvegarde locale
      localStorage.setItem('current_user', JSON.stringify(me));
    } catch (error) {
      // ⚠️ En cas d'erreur API, on tente le cache local
      const cachedUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      const nomComplet =
        cachedUser?.nom_complet ||
        `${cachedUser?.prenom ?? ''} ${cachedUser?.nom ?? ''}`.trim() ||
        'Utilisateur';
      this.initialesProfil = this.getInitials(nomComplet);
    }
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
    const parts = nomComplet.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  }
}
