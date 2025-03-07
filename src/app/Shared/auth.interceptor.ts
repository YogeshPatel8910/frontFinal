import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../Services/authentication.service';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAuthToken();
    
    if (token) {
      this.authService.setAuthenticated(true);
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }

  catchError(error: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (error.status === 401) {
      
      localStorage.setItem('redirectUrl', this.router.url);
    }

    return throwError(() => error);
  }
}
