import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './Components/profile/profile.component';
import { LoginFormComponent } from './Components/login-form/login-form.component';
import { authGuard } from './Shared/auth.guard';
import { AppointmentsComponent } from './Components/appointments/appointments.component';
import { RegisterFormComponent } from './Components/register-form/register-form.component';
import { UsersComponent } from './Components/users/users.component';
import { LeaveComponent } from './Components/leave/leave.component';
import { BranchComponent } from './Components/branch/branch.component';
import { DepartmentComponent } from './Components/department/department.component';

const routes: Routes = [
  {path: 'login', component: LoginFormComponent},
  {path:'signup',component:RegisterFormComponent},
  {path:'profile',component:ProfileComponent,canActivate: [authGuard] },
  {path:'appointment',component:AppointmentsComponent,canActivate:[authGuard]},
  {path:'leave',component:LeaveComponent,canActivate:[authGuard]},
  {path:'users',component:UsersComponent,canActivate:[authGuard]},
  {path:'branch',component:BranchComponent,canActivate:[authGuard]},
  {path:'department',component:DepartmentComponent,canActivate:[authGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
