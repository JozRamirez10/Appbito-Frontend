import { Routes } from '@angular/router';
import { DailyHabitsComponent } from './components/daily.habits/daily.habits.component';
import { FormHabitComponent } from './components/form.habit/form.habit.component';
import { FormUserComponent } from './components/form.user/form.user.component';
import { ListHabitsComponent } from './components/list.habits/list.habits.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { VerifyComponent } from './components/verify/verify.component';
import { GENERAL, PATHS, VIEWS } from './constants/constants';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: GENERAL.EMPTY_STRING,
    redirectTo: PATHS.LOGIN,
    pathMatch: GENERAL.FULL,
  },
  {
    path: VIEWS.LOGIN,
    component: LoginComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.SIGN_IN,
    component: FormUserComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.USER,
    component: UserComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.DAILY_HABITS,
    component: DailyHabitsComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.LIST_HABITS,
    component: ListHabitsComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.HABIT,
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.HABIT_VIEW,
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.HABIT_ID_VIEW,
    component: FormHabitComponent,
    canActivate: [authGuard]
  },
  {
    path: VIEWS.VERIFY,
    component: VerifyComponent
  }
];
