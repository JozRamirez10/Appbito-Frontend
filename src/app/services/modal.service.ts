import { inject, Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { SpinnerTypes } from '@ionic/core';
import { ALERTS, APP, GENERAL, MODAL_MESSAGES, MODAL_TITLES, SPINNERS, TOAST } from '../constants/constants';
import { ModalActions } from '../enums/modal.actions.enum';
import { ModalPresent } from '../enums/modal.present.enum';

interface ModalConfig {
  type: ModalPresent;
  title? : string;
  message? : string;
  spinner? : SpinnerTypes;
  color? : string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);

  private loading: HTMLIonLoadingElement | null = null;
  private activeAlert: HTMLIonAlertElement | null = null;

  private readonly actionConfig: Record<ModalActions, ModalConfig> = {

    [ModalActions.LOADING]:       { type: ModalPresent.LOADING, message: MODAL_MESSAGES.LOADING, spinner: SPINNERS.CRESCENT },
    [ModalActions.CREATING_USER]: { type: ModalPresent.LOADING, message: MODAL_MESSAGES.CREATING_USER, spinner: SPINNERS.CIRCLES },

    [ModalActions.CREATE]:        { type: ModalPresent.TOAST, message: MODAL_MESSAGES.CREATE, color: TOAST.COLOR_SUCCESS },
    [ModalActions.EDIT]:          { type: ModalPresent.TOAST, message: MODAL_MESSAGES.EDIT, color: TOAST.COLOR_SUCCESS },
    [ModalActions.EDIT_PASSWORD]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.EDIT_PASSWORD, color: TOAST.COLOR_SUCCESS },
    [ModalActions.DELETE]:        { type: ModalPresent.TOAST, message: MODAL_MESSAGES.DELETE, color: TOAST.COLOR_SUCCESS },
    [ModalActions.USER_CREATED]:  { type: ModalPresent.TOAST, message: MODAL_MESSAGES.USER_CREATED, color: TOAST.COLOR_SUCCESS },
    [ModalActions.USER_REMOVED]:  { type: ModalPresent.TOAST, message: MODAL_MESSAGES.USER_REMOVED, color: TOAST.COLOR_SUCCESS },
    [ModalActions.EXIT]:          { type: ModalPresent.TOAST, message: MODAL_MESSAGES.EXIT, color: TOAST.COLOR_SUCCESS },

    [ModalActions.ERROR_SAVE]:           { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_SAVE, color: TOAST.COLOR_ERROR },
    [ModalActions.ERROR_DELETE]:         { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_DELETE, color: TOAST.COLOR_ERROR },

    [ModalActions.ERROR_USER_LOADING]:   { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_USER_LOADING, color: TOAST.COLOR_ERROR },
    [ModalActions.ERROR_HABITS_LOADING]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_HABITS_LOADING, color: TOAST.COLOR_ERROR },
    [ModalActions.ERROR_HABIT_PROGRESS_SAVE]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_HABIT_PROGRESS_SAVE, color: TOAST.COLOR_ERROR },
    [ModalActions.ERROR_IMAGE]:          { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_IMAGE , color: TOAST.COLOR_ERROR },

    [ModalActions.EXPIRED]:          { type: ModalPresent.ALERT, title: MODAL_TITLES.EXPIRED, message: MODAL_MESSAGES.EXPIRED },
    [ModalActions.ERROR_SESSION]:    { type: ModalPresent.ALERT, title: MODAL_TITLES.ERROR_SESSION, message: MODAL_MESSAGES.ERROR_SESSION },
    [ModalActions.ERROR_CONNECTION]: { type: ModalPresent.ALERT, title: MODAL_TITLES.ERROR_CONNECTION, message: MODAL_MESSAGES.ERROR_CONNECTION },
    [ModalActions.ERROR_SERVER]:     { type: ModalPresent.ALERT, title: MODAL_TITLES.ERROR_SERVER, message: MODAL_MESSAGES.ERROR_SERVER },

    [ModalActions.CUSTOM]:           { type: ModalPresent.ALERT }
  };

  async showModal(action : ModalActions, customTitle? : string, customText? : string)
    : Promise<void> {

    const config = this.actionConfig[action];

    if (!config) return;

    switch (config.type) {
      case ModalPresent.LOADING:
        await this.presentLoading(config.message!, config.spinner!);
        break;
      case ModalPresent.TOAST:
        await this.presentToast(config.message!, config.color || TOAST.COLOR_DEFAULT);
        break;
      case ModalPresent.ALERT:
        await this.presentAlert(
          customTitle || config.title,
          customText || config.message
        );
        break;
    }
  }

  private async presentLoading(message : string, spinner : SpinnerTypes) {
    await this.dismissLoading();
    this.loading = await this.loadingCtrl.create({
      message,
      spinner,
      backdropDismiss: false
    });
    await this.loading.present();
  }

  private async presentToast(message : string, color : string) {
    const toast = await this.toastCtrl.create({
      message,
      color: color,
      duration: TOAST.DURATION,
      position: TOAST.TOP_POSITION,
      cssClass: TOAST.CSS_CLASS
    });
    await toast.present();
  }

  private async presentAlert(title? : string, message? : string) {

    if (this.activeAlert) {
      await this.activeAlert.dismiss();
    }

    this.activeAlert = await this.alertCtrl.create({
      header: title || GENERAL.EMPTY_STRING,
      message: message || GENERAL.EMPTY_STRING,
      buttons: [APP.OK]
    });

    await this.activeAlert.present();
    this.activeAlert.onDidDismiss().then(() => this.activeAlert = null);
  }

  async confirmDelete() : Promise<boolean> {

    if (this.activeAlert) {
      await this.activeAlert.dismiss();
    }

    this.activeAlert = await this.alertCtrl.create({
      header: ALERTS.DELETE_TITLE,
      message: ALERTS.DELETE_MESSAGE,
      buttons: [
        {
          text: APP.CANCEL,
          role: ALERTS.ROLE_CANCEL,
          cssClass: ALERTS.CSS_CLASS_CANCEL,
        },
        {
          text: ALERTS.CONFIRM_DELETE,
          role: ALERTS.ROLE_CONFIRM,
          cssClass: ALERTS.CSS_CLASS_CONFIRM,
        }
      ]
    });

    await this.activeAlert.present();

    const result = await this.activeAlert.onDidDismiss();

    this.activeAlert = null;

    return result.role === ALERTS.ROLE_CONFIRM;
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
}

