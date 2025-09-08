// src/app/services/password/password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

    sendResetPasswordLink(email: string): Observable<any> {
        return this.http
            .post<any>(
                `${this.apiUrl}/sendResetPasswordLink`,
                { email },
                httpOption
            )
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    resetPassword(data: {
        email: string;
        token: string;
        password: string;
        password_confirmation: string;
    }): Observable<any> {
        return this.http
            .post<any>(`${this.apiUrl}/ResetPassword`, data, httpOption)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }
}
