import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { Transfert } from '../../models/transfert';

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
export class TransfertService {
    private apiUrl = `${environment.apiUrl}/transferts`;

    constructor(private http: HttpClient) {}

    private log(log: string) {
        console.info(log);
    }

    /**
     * ✅ Nouvelle gestion des erreurs améliorée
     */
    private handleError(error: HttpErrorResponse) {
        console.error('Erreur API:', error);

        let errorMessage = 'Une erreur inconnue est survenue';
        let validationErrors: { [key: string]: string[] } = {};

        if (error.error instanceof ErrorEvent) {
            // Erreur côté client
            errorMessage = `Erreur client : ${error.error.message}`;
        } else {
            // Erreur côté serveur
            switch (error.status) {
                case 400:
                    errorMessage = error.error.message || 'Requête invalide.';
                    break;
                case 404:
                    errorMessage = 'Transfert non trouvé. Vérifiez le code.';
                    break;
                case 422:
                    errorMessage = 'Validation échouée. Vérifiez les champs.';
                    if (error.error && error.error.data) {
                        validationErrors = error.error.data;
                    }
                    break;
                case 0:
                    errorMessage =
                        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
                    break;
                default:
                    errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
            }
        }

        return throwError(() => ({ message: errorMessage, validationErrors }));
    }

    getTransferts(): Observable<Transfert[]> {
        return this.http.get<{ data: Transfert[] }>(this.apiUrl + '/all').pipe(
            map((response) => response.data),
            catchError(this.handleError)
        );
    }

    getTransfertById(id: number): Observable<Transfert> {
        return this.http
            .get<{ success: boolean; data: Transfert }>(
                `${this.apiUrl}/showById/${id}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    getTransfertByCode(code: String): Observable<Transfert> {
        return this.http
            .get<{ success: boolean; data: Transfert }>(
                `${this.apiUrl}/showByCode/${code}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    createTransfert(transfert: Transfert): Observable<Transfert> {
        return this.http
            .post<Transfert>(`${this.apiUrl}/envoie`, transfert, httpOption)
            .pipe(catchError(this.handleError));
    }

    validerRetrait(
        code: string
    ): Observable<{ success: boolean; message: string; data: Transfert }> {
        return this.http
            .post<{ success: boolean; message: string; data: Transfert }>(
                `${this.apiUrl}/retrait`,
                { code },
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

    updateTransfertByCode(
        code: string,
        transfert: Transfert
    ): Observable<Transfert> {
        return this.http
            .put<Transfert>(
                `${this.apiUrl}/updateByCode/${code}`,
                transfert,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

    updateTransfertById(
        id: number,
        transfert: Transfert
    ): Observable<Transfert> {
        return this.http
            .put<Transfert>(
                `${this.apiUrl}/updateById/${id}`,
                transfert,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

    annulerTransfert(id: number): Observable<void> {
        return this.http
            .post<void>(`${this.apiUrl}/annuler/${id}`, httpOption)
            .pipe(catchError(this.handleError));
    }

    deleteTransfertById(
        id: number
    ): Observable<{ success: boolean; message: string }> {
        return this.http
            .delete<{ success: boolean; message: string }>(
                `${this.apiUrl}/deleteById/${id}`,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

    deleteTransfertByCode(
        code: string
    ): Observable<{ success: boolean; message: string }> {
        return this.http
            .delete<{ success: boolean; message: string }>(
                `${this.apiUrl}/deleteByCode/${code}`,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

    /*   *  méthode statistique global  */
    getStatistiquesGlobales(): Observable<any> {
        return this.http
            .get<{ success: boolean; data: any }>(
                `${this.apiUrl}/statistiques/globales`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    /*   *  méthode statistique par agence  */
   /* getStatistiquesParAgence(): Observable<any> {
        return this.http
            .get<{ success: boolean; data: any }>(
                `${this.apiUrl}/transferts/statistiques/agence`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }*/
}
