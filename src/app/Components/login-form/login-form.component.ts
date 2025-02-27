import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../../Services/authentication.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginType: string = '';  // Empty by default, will hold either 'email' or 'username'
  errorMessage: string = '';  // For displaying error messages

  constructor(private authService: AuthenticationService,private router:Router) {}
  
  checkLoginType() {
    const loginInput = (document.getElementById('loginInput') as HTMLInputElement).value;
    if (loginInput.includes('@')) {
      this.loginType = 'email';
    } else {
      this.loginType = 'username';
    }
  }

  async onSubmit(loginForm: NgForm) {
    if (loginForm.valid) {
      const loginData = loginForm.value;
      this.authService.login(loginData)
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.authService.setAuthToken(response.token);
          localStorage.setItem('role',response.role);
          this.authService.setAuthenticated(true);
          let redirectUrl = localStorage.getItem('redirectUrl') || '/profile';
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        },
        error: (error) => {
          this.errorMessage = 'Invalid credentials. Please try again.';  // Show error message
          console.error('Login failed', error);
        }
      });
    }
  }
}

