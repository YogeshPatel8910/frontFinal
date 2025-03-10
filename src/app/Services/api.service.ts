import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl1 = 'http://localhost:8081/api/';
  constructor(private http: HttpClient,private authService:AuthenticationService) {}
  
  getData() {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/profile`);
  }
  updateData(data:any):any{
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/profile`,data);
  }
  getAppointment(page: number, size: number):any{
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/appointment?direction=desc&page=${page}&size=${size}`);
  }
  
  addAppointment(data: any) {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('role')}/appointment`,data);
  }

  deleteAppointment(id:number) {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/appointment/${id}/cancel`,"");
  }
  rescheduleAppointment(id:number,data:any) {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/appointment/${id}/reschedule`,data);
  }

  getAppointmentData(){
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/data`);
  }

  getAllUsers(page: number, size: number,user : string | null) {
    if(!!user)
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}?direction=desc&page=${page}&size=${size}&search=${user}`);
    else
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}?page=${page}&size=${size}`);
  }

  setLeave(dates : Array<string>){
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/setLeave`,dates)
  }
  removeLeave(dates : Array<string>){
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/deleteLeave`,dates)
  }
  getLeave(){
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/leave`)
  }
  getBranch(page: number, size: number):any{
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/branch?&page=${page}&size=${size}`);
  }
  getDepartment(page: number, size: number):any{
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department?&page=${page}&size=${size}`);
  }
}
