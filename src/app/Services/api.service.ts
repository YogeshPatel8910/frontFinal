import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MedicalReport } from '../Components/medical-report-form/medical-report-form.component';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // getBranch(page: number, size: number):any{
  //   return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch?&page=${page}&size=${size}`);
  // }
  
  private apiUrl1 = 'http://192.168.0.72:8081/api/';
  constructor(private http: HttpClient,private authService:AuthenticationService) {}
  
  getData() {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/profile`);
  }
  updateData(data:any):any{
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/profile`,data);
  }
  getAppointment(page: number, size: number):any{
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/appointment?direction=desc&page=${page}&size=${size}`);
  }
  
  addAppointment(data: any) {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('userRole')}/appointment`,data);
  }

  deleteAppointment(id:number) {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/appointment/${id}/cancel`,"");
  }
  rescheduleAppointment(id:number,data:any) {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/appointment/${id}/reschedule`,data);
  }
  saveMedicalReport(id:number,medicalReport: MedicalReport) {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('userRole')}/appointment/${id}/report`,medicalReport);
  }
  getRegisterData(): Observable<Record<string, string[]>>{
    return this.http.get<Record<string, string[]>>(`${this.apiUrl1}auth/data/register`);
  }
  getAppointmentData(): Observable<Record<string, Record<string, string[]>>>{
    return this.http.get<Record<string, Record<string, string[]>>>(`${this.apiUrl1}auth/data/appointment`)
  }

  getAllUsers(page: number, size: number,user : string | null,direction:string) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('direction',direction);
    
      if (user) {
          params = params.set('search', user);
        }
      return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}`, { params });
  }
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/${id}`);
  }

  // createUser(userData: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl1}}${localStorage.getItem('userRole')}/users`, userData);
  // }

  // updateUser(id: string, userData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl1}}${localStorage.getItem('userRole')}/${id}`, userData);
  // }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('userRole')}/${id}`);
  }
  setLeave(dates : Array<string>){
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/setLeave`,dates)
  }
  removeLeave(dates : Array<string>){
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/deleteLeave`,dates)
  }
  getLeave(){
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/leave`)
  }
  getLeaveData(name:string){
    return this.http.get(`${this.apiUrl1}auth/data/leave/${name}`,)
  }
  // getDepartment(page: number, size: number):any{
  //   return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/department?&page=${page}&size=${size}`);
  // }
  // getBranch(page: number, size: number):any{
  //   return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch?&page=${page}&size=${size}`);
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
    
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch`, { params });
  }

  // Create a new branch
  createBranch(branch: any): Observable<any> {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch`, branch);
  }

  // Get a single branch by ID
  getBranchById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch/${id}`);
  }

  // Update a branch
  updateBranch(id: number, branch: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch/${id}`, branch);
  }

  // Delete a branch
  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch/${id}`);
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
    
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/department`, { params });
  }

  getDepartments(): Observable<any> {
    // Get all department (for dropdowns, etc.)
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/department`);
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post(`${this.apiUrl1}${localStorage.getItem('userRole')}/department`, department);
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/department/${id}`);
  }

  updateDepartment(id: number, department: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}${localStorage.getItem('userRole')}/department/${id}`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl1}${localStorage.getItem('userRole')}/department/${id}`);
  }

  getDepartmentsByBranchId(branchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/department/branch/${branchId}`);
  }
  getBranches(): Observable<any> {
    // Get all branches (for dropdowns, etc.)
    return this.http.get(`${this.apiUrl1}${localStorage.getItem('userRole')}/branch`);
  }

}
