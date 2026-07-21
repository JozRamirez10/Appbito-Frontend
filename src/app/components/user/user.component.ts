import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { editImage, findById } from 'src/app/store/user/user.action';
import { UserState } from 'src/app/store/user/user.reducer';
import { UserFormDataComponent } from "../user.form.data/user.form.data.component";
import { UserFormPasswordComponent } from "../user.form.password/user.form.password.component";
import { UserFormDeleteComponent } from "../user.form.delete/user.form.delete.component";
import { IonContent, IonCard, IonCardHeader, IonIcon, IonCardContent, IonButton, IonText, IonSegment, IonSegmentButton, IonLabel, IonModal, IonRow, IonCol, IonSegmentView, IonSegmentContent, IonRefresherContent, IonRefresher } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { brushOutline, closeSharp } from 'ionicons/icons';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    IonRefresher, IonRefresherContent, 
    IonCol, IonRow, IonModal, IonLabel, IonSegmentButton, IonSegment, IonText, IonButton, IonCardContent, IonIcon, IonCardHeader, IonCard, IonContent, IonSegmentView, IonSegmentContent,
    RouterLink,
    UserFormDataComponent,
    UserFormPasswordComponent,
    UserFormDeleteComponent
],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent  implements OnInit {

  user ! : User;

  nameUser ! : string;
  lastnameUser ! : string;
  emailUser ! : string; 

  image : any;

  selectedFile : File | null = null;
  fileError : string | null = null;

  loading ! : boolean; 

  isOpen : boolean = false;

  constructor(
    private store : Store<{users: UserState, auth : any, loading : any}>,
    private authService : AuthService,
    private modalService : ModalService
  ) {
    addIcons({
      closeSharp,
      brushOutline
    }),
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.loadDataInForm();
    });

    this.store.select('loading').subscribe(loading => {
      this.loading = loading;
    })
  }

  doRefresh(event : any){
    this.enterOnView().then(() => event.target.complete());;
  }

  async enterOnView(): Promise<void>{
    if(!this.user.id){
      const payload = this.authService.getPayload();
      if(payload && payload.sub){
        this.modalService.showModal('loading');
        this.store.dispatch(findById({ id: Number(payload.sub)}));
      }
    }
  }
  
  ngOnInit(): void {
    this.enterOnView();
  }

  loadDataInForm(){
    if(this.user.name != '')
      this.nameUser = this.user.name;

    if(this.user.lastname != '')
      this.lastnameUser = this.user.lastname;

    if(this.user.email != '')
      this.emailUser = this.user.email;
  }

  onFileSelected(event : Event) : void{
    const input = event.target as HTMLInputElement;
    if(!input.files || input.files.length === 0){
      this.fileError = "No file selected";
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    const fileType = file.type;

    if(fileType === 'image/png' || fileType === 'image/jpeg'){
      this.fileError = null;
      this.selectedFile = file;
    }else{
      this.fileError = 'Invalid file type. Only PNG and JPG are allowed.'
      this.selectedFile = null;
    }
  }

  onSaveImage(event : Event) : void{
    event.preventDefault();
    if(this.selectedFile){
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('email', this.user.email);

      this.store.dispatch(editImage({ formImage: formData }));

    }
  }

  cancel(){
    this.isOpen = false;
  }

}
