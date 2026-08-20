import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonList, IonRow, IonText } from "@ionic/angular/standalone";
import { finalize } from 'rxjs';
import { BaseForm } from 'src/app/classes/base.form';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { UpdatePasswordRequest } from 'src/app/models/dtos/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserState } from 'src/app/states/user.state';

interface PasswordForm extends UpdatePasswordRequest {
  confirmPassword : string
}

@Component({
  selector: 'app-user-form-password',
  standalone: true,
  imports: [
    IonButton, IonText, IonRow, IonList, IonInput,
    FormsModule
  ],
  templateUrl: './user.form.password.component.html',
  styleUrls: ['./user.form.password.component.scss'],
})
export class UserFormPasswordComponent extends BaseForm {

  readonly userState = inject(UserState);

  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  passwordData = signal<PasswordForm>({} as PasswordForm);

  passwordsMatch = signal<boolean>(true);

  onSubmit() : void{

    const data = this.passwordData();

    this.clearErrors();
    this.passwordsMatch.set(true);

    if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      this.passwordsMatch.set(false);
      return;
    }

    this.modalService.showModal(ModalActions.LOADING);

    const request : UpdatePasswordRequest = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    };

    this.userState.updatePassword(request).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: async () => {
        await this.modalService.showModal(ModalActions.EDIT_PASSWORD);
        this.authService.logout();
      },
      error: (err : HttpErrorResponse) => {
        this.handleFormError(err);
      }
    });
  }

}
