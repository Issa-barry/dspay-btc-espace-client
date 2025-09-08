import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Agence } from '../../models/agence';
import { environment } from 'src/environements/environment.dev';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AgenceService {
  private apiUrl = `${environment.apiUrl}/agences`;

  constructor(private http: HttpClient) {}

  private log(log: string) {
    console.info(log);
  }

  /**
   * ✅ Gestion centralisée des erreurs API
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API (Agence):', error);

    let message = 'Une erreur inconnue est survenue.';
    let validationErrors: { [key: string]: string[] } = {};

    if (error.error instanceof ErrorEvent) {
      message = `Erreur client : ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          message = error.error.message || 'Requête invalide.';
          break;
        case 404:
          message = 'Agence non trouvée.';
          break;
        case 422:
          message = 'Des champs sont invalides.';
          if (error.error?.data) {
            validationErrors = error.error.data;
          }
          break;
        case 0:
          message = 'Connexion impossible. Vérifiez votre réseau.';
          break;
        default:
          message = `Erreur serveur ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => ({ message, validationErrors }));
  }

  getAgences(): Observable<Agence[]> {
    return this.http.get<{ data: Agence[] }>(`${this.apiUrl}/all`).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  getAgenceById(id: number): Observable<Agence> {
    return this.http
      .get<{ success: boolean; data: Agence }>(`${this.apiUrl}/getById/${id}`)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  // agence.service.ts
getAgenceByReference(reference: string): Observable<Agence> {
    return this.http.get<{ success: boolean; data: Agence }>(
        `${this.apiUrl}/getByReference/${reference}`
    ).pipe(
        map(response => response.data),
        catchError(this.handleError)
    );
}


  createAgence(agence: Agence): Observable<Agence> {
    return this.http
      .post<Agence>(`${this.apiUrl}/create`, agence, httpOption)
      .pipe(catchError(this.handleError));
  }

  updateAgence(id: number, agence: Agence): Observable<Agence> {
    return this.http
      .put<Agence>(`${this.apiUrl}/updateById/${id}`, agence, httpOption)
      .pipe(catchError(this.handleError));
  }

  deleteAgence(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/deleteById/${id}`, httpOption)
      .pipe(catchError(this.handleError));
  }

  updateStatut(id: number, statut: 'active' | 'attente' | 'bloque' | 'archive'): Observable<Agence> {
  return this.http
    .patch<{ success: boolean; data: Agence }>(
      `${this.apiUrl}/${id}/statutUpdate`,
      { statut },
      httpOption
    )
    .pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
}

}
