import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../Services/api.service';
import { ToastrService } from 'ngx-toastr';

export interface MedicalReport {
  id?: number;
  symptom: string;
  diagnosis: string;
  notes: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  id?: number;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

@Component({
  selector: 'app-medical-report-form',
  templateUrl: './medical-report-form.component.html',
  styleUrls: ['./medical-report-form.component.scss']
})
export class MedicalReportFormComponent implements OnInit {
  @Input() appointmentData: any;
  @Input() reportData: MedicalReport | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() formSubmitted = new EventEmitter<MedicalReport>();
  
  reportForm!: FormGroup;
  submitted = false;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  checkEditMode(): void {
    this.isEditMode = !!this.reportData?.id;
    
    if (this.isEditMode && this.reportData) {
      // We're in edit mode, populate form with existing report data
      this.reportForm.patchValue({
        id: this.reportData.id,
        patientName: this.appointmentData.patientName,
        doctorName: this.appointmentData.doctorName,
        appointmentId: this.appointmentData.appointmentId,
        symptom: this.reportData.symptom,
        diagnosis: this.reportData.diagnosis,
        notes: this.reportData.notes || ''
      });
      
      // Clear default prescription and add existing ones
      this.prescriptions.clear();
      if (this.reportData.prescriptions && this.reportData.prescriptions.length > 0) {
        this.reportData.prescriptions.forEach(prescription => {
          this.prescriptions.push(this.fb.group({
            id: [prescription.id],
            name: [prescription.name, [Validators.required, Validators.minLength(3)]],
            dosage: [prescription.dosage, [Validators.required]],
            duration: [prescription.duration, [Validators.required]],
            instructions: [prescription.instructions, [Validators.required, Validators.minLength(5)]]
          }));
        });
      } else {
        this.addPrescription();
      }
    } else if (this.appointmentData) {
      // New report with appointment data
      this.populateFormFromAppointment();
    } else {
      // Completely new report
      this.addPrescription();
    }
  }

  populateFormFromAppointment(): void {
    if (this.appointmentData) {
      this.reportForm.patchValue({
        patientName: this.appointmentData.patientName || '',
        doctorName: this.appointmentData.doctorName || '',
        appointmentId: this.appointmentData.id || '',
      });
    }
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      id: [null],
      patientName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      doctorName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      appointmentId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      symptom: ['', [Validators.required, Validators.minLength(10)]],
      diagnosis: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
      prescriptions: this.fb.array([])
    });
  }

  createPrescriptionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      dosage: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      instructions: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  get prescriptions(): FormArray {
    return this.reportForm.get('prescriptions') as FormArray;
  }

  get f() {
    return this.reportForm.controls;
  }

  addPrescription(): void {
    this.prescriptions.push(this.createPrescriptionFormGroup());
  }

  removePrescription(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.removeAt(index);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.reportForm.invalid) {
      this.toastr.error('Please correct the errors before submitting the form', 'Validation Error');
      
      // Find first invalid control and focus it
      const firstInvalidControl = document.querySelector('.is-invalid');
      if (firstInvalidControl) {
        (firstInvalidControl as HTMLElement).focus();
      }
      
      return;
    }

    this.loading = true;
    const medicalReport: MedicalReport = this.reportForm.value;
    
    const apiCall = this.isEditMode 
      ? this.apiService.saveMedicalReport(this.reportForm.value['appointmentId'], medicalReport)
      : this.apiService.saveMedicalReport(this.reportForm.value['appointmentId'], medicalReport);

    apiCall.subscribe({
      next: (response: any) => {
        this.loading = false;
        const successMsg = this.isEditMode 
          ? 'Medical report has been updated successfully'
          : 'Medical report has been saved successfully';
          
        this.toastr.success(successMsg, 'Success');
        this.formSubmitted.emit(response);
        this.closeForm.emit();
      },
      error: (error: any) => {
        this.loading = false;
        this.toastr.error('There was an error saving the medical report', 'Error');
        console.error('Error saving report', error);
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.reportForm.reset();
    
    if (this.isEditMode && this.reportData) {
      this.checkEditMode(); // Re-populate with original data
    } else if (this.appointmentData) {
      this.populateFormFromAppointment();
      this.prescriptions.clear();
      this.addPrescription();
    } else {
      this.prescriptions.clear();
      this.addPrescription();
    }
  }

  cancel(): void {
    this.closeForm.emit();
  }
  
  isFieldRequired(formControlName: string): boolean {
    const control = this.reportForm.get(formControlName);
    if (!control) return false;
    
    const validator = control.validator && control.validator({} as any);
    return validator && validator['required'];
  }
  
  isPrescriptionFieldRequired(index: number, controlName: string): boolean {
    const control = this.prescriptions.at(index).get(controlName);
    if (!control) return false;
    
    const validator = control.validator && control.validator({} as any);
    return validator && validator['required'];
  }
}