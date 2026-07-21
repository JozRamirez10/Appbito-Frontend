import { Routes } from '@angular/router';
import { DailyHabitsComponent } from './components/daily.habits/daily.habits.component';
import { LoginComponent } from './components/login/login.component';
import { FormUserComponent } from './components/form.user/form.user.component';
import { ListHabitsComponent } from './components/list.habits/list.habits.component';
import { FormHabitComponent } from './components/form.habit/form.habit.component';
import { authGuard } from './guards/auth.guard';
import { UserComponent } from './components/user/user.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard]
  },
  {
    path: 'signIn',
    component: FormUserComponent,
    canActivate: [authGuard]
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dailyHabits',
    component: DailyHabitsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'listHabits',
    component: ListHabitsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'habit',
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
  {
    path: 'habit/:view',
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
  {
    path: 'habit/:id/:view',
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
];
