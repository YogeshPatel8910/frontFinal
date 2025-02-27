import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  showForm = false;
  selectedAppointment: any = null;
  role:string='';
  data: { [key: string]: any } = {};
  appointments: any[] = []; // Ensure appointments is an array
  currentPage = 1; // Track the current page
  itemsPerPage = 5; // Items per page
  constructor(private apiService: ApiService, private router: Router, private modalService: NgbModal) {}

  ngOnInit() {
    this.apiService.getAppointment()
      .subscribe({
        next: (response: [{ [key: string]: any }]) => {
          console.log(response);
          this.role=localStorage.getItem('role') || '';
          this.data = response;
          this.appointments = response || []; // Extract 'appointments' array if available
        },
        error: (error: any) => {
          console.log(error);
          this.router.navigate(['login']);
        }
      });
  }

  getStatusClasses(status: string): string {
    switch (status.toLowerCase()) {
        case 'confirmed': return 'bg-success text-white border-success';  // Green
        case 'pending': return 'bg-warning text-dark border-warning';    // Yellow
        case 'cancelled': return 'bg-danger text-white border-danger';   // Red
        case 'completed': return 'bg-primary text-white border-primary'; // Blue
        default: return 'bg-secondary text-white border-secondary';      // Gray (default)
    }
}
onAppointmentClick2(event: Event,appointment: any) {
  event.stopPropagation();
  console.log('Clicked cancel:', appointment);
  // You can navigate or open a modal here
  // this.router.navigate(['/appointment-details', appointment.id]);
}
onAppointmentClick1(event : Event,appointment: any) {
    event.stopPropagation();
  console.log('Clicked res:', appointment);
  // You can navigate or open a modal here
  // this.router.navigate(['/appointment-details', appointment.id]);
}

  
  toggleForm() {
    this.showForm = !this.showForm; // Show or hide form
  }
  openModal(content: any, appointment: any) {
    this.selectedAppointment = appointment;
    this.modalService.open(content, { centered: true, size: 'lg' });
  }
}
