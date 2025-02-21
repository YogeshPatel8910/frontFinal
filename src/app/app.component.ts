import { Component } from '@angular/core';
import { AuthenticationService } from './Services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  isAuthenticated = false;

  constructor(private authService: AuthenticationService,private http:HttpClient,private router:Router) {
    this.authService=authService
  }

  
  ngOnInit(): void {
      this.authService.isAuthenticated$.subscribe(status => {
        this.isAuthenticated = status;
      });
  }

  onLoginSuccess():void{
    this.authService.setAuthenticated(true);
  }
  
  get getAuthService() {
    return this.authService;
  }
}
