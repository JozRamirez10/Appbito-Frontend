import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonContent, IonInput, IonRefresher, IonRefresherContent, IonText } from "@ionic/angular/standalone";
import { AuthForm } from 'src/app/classes/auth.form';
import { FORM_LOGIN_MESSAGES, GENERAL, VIEWS } from 'src/app/constants/constants';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { LoginRequest } from 'src/app/models/dtos/auth.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonText,
    IonRefresherContent,
    IonRefresher,
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonInput,
    IonButton,
    RouterLink
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends AuthForm {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  credentials : LoginRequest = {} as LoginRequest;
  message : string = GENERAL.EMPTY_STRING;

  override enterOnView() : void {
    super.enterOnView();
    this.authService.removeSession();
  }

  override resetForm() : void {
    super.resetForm();
    this.credentials = {} as LoginRequest;
    this.message = GENERAL.EMPTY_STRING;
  }

  onSubmit() : void {
    if (!this.credentials.email || !this.credentials.password) {
      this.message = FORM_LOGIN_MESSAGES.REQUIRED_FIELDS;
      return;
    }

    this.message = GENERAL.EMPTY_STRING;
    this.modalService.showModal(ModalActions.LOADING);

    this.authService.loginUser(this.credentials).subscribe({
      next: () => {
        this.modalService.dismissLoading();
        this.router.navigate([`/${VIEWS.DAILY_HABITS}`]);
      },
      error: (err : HttpErrorResponse) => {
        this.modalService.dismissLoading();
        if (err.status === HttpStatusCode.BadRequest) {
          this.handleFormError(err);
        } else {
          this.message = FORM_LOGIN_MESSAGES.INVALID_CREDENTIALS;
        }
      }
    });
  }
}
