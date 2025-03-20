import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../Services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

// Define interfaces for better type safety
interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  departmentName: string;
  branchName: string;
  date: string;
  timeSlot: string;
  status: string;
  reason: string;
  medicalReport?: MedicalReport;
}

interface MedicalReport {
  id?: number;
  diagnosis: string;
  treatment: string;
  symptom:string;
  prescriptions: Array<Prescription>;
  notes: string;
  followUp: string;
  createdDate: string;
}
interface Prescription {
  id?: number;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface ApiResponse {
  data: Appointment[];
  TotalElements: number;
  [key: string]: any;
}

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  @ViewChild('medicalReportModal') medicalReportModal!: TemplateRef<any>;
  
  // State flags
  isRescheduleMode = false;
  showForm = false;
  reportForm = false;
  reportData = false;
  isLoading = true;
  
  // Data properties
  selectedAppointment: Appointment | null = null;
  role = '';
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalElements = 0;
  
  // Filters
  searchTerm = '';
  statusFilter = 'all';
  startDate = '';
  endDate = '';
  sortBy = 'date';
  sortOrder: SortOrder = 'asc';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.apiService
      .getAppointment(this.currentPage - 1, this.itemsPerPage)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: ApiResponse) => {
          this.role = localStorage.getItem('userRole') || '';
          this.appointments = response.data || [];
          this.totalElements = response.TotalElements;
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error loading appointments:', error);
          this.toastr.error('Failed to load appointments. Please try again later.');
        },
      });
  }

  getStatusClasses(status?: string): string {
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

  openModal(content: any, appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.modalService.open(content, { 
      centered: true, 
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  // Event handlers - all explicitly stop propagation to prevent bubbling issues
  onCancel(event: Event, appointment: Appointment | null): void {
    event.stopPropagation();
    this.selectedAppointment = appointment;
    this.modalService.open(this.confirmModal, { centered: true });
  }

  onReschedule(event: Event, appointment: Appointment | null): void {
    event.stopPropagation();
    this.selectedAppointment = appointment;
    this.isRescheduleMode = true;
    this.showForm = true;
  }
  
  onViewReport(event: Event, appointment: Appointment | null, modal?: any): void {
    event.stopPropagation();
    this.selectedAppointment = appointment;
    console.log(this.selectedAppointment);
    
    this.reportData = true;
    
    if (modal) {
      modal.close();
    }
  }

  createMedicalReport(event: Event, appointment: Appointment | null, modal?: any): void {
    event.stopPropagation();
    this.selectedAppointment = appointment;
    
    if(this.reportData){
      this.reportData=false;
    }
    this.reportForm = true;
    
    if (modal) {
      modal.close();
    }
  }

  // Appointment management methods
  confirmDelete(modal: any): void {
    if (!this.selectedAppointment) return;
    
    const loadingToast = this.toastr.info('Cancelling appointment...', '', {
      disableTimeOut: true
    });
    
    this.apiService.deleteAppointment(this.selectedAppointment.id).subscribe({
      next: () => {
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

  createForm(): void {
    this.showForm = true;
    this.isRescheduleMode = false;
    this.selectedAppointment = null;
  }

  toggleForm(): void {
    this.loadAppointments();
    this.showForm = false;
    this.selectedAppointment = null;
    this.isRescheduleMode = false;
  }
  
  closeReportForm(): void {
    if(this.reportData){
      this.reportData = false;
    }
    if(this.reportForm){
      this.reportForm = false;
      this.loadAppointments();
    }
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAppointments();
  }

  // Filter functions
  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        (appointment.patientName?.toLowerCase().includes(searchLower)) ||
        (appointment.doctorName?.toLowerCase().includes(searchLower)) ||
        (appointment.departmentName?.toLowerCase().includes(searchLower)) ||
        (appointment.branchName?.toLowerCase().includes(searchLower)) ||
        (appointment.reason?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status?.toLowerCase() === this.statusFilter.toLowerCase()
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
          ? (a.status || '').localeCompare(b.status || '') 
          : (b.status || '').localeCompare(a.status || '');
      }
      return 0;
    });
    
    this.filteredAppointments = filtered;
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.startDate = '';
    this.endDate = '';
    this.sortBy = 'date';
    this.sortOrder = 'asc';
    this.applyFilters();
    this.toastr.info('Filters have been reset');
  }
  
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }
  
  calculateLastItemIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
  }
  
  exportAppointments(): void {
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
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.toastr.success('Appointments exported successfully');
  }
}