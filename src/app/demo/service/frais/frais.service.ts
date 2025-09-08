import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { Frais } from '../../models/Frais';


const httpOption = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
   
  })
}; 

@Injectable({
  providedIn: 'root'
})
export class FraisService {
   private apiUrl = `${environment.apiUrl}/frais`;

  constructor(private http: HttpClient) { }

    private log(log: string){
      console.info(log)
    }
  
     private handleError<T>(operation = 'operation', result?: T) {
       return (error: any): Observable<T> => {
         console.error(error);
         this.log(`${operation} failed: ${error.message}`);
         return of(result as T);
       };
     }
  
     getAllFrais(): Observable<Frais[]> {
         return this.http.get<{ data: Frais[] }>(this.apiUrl+'/all').pipe(
           map(response => response.data),
          //  catchError(this.handleError)
         );
       }
     
  
      getFraisById(id: number): Observable<Frais> {
           return this.http.get<{ success: boolean, data: Frais }>(`${this.apiUrl}/getById/${id}`).pipe(
             map(response => response.data),
             // catchError(this.handleError)
           );
         }
  
      //      deleteFraisById(id: number): Observable<{ success: boolean; message: string }> {
      //        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/deleteById/${id}`, httpOption).pipe(
      //         //  catchError(this.handleError)
      //        );
      //      }
}
