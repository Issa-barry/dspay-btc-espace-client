import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private apiUrl = `${environment.apiUrl}`;
  private tokenSubject: BehaviorSubject<string | null>;
  public token$: Observable<string | null>;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('access_token');
    this.tokenSubject = new BehaviorSubject<string | null>(token);
    this.token$ = this.tokenSubject.asObservable();
  }

  /**
   * Store the token securely in localStorage and update the BehaviorSubject.
   * @param token Token to store
   */
  storeToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.tokenSubject.next(token);
  }

  /**
   * Remove the token from localStorage and clear the BehaviorSubject.
   */
  clearToken(): void {
    localStorage.removeItem('access_token');
    this.tokenSubject.next(null);
  }

  /**
   * Get the current token value from the BehaviorSubject.
   * @returns Current token or null if not available
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Verify the token's validity with the backend.
   * @returns Observable<boolean> indicating if the token is valid
   */
  verifyToken(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      console.warn('No token found in localStorage.');
      return of(false);
    }

    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/verify-token`).pipe(
      map((response) => {
        if (response.valid) {
          console.log('Token is valid.');
          return true;
        } else {
          this.clearToken();
          console.warn('Token is invalid or expired.');
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error verifying token:', error);
        this.clearToken();
        return of(false);
      })
    );
  }

  /**
   * Check if a token exists and is not null.
   * @returns boolean
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
}
