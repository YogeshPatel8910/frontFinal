import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';

interface User {
  id: string;
  roleName: string;
  name: string;
  mobileNo: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  address?: string;
  age?: number;
  gender?: string;
  appointment?: string;
  medicalReport?: string;
  specialization?: string;
  [key: string]: any;
}

interface Role {
  label: string;
  value: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  tableColumns: Record<string, string[]> = {
    all: ["id", "roleName", "name", "mobileNo", "email", "createdAt", "updatedAt"],
    Patient: ["id", "roleName", "name", "mobileNo", "email", "createdAt", "updatedAt", "address", "age", "gender", "appointment", "medicalReport"],
    Doctor: ["id", "roleName", "name", "mobileNo", "email", "createdAt", "updatedAt", "specialization"]
  };
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  popupUserId: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  toastTitle: string = '';
  filterText = '';
  sortAscending = true;
  sortField = 'name';
  selectedRole: string = 'all';
  roles: Role[] = [
    { label: 'Patient', value: 'ROLE_PATIENT' },
    { label: 'Doctor', value: 'ROLE_DOCTOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' }
  ];
  oudKey: string[]=[];
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  showNotification(title: string, message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
  
  hideToast(): void {
    this.showToast = false;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    const selectedRoleFilter = this.selectedRole === 'all' 
      ? null 
      : this.roles.find(role => role.label === this.selectedRole)?.value || null;
    
    this.apiService.getAllUsers(
      this.currentPage - 1, 
      this.itemsPerPage, 
      selectedRoleFilter,
      // this.sortField,
      this.sortAscending ? 'asc' : 'desc'
    ).subscribe({
      next: (response:any) => {
        this.users = response['data'];
        this.totalElements = response.TotalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Failed to load users. Please try again later.';
        this.isLoading = false;
        this.showNotification('Error', 'Failed to load users. Please try again later.', 'error');
      }
    });
  }

  onPageChange(event: number) {
    this.currentPage = event;
    this.loadUsers();
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.loadUsers();
  }

  filterByRole(role: string) {
    this.selectedRole = role;
    this.currentPage = 1; // Reset to first page when changing filters
    this.loadUsers();
  }

  openDeletePopup(userId: string): void {
    this.popupUserId = userId;
  }

  closePopup(): void {
    this.popupUserId = null;
  }

  deleteUser(): void {
    if (!this.popupUserId) return;
    
    const userId = this.popupUserId;
    this.isLoading = true;
    
    this.apiService.deleteUser(userId).subscribe({
      next: () => {
        // Remove the user from the local array after successful deletion
        this.users = this.users.filter(user => user.id !== userId);
        this.popupUserId = null;
        this.isLoading = false;
        
        // Show success notification
        this.showNotification('Success', 'User has been successfully deleted', 'success');
        
        // Reload the current page if it's now empty (unless it's the first page)
        if (this.users.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.loadUsers();
        } else if (this.totalElements > 0) {
          // Update total count
          this.totalElements--;
        }
      },
      error: (err: any) => {
        console.error('Error deleting user:', err);
        this.errorMessage = 'Failed to delete user. Please try again later.';
        this.popupUserId = null;
        this.isLoading = false;
        this.showNotification('Error', 'Failed to delete user. Please try again later.', 'error');
      }
    });
  }
  openUserDetails(user: User): void {
    this.selectedUser = user;
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  
    this.apiService.getUserById(this.selectedUser.id).subscribe({
      next: (response) => {
        this.selectedUser = response;
        this.oudKey=Object.keys(this.selectedUser?this.selectedUser:'');
      },
      error: (error) => {
        console.error("Error fetching user details:", error);
      }
    });
  }
  
  closeModal(): void {
    this.selectedUser = null;
    document.body.style.overflow = "auto"; // Restore scrolling
  }
  formatColumnHeader(column: string): string {
    // Special cases for better display
    switch(column) {
      case 'id':
        return 'ID';
      case 'mobileNo':
        return 'Phone';
      case 'roleName':
        return 'Role';
      case 'createdAt':
        return 'Created';
      case 'updatedAt':
        return 'Updated';
      case 'medicalReport':
        return 'Reports';
      default:
        // Convert camelCase to Title Case with spaces
        return column
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
    }
  }
  
  /**
   * Apply filters to user list based on search text
   */
  applyFilters(): void {
    // This should be implemented to filter users based on filterText
    // You'll need to modify your API call or filter locally
    this.currentPage = 1; // Reset to first page when filtering
    this.loadUsers();
  }
  
  /**
   * Export users data to CSV
   */
  exportToCSV(): void {
    if (!this.users.length) return;
    
    // Get relevant columns for the current view
    const columns = this.tableColumns[this.selectedRole];
    
    // Create CSV header row
    let csv = columns.map(col => this.formatColumnHeader(col)).join(',') + '\n';
    
    // Add data rows
    this.users.forEach(user => {
      const row = columns.map(col => {
        // Handle special formatting
        if (col === 'roleName') {
          return `"${user[col]?.replace('ROLE_', '')}"`;
        } else if (col === 'createdAt' || col === 'updatedAt') {
          return user[col] ? `"${new Date(user[col]).toLocaleString()}"` : '""';
        } else {
          // Escape quotes and wrap in quotes
          return `"${(user[col] || '').toString().replace(/"/g, '""')}"`;
        }
      }).join(',');
      csv += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${this.selectedRole.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Refresh user data
   */
  refreshData(): void {
    this.loadUsers();
  }
}