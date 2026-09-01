import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, finalize, map, Observable, of, switchMap, tap } from "rxjs";
import { GENERAL, VIEWS } from "../constants/constants";
import { ModalActions } from "../enums/modal.actions.enum";
import { DeleteUserRequest, UpdatePasswordRequest, UpdateUserRequest, User } from "../models/dtos/user.model";
import { ModalService } from "../services/modal.service";
import { UserService } from "../services/user.service";
import { catchAndNotify, hasNotErrorInterceptors, notifyError } from "../utils/helpers";

@Injectable({
    providedIn: 'root'
})
export class UserState {

    private readonly userService = inject(UserService);
    private readonly modalService = inject(ModalService);
    private readonly router = inject(Router);

    readonly user = signal<User | null>(null);
    readonly isLoading = signal<boolean>(false);

    loadMe() {
        this.isLoading.set(true);

        this.userService.getMe().pipe(
            switchMap((userData) => this.attachUserImage(userData)),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (userData) => {
                this.user.set(userData)
            },
            error: (err : HttpErrorResponse) => {
                notifyError(err, ModalActions.ERROR_USER_LOADING, this.modalService);
                if (hasNotErrorInterceptors(err)) {
                    this.router.navigate([`/${VIEWS.DAILY_HABITS}`]);
                }
            }
        });
    }

    updateProfileData(payload : UpdateUserRequest) {
        return this.userService.updateMe(payload).pipe(
            tap((updateUser) => {
                const currentImage = this.user()?.image;
                this.user.set({ ...updateUser, image: currentImage });
            }),
            catchAndNotify(ModalActions.ERROR_SAVE, this.modalService, true)
        );
    }

    uploadProfileImage(file : File) {
        this.modalService.showModal(ModalActions.LOADING);

        this.userService.uploadProfileImage(file).pipe(
            switchMap(updateUser => this.attachUserImage(updateUser)),
            finalize(() => this.modalService.dismissLoading())
        ).subscribe({
            next: (updateUser) => {
                this.user.set(updateUser);
            },
            error: (err : HttpErrorResponse) => {
                notifyError(err, ModalActions.ERROR_IMAGE, this.modalService);
            }
        });
    }

    updatePassword(payload : UpdatePasswordRequest) {
        return this.userService.updatePassword(payload).pipe(
            catchAndNotify(ModalActions.ERROR_SAVE, this.modalService, true)
        );
    }

    deleteAccount(payload : DeleteUserRequest) {
        return this.userService.deleteWithPassword(payload).pipe(
            catchAndNotify(ModalActions.ERROR_DELETE, this.modalService, true)
        );
    }

    private attachUserImage(user : User) : Observable<User> {

        if (!user.image) {
            return of(user);
        }

        return this.userService.getMyImage().pipe(
            map((blob) => {
                const currentUser = this.user();
                if (currentUser?.image?.startsWith('blob')) {
                    URL.revokeObjectURL(currentUser.image);
                }
                const imageUrl = URL.createObjectURL(blob);
                return { ...user, image: imageUrl };
            }),
            catchError(() => {
                return of({ ...user, image: GENERAL.EMPTY_STRING } as User);
            })
        );
    }
}