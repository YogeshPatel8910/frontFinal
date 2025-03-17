import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../Services/api.service';
import { ToastrService } from 'ngx-toastr';

export interface MedicalReport {
  id?: number;
  patientName: string;
  doctorName: string;
  appointmentId: number;
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
  @Output() closeForm = new EventEmitter<void>();
  
  reportForm!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.populateFormFromAppointment();
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
      prescriptions: this.fb.array([this.createPrescriptionFormGroup()])
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
      return;
    }

    this.loading = true;
    console.log(this.reportForm.value);
    
    const medicalReport: MedicalReport = this.reportForm.value;

    this.apiService.saveMedicalReport(medicalReport.appointmentId,medicalReport).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log(response);
        
        this.toastr.success('Medical report has been saved successfully', 'Success');
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
    if (this.appointmentData) {
      this.populateFormFromAppointment();
    }
    this.prescriptions.clear();
    this.addPrescription();
  }

  cancel(): void {
    this.closeForm.emit();
  }
}