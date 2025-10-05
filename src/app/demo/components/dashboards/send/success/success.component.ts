import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { interval, Subject, switchMap, takeUntil, startWith } from 'rxjs';
import { CheckoutLookup, PaiementService } from 'src/app/demo/service/paiement/paiement.service';

type Severity = 'success' | 'info' | 'warn' | 'danger';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  providers: [MessageService],
})
export class SuccessComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  sessionId = '';
  loading = true;
  lookup?: CheckoutLookup;

  // polling toutes les 2s pendant 60s
  readonly POLL_MS = 2000;
  readonly MAX_MS  = 60000;
  startedAt = 0;

  constructor(
    private route: ActivatedRoute,
    private toast: MessageService,
    private pay: PaiementService,
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';
    if (!this.sessionId) {
      this.loading = false;
      this.toast.add({ severity: 'warn', summary: 'Session manquante', detail: 'Paramètre session_id absent.' });
      return;
    }

    this.toast.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement confirmé' });

    this.startedAt = Date.now();

    // 1er tir immédiat, puis toutes les POLL_MS
    interval(this.POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.pay.getCheckoutStatus(this.sessionId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.lookup = res.data;
          this.loading = false;
     console.log('lookup', this.lookup);
          const done =
            !!this.lookup?.transfert_id ||
            this.lookup?.status === 'succeeded' ||
            this.lookup?.processed_at != null;

          const timeout = Date.now() - this.startedAt > this.MAX_MS;

          if (done) {
            // on arrête le polling une fois terminé
            this.destroy$.next();
            this.toast.add({
              severity: 'success',
              summary: 'Transfert créé',
              detail: 'Votre transfert est disponible.',
              life: 2500,
            });
          } else if (timeout) {
            this.destroy$.next(); // stop polling
            this.toast.add({
              severity: 'info',
              summary: 'Toujours en cours',
              detail: 'Le traitement prend plus de temps que prévu. Actualisez dans quelques instants.',
            });
          }
        },
        error: (err) => {
          this.loading = false;
          const msg = err?.error?.message || err?.message || 'Erreur lors de la récupération.';
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: msg });
          this.destroy$.next(); // stop polling on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  eurosFromCents(v?: number) { return typeof v === 'number' ? (v / 100) : 0; }
}
