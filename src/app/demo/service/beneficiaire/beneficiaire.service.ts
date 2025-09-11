// src/app/demo/service/beneficiaire/beneficiaire.service.ts
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environements/environment.dev';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Beneficiaire } from '../../models/beneficiaire';
import { PaginationMeta } from '../../models/PaginationMeta';


const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT,PATCH',
  }),
};

@Injectable({ providedIn: 'root' })
export class BeneficiaireService {
  private apiUrl = `${environment.apiUrl}/beneficiaires`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      if (error.status === 422) {
        if (error.error?.data && typeof error.error.data === 'object') {
          errorMessage = Object.keys(error.error.data)
            .map((k) => (Array.isArray(error.error.data[k]) ? error.error.data[k].join(' ') : String(error.error.data[k])))
            .join(' ');
        } else if (error.error?.errors) {
          // compat autre format
          const errs = error.error.errors;
          errorMessage = Object.keys(errs).map((k) => errs[k].join(' ')).join(' ');
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      } else if (error.status === 401) {
        errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur';
      } else {
        errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  /** Liste paginée (items + meta) */
  list(opts: { search?: string; page?: number; per_page?: number } = {})
    : Observable<{ items: Beneficiaire[]; meta: PaginationMeta }> {

    let params = new HttpParams();
    if (opts.search) params = params.set('search', opts.search);
    if (opts.page) params = params.set('page', String(opts.page));
    if (opts.per_page) params = params.set('per_page', String(opts.per_page));

    return this.http
      .get<{ success: boolean; data: { items: Beneficiaire[]; meta: PaginationMeta } }>(
        `${this.apiUrl}/all`,
        { params }
      )
      .pipe(
        map((res) => res.data),
        catchError(this.handleError) 
      );
  }

  /** Récupérer un bénéficiaire par id */
  getById(id: number): Observable<Beneficiaire> {
    return this.http
      .get<{ success: boolean; data: Beneficiaire }>(`${this.apiUrl}/getById/${id}`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Créer un bénéficiaire */
  create(payload: Pick<Beneficiaire, 'nom' | 'prenom' | 'phone'>): Observable<Beneficiaire> {
    return this.http
      .post<{ success: boolean; data: Beneficiaire }>(`${this.apiUrl}/create`, payload, httpOption)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Mettre à jour (PATCH partiel) */
  update(id: number, payload: Partial<Pick<Beneficiaire, 'nom' | 'prenom' | 'phone'>>): Observable<Beneficiaire> {
    return this.http
      .patch<{ success: boolean; data: Beneficiaire }>(`${this.apiUrl}/update/${id}`, payload, httpOption)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Version allégée pour dropdown (retourne juste id/label/phone) */
    listForSelect(search = '', limit = 50)
  : Observable<Array<{ id: number; label: string; phone: string }>> {

  return this.list({ search, page: 1, per_page: limit }).pipe(
    map(({ items }) =>
      items
        // garde uniquement ceux qui ont un id numérique
        .filter((b): b is Beneficiaire & { id: number } => typeof b.id === 'number')
        .map((b) => ({
          id: b.id, // ici b.id est garanti number
          label: (b.nom_complet ?? `${b.prenom ?? ''} ${b.nom ?? ''}`).trim(),
          phone: b.phone ?? '',
        }))
    ),
    catchError(this.handleError)
  );
}

}
