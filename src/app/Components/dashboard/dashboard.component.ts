import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  userData: any = null;
  temperature: number = 10; // Setting temperature to 10 as requested
  weatherData: any = {
    current: 24,
    high: 28,
    low: 19,
    condition: 'Partly Cloudy'
  };
  
  // Statistics for each role
  statistics: any = {
    ROLE_ADMIN: [
      { title: 'Total Patients', value: 0, icon: 'bi-people-fill', color: 'primary' },
      { title: 'Total Doctors', value: 0, icon: 'bi-clipboard2-pulse-fill', color: 'success' },
      { title: 'Appointments Today', value: 0, icon: 'bi-calendar-check-fill', color: 'warning' },
      { title: 'System Alerts', value: 0, icon: 'bi-exclamation-triangle-fill', color: 'danger' }
    ],
    ROLE_PATIENT: [
      { title: 'Upcoming Appointments', value: 0, icon: 'bi-calendar-date-fill', color: 'primary' },
      { title: 'Prescriptions', value: 0, icon: 'bi-prescription2', color: 'success' },
      { title: 'Test Results', value: 0, icon: 'bi-file-earmark-medical-fill', color: 'warning' },
      { title: 'Messages', value: 0, icon: 'bi-envelope-fill', color: 'info' }
    ],
   
    ROLE_DOCTOR: [
      { title: 'Today\'s Patients', value: 0, icon: 'bi-person-fill', color: 'primary' },
      { title: 'Pending Reports', value: 0, icon: 'bi-file-earmark-text-fill', color: 'warning' },
      { title: 'Messages', value: 0, icon: 'bi-chat-dots-fill', color: 'info' },
      { title: 'Schedule', value: 0, icon: 'bi-calendar-week-fill', color: 'success' }
    ]
  };
  
  // Recent activities for each role
  activities: any = {
    ROLE_ADMIN: [
      { type: 'New Patient Registration', time: '10 minutes ago', user: 'John Doe', status: 'Complete' },
      { type: 'System Update', time: '1 hour ago', user: 'Admin', status: 'Complete' },
      { type: 'Doctor Schedule Change', time: '3 hours ago', user: 'Dr. Smith', status: 'Pending Approval' },
      { type: 'Data Backup', time: '1 day ago', user: 'System', status: 'Complete' }
    ],
    ROLE_PATIENT: [
      { type: 'Appointment Confirmed', time: '2 hours ago', with: 'Dr. Johnson', status: 'Scheduled' },
      { type: 'Prescription Refill', time: '1 day ago', with: 'Dr. Smith', status: 'Ready for Pickup' },
      { type: 'Test Results', time: '3 days ago', with: 'Lab', status: 'Available' },
      { type: 'Bill Payment', time: '1 week ago', with: 'Billing Dept.', status: 'Paid' }
    ],
   
    ROLE_DOCTOR: [
      { type: 'Patient Appointment', time: '1 hour ago', patient: 'Jane Smith', status: 'Completed' },
      { type: 'Test Results', time: '3 hours ago', patient: 'Mike Johnson', status: 'Reviewed' },
      { type: 'Meeting', time: '2 days ago', with: 'Department Head', status: 'Attended' },
      { type: 'Research Paper', time: '1 week ago', topic: 'Covid-19 Treatment', status: 'In Progress' }
    ]
  };
  
  // Quick actions for each role
  quickActions: any = {
    ROLE_ADMIN: [
      { title: 'Add New User', icon: 'bi-person-plus-fill', route: '/admin/add-user' },
      { title: 'System Reports', icon: 'bi-file-earmark-bar-graph-fill', route: '/admin/reports' },
      { title: 'Manage Doctors', icon: 'bi-clipboard2-pulse-fill', route: '/admin/doctors' },
      { title: 'Settings', icon: 'bi-gear-fill', route: '/admin/settings' }
    ],
    ROLE_PATIENT: [
      { title: 'Book Appointment', icon: 'bi-calendar-plus-fill', route: '/patient/book-appointment' },
      { title: 'View Medical Records', icon: 'bi-file-medical-fill', route: '/patient/records' },
      { title: 'Contact Doctor', icon: 'bi-chat-left-text-fill', route: '/patient/messages' },
      { title: 'Pay Bills', icon: 'bi-credit-card-fill', route: '/patient/billing' }
    ],
 
    ROLE_DOCTOR: [
      { title: 'View Schedule', icon: 'bi-calendar-check-fill', route: '/doctor/schedule' },
      { title: 'Patient Records', icon: 'bi-person-lines-fill', route: '/doctor/patients' },
      { title: 'Write Prescription', icon: 'bi-prescription', route: '/doctor/prescriptions' },
      { title: 'Lab Results', icon: 'bi-clipboard-data-fill', route: '/doctor/lab-results' }
    ]
  };
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadUserData();
  }
  
  loadUserData() {
    this.isLoading = true;
    this.apiService.getData()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('User data retrieved:', response);
          this.userData = response;
          this.loadDashboardData(this.userData.roleName);
        },
        error: (error) => {
          console.error('Error retrieving user data:', error);
          this.errorMessage = 'Failed to load dashboard data. Please try again later.';
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 3000);
        }
      });
  }
  
  loadDashboardData(role: string) {
    // In a real application, you would load this data from your API
    // Here we're simulating the data load with mock data
    this.isLoading = true;
    
    setTimeout(() => {
      // Simulate loading random data for statistics
      this.statistics[role].forEach((stat: { value: number; }) => {
        stat.value = Math.floor(Math.random() * 100);
      });
      
      this.isLoading = false;
    }, 800);
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
  refreshData() {
    this.loadDashboardData(this.userData.roleName);
  }

}