import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Tasks } from './tasks/tasks';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'tasks', component: Tasks }
];
