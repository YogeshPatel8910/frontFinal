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
  // result: any;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}
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
          { value:this.appointmentData?this.appointmentData[key]:'', disabled: this.isRescheduleMode && key !=='date' && key !== 'timeSlot'  }, 
          this.fieldConfig[key]?.errors ? Validators.required : []
        )
      );
    }

   
  }
  loadAppointmentData() {
    this.apiService.getAppointmentData().subscribe({
      next: (response: any) => {
        console.log(response);
        
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
        // debugger
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
  }
  
  /* ✅ Populate Reschedule Data (Only When Rescheduling) */
  populateRescheduleData() {
    if (this.appointmentData) {
      this.fieldConfig['branchName'].options?.push(this.appointmentData.branchName)  ;
      this.fieldConfig['departmentName'].options?.push(this.appointmentData.departmentName);
      this.fieldConfig['doctorName'].options?.push(this.appointmentData.doctorName);
      // this.appointmentForm.patchValue({
      //   date: this.appointmentData.date || '',
      //   timeSlot: this.appointmentData.timeSlot || '',
      //   branchName: this.appointmentData.branchName || '',  // Directly set value
      //   departmentName: this.appointmentData.departmentName || '',
      //   doctorName: this.appointmentData.doctorName || '',
      // });
    }
  }
  
  onSubmit() {
    if (this.appointmentForm.valid) {
      console.log('Appointment Data:', this.appointmentForm.value);
      if (this.isRescheduleMode) {
        this.handleReschedule();
      } else {
        this.handleNewBooking();
      }
      this.closeForm.emit();
    }
  }

  handleNewBooking() {
    this.apiService.addAppointment(this.appointmentForm.value).subscribe({
      next: (response: any) => {
        console.log('Appointment Booked Successfully', response);
        this.closeForm.emit();
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage = error.error?.message || 'Booking failed!';
      }
    });
  }
  
  handleReschedule() {
    if (!this.appointmentData?.id) {
      this.errorMessage = 'Invalid appointment data!';
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
          this.closeForm.emit();
        },
        error: (error: { error: { message: string } }) => {
          this.errorMessage = error.error?.message || 'Rescheduling failed!';
        },
      });
  
  }

  isSameAsOriginal(): boolean {
    if (this.appointmentData.date != this.appointmentForm.get('date')?.value || this.appointmentData.timeSlot != this.appointmentForm.get('timeSlot')?.value){
      return false;
    } 
    else{
      return true;
    }
  }
  
}
