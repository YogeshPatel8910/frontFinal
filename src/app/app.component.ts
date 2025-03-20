import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from './Services/authentication.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  isAuthenticated = false;
  private authSubscription: Subscription = new Subscription(); ;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onLoginSuccess(): void {
    // With the new authentication service, you don't need to manually set authenticated
    // This is handled internally in the login method
    // But for backward compatibility, you can keep this method
    this.authService.setAuthenticated(true);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}