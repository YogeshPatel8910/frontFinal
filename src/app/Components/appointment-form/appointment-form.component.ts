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

interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
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
  isSubmitting: boolean = false; // Track form submissio  n state
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
    reason: { 
      type: 'text', 
      placeholder: 'Enter Reason for Appointment' 
    },
    date: {
      type: 'date',
      placeholder: 'Select Date',
      errors: { required: 'Date is required' },
    },
    timeSlot: {
      type: 'select',
      placeholder: 'Select Time Slot',
      options: [], // Will be populated with time slots
      errors: { required: 'Time Slot is required' },
    },
  };

  unavailableDates: Date[] = [];
  allTimeSlots: TimeSlot[] = [];
  selectedDate: string = '';
  unavailableTimeSlots: string[] = []; // Track unavailable time slots for the selected date/doctor

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  get today(): Date {
    return new Date();
  }

  ngOnInit() {
    // Get role from localStorage
    this.userRole = localStorage.getItem('userRole') || 'patient'; // Default to 'patient' if not found

    this.initializeForm();

    // Generate all time slots at initialization
    this.generateTimeSlots();

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

    // Add listener for date changes to update available time slots
    this.appointmentForm.get('date')?.valueChanges.subscribe(date => {
      this.selectedDate = date;
      // Update available time slots when date changes
      this.updateAvailableTimeSlots();
    });

    // Add listener for doctor changes to update available slots
    this.appointmentForm.get('doctorName')?.valueChanges.subscribe(doctorName => {
      if (doctorName) {
        this.loadUnavailableDates(doctorName);
        // Reset time slot if doctor changes
        this.appointmentForm.get('timeSlot')?.setValue('');
      }
    });
  }

  loadAppointmentData() {
    this.apiService.getAppointmentData().subscribe({
      next: (response: any) => {
        this.branch = Object.keys(response);
        this.fieldConfig['branchName'].options = this.branch;
        this.appointmentForm.get('branchName')?.valueChanges.subscribe((b) => {
          this.department = Object.keys(response[b]);
          this.fieldConfig['departmentName'].options = this.department;
          this.appointmentForm.get('departmentName')?.valueChanges.subscribe((d) => {
              this.doctor = Object.values(response[b][d]);
              this.fieldConfig['doctorName'].options = this.doctor;
              // Reset doctor, date and time slot when department changes
              this.appointmentForm.get('doctorName')?.setValue('');
              this.appointmentForm.get('date')?.setValue('');
              this.appointmentForm.get('timeSlot')?.setValue('');
          });
          // Reset department, doctor, date and time slot when branch changes
          this.appointmentForm.get('departmentName')?.setValue('');
          this.appointmentForm.get('doctorName')?.setValue('');
          this.appointmentForm.get('date')?.setValue('');
          this.appointmentForm.get('timeSlot')?.setValue('');
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointment data. Please try again.';
      }
    });
  }
  
  minDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };

  populateRescheduleData() {
    if (this.appointmentData) {
      this.fieldConfig['branchName'].options = [this.appointmentData.branchName];
      this.fieldConfig['departmentName'].options = [this.appointmentData.departmentName];
      this.fieldConfig['doctorName'].options = [this.appointmentData.doctorName];
      
      this.loadUnavailableDates(this.appointmentData.doctorName);
      
      // For reschedule, check if original time slot is still available
      if (this.appointmentData.date && this.appointmentData.timeSlot) {
        this.loadUnavailableTimeSlots(this.appointmentData.doctorName, this.appointmentData.date);
      }
    }
  }
  
  loadUnavailableDates(doctorName: string) {
    // API call to get unavailable dates for the selected doctor
    this.apiService.getLeaveData(doctorName).subscribe({
      next: (response: any) => {
        this.unavailableDates = response || [];
        
        // Reset date field if currently selected date is unavailable
        const currentDate = this.appointmentForm.get('date')?.value;
        if (currentDate && this.isDateUnavailable(new Date(currentDate))) {
          this.appointmentForm.get('date')?.setValue('');
          this.appointmentForm.get('timeSlot')?.setValue('');
        } else if (currentDate) {
          // If date is still valid, update time slots
          this.loadUnavailableTimeSlots(doctorName, currentDate);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load doctor availability. Please try again.';
      }
    });
  }

  loadUnavailableTimeSlots(doctorName: string, date: string) {
    // This would be an API call in a real application
    // For demo, we'll simulate some unavailable time slots
    // In a real app, you would fetch this from your backend
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // Simulate different unavailable slots based on day of week
    // Monday (1) - morning slots unavailable
    // Friday (5) - afternoon slots unavailable
    // Other days - random slots unavailable
    
    this.unavailableTimeSlots = [];
    
    if (dayOfWeek === 1) { // Monday
      this.unavailableTimeSlots = ['09:00', '09:30', '10:00', '10:30'];
    } else if (dayOfWeek === 5) { // Friday
      this.unavailableTimeSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    } else {
      // Random unavailable slots for other days
      const possibleSlots = ['09:00', '10:30', '13:00', '15:30', '16:30'];
      const numberOfUnavailable = Math.floor(Math.random() * 3) + 1; // 1-3 unavailable slots
      
      for (let i = 0; i < numberOfUnavailable; i++) {
        const randomIndex = Math.floor(Math.random() * possibleSlots.length);
        this.unavailableTimeSlots.push(possibleSlots[randomIndex]);
        possibleSlots.splice(randomIndex, 1);
      }
    }
    
    // Update the available time slots
    this.updateAvailableTimeSlots();
  }

  generateTimeSlots() {
    // Generate half-hour slots from 9 AM to 5 PM
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const hourString = hour.toString().padStart(2, '0');
        const minuteString = minute.toString().padStart(2, '0');
        const timeValue = `${hourString}:${minuteString}`;
        
        // Format for display (12-hour format)
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const timeLabel = `${displayHour}:${minuteString} ${ampm}`;
        
        slots.push({
          value: timeValue,
          label: timeLabel,
          available: true // Default all slots to available
        });
      }
    }
    
    this.allTimeSlots = slots;
  }

  updateAvailableTimeSlots() {
    if (!this.selectedDate || !this.appointmentForm.get('doctorName')?.value) {
      // If no date or doctor selected, don't update
      return;
    }
    
    // First reset all slots to available
    this.allTimeSlots.forEach(slot => {
      slot.available = true;
    });
    
    // Mark unavailable slots
    this.unavailableTimeSlots.forEach(unavailableTime => {
      const slot = this.allTimeSlots.find(s => s.value === unavailableTime);
      if (slot) {
        slot.available = false;
      }
    });
    
    // Update options in the fieldConfig
    this.fieldConfig['timeSlot'].options = this.allTimeSlots
      .filter(slot => slot.available)
      .map(slot => slot.label);
    
    // Check if the currently selected time slot is now unavailable
    const currentTimeSlot = this.appointmentForm.get('timeSlot')?.value;
    if (currentTimeSlot) {
      const isCurrentSlotAvailable = this.allTimeSlots
        .some(slot => slot.label === currentTimeSlot && slot.available);
        
      if (!isCurrentSlotAvailable) {
        // Reset time slot if current selection is unavailable
        this.appointmentForm.get('timeSlot')?.setValue('');
      }
    }
  }

  isDateUnavailable = (date: any): boolean => {
    if (!date || !this.unavailableDates || this.unavailableDates.length === 0) {
      return false;
    }
    
    // Convert NgbDate to JavaScript Date for comparison
    let jsDate;
    if (date.year) {
      // It's an NgbDate object
      jsDate = new Date(date.year, date.month - 1, date.day);
    } else {
      // It's already a Date object
      jsDate = date;
    }
    
    const formattedDate = jsDate.toDateString();
    
    return this.unavailableDates.some(
      unavailableDate => new Date(unavailableDate).toDateString() === formattedDate
    );
  }
 
  onSubmit() {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      
      if (this.isRescheduleMode) {
        this.handleReschedule();
      } else {
        this.handleNewBooking();
      }
    } else {
      // Highlight all invalid fields
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  handleNewBooking() {
    // Format the form values before sending
    const formData = this.prepareFormData();
    
    this.apiService.addAppointment(formData).subscribe({
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

    // Get the selected time slot value, not label
    const timeSlotValue = this.getTimeSlotValue(this.appointmentForm.value.timeSlot);
    if (this.appointmentForm.value.date && typeof this.appointmentForm.value.date === 'object') {
      this.appointmentForm.value.date = `${this.appointmentForm.value.date.year}-${('0' + this.appointmentForm.value.date.month).slice(-2)}-${('0' + this.appointmentForm.value.date.day).slice(-2)}`;
    }
    const updatedData = {
      id: this.appointmentData.id,
      date: this.appointmentForm.value.date,
      timeSlot: timeSlotValue,
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

  // Helper to get the time slot value from the label
  getTimeSlotValue(label: string): string {
    const slot = this.allTimeSlots.find(s => s.label === label);
    return slot ? slot.value : label;
  }

  // Prepare form data for submission
  prepareFormData() {
    const formValues = { ...this.appointmentForm.value };
    
    // Convert time slot label to value if needed
    if (formValues.date && typeof formValues.date === 'object') {
      formValues.date = `${formValues.date.year}-${('0' + formValues.date.month).slice(-2)}-${('0' + formValues.date.day).slice(-2)}`;
    }
    if (formValues.timeSlot) {
      formValues.timeSlot = this.getTimeSlotValue(formValues.timeSlot);
    }
    
    return formValues;
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