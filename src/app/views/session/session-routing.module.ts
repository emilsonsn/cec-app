import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@app/views/session/login/login.component';
import { ForgotPasswordComponent } from '@app/views/session/forgot-password/forgot-password.component';
import { PasswordRecoveryComponent } from '@app/views/session/password-recovery/password-recovery.component';
import { AssignComponent } from './assign/assign.component';
import { permissionGuard } from '@app/guards/permission.guard';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'password_recovery',
    component: PasswordRecoveryComponent,
  },
  {
    path: 'assign',
    component: AssignComponent,
    canActivate: [permissionGuard],
    // data: {
    //   page: 'assign',
    // },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionRoutingModule {}
