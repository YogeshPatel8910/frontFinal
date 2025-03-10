import { Component } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css'
})
export class BranchComponent {
  branchForm:FormGroup
  currentPage: number = 1;  // Ensure this starts at 1
  itemsPerPage: number = 10;
  totalElements: number = 0;
  popupUserId: number | null = null;
  popupPosition = { top: 0, left: 0 };
  data: any[]  = [];  // Ensure `data` is initialized as an object
  columnTable: string[] = [];

constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }  
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // If 'all' is selected, send null; otherwise, send the selected role
    // const selectedRoleFilter = this.selectedRole === 'all' 
    // ? null 
    // : this.roles.find(role => role.label === this.selectedRole)?.value || null;
    this.apiService.getBranch(0,10).subscribe({
      next: (response: { [key: string]: any }) => {
        console.log(response['data']);
        // this.users = response['data'];
        // this.totalElements = response['TotalElements'];
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
}
