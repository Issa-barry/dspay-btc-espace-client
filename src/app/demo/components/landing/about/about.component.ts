import { Component } from '@angular/core';

interface Stat { label: string; value: string; }
interface TimelineEvent { title: string; date: string; text: string; icon?: string; color?: string; }
interface Team { name: string; role: string; avatar?: string; }

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  accent = '#875A7B'; // violet Odoo

  hero = {
    title: 'À propos de DSPay',
    subtitle: 'Des transferts simples, transparents et rapides entre l’Europe et la Guinée.',
    image: 'assets/about/hero.jpg', // remplace par ton image
  };

  stats: Stat[] = [
    { label: 'Transferts traités', value: '12 000+' },
    { label: 'Taux de dispo', value: '99,9%' },
    { label: 'Points de retrait', value: '120+' },
  ];

timeline: TimelineEvent[] = [
  {
    title: 'Montant & mode de réception',
    date: 'Étape 1',
    text: 'Saisissez le montant en EUR et choisissez le mode : retrait cash, Orange Money ou eWallet.',
    icon: 'pi pi-wallet',
    color: '#0862c9 '
  },
  {
    title: 'Bénéficiaire',
    date: 'Étape 2',
    text: 'Sélectionnez ou créez le bénéficiaire en Guinée (nom et téléphone).',
    icon: 'pi pi-user',
    color: '#eed363'
  },
  {
    title: 'Récapitulatif',
    date: 'Étape 3',
    text: 'Vérifiez le montant, les frais, le taux appliqué et les infos du bénéficiaire.',
    icon: 'pi pi-eye',
    color: '#875A7B'
  },
  {
    title: 'Paiement sécurisé',
    date: 'Étape 4',
    text: 'Réglez par carte bancaire. Les frais sont clairement affichés avant validation.',
    icon: 'pi pi-credit-card',
    color: '#1a9330'
  },
  {
    title: 'Retrait / Réception',
    date: 'Étape 6',
    text: 'Retrait cash en agence partenaire ou réception e-wallet selon votre choix.',
    icon: 'pi pi-map-marker',
    color: '#006141'
  }
];


  team: Team[] = [
    { name: 'Ibrahima S.', role: 'Produit', avatar: 'https://i.pravatar.cc/160?img=12' },
    { name: 'Mariam Diallo', role: 'Support Guinée', avatar: 'https://i.pravatar.cc/160?img=5' },
    { name: 'A. Camara', role: 'Front-end', avatar: 'https://i.pravatar.cc/160?img=33' },
    { name: 'Y. Barry', role: 'Ops & Agences', avatar: 'https://i.pravatar.cc/160?img=22' },
  ];
}
