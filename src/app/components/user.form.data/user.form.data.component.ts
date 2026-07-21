import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user';
import { logout } from 'src/app/store/auth/auth.action';
import { edit } from 'src/app/store/user/user.action';
import { UserState } from 'src/app/store/user/user.reducer';
import { CommonModule } from '@angular/common';
import { ModalService } from 'src/app/services/modal.service';
import { IonList, IonRow, IonCol, IonButton, IonIcon, IonDatetimeButton, IonModal, IonText, IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-user-form-data',
  standalone: true,
  imports: [
    IonText, IonModal, IonDatetimeButton, IonIcon, IonButton, IonCol, IonRow, IonList, IonInput,
    FormsModule,
    CommonModule
  ],
  templateUrl: './user.form.data.component.html',
  styleUrls: ['./user.form.data.component.scss'],
})
export class UserFormDataComponent {

  buttonEdits = [
    {
      button: 'name',
      edit: false
    },
    {
      button: 'lastname',
      edit: false
    },
    {
      button: 'date',
      edit: false
    }
  ];

  user ! : User;
  errors : any = {};

  constructor(
    private store : Store<{users : UserState, auth: any}>,
    private modalService : ModalService
  ) {
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
  }

  btnEdit(input : string) : void {
    this.buttonEdits = this.buttonEdits.map(field => field.button == input ? {... field, edit: !field.edit} : field);
  }

  isEdit(input : string) : boolean{
    const field = this.buttonEdits.find(field => field.button == input);
    return field ? field.edit : false;
  }

  onSubmit(userForm : NgForm) : void {
    if(userForm.valid){
      this.store.dispatch(edit({userUpdate: this.user}));
      this.modalService.showModal('loading');
      
    }
  }

  handlerLogout() : void {
    this.store.dispatch(logout());
  }

}
