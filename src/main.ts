import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { habitReducer } from './app/store/habit/habits.reducer';
import { userReducer } from './app/store/user/user.reducer';
import { UserEffects } from './app/store/user/user.effects';
import { authReducer } from './app/store/auth/auth.reducer';
import { AuthEffects } from './app/store/auth/auth.effects';
import { loadingReducer } from './app/store/loading/loading.reducer';
import { habitProgressReducer } from './app/store/habitProgress/habit.progress.reducer';
import { HabitProgressEffects } from './app/store/habitProgress/habit.progress.effects';
import { habitProgressMonthlyReducer } from './app/store/habitProgressMonthly/habit.progress.month.reducer';
import { HabitProgressMonthlyEffects } from './app/store/habitProgressMonthly/habit.progress.month.effects';
import { HabitsEffects } from './app/store/habit/habits.effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/interceptors/token.interceptor';
import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from './app/services/auth.service';
import { applySafeArea } from './app/utils/safe.area';


window.addEventListener('DOMContentLoaded', async () => {
  await applySafeArea();
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() : Promise<void> => {
      const authService = inject(AuthService);
      return ( async () => {
        await authService.getToken();         
        await authService.refreshToken();     
      })();
    }),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideStore({
      habits: habitReducer,
      habitProgress: habitProgressReducer,
      habitProgressMonthly: habitProgressMonthlyReducer,
      users: userReducer,
      auth: authReducer,
      loading: loadingReducer
    }),
    provideEffects(
      HabitsEffects,
      HabitProgressEffects,
      HabitProgressMonthlyEffects,
      UserEffects,
      AuthEffects
    ),
],
});
