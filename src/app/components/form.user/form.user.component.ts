import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user';
import { ModalService } from 'src/app/services/modal.service';
import { loadingState } from 'src/app/store/loading/loading.action';
import { add, cleanUser } from 'src/app/store/user/user.action';
import { IonContent, IonCard, IonCardHeader, IonCardContent, IonButton, IonInput, IonRow, IonCol, IonRefresher, IonRefresherContent } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';

@Component({
  selector: 'app-form-user',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardHeader,
    IonicModule,
    IonCardContent,
    IonButton,
    IonInput,
    IonRow,
    IonCol,
    IonRefresher, 
    IonRefresherContent
],
  templateUrl: './form.user.component.html',
  styleUrl: './form.user.component.scss'
})
export class FormUserComponent implements OnInit{
  
  loading ! : boolean ;
  view : boolean = false;

  user ! : User;
  errors : any = {};
  passwordConfirm  ! : string;
  errorPassConfirm : boolean = false;

  constructor(
    private store : Store<{users : any, loading : any}>,
    private modalService : ModalService,
  ) {
    addIcons({closeSharp});
    
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
    this.store.select('loading').subscribe(loading => {
      this.loading = loading;
      if(this.view){
        if(loading){
          this.modalService.showModal('creatingUser');
        }else{
          this.modalService.dismissLoading();
        }
      }
    })
  }

  async enterOnView() : Promise<void> {
    this.user = new User();
    this.store.dispatch(cleanUser());
    this.passwordConfirm = '';
    this.modalService.dismissLoading();
  }

  doRefresh(event : any){
    this.enterOnView().then(() => event.target.complete());;
  }
  
  ngOnInit(): void {
    this.enterOnView();
  }

  async ionViewWillEnter() : Promise<void> {
    this.enterOnView();
    this.view = true;
  }

  ionViewWillLeave() : void {
    this.view = false;
  }

  onSubmit(userForm : NgForm) : void {
    
    Object.values(userForm.controls).forEach(control => {
      control.markAsTouched();
    });
    
    if(userForm.valid){
      if(this.passwordConfirm == this.user.password){
        this.store.dispatch(loadingState({loading: true}))
        this.store.dispatch(add({user : this.user}));
      }else{
        this.errorPassConfirm = true;
      }
    }
  }

  ngOnDestroy() : void {
    this.user = new User();
  }
}