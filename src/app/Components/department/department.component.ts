import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

interface Department {
  [x: string]: any;
  id: number;
  name: string;
  branchIds?: number[];
  branchNames?: string[];
  // Add other properties as needed
}

interface Branch {
  id: number;
  name: string;
}

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent implements OnInit {
  departmentForm: FormGroup;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  loading: boolean = false;
  data: Department[] = [];
  branches: Branch[] = [];
  columnTable: string[] = [];
  confirmationModal: any = null;
  deleteId: number | null = null;
  searchTerm: string = '';
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentDepartmentId: number | null = null;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      branchName: [[],[]]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadBranches();
  }

  // Custom validator for at least one branch selection
  atLeastOneSelection(control: any) {
    const selections = control.value;
    return selections && selections.length ? null : { required: true };
  }

  loadDepartments(): void {
    this.loading = true;
    const pageIndex = this.currentPage - 1; // API expects 0-based index
    
    this.apiService.getDepartment(pageIndex, this.itemsPerPage, this.searchTerm, this.sortColumn, this.sortDirection).subscribe({
      next: (response: any) => {
        this.data = response['data'] || [];
        console.log(this.data);
        
        // Format the branch names as arrays if they're not already
        this.data = this.data.map(dept => {
          if (dept['branchName'] && typeof dept['branchName'] === 'string') {
            dept['branchName'] = dept['branchName'].split(',').map((name: string) => name.trim());
          }
          return dept;
        });
        
        this.totalElements = response['TotalElements'] || 0;
        if (this.data.length > 0) {
          this.columnTable = Object.keys(this.data[0]).filter(key => key !== 'id' && key !== 'branchIds');
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.toastr.error('Failed to load departments', 'Error');
        console.error('Error loading departments:', error);
        this.loading = false;
      }
    });
  }

  loadBranches(): void {
    this.apiService.getBranches().subscribe({
      next: (response: any) => {
        this.branches = response['data'] || [];
        console.log("branches",this.branches);
        
      },
      error: (error: any) => {
        this.toastr.error('Failed to load branches', 'Error');
        console.error('Error loading branches:', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDepartments();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadDepartments();
  }

  search(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadDepartments();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadDepartments();
  }

  openDeleteConfirmation(content: any, id: number): void {
    this.deleteId = id;
    this.confirmationModal = this.modalService.open(content, { centered: true });
  }

  deleteDepartment(): void {
    if (this.deleteId) {
      this.apiService.deleteDepartment(this.deleteId).subscribe({
        next: () => {
          this.toastr.success('Department deleted successfully', 'Success');
          this.loadDepartments();
          this.confirmationModal.close();
        },
        error: (error: any) => {
          this.toastr.error('Failed to delete department', 'Error');
          console.error('Error deleting department:', error);
        }
      });
    }
  }

  openCreateModal(content: any): void {
    this.departmentForm.reset();
    this.departmentForm.patchValue({
      branchNames: []
    });
    this.currentDepartmentId = null;
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: any, department: Department): void {
    this.currentDepartmentId = department.id;
    
    // Convert branch names to array if it's a string
    let branchName = department['branchName'];
    if (typeof branchName === 'string') {
      branchName = branchName.split(',').map(name => name.trim());
    }
    
    this.departmentForm.patchValue({
      name: department.name,
      branchNames: branchName
    });
    
    this.modalService.open(content, { centered: true });
  }

  submitDepartment(): void {
    if (this.departmentForm.valid) {
      const formValues = this.departmentForm.value;
      
      // Create request object
      const department = {
        name: formValues.name,
        branchName: formValues.branchName?formValues.branchName:[]
      };
      
      this.apiService.createDepartment(department).subscribe({
        next: () => {
          this.toastr.success('Department created successfully', 'Success');
          this.loadDepartments();
          this.modalService.dismissAll();
        },
        error: (error: any) => {
          this.toastr.error('Failed to create department', 'Error');
          console.error('Error creating department:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.departmentForm);
    }
  }

  updateDepartment(): void {
    if (this.departmentForm.valid && this.currentDepartmentId) {
      const formValues = this.departmentForm.value;
      
      // Create request object
      const department = {
        id: this.currentDepartmentId,
        name: formValues.name,
        branchName: formValues.branchNames
      };
      this.apiService.updateDepartment(department.id,department).subscribe({
        next: () => {
          this.toastr.success('Department updated successfully', 'Success');
          this.loadDepartments();
          this.modalService.dismissAll();
        },
        error: (error: any) => {
          this.toastr.error('Failed to update department', 'Error');
          console.error('Error updating department:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.departmentForm);
    }
  }

  // Helper to calculate the last item index for pagination display
  calculateLastItemIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
  }

  // Helper to trigger validation messages
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Helper method to determine if a field is invalid
  isInvalid(controlName: string): boolean {
    const control = this.departmentForm.get(controlName);
    return control !== null && control.invalid && (control.dirty || control.touched);
  }
}