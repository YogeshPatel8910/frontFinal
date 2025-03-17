import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../Services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  @ViewChild('medicalReportModal') medicalReportModal!: TemplateRef<any>;
  
  isRescheduleMode: boolean = false;
  showForm = false;
  selectedAppointment: any = null;
  role: string = '';
  data: { [key: string]: any } = {};
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  reportForm: boolean = false;
  isLoading: boolean = true;
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // For the date filter
  startDate: string = '';
  endDate: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.apiService
      .getAppointment(this.currentPage - 1, this.itemsPerPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: { [key: string]: any }) => {
          this.role = localStorage.getItem('role') || '';
          this.appointments = response['data'] || [];
          this.filteredAppointments = [...this.appointments];
          this.totalElements = response['TotalElements'];
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error loading appointments:', error);
          this.toastr.error('Failed to load appointments. Please try again later.');
        },
      });
  }

  getStatusClasses(status: string): string {
    if (!status) return 'bg-secondary text-white border-secondary';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-success text-white border-success';
      case 'cancelled':
        return 'bg-danger text-white border-danger';
      case 'completed':
        return 'bg-primary text-white border-primary';
      case 'pending':
        return 'bg-warning text-dark border-warning';
      default:
        return 'bg-secondary text-white border-secondary';
    }
  }

  handleCardClick(event: Event, content: any, appointment: any): void {
    // Get the actual target element that was clicked
    const target = event.target as HTMLElement;
    
    // Check if the click was on or within a button, input, or anchor element
    const isInteractiveElement = !!target.closest('button') || 
                                !!target.closest('input') || 
                                !!target.closest('a') ||
                                target.tagName.toLowerCase() === 'button' ||
                                target.tagName.toLowerCase() === 'input' ||
                                target.tagName.toLowerCase() === 'a';
    
    // If the click was not on an interactive element, open the modal
    if (!isInteractiveElement) {
      this.openModal(content, appointment);
    }
  }
  onCancel(event: Event, appointment: any) {
    // Stop propagation to prevent detail modal from opening
      event.stopPropagation();
    this.selectedAppointment = appointment;
    this.modalService.open(this.confirmModal, { centered: true });
  }
// Add this method to your AppointmentsComponent class

buttonClick(event: Event): void {
  // This is the key - it stops the event from bubbling up to parent elements
  event.stopPropagation();
  event.preventDefault();
  
  // Optional: console log to verify this method is being called
  console.log('Button click stopped from propagating');
}
  confirmDelete(modal: any) {
    const loadingToast = this.toastr.info('Cancelling appointment...', '', {
      disableTimeOut: true
    });
    
    this.apiService.deleteAppointment(this.selectedAppointment.id).subscribe({
      next: (res) => {
        this.toastr.clear(loadingToast.toastId);
        this.toastr.success('Appointment cancelled successfully');
        this.loadAppointments();
        modal.close();
      },
      error: (err) => {
        this.toastr.clear(loadingToast.toastId);
        console.error('Error cancelling appointment:', err);
        this.toastr.error('Failed to cancel appointment. Please try again.');
      },
    });
  }

  onReschedule(event: Event, appointment: any) {
    // Stop propagation to prevent detail modal from opening
    event.stopPropagation();
    event.preventDefault();
    
    this.selectedAppointment = appointment;
    this.isRescheduleMode = true;
    this.showForm = true;
  }

  createMedicalReport(event: Event, appointment: any, modal?: any) {
    // Stop propagation to prevent detail modal from opening
      event.stopPropagation();
    
    this.selectedAppointment = appointment;
    this.reportForm = true;
    if (modal) {
      modal.close(); // Close the detail modal if provided
    }
  }

  onPageChange(event: number) {
    this.currentPage = event;
    this.loadAppointments();
  }

  createForm() {
    this.showForm = true;
    this.isRescheduleMode = false;
    this.selectedAppointment = null;
  }

  toggleForm() {
    this.loadAppointments();
    this.showForm = false;
    this.selectedAppointment = null;
    this.isRescheduleMode = false;
  }
  
  closeReportForm() {
    this.reportForm = false;
    this.loadAppointments(); // Refresh appointments to show updated report status
  }
  
  openModal(content: any, appointment: any) {
    this.selectedAppointment = appointment;
    this.modalService.open(content, { 
      centered: true, 
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }
  
  // Filter functions
  applyFilters() {
    let filtered = [...this.appointments];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        (appointment.patientName && appointment.patientName.toLowerCase().includes(searchLower)) ||
        (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchLower)) ||
        (appointment.departmentName && appointment.departmentName.toLowerCase().includes(searchLower)) ||
        (appointment.branchName && appointment.branchName.toLowerCase().includes(searchLower)) ||
        (appointment.reason && appointment.reason.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status && appointment.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }
    
    // Apply date range filter
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= start && appointmentDate <= end;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (this.sortBy === 'status') {
        return this.sortOrder === 'asc' 
          ? a.status.localeCompare(b.status) 
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
    
    this.filteredAppointments = filtered;
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.startDate = '';
    this.endDate = '';
    this.sortBy = 'date';
    this.sortOrder = 'asc';
    this.applyFilters();
    this.toastr.info('Filters have been reset');
  }
  
  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }
  
  exportAppointments() {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Date,Time,Patient,Doctor,Department,Branch,Status,Reason\n";
    
    // Add data rows
    this.filteredAppointments.forEach(appointment => {
      const row = [
        new Date(appointment.date).toLocaleDateString(),
        appointment.timeSlot,
        appointment.patientName,
        appointment.doctorName,
        appointment.departmentName,
        appointment.branchName,
        appointment.status,
        appointment.reason
      ].map(cell => `"${cell || ''}"`).join(',');
      
      csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    this.toastr.success('Appointments exported successfully');
  }
  
  calculateLastItemIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
  }
}