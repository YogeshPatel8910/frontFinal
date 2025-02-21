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


@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
    AppointmentsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: authInterceptor, multi: true },
    provideAnimationsAsync(), 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
