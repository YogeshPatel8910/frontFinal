import { Component } from '@angular/core';
import { AuthenticationService } from './Services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { first, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
[x: string]: any;
  title = 'frontend';
  isAuthenticated: boolean = false;
  showLoginForm: boolean = false;

  constructor(private authService: AuthenticationService,private http:HttpClient,private router:Router) {
    this.authService=authService
  }

  
  onLoginSuccess(){
    this.isAuthenticated = true;
    this.showLoginForm = false;
  }
    // Subscribe to the observable returned by validateToken
  ngOnInit(): void {
      // Check if the login form should be displayed
      this.authService.validateToken().pipe(first()).subscribe({
        next: (isValid: boolean) => {
          this.isAuthenticated = isValid;
          // If the user is not authenticated, show the login form
          if (!this.isAuthenticated) {
            localStorage.setItem('redirectUrl', this.router.url);
            
            this.showLoginForm = true;
          }
        },
        error: () => {
          // If error in token validation, consider the user as not authenticated
          this.isAuthenticated = false;
          this.showLoginForm = true;
        }
      });  
      // Remove the flag once the form is shown
   // localStorage.removeItem('showLoginForm');
  }
  
  get getAuthService() {
    return this.authService;
  }
}
