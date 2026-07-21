import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private loading: HTMLIonLoadingElement | null = null;
  private activeAlert: HTMLIonAlertElement | null = null; // ← NUEVO

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async showModal(action: string, title?: string, text?: string, icon?: string): Promise<void> {
    switch (action) {
      case 'loading':
        this.loading = await this.loadingCtrl.create({
          message: 'Loading...',
          spinner: 'crescent',
          backdropDismiss: false
        });
        await this.loading.present();
        break;
      
      case 'creatingUser':
        if(this.loading){
          await this.dismissLoading();
        }
        this.loading = await this.loadingCtrl.create({
          message: 'Creating user, please wait a moment...',
          spinner: 'circles',
          backdropDismiss: false
        });
        await this.loading.present();
        break;

      case 'create':
      case 'edit':
      case 'editPassword':
      case 'delete':
      case 'userCreated':
      case 'userRemoved':
      case 'exit':
        await this.toastCtrl.create({
          message: this.buildText(action),
          color: 'success',
          duration: 2500,
          position: 'top',
          cssClass: 'style-toast'
        }).then(toast => toast.present());
        break;

      case 'expired':
      case 'errorSession':
      case 'errorImage':
        this.activeAlert = await this.alertCtrl.create({
          header: this.buildTitle(action),
          message: this.buildText(action),
          buttons: ['OK']
        });
        await this.activeAlert.present();
        this.activeAlert.onDidDismiss().then(() => this.activeAlert = null); // ← LIMPIAR
        break;

      case 'custom':
        this.activeAlert = await this.alertCtrl.create({
          header: title || '',
          message: text || '',
          buttons: ['OK']
        });
        await this.activeAlert.present();
        this.activeAlert.onDidDismiss().then(() => this.activeAlert = null); // ← LIMPIAR
        break;

      default:
        break;
    }
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  isAlertVisible(): boolean {
    return this.activeAlert !== null;
  }

  private buildTitle(action: string): string {
    const titles: { [key: string]: string } = {
      expired: 'Session expired',
      errorSession: 'Session error',
      errorImage: 'Image error'
    };
    return titles[action] || '';
  }

  private buildText(action: string): string {
    const messages: { [key: string]: string } = {
      create: 'Successfully created!',
      edit: 'Successfully edited!',
      editPassword: 'Your password has been successfully changed. Your session will be closed.',
      delete: 'It has been deleted.',
      userCreated: 'Please check your email. You will receive a verification message.',
      userRemoved: 'Your user has been deleted successfully. Thank you very much for using Appbito.',
      exit: 'Your session has been closed successfully.',
      expired: 'The session has expired. Please login again.',
      errorSession: 'An error has occurred with the session. Please login again.',
      errorImage: 'Error uploading image.'
    };
    return messages[action] || '';
  }
}

