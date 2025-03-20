// role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterState } from '@angular/router';
import { AuthenticationService } from '../Services/authentication.service';
import { map, take } from 'rxjs/operators';
import { LowerCasePipe } from '@angular/common';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  const requiredRole = route.data['requiredRole'];
  
  return authService.authState$.pipe(
    take(1),
    map(authState => {
      // First check if authenticated
      if (!authState.isAuthenticated) {
        localStorage.setItem('redirectUrl', state.url);
        router.navigate(['/login']);
        return false;
      }
      console.log("Required",requiredRole);
      
      // Then check for required role if specified
      if (requiredRole && authState.role !== requiredRole) {
        router.navigate(['/unauthorized']);
        return false;
      }
      
      return true;
    })
  );
};