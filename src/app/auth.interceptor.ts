import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './Services/authentication.service';  // Make sure to import your AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAuthToken();
    console.log(localStorage.getItem('authToken'))
    console.log(token)
    if (token) {
      // Clone the request and set the Authorization header
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
