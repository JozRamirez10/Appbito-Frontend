import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCol, IonContent, IonIcon, IonLabel, IonModal, IonRefresher, IonRefresherContent, IonRow, IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView, IonSpinner, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { brushOutline, closeSharp } from 'ionicons/icons';
import { UserViewRefresh } from 'src/app/classes/user.view.refresh';
import { APP, ERRORS, GENERAL } from 'src/app/constants/constants';
import { UserFormDataComponent } from '../user.form.data/user.form.data.component';
import { UserFormDeleteComponent } from '../user.form.delete/user.form.delete.component';
import { UserFormPasswordComponent } from '../user.form.password/user.form.password.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [IonSpinner,
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
export class UserComponent extends UserViewRefresh {

  selectedFile = signal<File | null>(null);
  fileError = signal<string | null>(null);
  isOpen = signal<boolean>(false);

  constructor() {
    super();
    addIcons({ closeSharp, brushOutline });
  }

  override loadData(): void {
    this.userState.loadMe();
  }

  onFileSelected(event : Event) : void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.errorOnFileSelected(input, ERRORS.NO_FILE_SELECTED_ERROR);
      return;
    }

    const file = input.files[0];

    if (!(APP.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      this.errorOnFileSelected(input, ERRORS.INVALID_FILE_ERROR);
      return;
    }

    const fileSizeInMB = file.size / (APP.SIZE_KB * APP.SIZE_KB);
    if (fileSizeInMB > APP.MAX_IMAGE_SIZE_MB) {
      this.errorOnFileSelected(input, ERRORS.FILE_TOO_LARGE_ERROR);
      return;
    }

    this.fileError.set(null);
    this.selectedFile.set(file);
  }

  onSaveImage(event : Event) : void {
    event.preventDefault();
    const file = this.selectedFile();

    if (file) {
      this.userState.uploadProfileImage(file);
      this.isOpen.set(false);
    }
  }

  onModalDismiss() : void {
    this.isOpen.set(false);
    this.selectedFile.set(null);
    this.fileError.set(null);
  }

  private errorOnFileSelected(input : HTMLInputElement , error : string) : void {
    this.fileError.set(error);
    this.selectedFile.set(null);
    input.value = GENERAL.EMPTY_STRING;
  }
}
