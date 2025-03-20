import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../Services/authentication.service';
import { Router } from '@angular/router';
import { ApiService } from '../../Services/api.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  @Input() formHeader: string = 'Create Your Account'; // Dynamic form title
  @Input() showCloseButton: boolean = false; // Controls close button visibility
  @Output() closeForm = new EventEmitter<void>();
  // formHeader:string='Create Your Account';
  isLoading = false;
  errorMessage: string | null = null;
  branches: string[] = []; // Store branch names
  departments: string[] = []; // Store departments based on selected branch
  branchDepartmentMap: Record<string, string[]> = {};
  roles = [
    { label: 'Patient', value: 'ROLE_PATIENT' },
    { label: 'Doctor', value: 'ROLE_DOCTOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' }
  ];

  fieldConfig: Record<string, { 
    type: string; 
    placeholder: string; 
    validators: any[]; 
    errors: Record<string, string>; 
    options?: string[];
    label?: string;
    icon?: string;
    column?: string;
  }> = {
    name: { 
      type: 'text', 
      placeholder: 'Enter your full name', 
      validators: [Validators.required, Validators.minLength(3)], 
      errors: { required: 'Name is required', minlength: 'Name must be at least 3 characters' },
      label: 'Full Name',
      icon: 'bi-person-fill',
      column: 'col-12'
    },
    email: { 
      type: 'email', 
      placeholder: 'Enter your email address', 
      validators: [Validators.required, Validators.email], 
      errors: { required: 'Email is required', email: 'Please enter a valid email address' },
      label: 'Email Address',
      icon: 'bi-envelope-fill',
      column: 'col-12'
    },
    password: { 
      type: 'password', 
      placeholder: 'Create a password', 
      validators: [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ], 
      errors: { 
        required: 'Password is required', 
        minlength: 'Password must be at least 6 characters',
        pattern: 'Password must include uppercase, lowercase, number, and special character'
      },
      label: 'Password',
      icon: 'bi-shield-lock-fill',
      column: 'col-md-6'
    },
    confirmPassword: { 
      type: 'password', 
      placeholder: 'Confirm your password', 
      validators: [Validators.required], 
      errors: { required: 'Password confirmation is required' },
      label: 'Confirm Password',
      icon: 'bi-check-circle-fill',
      column: 'col-md-6'
    },
    mobileNo: { 
      type: 'tel', 
      placeholder: 'Enter your phone number', 
      validators: [Validators.required, Validators.pattern(/^\d{10}$/)], 
      errors: { required: 'Phone number is required', pattern: 'Please enter a valid 10-digit phone number' },
      label: 'Phone Number',
      icon: 'bi-telephone-fill',
      column: 'col-md-6'
    },
    address: { 
      type: 'text', 
      placeholder: 'Enter your home address', 
      validators: [Validators.required], 
      errors: { required: 'Address is required' },
      label: 'Home Address',
      icon: 'bi-house-door-fill',
      column: 'col-12'
    },
    specialization: { 
      type: 'text', 
      placeholder: 'Enter your medical specialization', 
      validators: [Validators.required], 
      errors: { required: 'Specialization is required' },
      label: 'Specialization',
      icon: 'bi-briefcase-fill',
      column: 'col-12'
    },
    age: { 
      type: 'number', 
      placeholder: 'Enter your age', 
      validators: [Validators.required, Validators.min(1), Validators.max(120)], 
      errors: { 
        required: 'Age is required', 
        min: 'Age must be at least 1', 
        max: 'Age cannot exceed 120' 
      },
      label: 'Age',
      icon: 'bi-calendar3',
      column: 'col-md-6'
    },
    gender: { 
      type: 'select', 
      placeholder: 'Select your gender', 
      validators: [Validators.required], 
      errors: { required: 'Gender is required' }, 
      options: ['Male', 'Female', 'Other'],
      label: 'Gender',
      icon: 'bi-gender-ambiguous',
      column: 'col-md-6'
    },
    branchName: { 
      type: 'select', 
      placeholder: 'Select Branch', 
      validators: [Validators.required], 
      errors: { required: 'Branch is required' }, 
      options: [],
      label: 'Branch Name',
      icon: 'bi-diagram-3-fill',
      column: 'col-12'
    },
    departmentName: { 
      type: 'select', 
      placeholder: 'Select Department', 
      validators: [Validators.required], 
      errors: { required: 'Department is required' }, 
      options: [],
      label: 'Department Name',
      icon: 'bi-diagram-3',
      column: 'col-12'
    }
  };

  roleFields: Record<string, string[]> = {
    ROLE_PATIENT: ['name', 'email', 'password', 'confirmPassword', 'mobileNo', 'address', 'age', 'gender'],
    ROLE_DOCTOR: ['name', 'email', 'password', 'confirmPassword', 'mobileNo', 'branchName', 'departmentName','specialization'],
    ROLE_ADMIN: ['name', 'email', 'password', 'confirmPassword', 'mobileNo']
  };
  role: string = '';

  constructor(private fb: FormBuilder, private apiService:ApiService ,private authService: AuthenticationService, private router: Router) {}

  ngOnInit() {
    this.role = localStorage.getItem('userRole') || '';
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
    // Remove existing controls
    Object.keys(this.registerForm.controls).forEach(key => {
      if (key !== 'roleName') {
        this.registerForm.removeControl(key);
      }
    });

    // Add role-specific controls
    this.roleFields[role].forEach(field => {
      this.registerForm.addControl(field, this.fb.control('', this.fieldConfig[field].validators));
    });

    if(role==='ROLE_DOCTOR'){
      this.fetchBranchDepartmentData();
    }
  }

  fetchBranchDepartmentData() {
    this.apiService.getRegisterData().subscribe({
      next: (data) => {
        this.branchDepartmentMap = data; // Store entire mapping
        this.branches = Object.keys(data); // Extract branches (hospital names)
        this.fieldConfig['branchName'].options?.push(...this.branches)
        this.registerForm.get('branchName')?.valueChanges.subscribe((b) => { 
          this.departments = Object.values(data[b]);
          this.fieldConfig['departmentName'].options = this.departments;
        });
        
      },
      error: (err) => {
        console.error('Error fetching branches and departments:', err);
      }
    });
  }

  onBranchChange(branch: string) {
    this.departments = this.branchDepartmentMap[branch] ? Object.keys(this.branchDepartmentMap[branch]) : [];
    this.registerForm.get('departmentName')?.setValue(''); // Reset department selection
    console.log(this.departments);
    
  }

  onSubmit() {
    // Mark all controls as touched to trigger validation messages
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (response: any) => {
        console.log('Registration Successful', response.user);
        this.isLoading = false;
        if(!this.showCloseButton){
          this.authService.setAuthenticated(true);
          this.router.navigate(['/login']);
        }
        else{
          console.log('showclose');
          
          this.close();
        }
      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error?.message || 'Registration failed! Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Helper methods for enhanced template
  isFieldRequired(fieldName: string): boolean {
    return this.fieldConfig[fieldName].validators.includes(Validators.required);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return (control?.invalid && control?.touched) ?? false;
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.registerForm.get(fieldName);
    if (!control?.errors || !control.touched) return [];
    
    return Object.keys(control.errors)
      .filter(key => this.fieldConfig[fieldName].errors[key])
      .map(key => this.fieldConfig[fieldName].errors[key]);
  }

  getLabelName(key: string): string {
    return this.fieldConfig[key].label || key.charAt(0).toUpperCase() + key.slice(1);
  }

  getIconForField(key: string): string {
    return this.fieldConfig[key].icon || 'bi-asterisk';
  }

  getIconForRole(role: string): string {
    switch (role) {
      case 'ROLE_PATIENT': return 'bi-person-fill';
      case 'ROLE_DOCTOR': return 'bi-hospital-fill';
      case 'ROLE_ADMIN': return 'bi-shield-fill';
      default: return 'bi-person-fill';
    }
  }

  getColumnClass(key: string): string {
    return this.fieldConfig[key].column || 'col-12';
  }

  calculateProgress(): number {
    if (!this.registerForm.valid) {
      const totalFields = this.roleFields[this.registerForm.get('roleName')?.value].length;
      const validFields = this.roleFields[this.registerForm.get('roleName')?.value]
        .filter(field => this.registerForm.get(field)?.valid).length;
      
      return Math.round((validFields / totalFields) * 100);
    }
    return 100;
  }
  close() {
    this.closeForm.emit(); // Notify parent to close
  }
}