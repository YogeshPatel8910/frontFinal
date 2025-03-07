import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../Services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  isRescheduleMode: boolean = false;
  showForm = false;
  selectedAppointment: any = null;
  role: string = '';
  data: { [key: string]: any } = {};
  appointments: any[] = []; // Ensure appointments is an array
  currentPage: number = 1; // Ensure this starts at 1
  itemsPerPage: number = 10;
  totalElements: number = 0;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loadUsers();
  }
  loadUsers(): void {
    this.apiService
      .getAppointment(this.currentPage - 1, this.itemsPerPage)
      .subscribe({
        next: (response: { [key: string]: any }) => {
          console.log(response);
          this.role = localStorage.getItem('role') || '';
          this.appointments = response['data'] || [];
          this.totalElements = response['TotalElements']; // Extract 'appointments' array if available
        },
        error: (error: any) => {
          console.log( error);
        },
      });
  }
  getStatusClasses(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-success text-white border-success'; // Green
      case 'cancelled':
        return 'bg-danger text-white border-danger'; // Red
      case 'completed':
        return 'bg-primary text-white border-primary'; // Blue
      default:
        return 'bg-secondary text-white border-secondary'; // Gray (default)
    }
  }
  onCancel(event: Event, appointment: any) {
    event.stopPropagation();
    this.selectedAppointment = appointment;
    this.modalService.open(this.confirmModal);
  }

  confirmDelete(modal: any) {
    this.apiService.deleteAppointment(this.selectedAppointment.id).subscribe({
      next: (res) => {
        this.loadUsers(); // Refresh list
        modal.close();
      },
      error: (err) => {
        console.error('Error cancelling appointment:', err);
      },
    });
  }

  onReschedule(event: Event, appointment: any) {
    event.stopPropagation();

    console.log('Clicked res:', appointment);
    this.selectedAppointment =appointment; // Store selected appointment
    this.isRescheduleMode = true; // Enable reschedule mode
    this.showForm = true; // Open the for

  }
  onPageChange(event: number) {
    this.currentPage = event;
    this.loadUsers(); // Reload data when the page changes
  }
  createForm(){
    this.showForm = true // Show or hide form
    this.isRescheduleMode = false;
    this.selectedAppointment = null;
  }

  toggleForm() {
    this.loadUsers();
    this.showForm = false; // Show or hide form
    this.selectedAppointment = null;
    this.isRescheduleMode = false;
  }
  
  openModal(content: any, appointment: any) {
    this.selectedAppointment = appointment;
    this.modalService.open(content, { centered: true, size: 'lg' });
  }
}
