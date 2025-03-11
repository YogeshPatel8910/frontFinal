import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl1 = 'http://192.168.0.72:8081/api/';
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

  getAllUsers(page: number, size: number,user : string | null,direction:string) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('direction',direction);
    
      if (user) {
          params = params.set('search', user);
        }
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}`, { params });
  }
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/${id}`);
  }

  // createUser(userData: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl1}}${localStorage.getItem('role')}/users`, userData);
  // }

  // updateUser(id: string, userData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl1}}${localStorage.getItem('role')}/${id}`, userData);
  // }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('role')}/${id}`);
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
  // getDepartment(page: number, size: number):any{
  //   return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department?&page=${page}&size=${size}`);
  // }
  // getBranch(page: number, size: number):any{
  //   return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/branch?&page=${page}&size=${size}`);
  // }
  getBranch(page: number, size: number, search: string = '', sortField: string = 'name', sortDirection: string = 'asc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    // if (search) {
    //   params = params.set('search', search);
    // }
    
    // if (sortField) {
    //   params = params.set('sort', `${sortField},${sortDirection}`);
    // }
    
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/branch`, { params });
  }

  // Create a new branch
  createBranch(branch: any): Observable<any> {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('role')}/branch`, branch);
  }

  // Get a single branch by ID
  getBranchById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/branch/${id}`);
  }

  // Update a branch
  updateBranch(id: number, branch: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/branch/${id}`, branch);
  }

  // Delete a branch
  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('role')}/branch/${id}`);
  }
  getDepartment(page: number, size: number, search: string = '', sortField: string = 'name', sortDirection: string = 'asc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    // if (search) {
    //   params = params.set('search', search);
    // }
    
    // if (sortField) {
    //   params = params.set('sort', `${sortField},${sortDirection}`);
    // }
    
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department`, { params });
  }

  getDepartments(): Observable<any> {
    // Get all department (for dropdowns, etc.)
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department/all`);
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('role')}/department`, department);
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department/${id}`);
  }

  updateDepartment(id: number, department: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('role')}/department/${id}`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('role')}/department/${id}`);
  }

  getDepartmentsByBranchId(branchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/department/branch/${branchId}`);
  }
  getBranches(): Observable<any> {
    // Get all branches (for dropdowns, etc.)
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('role')}/branch`);
  }
}
