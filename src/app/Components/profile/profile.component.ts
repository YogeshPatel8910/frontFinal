import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { first } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  data: { [key: string]: any }={}
  profileForm!: FormGroup;
  disabledFields = ['id', 'createdAt', 'updatedAt','roleName','appointment','branch','medicalReport','department','availableDays'];
  noShowField=['name'];
  dataKeys: string[] = [];
  isChanged=false;
Object: any;
  constructor(private apiService: ApiService,private fb: FormBuilder,private router:Router) {}
  ngOnInit() {
    this.apiService.getData()
    .subscribe({
      next:(response)=>{
        this.data=response;
        this.dataKeys = Object.keys(this.data);
        this.initForm();
      },
      error: (error) => {
        console.log(error);
        this.router.navigate(['login'])
      }
    });
  }
  initForm(){
    this.profileForm = this.fb.group({});
    this.dataKeys = Object.keys(this.data).filter(el => !this.disabledFields.includes(el));
    this.dataKeys.forEach((key) => {
      const isDisabled = this.noShowField.includes(key);
      this.profileForm.addControl(
        key,
        new FormControl({ value: this.data[key], disabled: isDisabled })
      );
    });
    this.profileForm.valueChanges.subscribe(() => {
      this.isChanged = this.profileForm.dirty; // Check if form is changed
    });
  }
  onSubmit() {
    if (this.profileForm.valid) {
      this.apiService.updateData(this.profileForm.getRawValue()).subscribe({
        next: (response) => {
          console.log("Updated Data Successfully:", response);
          this.isChanged = false; 
          alert("Profile updated successfully!");
        },
        error: (error) => {
          console.error("Error updating profile:", error);
          alert("Error updating profile. Please try again.");
        }
      });
    } else {
      alert("Please fill all required fields before submitting.");
    }
  }
}
