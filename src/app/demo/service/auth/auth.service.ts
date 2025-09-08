import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';
import { Router } from '@angular/router';
import { TokenService } from '../token/token.service';

//Hedaer Option
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
export class AuthService {
    private apiUrl = `${environment.apiUrl}`;
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    private userId = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private tokenService: TokenService
    ) {
        const storedUser = localStorage.getItem('access_token');
        this.currentUserSubject = new BehaviorSubject<any>(
            storedUser ? { access_token: storedUser } : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUser;
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Erreur API:', error);
        let errorMessage = 'Une erreur inconnue est survenue';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erreur client : ${error.error.message}`; 

        } else {
            switch (error.status) {
                case 400:
                    errorMessage =
                        'Requête invalide. Vérifiez vos informations.';
                    break;
                case 401:
                    errorMessage =
                        'Identifiants incorrects. Vérifiez votre email et mot de passe.';
                    break;
                case 403:
                    errorMessage = 'Accès refusé. Contactez l’administrateur.';
                    break;
                case 500:
                    errorMessage =
                        'Erreur interne du serveur. Réessayez plus tard.';
                    break;
                case 0:
                    errorMessage =
                        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
                    break;
                default:
                    errorMessage = `Erreur ${error.status}: ${error.message}`;
            }
        }

        return throwError(() => new Error(errorMessage));
    }

    login(credentials: { email: string; password: string }): Observable<any> {
        return this.http
            .post<any>(`${this.apiUrl}/login`, credentials, httpOption)
            .pipe(
                map((response) => {
                    this.tokenService.storeToken(response.access_token);
                    this.userId = response.user.id;
                    this.setUserId(this.userId);
                    localStorage.setItem('user_id', this.userId);
                    this.currentUserSubject.next({
                        access_token: response.access_token,
                    });
                    return response;
                }),
                // catchError(this.handleError)
            );
    }
 
    logout(): Observable<any> {
        
        return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
            map(() => {
                this.tokenService.clearToken();
                this.currentUserSubject.next(null);
                localStorage.removeItem('user_id');
                this.router.navigate(['/auth/login']);
            }),
            catchError(this.handleError) 
        );
    }

    register(user: any): Observable<any> {
        return this.http
            .post<any>(`${this.apiUrl}/users`, user, httpOption)
            .pipe(
                map((response) => {
                    console.log('Inscription réussie :', response);
                    return response;
                })
                // catchError(this.handleError('register', null))
            );
    }

    isAuthenticated(): boolean {
        return this.tokenService.hasToken();
    }

    getUserInfo(): any {
        return this.currentUserValue; // Retourne l'utilisateur actuellement stocké
    }

    setUserId(id: string) {
        this.userId = id;
    }

    getUserId() {
        return localStorage.getItem('user_id');
    }

    verifyToken(): Observable<boolean> {
        return this.tokenService.verifyToken().pipe(
            map((isValid) => {
                if (!isValid) {
                    this.currentUserSubject.next(null);
                    this.router.navigate(['/auth/login']);
                }
                return isValid;
            })
        );
    }

}
