import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { TicketService } from 'src/app/demo/service/ticketservice';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-transfert-envoie-2',
    templateUrl: './transfert-envoie-2.component.html',
    styleUrl: './transfert-envoie-2.component.scss',
})
export class TransfertEnvoie2Component implements OnInit {
    items: MenuItem[] = [];
    activeIndex = 1; // 0=Personal, 1=Seat, 2=Payment, 3=Confirmation

    // Formulaires
    personalForm!: FormGroup;
    seatForm!: FormGroup;
    paymentForm!: FormGroup;

    // Options (mock)
    classes = [
        { label: 'Economy', value: 'eco' },
        { label: 'Business', value: 'biz' },
    ];
    wagons = [
        { label: 'Wagon A', value: 'A' },
        { label: 'Wagon B', value: 'B' },
    ];
    seats = [
        { label: '12A', value: '12A' },
        { label: '14C', value: '14C' },
    ];

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.items = [
            { label: 'Montant à envoyer' },
            { label: 'Bénéficiaire' },
            { label: 'Récapitulatif' },
            { label: 'payement' },
        ];

        this.personalForm = this.fb.group({
            firstname: [''],
            lastname: [''],
            email: [''],
        });

        this.seatForm = this.fb.group({
            class: [null],
            wagon: [null],
            seat: [null],
        });

        this.paymentForm = this.fb.group({
            cardNumber: [''],
            holder: [''],
        });

     }

    next() {
        this.activeIndex = Math.min(
            this.activeIndex + 1,
            this.items.length - 1, 
             
        );
        console.log(this.activeIndex);
    }
    prev() {
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
    }

    // Simu validation par étape (à adapter)
    canNext(): boolean {
        if (this.activeIndex === 0) return this.personalForm.valid;
        if (this.activeIndex === 1) return this.seatForm.valid;
        if (this.activeIndex === 2) return this.paymentForm.valid;
        return true;
    }
}
