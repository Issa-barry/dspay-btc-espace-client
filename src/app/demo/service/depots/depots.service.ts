import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { Depot } from '../../models/depots';
 
export type DepotCreateDto = {
  serviceId: string;
  montant_envoye: number;   // € (decimal)
  amount: number;           // GNF (entier)
  customerPhoneNumber: string;
  fieldName: string;
  recipientTel?: string | null;
  accountId?: string | null;
};

export type DepotUpdateDto = Partial<DepotCreateDto> & {
  status?: 'pending' | 'success' | 'failed';
};

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class DepotService {
  private apiUrl = `${environment.apiUrl}/depots`;

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
          errorMessage = error.error?.message || 'Ressource introuvable.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation échouée. Vérifiez les champs.';
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

  /** Liste (compat plusieurs formats de réponse) */
  getAll(): Observable<Depot[]> {
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      map((res) => {
        if (res?.data?.items) return res.data.items as Depot[];
        if (Array.isArray(res?.data)) return res.data as Depot[];
        if (Array.isArray(res)) return res as Depot[];
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /** Liste des dépôts de l’utilisateur connecté */
  getByAuthUser(): Observable<Depot[]> {
    return this.http.get<any>(`${this.apiUrl}/by-user`).pipe(
      map((res) => {
        if (res?.data?.items) return res.data.items as Depot[];
        if (Array.isArray(res?.data)) return res.data as Depot[];
        if (Array.isArray(res)) return res as Depot[];
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /** Détail par id (si exposé côté API) */
  getById(id: number): Observable<Depot> {
    return this.http
      .get<{ success: boolean; data: Depot }>(`${this.apiUrl}/showById/${id}`)
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Détail par référence (ex: DSP-YYYYMMDD-0001) si exposé côté API */
  getByRef(ref: string): Observable<Depot> {
    return this.http
      .get<{ success: boolean; data: Depot }>(`${this.apiUrl}/showByRef/${encodeURIComponent(ref)}`)
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Création (conforme à POST /api/v1/depots) */
  create(payload: DepotCreateDto): Observable<Depot> {
    return this.http
      .post<{ success: boolean; message: string; data: Depot }>(`${this.apiUrl}`, payload, httpOption)
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Mise à jour par id (si endpoint existant) */
  updateById(id: number, payload: DepotUpdateDto): Observable<Depot> {
    return this.http
      .put<{ success: boolean; data: Depot }>(`${this.apiUrl}/updateById/${id}`, payload, httpOption)
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Mise à jour par référence (si endpoint existant) */
  updateByRef(ref: string, payload: DepotUpdateDto): Observable<Depot> {
    return this.http
      .put<{ success: boolean; data: Depot }>(`${this.apiUrl}/updateByRef/${encodeURIComponent(ref)}`, payload, httpOption)
      .pipe(map((r) => r.data), catchError(this.handleError));
  }

  /** Suppression par id (si endpoint existant) */
  deleteById(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/deleteById/${id}`, httpOption)
      .pipe(catchError(this.handleError));
  }

  /** Suppression par référence (si endpoint existant) */
  deleteByRef(ref: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/deleteByRef/${encodeURIComponent(ref)}`, httpOption)
      .pipe(catchError(this.handleError));
  }
}
