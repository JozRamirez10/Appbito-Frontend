import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { filter, from, map, switchMap, take } from "rxjs";

export const authGuard : CanActivateFn = (route, state) => {
    const service = inject(AuthService);
    const router = inject(Router);

    return from(service.getToken()).pipe(
        map(token => {
        const isLoginRoute = route.routeConfig?.path === 'login' || route.routeConfig?.path === 'signIn';
        if(token){
            return isLoginRoute
            ? router.createUrlTree(['/dailyHabits'])
            : true;
        } else {
            return !isLoginRoute
            ? router.createUrlTree(['/login'])
            : true;
        }
        })
    )
};

