import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../Services/api.service';
import { animate } from '@angular/animations';

interface FieldConfig {
  [key: string]: {
    type: string;
    placeholder: string;
    options?: string[];
    errors?: { [key: string]: string };
  };
}

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css'],
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  userRole: string = ''; // Store role from localStorage
  errorMessage: string | null = null;
  doctor: string[] = [];
  department: string[] = [];
  branch: string[] = [];
  result: { [key: string]: any } = {};
  roleFields: { [key: string]: string[] } = {
    patient: [
      'branchName',
      'departmentName',
      'doctorName',
      'reason',
      'date',
      'timeSlot',
    ],
    doctor: ['patientName', 'date', 'timeSlot'],
  };
  fieldConfig: FieldConfig = {
    patientName: {
      type: 'text',
      placeholder: 'Enter Patient Name',
      errors: { required: 'Patient Name is required' },
    },
    branchName: {
      type: 'select',
      placeholder: 'Enter Branch Name',
      options: [],
      errors: { required: 'Branch Name is required' },
    },
    departmentName: {
      type: 'select',
      placeholder: 'Select Department',
      options: [],
    },
    doctorName: {
      type: 'select',
      placeholder: 'Enter Doctor Name',
      options: [],
      errors: { required: 'Doctor Name is required' },
    },
    reason: { type: 'text', placeholder: 'Enter Reason for Appointment' },
    date: {
      type: 'date',
      placeholder: 'Select Date',
      errors: { required: 'Date is required' },
    },
    timeSlot: {
      type: 'time',
      placeholder: 'Select Time Slot',
      errors: { required: 'Time Slot is required' },
    },
  };
  // result: any;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit() {
    // Get role from localStorage
    this.userRole = localStorage.getItem('role') || 'patient'; // Default to 'patient' if not found
    this.apiService.getAppointmentData().subscribe({
      next: (response: any) => {
        response[1].forEach((r1: any) => {
          this.result[r1.name] = {};
          response[2].forEach((r2: any) => {
            this.result[r1.name][r2.name] = response[0]
              .filter(
                (r0: any) =>
                  r0.departmentName === r2.name && r0.branchName === r1.name
              )
              .map((r0: any) => r0.name);
          });
        });

        this.branch = Object.keys(this.result);
        // if (!this.fieldConfig['branchName']) {
        //   this.fieldConfig['branchName'] = { type: 'select', placeholder: 'Enter Branch Name', options: [] };
        // }
        this.fieldConfig['branchName'].options = this.branch;

        this.appointmentForm.get('branchName')?.valueChanges.subscribe((b) => {
          this.department = Object.keys(this.result[b]);
          this.fieldConfig['departmentName'].options = this.department;
          this.appointmentForm
            .get('departmentName')
            ?.valueChanges.subscribe((d) => {
              this.doctor = Object.values(this.result[b][d]);
              this.fieldConfig['doctorName'].options = this.doctor;
            });
        });
      },
    });

    this.appointmentForm = this.fb.group({
      roleName: [this.userRole, Validators.required], // Set role automatically
    });

    // Add form fields dynamically
    for (const key of this.roleFields[this.userRole]) {
      this.appointmentForm.addControl(
        key,
        this.fb.control(
          '',
          this.fieldConfig[key]?.errors ? Validators.required : []
        )
      );
    }
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      console.log('Appointment Data:', this.appointmentForm.value);
      alert('Appointment Booked Successfully!');
      this.apiService.addAppointment(this.appointmentForm.value).subscribe({
        next: (response: any) => {
          console.log('Registration Successful', response);
          let redirectUrl = localStorage.getItem('redirectUrl') || '/profile';
        },
        error: (error: { error: { message: string } }) => {
          this.errorMessage = error.error?.message || 'Registration failed!';
        },
      });
    }
  }
}
