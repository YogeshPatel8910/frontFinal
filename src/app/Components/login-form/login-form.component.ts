import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../Services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      loginInput: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get loginInputType(): string {
    const value = this.loginForm.get('loginInput')?.value || '';
    return value.includes('@') ? 'email' : 'username';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginData = {
      name: this.loginForm.value.loginInput,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.authService.setAuthToken(response.token);
        localStorage.setItem('role', response.role);
        this.authService.setAuthenticated(true);
        
        const redirectUrl = localStorage.getItem('redirectUrl') || '/profile';
        localStorage.removeItem('redirectUrl');
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.errorMessage = error.status === 401 
          ? 'Invalid credentials. Please try again.' 
          : 'An error occurred. Please try again later.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}