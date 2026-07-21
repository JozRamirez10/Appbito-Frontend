import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user';
import { ModalService } from 'src/app/services/modal.service';
import { remove } from 'src/app/store/user/user.action';
import { IonText, IonList, IonRow, IonButton, IonInput, AlertController } from "@ionic/angular/standalone";

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
export class UserFormDeleteComponent {

  user ! : User;

  password ! : string;
  passwordConfirm ! : string;

  matches : boolean = true;
  passwordConfirmEmpty : boolean = false;

  errors : any = {};

  constructor(
    private store : Store<{users : any}>,
    private modalService : ModalService,
    private alertCtrl : AlertController
  ) {
    this.password = '';
    this.passwordConfirm = '';
    this.store.select('users').subscribe(state => {
      this.user = {... state.user},
      this.errors = state.errors;
    });
  }

  async onSubmit(deleteForm : NgForm) : Promise<void> {
    this.matches = true;
    this.passwordConfirmEmpty = false;

    if(deleteForm.valid){
      if(this.passwordConfirm == undefined || this.passwordConfirm == ''){
        this.passwordConfirmEmpty = true;
      }else if(this.password != this.passwordConfirm){
        this.matches = false;
      }else{
        const alert = await this.alertCtrl.create({
          header: 'Are you sure?',
          message: "You won't be able to revert this!",
          buttons:[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'alert-button-cancel'
            },
            {
              text: 'Yes, detele it!',
              role: 'confirm',
              cssClass: 'alert-button-confirm',
              handler: () => {
                this.store.dispatch(remove({
                  request: { password : this.password },
                  id: this.user.id
                }))

                this.modalService.showModal('loading');
              }
            }
          ]
        });
        await alert.present();

      }
    }
  }
}
