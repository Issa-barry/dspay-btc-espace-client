import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService } from 'primeng/api';
import { Contact } from 'src/app/demo/models/contact';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { Role } from 'src/app/demo/models/Role';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

interface MonthlyPayment {
    name?: string;
    amount?: number;
    paid?: boolean;
    date?: string;
}

@Component({
    templateUrl: './banking.dashboard.component.html',
    providers: [MessageService],
})
export class BankingDashboardComponent implements OnInit, OnDestroy {
    devises: any[] = [];
    chartData: any;

    chartOptions: any;

    payments: MonthlyPayment[] = [];

    subscription: Subscription;

    errors: { [key: string]: string } = {};
    contact: Contact = new Contact();

    constructor(
        private layoutService: LayoutService,
        private contactService: ContactService,
        private messageService: MessageService,
        private transfertService: TransfertService
    ) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
                this.initChart();
            });
    }

    ngOnInit() {
        this.getContactById(1);
        this.loadStatistiques();

        this.initChart();

        this.payments = [
            {
                name: 'Electric Bill',
                amount: 75.6,
                paid: true,
                date: '06/04/2022',
            },
            {
                name: 'Water Bill',
                amount: 45.5,
                paid: true,
                date: '07/04/2022',
            },
            { name: 'Gas Bill', amount: 45.2, paid: false, date: '12/04/2022' },
            {
                name: 'Internet Bill',
                amount: 25.9,
                paid: true,
                date: '17/04/2022',
            },
            {
                name: 'Streaming',
                amount: 40.9,
                paid: false,
                date: '20/04/2022',
            },
        ];
    }

    //   private showError(summary: string, detail: string): void {
    //     this.messageService.add({ severity: 'error', summary, detail });
    //   }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
            ],
            datasets: [
                {
                    label: 'Income',
                    data: [6500, 5900, 8000, 8100, 5600, 5500, 4000],
                    fill: false,
                    tension: 0.4,
                    borderColor: documentStyle.getPropertyValue('--green-500'),
                },
                {
                    label: 'Expenses',
                    data: [1200, 5100, 6200, 3300, 2100, 6200, 4500],
                    fill: true,
                    borderColor: '#6366f1',
                    tension: 0.4,
                    backgroundColor: 'rgba(99,102,220,0.2)',
                },
            ],
        };

        this.chartOptions = {
            animation: {
                duration: 0,
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }

                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(context.parsed.y);
                            }
                            return label;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
            },
        };
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getContactById(id: number): void {
        this.contactService.getContactById(id).subscribe({
            next: (response) => (this.contact = response),
            error: (err) =>
                console.error(
                    'Erreur lors de la récupération du contact:',
                    err
                ),
        });
    }

    /**global stats */
    stats: {
        total_envoye: number;
        total_recu: number;
        total_general: number;
        nb_transferts: number;
    } = {
        total_envoye: 0,
        total_recu: 0,
        total_general: 0,
        nb_transferts: 0,
    };

    loadStatistiques(): void {
        this.transfertService.getStatistiquesGlobales().subscribe({
            next: (res) => {
                this.stats = res;
                console.log('Statistiques globales:', this.stats);
                
            },
            error: (err) => {
                console.error('Erreur lors du chargement des stats', err);
            },
        });
    }
}
