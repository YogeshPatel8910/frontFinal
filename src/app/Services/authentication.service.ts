// authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  expiresIn?: number;
  userId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  userId: string | null;
  expiresAt: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = 'http://192.168.0.72:8081/api/auth/';
  private tokenExpirationTimer: any;

  // Auth state management with BehaviorSubject
  private authStateSubject = new BehaviorSubject<AuthState>(this.loadAuthState());
  authState$ = this.authStateSubject.asObservable();
  
  // Convenience observables
  isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  userRole$ = this.authState$.pipe(map(state => state.role));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check token validity on service initialization
    this.checkTokenValidity();
  }

  // Load auth state from localStorage
  private loadAuthState(): AuthState {
    const token = localStorage.getItem('authToken');
    const expiresAt = localStorage.getItem('expiresAt');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    const isTokenValid = token && expiresAt && new Date().getTime() < parseInt(expiresAt);
    
    return {
      isAuthenticated: !!isTokenValid,
      token: isTokenValid ? token : null,
      role: isTokenValid ? role : null,
      userId: isTokenValid ? userId : null,
      expiresAt: isTokenValid ? parseInt(expiresAt) : null
    };
  }

  // Save auth state to localStorage
  private saveAuthState(state: AuthState): void {
    if (state.isAuthenticated && state.token && state.expiresAt) {
      localStorage.setItem('authToken', state.token);
      localStorage.setItem('expiresAt', state.expiresAt.toString());
      if (state.role) localStorage.setItem('userRole', state.role);
      if (state.userId) localStorage.setItem('userId', state.userId);
    } else {
      this.clearAuthData();
    }
    
    this.authStateSubject.next(state);
  }

  // Check if token is still valid and manage auto-logout
  private checkTokenValidity(): void {
    const currentState = this.authStateSubject.value;
    
    if (currentState.isAuthenticated && currentState.expiresAt) {
      const expiresIn = currentState.expiresAt - new Date().getTime();
      
      if (expiresIn <= 0) {
        // Token expired
        this.logout();
      } else {
        // Set auto-logout timer
        this.setAutoLogoutTimer(expiresIn);
      }
    }
  }

  // Set timer for auto logout when token expires
  private setAutoLogoutTimer(expiresIn: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expiresIn);
  }

  // Clear all auth data
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authStateSubject.value.token;
  }

  // Get current user role
  getUserRole(): string | null {
    return this.authStateSubject.value.role;
  }

  // Login method
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, loginRequest)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  // Register method
  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, registerRequest)
      .pipe(catchError(this.handleError));
  }

  // Handle successful authentication
  private handleAuthentication(response: LoginResponse): void {
    const { token, role, expiresIn = 3600, userId = null } = response;
    
    // Calculate expiration timestamp
    const expiresAt = new Date().getTime() + expiresIn * 1000;
    
    // Update auth state
    this.saveAuthState({
      isAuthenticated: true,
      token,
      role,
      userId,
      expiresAt
    });
    
    // Set auto-logout timer
    this.setAutoLogoutTimer(expiresIn * 1000);
    
    // Navigate to redirect URL if available
    const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
    localStorage.removeItem('redirectUrl');
    this.router.navigateByUrl(redirectUrl);
  }

  // Logout method
  logout(): void {
    // Update auth state
    this.saveAuthState({
      isAuthenticated: false,
      token: null,
      role: null,
      userId: null,
      expiresAt: null
    });
    
    // Clear all auth data
    this.clearAuthData();
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Handle specific error codes
      if (error.status === 401) {
        errorMessage = 'Authentication failed! Please check your credentials.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  setAuthToken(token: string) {
    const currentState = this.authStateSubject.value;
    // Default expiration to 1 hour if not available
    const expiresAt = new Date().getTime() + 3600 * 1000;
    
    this.saveAuthState({
      ...currentState,
      isAuthenticated: true,
      token,
      expiresAt
    });
  }
  // Compatibility method for legacy code
setAuthenticated(value: boolean) {
  const currentState = this.authStateSubject.value;
  
  if (value === false) {
    // If setting to false, clear authentication
    this.logout();
  } else if (value === true && currentState.token) {
    // If setting to true and we have a token, update state
    this.saveAuthState({
      ...currentState,
      isAuthenticated: true
    });
  }
}
}