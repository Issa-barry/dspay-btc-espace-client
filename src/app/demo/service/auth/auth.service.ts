import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';
import { Router } from '@angular/router';
import { TokenService } from '../token/token.service';
import { Contact } from '../../models/contact';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // ⚠️ Ne pas mettre d’en-têtes Access-Control-* côté front
  }),
};

export interface CreateClientDto {
  email: string; phone: string; password: string; password_confirmation: string;
}
export interface ApiResponse<T = any> { success: boolean; message: string; data?: T | null; }
export interface ClientCreated { id: number; email: string; phone: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  /** ✅ état typé Contact */
  private currentUserSubject: BehaviorSubject<Contact | null>;
  public  currentUser$: Observable<Contact | null>;
  private userId = '';

  constructor(
    public router: Router,
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    /** ✅ on restaure l’utilisateur si présent */
    const saved = localStorage.getItem('current_user');
    this.currentUserSubject = new BehaviorSubject<Contact | null>(
      saved ? JSON.parse(saved) as Contact : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /** ✅ renvoie la valeur courante (pas l’Observable) */
  public get currentUserValue(): Contact | null {
    return this.currentUserSubject.value;
  }
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
  /** Login: stocke token + user */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, httpOption).pipe(
      tap((response) => {
        // token
        this.tokenService.storeToken(response.access_token);

        // user (typé Contact) renvoyé par le backend
        const user: Contact = response.user as Contact;

        this.userId = String(user.id);
        localStorage.setItem('user_id', this.userId);

        // ✅ on garde l’objet utilisateur en mémoire
        this.currentUserSubject.next(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      })
      // ,catchError(this.handleError)
       ,catchError(this.handleError)
    );
  }

  /** Profil utilisateur connecté */
  getMe(): Observable<Contact> {
    return this.http
      .get<{ success: boolean; data: Contact }>(`${this.apiUrl}/users/me`)
      .pipe(
        map(res => res.data),
        tap((user: Contact) => {
          this.currentUserSubject.next(user);
          localStorage.setItem('current_user', JSON.stringify(user));
          if (user?.id) localStorage.setItem('user_id', String(user.id));
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearToken();
        this.currentUserSubject.next(null);
        localStorage.removeItem('user_id');
        localStorage.removeItem('current_user'); // ✅ important
        this.router.navigate(['/auth/login']);
      }),
      catchError(this.handleError)
    );
  }

  toCreateDto(contact: Contact): CreateClientDto {
    return {
      email: contact.email?.trim() ?? '',
      phone: contact.phone?.trim() ?? '',
      password: contact.password ?? '',
      password_confirmation: contact.password_confirmation ?? '',
    };
  } 

  // register(payload: CreateClientDto): Observable<Contact> {
  //   return this.http.post<ApiResponse<ClientCreated>>(
  //     `${this.apiUrl}/users/clients/create`, payload, httpOption)
  //     .pipe(map((res) => res.data), catchError(this.handleError));
  // }

    register(payload: Contact): Observable<Contact> {
      return this.http
        .post<{ success: boolean; data: Contact }>(`${this.apiUrl}/users/clients/create`, payload, httpOption)
        .pipe(map(res => res.data));;
    }
  

  isAuthenticated(): boolean { return this.tokenService.hasToken(); }
  getUserInfo(): Contact | null { return this.currentUserValue; }
  setUserId(id: string) { this.userId = id; }
  getUserId() { return localStorage.getItem('user_id'); }

  verifyToken(): Observable<boolean> {
    return this.tokenService.verifyToken().pipe(
      map((isValid) => {
        if (!isValid) {
          this.currentUserSubject.next(null);
          localStorage.removeItem('current_user');
          this.router.navigate(['/auth/login']);
        }
        return isValid;
      })
    );
  }
}