import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { PATHS } from 'src/app/constants/constants';
import { VerifyStatus } from 'src/app/enums/verify.status.enum';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  imports: [IonSpinner, IonCardContent, IonCardHeader, IonCard, IonContent, IonTitle, IonButton, IonButtons, IonToolbar, IonHeader,
    RouterLink
  ],
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  status = signal<VerifyStatus>(VerifyStatus.LOADING);

  readonly VerifyStatus = VerifyStatus;

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];
      if (token) {
        await this.verifyAccount(token);
      } else {
        this.status.set(VerifyStatus.ERROR);
      }
    });
  }

  async verifyAccount(token : string) : Promise<void> {
    this.status.set(VerifyStatus.LOADING);
    const isVerified = await this.authService.verifyAccount(token);
    this.status.set(isVerified ? VerifyStatus.SUCCESS : VerifyStatus.ERROR);
  }

  toLogin() : void {
    this.router.navigateByUrl(PATHS.LOGIN, { replaceUrl: true });
  }
}
