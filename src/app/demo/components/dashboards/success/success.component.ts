import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  sessionId: string | null = null;
  transactionType: 'depot' | 'send' = 'depot';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    this.transactionType = (this.route.snapshot.queryParamMap.get('type') as any) || 'depot';
  }

  get title(): string {
    return this.transactionType === 'depot' ? 'Dépôt réussi !' : 'Transfert réussi !';
  }

  get message(): string {
    return this.transactionType === 'depot' 
      ? 'Votre dépôt a été confirmé avec succès.'
      : 'Votre transfert a été effectué avec succès.';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  makeAnotherTransaction(): void {
    const route = this.transactionType === 'depot' ? '/dashboard/depot' : '/dashboard/send';
    this.router.navigate([route]);
  }
}