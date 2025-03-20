import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  constructor(private router: Router,private location:Location) {}

  goBack(): void {
    window.history.back();
    
  }

  goToDashboard(): void {
    this.router.navigate(['/profile']);
  }

}
