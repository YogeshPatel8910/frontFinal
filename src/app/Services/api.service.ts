import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

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
  getAppointment():any{
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/profile/appointment?direction=desc`);
  }
  
  addAppointment(data: any) {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('role')}/profile/appointment`,data);
  }

  getAppointmentData(){
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/profile/data`);
  }

  getAllUsers(page: number, size: number,user : string | null) {
    if(!!user)
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}?page=${page}&size=${size}&search=${user}`);
    else
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}?page=${page}&size=${size}`);
  }

}
