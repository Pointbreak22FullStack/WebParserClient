import { Routes } from '@angular/router';
import {Dashboard} from './pages/dashboard/dashboard';
import {Login} from './pages/login/login';
import {Register} from './pages/register/register';
import {Tasks} from './pages/tasks/tasks';
import {NewTask} from './pages/new-task/new-task';
import {Comments} from './pages/comments/comments';
import {Monitoring} from './pages/monitoring/monitoring';
import {GenAi} from './pages/gen-ai/gen-ai';
import {Accounts} from './pages/accounts/accounts';
import {Proxies} from './pages/proxies/proxies';
import {Callback} from './pages/callback/callback';
import {authGuard} from './core/guards/auth-guard';
import {Logs} from './pages/logs/logs';
import {Settings} from './pages/settings/settings';

export const routes: Routes = [
  { path: '', component: Dashboard,canActivate: [authGuard]  },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'tasks', component: Tasks,canActivate: [authGuard] },
  { path: 'new-task', component: NewTask ,canActivate: [authGuard]},
  { path: 'comments', component: Comments,canActivate: [authGuard] },
  { path: 'monitoring', component: Monitoring ,canActivate: [authGuard]},
  { path: 'gen-ai', component: GenAi,canActivate: [authGuard] },
  { path: 'accounts', component: Accounts,canActivate: [authGuard] },
  { path: 'proxies', component: Proxies ,canActivate: [authGuard]},
  { path: 'logs', component: Logs ,canActivate: [authGuard]},
  { path: 'settings', component: Settings ,canActivate: [authGuard]},
  { path: 'auth/callback', component: Callback }, // ← здесь
];
