import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCol, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonList, IonModal, IonRow, IonText } from "@ionic/angular/standalone";
import { finalize } from 'rxjs';
import { BaseForm } from 'src/app/classes/base.form';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { UpdateUserRequest } from 'src/app/models/dtos/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserState } from 'src/app/states/user.state';

@Component({
  selector: 'app-user-form-data',
  standalone: true,
  imports: [
    IonText, IonModal, IonDatetimeButton, IonIcon, IonButton, IonCol, IonRow, IonList, IonInput,
    IonDatetime,
    FormsModule,
    CommonModule
  ],
  templateUrl: './user.form.data.component.html',
  styleUrls: ['./user.form.data.component.scss'],
})
export class UserFormDataComponent extends BaseForm {

  readonly userState = inject(UserState);
  readonly authService = inject(AuthService);

  private readonly modalService = inject(ModalService);

  editing = signal<Record<string, boolean>>(this.getEditingInit());

  userForm = signal<UpdateUserRequest>({} as UpdateUserRequest);

  constructor() {
    super();

    effect(() => {
      const user = this.userState.user();
      if (user) {
        untracked(() => {
          this.userForm.set({
            name: user.name,
            lastname: user.lastname,
            birthDate: user.birthDate
          });
        });
      }
    });
  }

  toggleEdit(field : keyof UpdateUserRequest) : void {
    this.editing.update(prev => ({ ...prev, [field]: !prev[field] }));
    if (!this.editing()[field]) {
      const user = this.userState.user();
      if (user) {
        this.userForm.update(prev => ({ ...prev, [field]: user[field] }));
        this.clearErrors();
      }
    }
  }

  isEditing(field : keyof UpdateUserRequest) : boolean {
    return this.editing()[field];
  }

  onSubmit() : void {
    const data = this.userForm();
    this.clearErrors();

    if (!data.name || !data.lastname || !data.birthDate) {
      return;
    }

    this.modalService.showModal(ModalActions.LOADING);

    this.userState.updateProfileData(data).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: () => {
        this.modalService.showModal(ModalActions.EDIT);
        this.editing.set(this.getEditingInit());
      },
      error: (err : HttpErrorResponse) => {
        this.handleFormError(err);
      }
    });
  }

  handlerLogout() : void {
    this.authService.logout();
  }

  private getEditingInit() : Record<string, boolean> {
    return {
      name: false,
      lastname: false,
      birthDate: false
    }
  }
}
