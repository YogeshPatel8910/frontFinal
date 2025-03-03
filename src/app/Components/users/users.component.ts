import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  tableColumns : Record<string, string[]> = {
    all : ["id","roleName","name","mobileNo","email","createdAt","updatedAt","address","age","gender","appointment","medicalReport","specialization"],
    Patient : ["id","roleName","name","mobileNo","email","createdAt","updatedAt","address","age","gender","appointment","medicalReport"],
    Doctor : ["id","roleName","name","mobileNo","email","createdAt","updatedAt","specialization"]
  };
  currentPage: number = 1;  // Ensure this starts at 1
  itemsPerPage: number = 10;
  totalElements: number = 0;
  hoveredUserId: string | null = null;
  popupUserId: string | null = null;

  filterText = '';
  filteredUsers = [...this.users];
  sortAscending = true;
  selectedUser: string = '';
  selectedRole: string = 'all';
  roles = [
    { label: 'Patient', value: 'ROLE_PATIENT' },
    { label: 'Doctor', value: 'ROLE_DOCTOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' }
  ];
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  
  loadUsers(): void {
    // If 'all' is selected, send null; otherwise, send the selected role
    const selectedRoleFilter = this.selectedRole === 'all' 
    ? null 
    : this.roles.find(role => role.label === this.selectedRole)?.value || null;
    this.apiService.getAllUsers(this.currentPage - 1, this.itemsPerPage, selectedRoleFilter).subscribe({
      next: (response: { [key: string]: any }) => {
        console.log(response['data']);
        this.users = response['data'];
        this.totalElements = response['TotalElements'];
      }
    });
  }
  

  onPageChange(event: number) {
    this.currentPage = event;
    this.loadUsers();  // Reload data when the page changes
  }
  filterUsers() {
    this.applyFilters();
  }

  sortByName() {
    this.sortAscending = !this.sortAscending;
    this.filteredUsers.sort((a, b) => 
      this.sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }

  filterByRole(role: string) {
    this.selectedRole = role;
    this.loadUsers();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user =>
      (this.selectedRole === 'all' || user.roleName.toLowerCase() === this.selectedRole) &&
      (this.selectedUser === '' || user.name === this.selectedUser)
    );
    this.totalElements = this.filteredUsers.length;
  }
  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(user => user.id !== userId);
      console.log(`User with ID ${userId} deleted`);
    }
  }
  
openDeletePopup(userId: string): void {
  this.popupUserId = userId;
}
  onHover(userId: string): void {
    console.log(`Hovered over user with ID ${userId}`);
  }
  
}
