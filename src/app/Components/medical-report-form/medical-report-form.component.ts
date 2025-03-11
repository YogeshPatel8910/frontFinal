import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../Services/api.service';


interface MedicalReport {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  symptom: string;
  diagnosis: string;
  notes: string;
}

@Component({
  selector: 'app-medical-report-form',
  templateUrl: './medical-report-form.component.html',
  styleUrl: './medical-report-form.component.css'
})
export class MedicalReportFormComponent {
  medicalForm!: FormGroup;
  isSubmitting = false;
  role: string = '';
  constructor(private fb: FormBuilder,private apiService:ApiService) {}

  ngOnInit(): void {
    this.medicalForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentId: ['', Validators.required],
      symptom: ['', Validators.required],
      diagnosis: ['', Validators.required],
      notes: ['']
    });
  }

  submitForm(): void {
    if (this.medicalForm.invalid) return;
    this.isSubmitting = true;
    
    const medicalReport: MedicalReport = this.medicalForm.value;
    // this.apiService.createMedicalReport(medicalReport).subscribe({

    //   next:(response: any )=> {
    //     console.log('Medical Report Saved:', response);
    //     this.medicalForm.reset();
    //     this.isSubmitting = false;
    //   },
    //   error:(err: any) => {
    //     console.error('Error saving medical report', err);
    //     this.isSubmitting = false;
    //   }
    // });
  }
}

