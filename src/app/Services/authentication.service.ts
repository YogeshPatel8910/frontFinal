import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  name: string;
  password: string;
}

interface LoginResponse {
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private token: string | null = null;

  
  private apiUrl = 'http://localhost:8081/api/auth/login';  // Replace with your Spring Boot URL

  constructor(private http: HttpClient) {}
  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken',token);

  }
  getAuthToken() {
    return this.token || localStorage.getItem('authToken');
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, loginRequest);
  }
}
