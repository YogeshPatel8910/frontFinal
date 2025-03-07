import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../Services/authentication.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        localStorage.setItem('redirectUrl', state.url);
        router.navigate(['/login'])
        return false;
      }
      return true;
    }),
    catchError((err) => {
      localStorage.setItem('redirectUrl', state.url);
      router.navigate(['/login']);
      return of(false); 
    })
  );
};