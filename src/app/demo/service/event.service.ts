import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class EventService {
    private apiUrl = 'http://127.0.0.1:8000/api/agences'; // Remplacez par l'URL de votre API

    constructor(private http: HttpClient) { }

    getEvents() {
        return this.http.get<any>('assets/demo/data/scheduleevents.json')
            .toPromise()
            .then(res => res.data as any[])
            .then(data => data);
    }
 
  getAgences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
