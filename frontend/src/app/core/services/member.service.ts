import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SignupRequest, SignupResponse } from '../models/member.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/members`;

  signup(request: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, request).pipe(
      map(response => response),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.status === 409) {
      message = 'This email address is already registered.';
    } else if (error.status === 400) {
      message = error.error?.message ?? 'Please check your form and try again.';
    } else if (error.status === 0) {
      message = 'Unable to connect to the server. Please try again later.';
    }
    return throwError(() => new Error(message));
  }
}
