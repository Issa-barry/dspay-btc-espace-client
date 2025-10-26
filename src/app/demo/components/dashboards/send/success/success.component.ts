import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CheckoutLookup, PaiementService } from 'src/app/demo/service/paiement/paiement.service';
import { interval, Subject, switchMap, startWith, takeUntil, timer, merge, map, distinctUntilChanged, finalize } from 'rxjs';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  providers: [MessageService],
})
export class SuccessComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly POLL_MS = 5000;   // 5s pour réduire la charge
  readonly MAX_MS  = 30000;  // 30s max

  sessionId = '';
  loading = true;
  lookup?: CheckoutLookup;
  private pollingStarted = false; // anti-double démarrage

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: MessageService,
    private pay: PaiementService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';
    if (!this.sessionId) {
      this.loading = false;
      this.toast.add({ severity: 'warn', summary: 'Session manquante', detail: 'session_id absent.' });
      this.router.navigate(['/dashboard/send'], { replaceUrl: true });
      return;
    }

    if (this.pollingStarted) return; // empêche tout double démarrage
    this.pollingStarted = true;

    const stop$ = merge(this.destroy$, timer(this.MAX_MS));

    interval(this.POLL_MS)
      .pipe(
        startWith(0),                  // tir immédiat
        takeUntil(stop$),              // arrêt auto (leave page / timeout)
        switchMap(() => this.pay.getCheckoutStatus(this.sessionId)),
        map(res => res.data),
        distinctUntilChanged(
          (a, b) => a?.status === b?.status && a?.transfert_id === b?.transfert_id
        ),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (lookup) => {
          this.lookup = lookup;

          const done =
            !!lookup?.transfert_id ||
            lookup?.status === 'succeeded' ||
            lookup?.processed_at != null;

          const failed =
            lookup?.status === 'canceled' ||
            lookup?.status === 'requires_payment_method' ||
            lookup?.status === 'requires_payment';

          if (done) {
            this.destroy$.next(); // stop
            this.toast.add({ severity: 'success', summary: 'Transfert créé', detail: 'Votre transfert est disponible.', life: 2500 });
            if (lookup?.transfert_id) {
              this.router.navigate(['/dashboard/transfert/detail', lookup.transfert_id], { replaceUrl: true });
            }
          } else if (failed) {
            this.destroy$.next(); // stop
            this.toast.add({ severity: 'warn', summary: 'Paiement non finalisé', detail: 'Annulé ou refusé.' });
            this.router.navigate(['/dashboard/send'], { replaceUrl: true });
          }
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Erreur de récupération.';
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: msg });
          this.destroy$.next(); // stop sur erreur
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
