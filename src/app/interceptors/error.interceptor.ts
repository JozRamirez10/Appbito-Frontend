import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ERRORS } from "../constants/constants";
import { ModalActions } from "../enums/modal.actions.enum";
import { ModalService } from "../services/modal.service";

export const errorInterceptor : HttpInterceptorFn = (req, next) => {

    const modalService = inject(ModalService);

    const errorActionMap: Record<number, ModalActions> = {
        [ERRORS.STATUS_ZERO] : ModalActions.ERROR_CONNECTION,
        [HttpStatusCode.InternalServerError] : ModalActions.ERROR_SERVER
    };

    return next(req).pipe(
        catchError((error : HttpErrorResponse) => {

            const errorAction = errorActionMap[error.status];

            if (errorAction) {
                modalService.dismissLoading();
                modalService.showModal(errorAction);
            }

            return throwError(() => error);
        })
    )
}