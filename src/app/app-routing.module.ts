import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './Components/profile/profile.component';
import { LoginFormComponent } from './Components/login-form/login-form.component';
import { authGuard } from './auth.guard';
import { AppointmentsComponent } from './Components/appointments/appointments.component';
import { RegisterFormComponent } from './Components/register-form/register-form.component';

const routes: Routes = [
  {path: 'login', component: LoginFormComponent},
  {path:'signup',component:RegisterFormComponent},
  {path:'profile',component:ProfileComponent,canActivate: [authGuard] },
  {path:'appointment',component:AppointmentsComponent,canActivate:[authGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
