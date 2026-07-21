import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user';
import { login } from 'src/app/store/auth/auth.action';
import { cleanUser } from 'src/app/store/user/user.action';
import { ModalService } from 'src/app/services/modal.service';
import { IonContent, IonCard, IonCardHeader, IonCardContent, IonButton, IonInput, IonRefresher, IonRefresherContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonRefresherContent, 
    IonRefresher, 
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonInput,
    IonButton
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {

  user ! : User;
  message ! : string;

  constructor(
    private store : Store<{auth : any, loading : any}>,
    private modalService : ModalService
  ) {
    this.user = new User(); 
  }

  async enterOnView(): Promise<void>{
    this.user = new User(); 
    this.store.dispatch(cleanUser());
    this.modalService.dismissLoading();
  }
  
  ngOnInit(): void {
    this.enterOnView();
  }

  doRefresh(event : any){
    this.enterOnView().then(() => event.target.complete());;
  }

  async ionViewWillEnter() {
    this.user = new User(); 
    this.store.dispatch(cleanUser());
    this.modalService.dismissLoading();
  }

  onSubmit() : void {
    if(!this.user.email || !this.user.password){
      this.message = 'Email and password required';
    }else{
      this.store.dispatch(login({
        email: this.user.email,
        password: this.user.password
      }));
      this.message = '';

      this.modalService.showModal('loading');
    }
  }

  ngOnDestroy() : void {
    this.user = new User();
  }

}
