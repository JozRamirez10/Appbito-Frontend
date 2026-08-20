import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { tokenInterceptor } from './app/interceptors/token.interceptor';
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
      return (async () => {

        const token = await authService.getToken();

        if (!token) {
          await authService.refreshToken();
        }

      })();
    }),
    provideHttpClient(withInterceptors([
      tokenInterceptor,
      errorInterceptor
    ]))
  ],
});
