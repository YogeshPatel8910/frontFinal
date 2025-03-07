import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
data:any;
profileForm!: FormGroup;
isLoading = false;
errorMessage: string | null = null;

role: string = localStorage.getItem('role') ?? 'ROLE_PATIENT';  // Default to 'ROLE_PATIENT'
roles = [
  { label: 'patient', value: 'ROLE_PATIENT' },
  { label: 'doctor', value: 'ROLE_DOCTOR' },
  { label: 'admin', value: 'ROLE_ADMIN' }
];
fieldConfig: Record<string, { type: string; placeholder: string; validators: any[]; errors: Record<string, string>, options?: string[] , disabled?:boolean }> = {
  name: { type: 'text', placeholder: 'Enter full name', validators: [Validators.required, Validators.minLength(3)], errors: { required: 'Name is required', minlength: 'Name must be at least 3 characters' } , disabled:true },
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
  ROLE_PATIENT: ['name', 'email', 'mobileNo', 'address', 'age', 'gender'],
  ROLE_DOCTOR: ['name', 'email', 'mobileNo', 'specialization'],
  ROLE_ADMIN: ['name', 'email', 'mobileNo']
};
isChanged=false;
constructor(private apiService: ApiService,private fb: FormBuilder,private router:Router) {}
  ngOnInit() {
    this.apiService.getData()
    .subscribe({
      next:(response)=>{
        console.log(response);
        this.data=response;
        this.initForm(this.data.roleName);

      },
      error: (error) => {
        console.log(error);
        this.router.navigate(['login'])
      }
    });
  }
  initForm(role:string){
    this.profileForm = this.fb.group({});
    this.roleFields[role].forEach(field => {
      this.profileForm.addControl(field, this.fb.control({
        value : this.data[field],
        disabled : !!this.fieldConfig[field].disabled}
        , this.fieldConfig[field].validators));
    });
    this.profileForm.valueChanges.subscribe(() => {
      this.isChanged = this.profileForm.dirty; // Check if form is changed
    });
  }
  onSubmit() {
    if (this.profileForm.valid) {
      let updatedData = this.profileForm.getRawValue(); 
      console.log(updatedData);
      updatedData.roleName = this.data['roleName'];
      console.log(updatedData)
      this.apiService.updateData(updatedData).subscribe({
        next: (response: any) => {
          console.log("Updated Data Successfully:", response);
          this.isChanged = false; 
          alert("Profile updated successfully!");
        },
        error: (error: any) => {
          console.error("Error updating profile:", error);
          alert("Error updating profile. Please try again.");
        }
      });
    } else {
      alert("Please fill all required fields before submitting.");
    }
  }
  
}
