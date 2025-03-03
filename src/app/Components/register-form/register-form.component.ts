import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../Services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  roles = [
    { label: 'Patient', value: 'ROLE_PATIENT' },
    { label: 'Doctor', value: 'ROLE_DOCTOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' }
  ];

  fieldConfig: Record<string, { type: string; placeholder: string; validators: any[]; errors: Record<string, string>; options?: string[] }> = {
    name: { type: 'text', placeholder: 'Enter full name', validators: [Validators.required, Validators.minLength(3)], errors: { required: 'Name is required', minlength: 'Name must be at least 3 characters' } },
    email: { type: 'email', placeholder: 'Enter email address', validators: [Validators.required, Validators.email], errors: { required: 'Email is required', email: 'Enter a valid email' } },
    password: { type: 'password', placeholder: 'Enter password', validators: [Validators.required, Validators.minLength(6)], errors: { required: 'Password is required', minlength: 'Password must be at least 6 characters' } },
    confirmPassword: { type: 'password', placeholder: 'Confirm password', validators: [Validators.required], errors: { required: 'Password confirmation is required' } },
    mobileNo: { type: 'text', placeholder: 'Enter phone number', validators: [Validators.required, Validators.pattern(/^\d{10}$/)], errors: { required: 'Phone is required', pattern: 'Enter a valid 10-digit phone number' } },
    address: { type: 'text', placeholder: 'Enter home address', validators: [Validators.required], errors: { required: 'Address is required' } },
    specialization: { type: 'text', placeholder: 'Enter specialization', validators: [Validators.required], errors: { required: 'Specialization is required' } },
    age: { type: 'number', placeholder: 'Enter age', validators: [Validators.required, Validators.min(1), Validators.max(120)], errors: { required: 'Age is required', min: 'Age must be at least 1', max: 'Age cannot exceed 120' } },
    gender: { type: 'select', placeholder: 'Select gender', validators: [Validators.required], errors: { required: 'Gender is required' }, options: ['Male', 'Female'] }
  };

  roleFields: Record<string, string[]> = {
    ROLE_PATIENT: ['name', 'email', 'password', 'confirmPassword', 'mobileNo', 'address', 'age', 'gender'],
    ROLE_DOCTOR: ['name', 'email', 'password', 'confirmPassword', 'mobileNo', 'specialization'],
    ROLE_ADMIN: ['name', 'email', 'password', 'confirmPassword', 'mobileNo']
  };

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private router : Router) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      roleName: ['ROLE_PATIENT', Validators.required]
    });

    this.registerForm.get('roleName')?.valueChanges.subscribe(role => this.updateFormFields(role));
    this.updateFormFields('ROLE_PATIENT');
  }

  updateFormFields(role: string) {
    Object.keys(this.registerForm.controls).forEach(key => {
      if (key !== 'roleName') {
        this.registerForm.removeControl(key);
      }
    });

    this.roleFields[role].forEach(field => {
      this.registerForm.addControl(field, this.fb.control('', this.fieldConfig[field].validators));
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    console.log(this.registerForm.value);
    
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (response: any) => {
        console.log('Registration Successful', response.user);
        this.isLoading = false;
        this.authService.setAuthToken(response.token);
          localStorage.setItem('role',response.role);
          this.authService.setAuthenticated(true);
        let redirectUrl = localStorage.getItem('redirectUrl') || '/profile';
        console.log(redirectUrl);
        
        this.router.navigate([redirectUrl]);

      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error?.message || 'Registration failed!';
        this.isLoading = false;
      }
    });
  }
}
