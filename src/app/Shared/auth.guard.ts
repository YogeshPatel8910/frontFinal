// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../Services/authentication.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        localStorage.setItem('redirectUrl', state.url);
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};