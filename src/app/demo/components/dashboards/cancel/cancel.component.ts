import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cancel',
  standalone: false,
  templateUrl: './cancel.component.html',
  styleUrl: './cancel.component.scss'
})
export class CancelComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('order_id');
    const cancelToken = this.route.snapshot.queryParamMap.get('cancel_token');

    if (orderId && cancelToken) {
      this.http.get(`http://127.0.0.1:8000/api/payments/stripe/checkout-session/cancel`, {
        params: { order_id: orderId, cancel_token: cancelToken }
      }).subscribe({
        next: (res) => console.log('Annulation enregistrée côté serveur', res),
        error: (err) => console.error('Erreur d’annulation', err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/send']);
  }
}