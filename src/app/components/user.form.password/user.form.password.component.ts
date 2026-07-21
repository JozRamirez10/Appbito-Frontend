import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdatePasswordRequest, User } from 'src/app/models/user';
import { ModalService } from 'src/app/services/modal.service';
import { editPassword } from 'src/app/store/user/user.action';
import { IonList, IonRow, IonText, IonButton, IonInput } from "@ionic/angular/standalone";

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
export class UserFormPasswordComponent  implements OnInit {

  user ! : User;
  requestPassword : UpdatePasswordRequest;
  newPasswordConfirm ! : string;
  
  matches : boolean = true;
  passwordConfirmEmpty : boolean = false;
  
  errors : any = {};

  constructor(
    private store : Store<{users : any}>,
    private modalService : ModalService
  ) {
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
    this.requestPassword = new UpdatePasswordRequest();
    this.requestPassword.newPassword = '';
    this.requestPassword.oldPassword = '';
    this.newPasswordConfirm = '';
  }
  ngOnInit(): void {
    this.newPasswordConfirm = '';
  }

  onSubmit(passwordForm : NgForm) : void{
    if(passwordForm.valid){
      this.passwordConfirmEmpty = false;
      this.matches = true;
  
      if(this.newPasswordConfirm == undefined || this.newPasswordConfirm == ''){
        this.passwordConfirmEmpty = true;
      }else if(this.requestPassword.newPassword != this.newPasswordConfirm){
        this.matches = false;
      }else{
        this.store.dispatch(editPassword({
          request: {... this.requestPassword},
          id: this.user.id
        }));

        this.modalService.showModal('loading');

      }
    }
  }

}
