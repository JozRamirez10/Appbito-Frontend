import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCol, IonContent, IonIcon, IonInput, IonRefresher, IonRefresherContent, IonRow, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { AuthForm } from 'src/app/classes/auth.form';
import { PATHS } from 'src/app/constants/constants';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { CreateUserRequest } from 'src/app/models/dtos/user.model';
import { UserService } from 'src/app/services/user.service';

interface CreateForm extends CreateUserRequest {
  confirmPassword : string;
}

@Component({
  selector: 'app-form-user',
  standalone: true,
  imports: [IonText, IonIcon,
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonInput,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent
],
  templateUrl: './form.user.component.html',
  styleUrls: ['./form.user.component.scss']
})
export class FormUserComponent extends AuthForm {

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  userData = signal<CreateForm>({} as CreateForm);
  passwordsMatch = signal<boolean>(true);

  constructor() {
    super();
    addIcons({ closeSharp });
  }

  override resetForm() : void {
    super.resetForm();
    this.userData.set({} as CreateForm);
    this.passwordsMatch.set(true);
  }

  onSubmit() : void {
    this.clearErrors();
    this.passwordsMatch.set(true);

    if (this.authForm) {
      this.authForm.control.markAllAsTouched();
    }

    if (this.authForm?.invalid) {
      return;
    }

    const data = this.userData();

    if (!data.password || !data.confirmPassword) {
      return;
    }

    if (data.password !== data.confirmPassword) {
      this.passwordsMatch.set(false);
      return;
    }

    this.modalService.showModal(ModalActions.CREATING_USER);

    this.userService.createUser(data).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: async () => {
        await this.modalService.showModal(ModalActions.USER_CREATED);
        this.router.navigateByUrl(PATHS.LOGIN, { replaceUrl: true });
      },
      error: (err : HttpErrorResponse) => {
        this.handleFormError(err);
      }
    });
  }

}