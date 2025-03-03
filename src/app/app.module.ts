import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginFormComponent } from './Components/login-form/login-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { ProfileComponent } from './Components/profile/profile.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentsComponent } from './Components/appointments/appointments.component';
import { RegisterFormComponent } from './Components/register-form/register-form.component';
import { AppointmentFormComponent } from './Components/appointment-form/appointment-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { UsersComponent } from './Components/users/users.component';
import { LeaveComponent } from './Components/leave/leave.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
    AppointmentsComponent,
    RegisterFormComponent,
    AppointmentFormComponent,
    UsersComponent,
    LeaveComponent,
    

  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    NgbModule,
    NgxPaginationModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: authInterceptor, multi: true },
    provideAnimationsAsync(), 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
