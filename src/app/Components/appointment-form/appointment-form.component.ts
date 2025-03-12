import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../Services/api.service';

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
  @Input() appointmentData: any; // Receives appointment data when rescheduling
  @Input() isRescheduleMode: boolean = false; // Reschedule mode flag
  @Output() closeForm = new EventEmitter<void>();

  appointmentForm!: FormGroup;
  userRole: string = ''; // Store role from localStorage
  errorMessage: string | null = null;
  isSubmitting: boolean = false; // Track form submission state
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
      placeholder: 'Enter Department Name',
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

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  get today(): Date {
    return new Date();
  }

  ngOnInit() {
    // Get role from localStorage
    this.userRole = localStorage.getItem('role') || 'patient'; // Default to 'patient' if not found

    this.initializeForm();

    if (!this.isRescheduleMode) {
      this.loadAppointmentData();
    } else {
      this.populateRescheduleData();
    }
  }

  initializeForm() {
    // Get role from localStorage
    this.appointmentForm = this.fb.group({
      roleName: [this.userRole, Validators.required], // Set role automatically
    });
    // Add form fields dynamically
    for (const key of this.roleFields[this.userRole]) {
      this.appointmentForm.addControl(
        key,
        this.fb.control(
          { value: this.appointmentData ? this.appointmentData[key] : '', disabled: this.isRescheduleMode && key !== 'date' && key !== 'timeSlot' }, 
          this.fieldConfig[key]?.errors ? Validators.required : []
        )
      );
    }
  }

  loadAppointmentData() {
    this.apiService.getAppointmentData().subscribe({
      next: (response: any) => {
        this.branch = Object.keys(response);
        this.fieldConfig['branchName'].options = this.branch;
        this.appointmentForm.get('branchName')?.valueChanges.subscribe((b) => {
          this.department = Object.keys(response[b]);
          this.fieldConfig['departmentName'].options = this.department;
          this.appointmentForm
            .get('departmentName')
            ?.valueChanges.subscribe((d) => {
              this.doctor = Object.values(response[b][d]);
              this.fieldConfig['doctorName'].options = this.doctor;
            });
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointment data. Please try again.';
      }
    });
  }
  
  populateRescheduleData() {
    if (this.appointmentData) {
      this.fieldConfig['branchName'].options = [this.appointmentData.branchName];
      this.fieldConfig['departmentName'].options = [this.appointmentData.departmentName];
      this.fieldConfig['doctorName'].options = [this.appointmentData.doctorName];
    }
  }
  
  onSubmit() {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      console.log('Appointment Data:', this.appointmentForm.value);
      
      if (this.isRescheduleMode) {
        this.handleReschedule();
      } else {
        this.handleNewBooking();
      }
    }
  }

  handleNewBooking() {
    this.apiService.addAppointment(this.appointmentForm.value).subscribe({
      next: (response: any) => {
        console.log('Appointment Booked Successfully', response);
        this.isSubmitting = false;
        this.closeForm.emit();
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage = error.error?.message || 'Booking failed!';
        this.isSubmitting = false;
      }
    });
  }
  
  handleReschedule() {
    if (!this.appointmentData?.id) {
      this.errorMessage = 'Invalid appointment data!';
      this.isSubmitting = false;
      return;
    }

    const updatedData = {
      id: this.appointmentData.id,
      date: this.appointmentForm.value.date,
      timeSlot: this.appointmentForm.value.timeSlot,
    };

    this.apiService.rescheduleAppointment(updatedData.id, updatedData).subscribe({
      next: (response: any) => {
        console.log('Rescheduled Successfully', response);
        this.isSubmitting = false;
        this.closeForm.emit();
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage = error.error?.message || 'Rescheduling failed!';
        this.isSubmitting = false;
      },
    });
  }

  isSameAsOriginal(): boolean {
    if (!this.appointmentData) return false;
    
    const dateValue = this.appointmentForm.get('date')?.value;
    const timeValue = this.appointmentForm.get('timeSlot')?.value;
    
    return this.appointmentData.date === dateValue && 
           this.appointmentData.timeSlot === timeValue;
  }
  
  clearError() {
    this.errorMessage = null;
  }
}