import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environements/environment.dev';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevisesService {
  private apiUrl = `${environment.apiUrl}/devises`;

  constructor(private http: HttpClient) {}

  private log(log: string) {
    console.info(log);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getDevises(): Observable<any[]> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/all`).pipe(
      map(response => response.data), // Extraire les données de la réponse
      catchError(this.handleError('getDevises', [])) // Gérer les erreurs
    );
  }
}
