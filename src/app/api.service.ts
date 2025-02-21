import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './Services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient,private authService:AuthenticationService) {}

  getData() {
    return this.http.get(`http://localhost:8081/api/${localStorage.getItem('role')}/profile`);
  }
  updateData(data:any){
    return this.http.put('http://localhost:8081/api/admin/profile',data);
  }
  
}
