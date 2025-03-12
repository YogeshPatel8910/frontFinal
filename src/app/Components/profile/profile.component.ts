import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  data: any;
  profileForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  role: string = localStorage.getItem('role') ?? 'ROLE_PATIENT';  // Default to 'ROLE_PATIENT'
  
  roles = [
    { label: 'patient', value: 'ROLE_PATIENT' },
    { label: 'doctor', value: 'ROLE_DOCTOR' },
    { label: 'admin', value: 'ROLE_ADMIN' }
  ];
  
  fieldConfig: Record<string, { 
    type: string; 
    placeholder: string; 
    validators: any[]; 
    errors: Record<string, string>, 
    options?: string[], 
    disabled?: boolean 
  }> = {
    name: { 
      type: 'text', 
      placeholder: 'Enter full name', 
      validators: [Validators.required, Validators.minLength(3)], 
      errors: { 
        required: 'Name is required', 
        minlength: 'Name must be at least 3 characters' 
      }, 
      disabled: true 
    },
    email: { 
      type: 'email', 
      placeholder: 'Enter email address', 
      validators: [Validators.required, Validators.email], 
      errors: { 
        required: 'Email is required', 
        email: 'Enter a valid email' 
      }
    },
    password: { 
      type: 'password', 
      placeholder: 'Enter new password (leave blank to keep current)', 
      validators: [Validators.minLength(6)], 
      errors: { 
        minlength: 'Password must be at least 6 characters' 
      }
    },
    confirmPassword: { 
      type: 'password', 
      placeholder: 'Confirm new password', 
      validators: [], 
      errors: { 
        mismatch: 'Passwords do not match' 
      }
    },
    mobileNo: { 
      type: 'text', 
      placeholder: 'Enter phone number', 
      validators: [Validators.required, Validators.pattern(/^\d{10}$/)], 
      errors: { 
        required: 'Phone is required', 
        pattern: 'Enter a valid 10-digit phone number' 
      }
    },
    address: { 
      type: 'text', 
      placeholder: 'Enter home address', 
      validators: [Validators.required], 
      errors: { 
        required: 'Address is required' 
      }
    },
    specialization: { 
      type: 'text', 
      placeholder: 'Enter specialization', 
      validators: [Validators.required], 
      errors: { 
        required: 'Specialization is required' 
      }
    },
    age: { 
      type: 'number', 
      placeholder: 'Enter age', 
      validators: [Validators.required, Validators.min(1), Validators.max(120)], 
      errors: { 
        required: 'Age is required', 
        min: 'Age must be at least 1', 
        max: 'Age cannot exceed 120' 
      }
    },
    gender: { 
      type: 'select', 
      placeholder: 'Select gender', 
      validators: [Validators.required], 
      errors: { 
        required: 'Gender is required' 
      }, 
      options: ['Male', 'Female', 'Other'] 
    }
  };
  
  roleFields: Record<string, string[]> = {
    ROLE_PATIENT: ['name', 'email', 'mobileNo', 'address', 'age', 'gender', 'password', 'confirmPassword'],
    ROLE_DOCTOR: ['name', 'email', 'mobileNo', 'specialization', 'password', 'confirmPassword'],
    ROLE_ADMIN: ['name', 'email', 'mobileNo', 'password', 'confirmPassword']
  };
  
  isChanged = false;
  isPasswordFieldVisible = false;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.isLoading = true;
    this.apiService.getData()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('Profile data retrieved:', response);
          this.data = response;
          this.initForm(this.data.roleName);
        },
        error: (error) => {
          console.error('Error retrieving profile data:', error);
          this.errorMessage = 'Failed to load profile data. Please try again later.';
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 3000);
        }
      });
  }
  
  initForm(role: string) {
    this.profileForm = this.fb.group({});
    
    // Add regular fields
    this.roleFields[role].forEach(field => {
      if (field === 'confirmPassword') return; // We'll add this after with special validation
      
      this.profileForm.addControl(
        field, 
        this.fb.control({
          value: field === 'password' ? '' : this.data[field],
          disabled: !!this.fieldConfig[field].disabled
        }, this.fieldConfig[field].validators)
      );
    });
    
    // Add confirm password with custom validation
    if (this.roleFields[role].includes('confirmPassword')) {
      this.profileForm.addControl('confirmPassword', this.fb.control(''));
      
      // Add password match validation
      this.profileForm.get('confirmPassword')?.setValidators([
        (control: AbstractControl): ValidationErrors | null => {
          const password = this.profileForm.get('password')?.value;
          return password && control.value && password !== control.value 
            ? { mismatch: true } 
            : null;
        }
      ]);
    }
    
    // Track form changes
    this.profileForm.valueChanges.subscribe(() => {
      this.isChanged = this.profileForm.dirty;
      
      // Update confirmPassword validation when password changes
      if (this.profileForm.get('password') && this.profileForm.get('confirmPassword')) {
        this.profileForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }
  
  togglePasswordFields() {
    this.isPasswordFieldVisible = !this.isPasswordFieldVisible;
  }
  
  onSubmit() {
    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      this.errorMessage = "Please fill all required fields correctly before submitting.";
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    
    const updatedData = this.profileForm.getRawValue();
    updatedData.roleName = this.data['roleName'];
    console.log(updatedData);
    
    // Remove empty password fields from submission
    if (!updatedData.password) {
      delete updatedData.password;
      delete updatedData.confirmPassword;
    } else {
      // If we're submitting a password, we don't need confirmPassword on server
      delete updatedData.confirmPassword;
    }
    
    this.isLoading = true;
    this.apiService.updateData(updatedData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          console.log("Profile updated successfully:", response);
          this.isChanged = false;
          this.successMessage = "Profile updated successfully!";
          setTimeout(() => this.successMessage = null, 5000);
          
          // Update the local data
          Object.keys(updatedData).forEach(key => {
            if (key !== 'password' && key !== 'confirmPassword') {
              this.data[key] = updatedData[key];
            }
          });
          
          // Reset password fields
          if (this.profileForm.get('password')) {
            this.profileForm.get('password')?.setValue('');
          }
          if (this.profileForm.get('confirmPassword')) {
            this.profileForm.get('confirmPassword')?.setValue('');
          }
          this.profileForm.markAsPristine();
        },
        error: (error: any) => {
          console.error("Error updating profile:", error);
          this.errorMessage = error.error?.message || "Error updating profile. Please try again.";
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }
  
  resetForm() {
    this.initForm(this.data.roleName);
    this.errorMessage = null;
    this.successMessage = null;
  }
}