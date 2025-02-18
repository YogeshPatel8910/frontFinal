import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../../Services/authentication.service';
import { first } from 'rxjs';
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
    // Check if the input contains '@' to determine if it's an email
    if (loginInput.includes('@')) {
      this.loginType = 'email';
    } else {
      this.loginType = 'username';
    }
  }

  async onSubmit(loginForm: NgForm) {
    if (loginForm.valid) {
      const loginData = loginForm.value;
      // debugger
      // Call the AuthService to authenticate the user
      this.authService.login(loginData)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.authService.setAuthToken(response.token);
          const redirectUrl = localStorage.getItem('redirectUrl') || '/profile';
          localStorage.removeItem('redirectUrl');
          console.log(redirectUrl);
          console.log(localStorage.getItem('redirectUrl'))
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

