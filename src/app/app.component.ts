import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { GENERAL, VIEWS } from './constants/constants';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private platform = inject(Platform);
  private location = inject(Location);
  private router = inject(Router);

  private rootViews : string[] = [
    `/${VIEWS.LOGIN}`,
    `/${VIEWS.DAILY_HABITS}`,
    GENERAL.DASH
  ];

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        const currentUrl = this.router.url;
        if (this.rootViews.includes(currentUrl)) {
          App.minimizeApp();
        } else {
          this.location.back();
        }
      })
    })
  }
}
