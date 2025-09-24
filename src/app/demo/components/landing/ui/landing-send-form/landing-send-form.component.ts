import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'app-landing-send-form',
  templateUrl: './landing-send-form.component.html',
  styleUrl: './landing-send-form.component.scss'
})
export class LandingSendFormComponent implements  OnInit{
 
          
       constructor(
        private router: Router,
         private authService:AuthService,
       ) { } 
       
        ngOnInit() {
          this.recalc();
        }
   
         //   ***********************************IBA
    // EUR -> GNF fixe
amountInput = 0;          // valeur saisie
feesIncluded = true;      // switch "Frais inclus ?"

feePercent = 0.05;       // 2,5% (à adapter ou charger via API)
minFeeEUR = 0;            // optionnel: frais minimum ; laisse 0 si inutile

rateBase = 10700;          // taux de base
rate = this.rateBase;     // taux courant (peut être promo)
promo = false;            // active un taux promo si besoin

// valeurs calculées
fees = 0;                 // en EUR
sendAmountEUR = 0;        // montant envoyé (EUR)
totalToPay = 0;           // total débité (EUR)
receiveGNF = 0;           // reçu en GNF

  
// --- state pour savoir quel champ a été modifié en dernier (optionnel)
lastEdited: 'send' | 'receive' = 'send';

// appelé quand "Vous envoyez" change
onAmountInput(): void {
  this.lastEdited = 'send';
  this.recalcFromSend();
}

// appelé quand "Le destinataire reçoit" change
onReceiveInput(): void {
  this.lastEdited = 'receive';
  this.recalcFromReceive();
}

// === Calcul quand on saisit le montant envoyé (EUR)
recalcFromSend(): void {
  const p = Number(this.feePercent) || 0;
  const montant = Number(this.amountInput) || 0;

  // frais toujours calculés de la même façon : p * base
  this.fees = Math.max(this.minFeeEUR, montant * p);

  if (this.feesIncluded) {
    // frais AJOUTÉS AU TOTAL (switch ON)
    this.sendAmountEUR = montant;
    this.totalToPay = montant + this.fees;
  } else {
    // frais INCLUS dans le montant saisi (switch OFF)
    this.sendAmountEUR = Math.max(0, montant - this.fees);
    this.totalToPay = montant;
  }

  const r = Number(this.rate) || 0;
  this.receiveGNF = Math.round(this.sendAmountEUR * r);
}

// === Calcul inverse quand on saisit le montant reçu (GNF)
recalcFromReceive(): void {
  const p = Number(this.feePercent) || 0;
  const r = Number(this.rate) || 0;
  const gnf = Math.max(0, Number(this.receiveGNF) || 0);

  const netEUR = r > 0 ? gnf / r : 0; // net que doit recevoir le bénéficiaire en EUR

  if (this.feesIncluded) {
    // frais AJOUTÉS AU TOTAL (switch ON)
    // montant saisi = net envoyé ; total = net + frais(net)
    this.sendAmountEUR = netEUR;
    this.fees = Math.max(this.minFeeEUR, this.sendAmountEUR * p);
    this.amountInput = this.sendAmountEUR;
    this.totalToPay = this.sendAmountEUR + this.fees;
  } else {
    // frais INCLUS dans le montant saisi (switch OFF)
    // on veut: send = amountInput - p*amountInput = amountInput*(1-p) = netEUR
    const denom = (1 - p) || 1e-9; // garde-fou si p=1
    this.amountInput = netEUR / denom;
    this.fees = Math.max(this.minFeeEUR, this.amountInput * p);
    this.sendAmountEUR = Math.max(0, this.amountInput - this.fees);
    this.totalToPay = this.amountInput;
  }
}

// === appelé au init et quand on change le switch
recalc(): void {
  if (this.lastEdited === 'receive') this.recalcFromReceive();
  else this.recalcFromSend();
}


startTransfer(): void {
  const params = {
    from: 'EUR',
    to: 'GNF',
    amountInput: this.amountInput,
    feesIncluded: this.feesIncluded,
    feePercent: this.feePercent,
    fees: this.fees.toFixed(2),
    sendAmount: this.sendAmountEUR.toFixed(2),
    totalToPay: this.totalToPay.toFixed(2),
    rate: this.rate,
    receive: Math.round(this.receiveGNF)
  };

  const urlTree = this.router.createUrlTree(
    ['/dashboard/transfert/envoie'],
    { queryParams: params }
  );
  const redirectUrl = urlTree.toString();

  if (this.authService.isAuthenticated()) {
    this.router.navigateByUrl(redirectUrl);
  } else {
    sessionStorage.setItem('pendingTransferParams', JSON.stringify(params));
    sessionStorage.setItem('redirectUrl', redirectUrl);
    this.router.navigate(['/auth/login'], { queryParams: { redirect: redirectUrl } });
  }
}
}
