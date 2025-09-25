import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { Router } from '@angular/router';
import { AuthService } from '../demo/service/auth/auth.service';
import { ContactService } from '../demo/service/contact/contact.service';
import { Contact } from '../demo/models/contact';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize, Observable } from 'rxjs';

@Component({
    selector: 'app-profilemenu',
    templateUrl: './app.profilesidebar.component.html',
    providers: [MessageService],
})
export class AppProfileSidebarComponent implements OnInit {
 me$!: Observable<Contact | null>;   // profil connecté (observable)
  contacts: Contact[] = [];
  contact: Contact = new Contact();
  errorMessage: string | null = null;
  loggingOut = false; 
 
    constructor(
        public router: Router, 
        private authService: AuthService,
        public layoutService: LayoutService,
        private contactService: ContactService,
        private messageService: MessageService,
    ) { }

    get visible(): boolean {
        return this.layoutService.state.profileSidebarVisible;
    }

    set visible(_val: boolean) {
        this.layoutService.state.profileSidebarVisible = _val;
    }


        // Méthode de déconnexion
 logout(): void {
    if (this.loggingOut) return;       // évite les doubles clics
    this.errorMessage = null;
    this.loggingOut = true;

    this.authService.logout()
      .pipe(finalize(() => this.loggingOut = false))   // stoppe le spinner
      .subscribe({
        next: () => {
          this.visible = false;                         // ferme le sidebar
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Erreur de déconnexion', err);
          this.errorMessage = 'Une erreur est survenue lors de la déconnexion.';
        }
      });
  }
  getContactById(){
    this.contactService.getContactById(1).subscribe({
      next:(res) => {
        this.contact = res
      },
      error:(err) => {console.error("Erreur lor de la recuperation du contact", err)}
    })
  }


  ngOnInit() {
    this.getContactById();
    this.lodUserAuth();
    }

   lodUserAuth() {
    this.me$ = this.authService.currentUser$;
    // Si pas encore chargé (page fraîche), on récupère /users/me
    if (!this.authService.currentUserValue) {
      this.authService.getMe().subscribe();
    }
  }
}