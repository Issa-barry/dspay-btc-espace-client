# FELLO CONSULTING

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

 
## IBA   ****

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
# angular-starter


 


## Component
ng generate module demo/components/contact/contact-affecter-agence --route contact-new --module contact# dspay-btc-espace-client

## PIPES 
#### DATE 
`<span class="text-900 font-medium text-sm">Transfert du {{ transfert.updated_at | dateFr:'moisEnLettre'  }}</span>`

### PHONE 
`<span>{{ facture.commande?.contact?.phone | phoneFormat:'GN' }}</span>`

### Money 
<!-- GNF -->
{{ montantGNF | money:'GNF' }}            <!-- ex : 1 070 000 GNF -->
{{ montantGNF | money:'GNF':'auto':true }}<!-- ex : 1,1 M GNF (compact) -->

<!-- EUR -->
{{ frais | money:'EUR' }}                 <!-- ex : 12,50 € -->
{{ total_ttc | money:'EUR' }}             <!-- ex : 128,40 € -->
{{ transfert.montant_envoie | money:'EUR' }}

#### Utilisation (plus d’espace pour GNF)
{{ transfert.montant_gnf | money:'GNF':'auto':false:'none':'fr-FR':'wide' }}

→ wide/normal/em/figure c'est pour espace de montant : donne 1 070 000 GNF (deux espaces insécables).

test
 
 dev
# DEPLOIEMENT

🚀 Nouveaux scripts disponibles

Développement

npm start


Préprod

npm run start:preprod
npm run build:preprod


Production

npm run build


Génération manuelle sitemap

npm run generate:sitemap

