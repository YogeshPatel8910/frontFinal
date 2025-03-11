import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalReportFormComponent } from './medical-report-form.component';

describe('MedicalReportFormComponent', () => {
  let component: MedicalReportFormComponent;
  let fixture: ComponentFixture<MedicalReportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalReportFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicalReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
