import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { from, map } from "rxjs";
import { GENERAL, PATHS, VIEWS } from "../constants/constants";
import { AuthService } from "../services/auth.service";

export const authGuard : CanActivateFn = (route, state) => {

    const service = inject(AuthService);
    const router = inject(Router);

    return from(service.getToken()).pipe(
        map(token => {

            const currentPath = route.routeConfig?.path || GENERAL.EMPTY_STRING;
            const isPublicRoute = [VIEWS.LOGIN, VIEWS.SIGN_IN].includes(currentPath);

            if (token) {
                return isPublicRoute
                    ? router.createUrlTree([`/${VIEWS.DAILY_HABITS}`])
                    : true;
            }

            return isPublicRoute
                ? true
                : router.createUrlTree([PATHS.LOGIN]);
        })
    );
};

