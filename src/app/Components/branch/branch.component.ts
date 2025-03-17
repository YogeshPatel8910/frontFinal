import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css'
})
export class BranchComponent implements OnInit{
[x: string]: any;
  branchForm:FormGroup;
  departments:string[]=[]
  currentPage: number = 1;  // Ensure this starts at 1
  itemsPerPage: number = 10;
  totalElements: number = 0;
  popupUserId: number | null = null;
  popupPosition = { top: 0, left: 0 };
  addedBranches: any[] = []; // List of added branches
  selectedBranches: boolean[] = []; // Tracks selected branches for deletion
  data: any[]  = [];  // Ensure `data` is initialized as an object
  columnTable: string[] = [];
  loading: boolean = false;
  confirmationModal: any = null;
  deleteId: number | null = null;
  searchTerm: string = '';
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\+\-\s]{8,15}$/)]],
      departmentName:[[],[]]
    });
  }
  ngOnInit(): void {
    this.loadBranches();
    this.loadDepatments();
  }

  loadBranches(): void {
    this.loading = true;
    const pageIndex = this.currentPage - 1; // API expects 0-based index
    
    this.apiService.getBranch(pageIndex, this.itemsPerPage, this.searchTerm, this.sortColumn, this.sortDirection).subscribe({
      next: (response: any) => {
        this.data = response['data'];
        this.totalElements = response['TotalElements'];
        if (this.data.length > 0) {
          this.columnTable = Object.keys(this.data[0]).filter(key => key !== 'id');
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.toastr.error('Failed to load branches', 'Error');
        console.error('Error loading branches:', error);
        this.loading = false;
      }
    });
  }
  loadDepatments(): void {
    this.apiService.getDepartments().subscribe({
      next: (response: any) => {
        this.departments = response['data'] || [];
      },
      error: (error: any) => {
        this.toastr.error('Failed to load branches', 'Error');
        console.error('Error loading branches:', error);
      }
    });
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBranches();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadBranches();
  }

  search(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadBranches();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadBranches();
  }

  openDeleteConfirmation(content: any, id: number): void {
    this.deleteId = id;
    this.confirmationModal = this.modalService.open(content, { centered: true });
  }

  deleteBranch(): void {
    if (this.deleteId) {
      this.apiService.deleteBranch(this.deleteId).subscribe({
        next: () => {
          this.toastr.success('Branch deleted successfully', 'Success');
          this.loadBranches();
          this.confirmationModal.close();
        },
        error: (error: any) => {
          this.toastr.error('Failed to delete branch', 'Error');
          console.error('Error deleting branch:', error);
        }
      });
    }
  }

  cancelDelete(): void {
    this.confirmationModal.close();
    this.deleteId = null;
  }

  openCreateModal(content: any): void {
    this.branchForm.reset();
    this.modalService.open(content, { centered: true });
  }

  submitBranch(): void {
    if (this.branchForm.valid) {
      const branch = this.branchForm.value;
      this.apiService.createBranch(branch).subscribe({
        next: () => {
          this.toastr.success('Branch created successfully', 'Success');
          this.loadBranches();
          this.modalService.dismissAll();
        },
        error: (error: any) => {
          this.toastr.error('Failed to create branch', 'Error');
          console.error('Error creating branch:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.branchForm);
    }
  }
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
    const control = this.branchForm.get(controlName);
    return control !== null && control.invalid && (control.dirty || control.touched);
  }
}