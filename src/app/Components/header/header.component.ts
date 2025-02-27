import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  role:string='';
  constructor(){}
  ngOnInit() {
    this.role = localStorage.getItem('role') || '';
  }

  logout(){
    localStorage.removeItem('authToken')
  }
}
