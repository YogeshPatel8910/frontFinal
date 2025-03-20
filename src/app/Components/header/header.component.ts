import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  role:string=''
  ngOnInit() {
    this.role = localStorage.getItem('userRole') || '';
  }

  logout(){
    localStorage.clear();
  }
}
