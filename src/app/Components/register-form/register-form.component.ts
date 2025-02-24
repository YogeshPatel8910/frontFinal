import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  roles: string[] = ['Patient', 'Doctor', 'Admin']; // Available roles

  // Fields based on role selection
  placeholders: { [key: string]: string } = {
    name: 'Enter full name',
    email: 'Enter email address',
    password: 'Enter password',
    phone: 'Enter phone number',
    address: 'Enter home address',
    specialization: 'Enter specialization',
    department: 'Enter department',
    age:'Enter age',
    gender:'Enter gender'
  };
  // Fields based on role selection
  roleFields: { [key: string]: string[] } = {
    Patient: ['name', 'email', 'password', 'phone', 'address','age','gender'],
    Doctor: ['name', 'email', 'password', 'phone', 'specialization'],
    Admin: ['name', 'email', 'password', 'phone'],
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      role: ['Patient', Validators.required], // Default role
    });

    // Update form fields when role changes
    this.registerForm.get('role')?.valueChanges.subscribe((role) => {
      this.updateFormFields(role);
    });

    // Initialize fields based on default role
    this.updateFormFields('Patient');
  }

  updateFormFields(role: string) {
    // Remove all previous fields except 'role'
    Object.keys(this.registerForm.controls).forEach(key => {
      if (key !== 'role') {
        this.registerForm.removeControl(key);
      }
    });

    // Add fields dynamically based on role
    this.roleFields[role].forEach((field) => {
      this.registerForm.addControl(
        field,
        new FormControl('', Validators.required)
      );
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form Submitted:', this.registerForm.getRawValue());
    }
  }
}
