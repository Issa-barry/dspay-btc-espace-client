import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

import { Contact } from '../../../models/contact';
import { Role } from '../../../models/Role';
import { ContactService } from '../../../service/contact/contact.service';
import { RoleService } from '../../../service/role/role.service';
import { Statut } from 'src/app/demo/enums/statut.enum';
import { Beneficiaire } from 'src/app/demo/models/beneficiaire';
import { PaginationMeta } from 'src/app/demo/models/PaginationMeta';
import { BeneficiaireService } from 'src/app/demo/service/beneficiaire/beneficiaire.service';
import { formatPhoneOnType, toE164 } from 'src/app/shared/utils/phone.util';

@Component({
  selector: 'app-beneficiaire-liste',
  templateUrl: './beneficiaire-liste.component.html',
  styleUrl: './beneficiaire-liste.component.scss',
  providers: [MessageService, ConfirmationService]

})
export class BeneficiaireListeComponent implements OnInit {

    beneficiaires: Beneficiaire[] = [];
    beneficiaire: Beneficiaire = new Beneficiaire();
   beneficiaireDialog = false;
   deleteBeneficiaireDialog = false;
    current: Beneficiaire = {} as Beneficiaire;
    selectedBeneficiaires: Beneficiaire[] = [];
    page = 1;
    perPage = 10; 
    searchTerm = '';
 
   meta: PaginationMeta | null = null;

  roles: Role[] = [];
  optionPays = [
    { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
    { label: 'FRANCE', value: 'France' }
  ];

  //
  contacts: Contact[] = [];
  contact: Contact = new Contact();
   

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

  // Pays: toujours Guinée-Conakry pour bénéficiaires

  constructor(
    private contactService: ContactService,
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
     private beneficiaireService: BeneficiaireService,
  ) {}

  ngOnInit(): void {
    this.getAllContacts();
    this.getAllRoles();
    this.loadBeneficiaires();

    // Rien à initialiser: pays forcé à GN côté UI et logique
  }

  /** Chargement liste paginée */
  loadBeneficiaires(): void {
    this.loading = true;

    this.beneficiaireService
      .list({ page: this.page, per_page: this.perPage, search: this.searchTerm || undefined })
      .subscribe({
        next: ({ items, meta }) => {
          this.beneficiaires = items;
          this.meta = meta;
          this.loading = false;
          console.log(this.beneficiaires);
          
        },
        error: (err) => {
          this.loading = false;
          this.showMessage('error', 'Erreur', err.message || 'Échec du chargement des bénéficiaires.');
        }
      });
  }

  editBeneficiaire(beneficiaire: Beneficiaire): void {
    this.beneficiaire = { ...beneficiaire };
    this.beneficiaireDialog = true;
  }

  // 
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

  saveBeneficiaire(): void {
    this.submitted = true;

  // validation très simple (adapte selon ton modèle)
  if (!this.beneficiaire?.phone || (!this.beneficiaire.nom && !this.beneficiaire.nom_complet)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Champs requis',
      detail: 'Veuillez saisir au moins le Nom (ou Nom complet) et le Téléphone.',
      life: 3000
    });
    return;
  }

  // Normaliser téléphone en E.164 pour la Guinée (GN)
  const e164 = toE164(this.beneficiaire.phone || '', 'GN');
  if (!e164) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Téléphone invalide',
      detail: `Le numéro n'est pas valide pour la Guinée-Conakry.`,
      life: 3000
    });
    return;
  }

  const payload = {
    nom: this.beneficiaire.nom ?? '',
    prenom: this.beneficiaire.prenom ?? '',
    phone: e164
  };

  const isUpdate = typeof this.beneficiaire.id === 'number' && this.beneficiaire.id > 0;

  const serviceCall = isUpdate
    ? this.beneficiaireService.update(this.beneficiaire.id!, payload)
    : this.beneficiaireService.create(payload);

  serviceCall.subscribe({
    next: () => {
      this.loadBeneficiaires();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: isUpdate
          ? 'Bénéficiaire mis à jour avec succès'
          : 'Bénéficiaire créé avec succès',
        life: 3000
      });
      this.hideDialog();
    },
    error: (err: any) => {
      console.error('Erreur:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || "L'opération a échoué",
        life: 3000
      });
    }
  });
}
  // ---- Téléphone (UX) ----
  onPhoneInput(event: Event) {
    const target = event?.target as HTMLInputElement | null;
    const raw = target?.value ?? '';
    // Retire toute lettre/symbole saisi; ne garde que les chiffres
    const digitsOnly = raw.replace(/\D+/g, '');
    this.beneficiaire.phone = formatPhoneOnType(digitsOnly, 'GN');
  }

  onPhoneKeyDown(event: KeyboardEvent) {
    const allowedCtrl = event.ctrlKey || event.metaKey;
    const key = event.key;
    // Autoriser touches de contrôle, navigation et raccourcis
    const controlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter', 'Escape'
    ];
    if (controlKeys.includes(key) || (allowedCtrl && ['a','c','v','x'].includes(key.toLowerCase()))) {
      return; // autoriser
    }
    // Autoriser uniquement les chiffres
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }

/** Ouvrir la modale de suppression multiple */
/** Ouvrir la modale de suppression unitaire */
deleteBeneficiaire(b: Beneficiaire): void {
  this.current = { ...b };
  this.deleteBeneficiaireDialog = true;
}


/** Confirmer suppression unitaire */
confirmDeleteBeneficiaire(): void {
  // this.deleteBeneficiaireDialog = false;

  if (!this.current?.id) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: "ID du bénéficiaire non défini",
      life: 3000
    });
    return;
  }

  this.beneficiaireService.delete(this.current.id).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Bénéficiaire supprimé avec succès',
        life: 3000
      });
      this.loadBeneficiaires();
      this.current = {} as Beneficiaire;
      this.deleteBeneficiaireDialog = false;
    },
    error: (err) => {
      console.error('Erreur suppression bénéficiaire:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Échec de la suppression',
        life: 3000
      });
    }
  });
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
    this.beneficiaire = new Beneficiaire();
    this.submitted = false;
    this.beneficiaireDialog = true;
  }

  hideDialog(): void {
    this.beneficiaireDialog = false;
    this.submitted = false;
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
 
getInitials(fullName: string): string {
  if (!fullName) return '?';
  const p = fullName.trim().split(/\s+/);
  return (p[0][0] + (p[p.length - 1]?.[0] || '')).toUpperCase();
}


   onGotToNewBeneficiaire(): void {
    this.router.navigate(['/dashboard/beneficiaire/beneficiaire-new']);
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
