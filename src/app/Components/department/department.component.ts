import { Component } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent {
  departmentForm: FormGroup;
  currentPage: number = 1;  
  itemsPerPage: number = 10;
  totalElements: number = 0;
  popupUserId: number | null = null;
  popupPosition = { top: 0, left: 0 };
  data: any[]  = [];  // Ensure `data` is initialized as an object
  columnTable: string[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.apiService.getDepartment(this.currentPage - 1, this.itemsPerPage).subscribe({
      next: (response: { [key: string]: any }) => {
        console.log(response['data']);
        this.data = response['data'] || [];  // Ensure it doesn’t break if response['data'] is undefined
        this.columnTable = this.data.length ? Object.keys(this.data[0]) : [];        
        this.totalElements = response['TotalElements'] || 0;
      },
      error: (err:any) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  onPageChange(event: number): void {
    this.currentPage = event;
    this.load();  // Reload data when the page changes
  }

  showDeletePopup(userId: number, event: MouseEvent) {
    this.popupUserId = userId;
    this.popupPosition.top = event.clientY;
    this.popupPosition.left = event.clientX - 100; // Adjust for right end
  }

  deleteUser(userId: number) {
    // this.apiService.deleteDepartment(userId).subscribe({
    //   next: () => {
    //     alert('Department deleted successfully!');
    //     this.popupUserId = null;
    //     this.load(); // Refresh the table
    //   },
    //   error: () => {
    //     alert('Error deleting department');
    //   }
    // });
  }
  submitForm() {
    if (this.departmentForm.valid) {
      // this.apiService.createDepartment(this.departmentForm.value).subscribe({
      //   next: (response) => {
      //     console.log('Department created:', response);
      //     alert('Department created successfully!');
      //     this.departmentForm.reset();
      //     this.closeModal();  // Close modal on success
      //   },
      //   error: (err) => {
      //     console.error('Error creating department:', err);
      //     alert('Failed to create department');
      //   }
      // });
    }
  }
}