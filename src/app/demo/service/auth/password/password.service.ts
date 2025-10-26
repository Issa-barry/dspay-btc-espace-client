// src/app/services/password/password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';

const httpOption = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    }),
};

@Injectable({ providedIn: 'root' })
export class PasswordService {
    private apiUrl = `${environment.apiUrl}`;

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
    

    sendResetPasswordLink(email: string): Observable<any> {
        return this.http
            .post<any>(
                `${this.apiUrl}/sendResetPasswordLink`,{ email }, httpOption)
            .pipe(map((response) => {
                    return response;}));
    }

    //     sendResetPasswordLink(email: string): Observable<any> {
    //     return this.http
    //         .post<any>(
    //             `${this.apiUrl}/sendResetPasswordLink`,{ email }, httpOption)
    //         .pipe(map((response) => {
    //                 return response;}));
    // }

    resetPassword(data: {
        email: string;
        token: string;
        password: string;
        password_confirmation: string;
    }): Observable<any> {
        return this.http
            .post<any>(`${this.apiUrl}/ResetPassword`, data, httpOption)
            .pipe(map((response) => {return response;}));
    }
}
 