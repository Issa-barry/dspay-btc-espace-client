import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Contact } from 'src/app/demo/models/contact';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './register.component.html',
    providers: [MessageService, ConfirmationService]
})
export class RegisterComponent {
    confirmed: boolean = false;
    contact: Contact = new Contact();
    errorMessage: string = '';
    successMessage: string = '';
    errors: { [key: string]: string[] } = {};

    nom: string = '';
    prenom: string = ''; 
    email: string = '';
    phone: string = '';
    password: string = ''; 
    password_confirmation: string = ''; 
    role : string = "client";
    date_naissance:string ="2024-01-01";
    

     constructor(
        public router: Router,
        private authService: AuthService,
        private layoutService: LayoutService,
        private messageService: MessageService, 
        private confirmationService: ConfirmationService) {}

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    
     onRegister() {
    this.errors = {};                  // reset erreurs
    this.errorMessage = '';

    this.contact.password_confirmation = this.contact.password;

    this.authService.register(this.contact).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie ! Vous avez reçu un mail de validation.';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.successMessage,
          life: 4000
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errors = err.error.data || {};
        console.log("erreur front", this.errors);
        
      }
    });
  }
}
 