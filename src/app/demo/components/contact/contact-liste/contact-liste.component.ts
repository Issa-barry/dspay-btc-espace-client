import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

import { Contact } from '../../../models/contact';
import { Role } from '../../../models/Role';
import { ContactService } from '../../../service/contact/contact.service';
import { RoleService } from '../../../service/role/role.service';
import { Statut } from 'src/app/demo/enums/statut.enum';

@Component({
  selector: 'app-contact-liste',
  templateUrl: './contact-liste.component.html',
  styleUrls: ['./contact-liste.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ContactListeComponent implements OnInit {
  contacts: Contact[] = [];
  contact: Contact = new Contact();
  roles: Role[] = [];
  optionPays = [
    { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
    { label: 'FRANCE', value: 'France' }
  ];

  contactDialog = false;
  deleteContactDialog = false;
  deleteContactsDialog = false;
  submitted = false;

  loading = false;
  skeletonRows = Array.from({ length: 5 }, () => ({}));
  rowsPerPageOptions = [5, 10, 20];

  selectedContacts: Contact[] = [];

  isValidPhone = true;
  isValidCodePostal = true;
  isCodePostalDisabled = false;
  isValidPays = true;

  constructor(
    private contactService: ContactService,
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getAllContacts();
    this.getAllRoles();
  }

  getAllContacts(): void {
    this.loading = true;
    this.contactService.getContacts().subscribe({
      next: (res) => {
        this.contacts = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des contacts:', err);
        this.loading = false;
      }
    });
  }

  getAllRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => console.error('Erreur chargement rôles:', err)
    });
  }

  validatePhone(): void {
    const regex = /^(?:\+|00)?(\d{1,3})[-.\s]?\d{10,}$/;
    this.isValidPhone = regex.test(this.contact.phone || '');
  }

  validateCodePostal(): void {
    const cp = this.contact.adresse?.code_postal?.toString() || '';
    this.isValidCodePostal = /^\d{5}$/.test(cp);
  }

  validatePays(): void {
    this.isValidPays = !!this.contact.adresse?.pays;
    if (this.contact.adresse?.pays === 'GUINEE-CONAKRY') {
      this.contact.adresse.code_postal = '00000';
      this.isCodePostalDisabled = true;
    } else {
      this.isCodePostalDisabled = false;
    }
  }

  saveContact(): void {
    this.submitted = true;
    this.validatePays();
    this.validateCodePostal();
    this.validatePhone();

    this.contact.role = String(this.contact.role?.name || this.contact.role);
    this.contact.adresse.code_postal = String(this.contact.adresse.code_postal);

    const serviceCall = this.contact.id && this.contact.password
      ? this.contactService.updateContact(this.contact.id, this.contact)
      : this.contactService.createContact(this.contact);

    serviceCall.subscribe({
      next: () => {
        this.getAllContacts();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Contact enregistré avec succès',
          life: 3000
        });
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "L'opération a échoué",
          life: 3000
        });
      }
    });

    this.contactDialog = false;
  }

  editContact(contact: Contact): void {
    this.contact = { ...contact };
    this.contactDialog = true;
  }

  deleteContact(contact: Contact): void {
    this.contact = { ...contact };
    this.deleteContactDialog = true;
  }

  confirmDelete(): void {
    this.deleteContactDialog = false;
    if (!this.contact.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "ID du contact non défini",
        life: 3000
      });
      return;
    }

    this.contactService.deleteContact(this.contact.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Contact supprimé avec succès',
          life: 3000
        });
        this.getAllContacts();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la suppression du contact',
          life: 3000
        });
      }
    });
  }

  deleteSelectedContacts(): void {
    this.deleteContactsDialog = true;
  }

  confirmDeleteSelected(): void {
    this.deleteContactsDialog = false;
    // Implémentez la logique réelle si vous avez un service côté backend
    this.selectedContacts = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Suppression multiple',
      detail: 'Contacts supprimés',
      life: 3000
    });
  }

  openNew(): void {
    this.contact = new Contact();
    this.submitted = false;
    this.contactDialog = true;
  }

  hideDialog(): void {
    this.contactDialog = false;
    this.submitted = false;
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onGotToNewContact(): void {
    this.router.navigate(['/dashboard/contact/contact-new']);
  }

  onGotToContactDetail(contact: Contact): void {
    this.router.navigate(['/dashboard/contact/contact-detail', contact.id]);
  }
   showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }


  private updateStatutContact(contact: Contact, statut: Statut, severity: string, action: string) {
          if (!contact.id) return;
  
          this.contactService.updateStatut(contact.id, statut).subscribe({
              next: (updated) => {
                  this.showMessage(severity, 'Statut modifié', `Contact "${updated.nom_complet}" ${action}.`);
                  this.getAllContacts();
              },
              error: (err) => {
                  this.showMessage('error', 'Erreur', err.message || `Échec de la modification du statut.`);
              },
          });
      }
  

     // Statuts avec Enum
      validerContact(contact: Contact) {
          this.updateStatutContact(contact, Statut.ACTIVE, 'success', 'validée');
      }

      bloquerContact(contact: Contact) {
          this.updateStatutContact(contact, Statut.BLOQUE, 'warn', 'bloquée');
      }

      debloquerContact(contact: Contact) {
          this.updateStatutContact(contact, Statut.ACTIVE, 'success', 'débloquée');
      }
}
