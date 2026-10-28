import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  catchError,
  map,
  switchMap,
  tap,
  throwError
} from 'rxjs';

export interface AuthResponse {
  username: string;
  roles: string[];
}

interface CsrfResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  readonly currentUser = signal<AuthResponse | null>(null);

  private refreshCsrfToken(): Observable<void> {
    return this.http
      .get<CsrfResponse>(`${this.apiUrl}/csrf`)
      .pipe(map(() => undefined));
  }

  login(
    username: string,
    password: string
  ): Observable<AuthResponse> {

    // Obtain a CSRF cookie before attempting login.
    return this.refreshCsrfToken().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(
          `${this.apiUrl}/login`,
          { username, password }
        )
      ),
      tap(user => this.currentUser.set(user)),

      // A fresh token is needed after successful authentication.
      switchMap(user =>
        this.refreshCsrfToken().pipe(map(() => user))
      ),

      catchError(error => {
        this.currentUser.set(null);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => this.currentUser.set(user)),
        catchError(error => {
          this.currentUser.set(null);
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => this.currentUser.set(null)),
        switchMap(() => this.refreshCsrfToken())
      );
  }
}