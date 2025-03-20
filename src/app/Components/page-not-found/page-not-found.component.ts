import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
