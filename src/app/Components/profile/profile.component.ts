import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { first } from 'rxjs';
import { NotExpr } from '@angular/compiler';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  data='';
  constructor(private apiService: ApiService) {}
  ngOnInit() {
    this.apiService.getData()
    .pipe(first())
    .subscribe({
      next:(response)=>{
        this.data=JSON.stringify(response);
        console.log(response)
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
