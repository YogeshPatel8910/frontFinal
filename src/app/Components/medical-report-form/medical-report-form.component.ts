import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../Services/api.service';


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
  reportForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      id: [null],
      patientName: ['', Validators.required],
      doctorName: ['', Validators.required],
      appointmentId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      symptom: ['', Validators.required],
      diagnosis: ['', Validators.required],
      notes: [''],
      prescriptions: this.fb.array([this.createPrescriptionFormGroup()])
    });
  }

  createPrescriptionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      duration: ['', Validators.required],
      instructions: ['', Validators.required]
    });
  }

  get prescriptions(): FormArray {
    return this.reportForm.get('prescriptions') as FormArray;
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
      return;
    }

    const medicalReport: MedicalReport = this.reportForm.value;
    console.log('Medical Report', medicalReport);
    
    // Here you would typically send the data to your backend API
    // this.medicalReportService.saveMedicalReport(medicalReport).subscribe(
    //   response => {
    //     console.log('Report saved successfully', response);
    //   },
    //   error => {
    //     console.error('Error saving report', error);
    //   }
    // );
  }

  resetForm(): void {
    this.submitted = false;
    this.reportForm.reset();
    this.prescriptions.clear();
    this.addPrescription();
  }
}

