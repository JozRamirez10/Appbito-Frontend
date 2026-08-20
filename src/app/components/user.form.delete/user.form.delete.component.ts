import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonList, IonRow, IonText } from "@ionic/angular/standalone";
import { finalize } from 'rxjs';
import { BaseForm } from 'src/app/classes/base.form';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { DeleteUserRequest } from 'src/app/models/dtos/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserState } from 'src/app/states/user.state';

interface DeleteForm extends DeleteUserRequest {
  confirmPassword : string;
}

@Component({
  selector: 'app-user-form-delete',
  standalone: true,
  imports: [
    IonButton, IonRow, IonList, IonText, IonInput,
    FormsModule,
  ],
  templateUrl: './user.form.delete.component.html',
  styleUrls: ['./user.form.delete.component.scss'],
})
export class UserFormDeleteComponent extends BaseForm {

  readonly userState = inject(UserState);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  deleteData = signal<DeleteForm>({} as DeleteForm);

  passwordsMatch = signal<boolean>(true);

  async onSubmit() : Promise<void> {

    const data = this.deleteData();

    this.clearErrors();
    this.passwordsMatch.set(true);

    if (!data.password || !data.confirmPassword) {
      return;
    }

    if (data.password !== data.confirmPassword) {
      this.passwordsMatch.set(false);
      return;
    }

    const isConfirmed = await this.modalService.confirmDelete();

    if (isConfirmed) {
      this.executeDelete(data.password);
    }
  }

  private executeDelete(password : string) : void {
    this.modalService.showModal(ModalActions.LOADING);

    this.userState.deleteAccount({ password }).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: async () => {
        await this.modalService.showModal(ModalActions.USER_REMOVED);
        this.authService.logout();
      },
      error: (err : HttpErrorResponse) => {
        this.handleFormError(err);
      }
    });
  }
}
