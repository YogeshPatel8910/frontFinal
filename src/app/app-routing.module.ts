// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginFormComponent } from './Components/login-form/login-form.component';
import { RegisterFormComponent } from './Components/register-form/register-form.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AppointmentsComponent } from './Components/appointments/appointments.component';
import { LeaveComponent } from './Components/leave/leave.component';
import { UsersComponent } from './Components/users/users.component';
import { BranchComponent } from './Components/branch/branch.component';
import { DepartmentComponent } from './Components/department/department.component';
import { UnauthorizedComponent } from './Components/unauthorized/unauthorized.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { MedicalReportFormComponent } from './Components/medical-report-form/medical-report-form.component';

// Guards
import { authGuard } from './Shared/auth.guard';
import { roleGuard } from './Shared/role.guard';

// Resolvers
// import { UserDataResolver } from './resolvers/user-data.resolver';
// import { AppointmentsResolver } from './resolvers/appointments.resolver';
// import { DepartmentResolver } from './resolvers/department.resolver';

const routes: Routes = [
  // Public routes
  { 
    path: 'login', 
    component: LoginFormComponent 
  },
  { 
    path: 'signup', 
    component: RegisterFormComponent 
  },
  
  // Protected routes - Dashboard/Profile
  { 
    path: 'profile', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    // resolve: {
    //   userData: UserDataResolver
    // }
  },
  
  // Protected routes - User management (Admin only)
  { 
    path: 'users', 
    component: UsersComponent, 
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' }
  },
  { 
    path: 'add', 
    component: RegisterFormComponent, 
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' }
  },
  
  // Protected routes - Department management (Admin only)
  { 
    path: 'department', 
    component: DepartmentComponent, 
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' },
    // resolve: {
    //   departments: DepartmentResolver
    // }
  },
  { 
    path: 'branch', 
    component: BranchComponent, 
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' }
  },
  
  // Protected routes - Employee features
  { 
    path: 'appointment', 
    component: AppointmentsComponent, 
    canActivate: [authGuard],
    // resolve: {
    //   appointments: AppointmentsResolver
    // }
  },
  { 
    path: 'leave', 
    component: LeaveComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'medical-report', 
    component: MedicalReportFormComponent, 
    canActivate: [authGuard]
  },
  
  // Error handling routes
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent 
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    component: PageNotFoundComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }