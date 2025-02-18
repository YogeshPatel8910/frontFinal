import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from './Services/authentication.service';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAuthToken();
    
    // Clone the request and add the token if available
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }

  // Handle 401 Unauthorized errors
  catchError(error: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (error.status === 401) {
      // Store the attempted URL before showing login form
      localStorage.setItem('redirectUrl', this.router.url);

      localStorage.setItem('showLoginForm', 'true');
    }

    return throwError(() => error);
  }
}
