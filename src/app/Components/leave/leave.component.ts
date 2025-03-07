import { Component, OnInit, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../Services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrl: './leave.component.css',
})
export class LeaveComponent implements OnInit {
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  today: string = this.getFormattedDate(new Date());
  selectedLeaves: Set<string> = new Set();
  leaveNotes: { [key: string]: string } = {};
  daysInMonth: any[] = [];
  pastLeaves: string[] = []; // Example past leaves
  leaveReason: string = '';
  isDeleteMode: boolean = false;
  selectType:boolean | null = null; 
  isRemoving: boolean | null = null ;
  constructor(private apiService: ApiService, private modalService: NgbModal) {}

  ngOnInit() {
   this.initCal();
  }
  initCal(){
    this.apiService.getLeave().subscribe({
      next: (res: any) => {
        console.log(res);
        this.pastLeaves = res;
        this.generateCalendar();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  generateCalendar() {
    this.daysInMonth = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDay = firstDayOfMonth.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
      this.daysInMonth.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateString = this.getFormattedDate(date);
      const isPast = dateString < this.today;
      const isPastLeave = this.pastLeaves.includes(dateString);

      this.daysInMonth.push({
        day,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateString,
        isPast,
        isPastLeave,
      });
    }
  }

  getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isLeaveSelected(dateString: string): boolean {
    return this.selectedLeaves.has(dateString);
  }

  confirmLeave(modal:any) {
    if (this.selectedLeaves) {
      console.log(this.selectedLeaves);

      this.apiService.setLeave(Array.from(this.selectedLeaves)).subscribe({
        next: (response) => {
          this.initCal();
          modal.close();
          this.selectedLeaves.clear();
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
  openModal(isCancel: boolean, modal: any) {
    this.isRemoving = isCancel;
    this.modalService.open(this.confirmModal);
  }
  

  removeLeave(modal:any) {
    if (this.selectedLeaves) {
      console.log(this.selectedLeaves);

      this.apiService.removeLeave(Array.from(this.selectedLeaves)).subscribe({
        next: (response) => {
          this.initCal();
          modal.close()
          this.selectedLeaves.clear();
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  changeMonth(direction: number) {
    this.currentMonth += direction;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  getMonthName(month: number): string {
    return new Date(this.currentYear, month).toLocaleString('en-US', {
      month: 'long',
    });
  }

  getSortedLeaves(filterType: string): string[] {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Get current month (1-12)

    return Array.from(
      this.pastLeaves.filter((leaveDate) => {
        const leaveDateObj = new Date(leaveDate);
        const leaveMonth = leaveDateObj.getMonth() + 1; // Convert to 1-12 range

        if (filterType === 'present') {
          return leaveMonth === currentMonth; // Only current month's leaves
        } else if (filterType === 'past') {
          return leaveMonth < currentMonth; // Leaves from previous months
        } else {
          return true; // No filter applied, return all leaves
        }
      })
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort in chronological order
  }

  getLeaveModalDatesArray(): string[] {
    return Array.from(this.selectedLeaves);
  }
  onClick(dateString: string | null): void {
    if (!dateString) return; // Prevent null values

    if (!this.selectedLeaves) {
      this.selectedLeaves = new Set(); // Ensure initialization
    }

    if(this.selectType==null){
      if(this.pastLeaves.includes(dateString)){
        this.selectType=true;
      }
      else{
        this.selectType=false;
      }
    }
    if (this.selectedLeaves.has(dateString)) {
      this.selectedLeaves.delete(dateString);
      if(this.selectedLeaves.size==0){
        this.selectType=null;
      }
    }
    else{
      if (this.selectedLeaves.size < 4 && (this.selectType == this.pastLeaves.includes(dateString))) {
        this.selectedLeaves.add(dateString);
      }
      console.log(Array.from(this.selectedLeaves));
    }
   
  }
 
  isPastLeaveSelected(): boolean {
    return Array.from(this.selectedLeaves).some(date => this.pastLeaves.includes(date));
  }
  
  toggleDeleteMode(): void {
    this.selectType =null;
    this.selectedLeaves.clear(); // Clear selection when switching mode
  }
  
}
