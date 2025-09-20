import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { Transfert } from '../../models/transfert';

export type TransfertCreateDto = {
  beneficiaire_id: number;
  taux_echange_id: number;
  montant_envoie: number;
};

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // Ces entêtes CORS ne sont pas nécessaires côté client, tu peux les retirer :
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT,PATCH',
  }),
};

@Injectable({ providedIn: 'root' })
export class TransfertService {
  private apiUrl = `${environment.apiUrl}/transferts`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);

    let errorMessage = 'Une erreur inconnue est survenue';
    let validationErrors: Record<string, string[]> = {};

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Requête invalide.';
          break;
        case 401:
          errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
          break;
        case 404:
          errorMessage = error.error?.message || 'Transfert non trouvé.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation échouée. Vérifiez les champs.';
          // Compat : ton backend peut renvoyer data{field:[...]} ou errors{field:[...]}
          validationErrors =
            (error.error?.data && typeof error.error.data === 'object'
              ? error.error.data
              : (error.error?.errors && typeof error.error.errors === 'object'
                  ? error.error.errors
                  : {}));
          break;
        case 0:
          errorMessage = 'Impossible de se connecter au serveur.';
          break;
        default:
          errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => ({ message: errorMessage, validationErrors }));
  }

  /** Liste (si ton endpoint renvoie {success, data: {items, meta}} ou bien {data: Transfert[]} ) */
  getTransferts(): Observable<Transfert[]> {
    return this.http
      .get<any>(`${this.apiUrl}/all`)
      .pipe(
        map((res) => {
          // Compat de formats possibles
          if (res?.data?.items) return res.data.items as Transfert[];
          if (Array.isArray(res?.data)) return res.data as Transfert[];
          if (Array.isArray(res)) return res as Transfert[];
          return [];
        }),
        catchError(this.handleError)
      );
  }

    getByUserAuth(): Observable<Transfert[]> {
    return this.http
      .get<any>(`${this.apiUrl}/by-user`)
      .pipe(
        map((res) => {
          // Compat de formats possibles
          if (res?.data?.items) return res.data.items as Transfert[];
          if (Array.isArray(res?.data)) return res.data as Transfert[];
          if (Array.isArray(res)) return res as Transfert[];
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getTransfertById(id: number): Observable<Transfert> {
    return this.http
      .get<{ success: boolean; data: Transfert }>(`${this.apiUrl}/showById/${id}`)
      .pipe(map((response) => response.data), catchError(this.handleError));
  }

  getTransfertByCode(code: string): Observable<Transfert> {
    return this.http
      .get<{ success: boolean; data: Transfert }>(`${this.apiUrl}/showByCode/${code}`)
      .pipe(map((response) => response.data), catchError(this.handleError));
  }

  /** ✅ Nouvelle création conforme au backend refactoré */
  createTransfert(payload: TransfertCreateDto): Observable<Transfert> {
    return this.http
      .post<{ success: boolean; message: string; data: Transfert }>(`${this.apiUrl}/envoie`, payload, httpOption)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Valider un retrait par code (si endpoint existant) */
  validerRetrait(code: string): Observable<{ success: boolean; message: string; data: Transfert }> {
    return this.http
      .post<{ success: boolean; message: string; data: Transfert }>(
        `${this.apiUrl}/retrait`,
        { code },
        httpOption
      )
      .pipe(catchError(this.handleError));
  }

  /** Update par code (si endpoint existant) */
  updateTransfertByCode(code: string, transfert: Partial<Transfert>): Observable<Transfert> {
    return this.http
      .put<{ success: boolean; data: Transfert }>(
        `${this.apiUrl}/updateByCode/${code}`,
        transfert,
        httpOption
      )
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Update par id (si endpoint existant) */
  updateTransfertById(id: number, transfert: Partial<Transfert>): Observable<Transfert> {
    return this.http
      .put<{ success: boolean; data: Transfert }>(
        `${this.apiUrl}/updateById/${id}`,
        transfert,
        httpOption
      )
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Annulation (pense à body {} pour ne pas envoyer les headers en body) */
  annulerTransfert(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiUrl}/annuler/${id}`, {}, httpOption)
      .pipe(catchError(this.handleError));
  }

  deleteTransfertById(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/deleteById/${id}`, httpOption)
      .pipe(catchError(this.handleError));
  }

  deleteTransfertByCode(code: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/deleteByCode/${code}`, httpOption)
      .pipe(catchError(this.handleError));
  }

  /* Statistiques globales */
  getStatistiquesGlobales(): Observable<any> {
    return this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/statistiques/globales`)
      .pipe(map((response) => response.data), catchError(this.handleError));
  }
}
