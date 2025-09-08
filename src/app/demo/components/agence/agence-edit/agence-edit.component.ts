import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Agence } from 'src/app/demo/models/agence';
import { AgenceService } from 'src/app/demo/service/agence/agence.service';

@Component({
    selector: 'app-agence-edit',
    templateUrl: './agence-edit.component.html',
    styleUrls: ['./agence-edit.component.scss'],
    providers: [MessageService],
})
export class AgenceEditComponent implements OnInit {
    agence: Agence = new Agence();
    submitted = false;
    loading = false;
    isGuineeSelected = false;
    apiErrors: { [key: string]: string[] } = {};
    errorMessage = '';
 
    id!: number;

    countries = [
        { name: 'GUINEE-CONAKRY', code: 'GN', value: 'GUINEE-CONAKRY' },
        { name: 'France', code: 'FR', value: 'FRANCE' },
    ];

    constructor(
        private route: ActivatedRoute,
        private agenceService: AgenceService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.id = +this.route.snapshot.paramMap.get('id')!;
        if (this.id) {
            this.loadAgence(this.id);
        }
    }

    loadAgence(id: number): void {
        this.agenceService.getAgenceById(id).subscribe({
            next: (data) => {
                this.agence = data;
                this.agence.responsable_reference = data.responsable?.reference || '';
                this.isGuineeSelected = data.adresse.pays === 'GUINEE-CONAKRY';
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Impossible de charger l'agence",
                });
            },
        });
    }

    onCountryChange(event: any): void {
        const selectedCountry = event.value;
        this.isGuineeSelected = selectedCountry === 'GUINEE-CONAKRY';
        if (this.isGuineeSelected) {
            this.agence.adresse.code_postal = '00000';
        } else {
            this.agence.adresse.quartier = '';
        }
    }

    updateAgence(): void {
        this.submitted = true;
        if (!this.agence.id) return;

        const agenceToUpdate = { ...this.agence };
        delete (agenceToUpdate as any).responsable; // uniquement responsable_reference envoyé

         console.log('agenceToUpdate:', agenceToUpdate.adresse);
         
        this.agenceService.updateAgence(this.id, agenceToUpdate).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Agence modifiée avec succès',
                });
            },
            error: (err) => {
                this.apiErrors = err.error?.errors || {};
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err.message || 'Une erreur est survenue',
                });
            },
        });
    }
}
