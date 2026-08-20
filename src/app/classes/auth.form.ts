import { Directive, inject, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { APP, FORMS } from "../constants/constants";
import { ModalService } from "../services/modal.service";
import { BaseForm } from "./base.form";

@Directive()
export abstract class AuthForm extends BaseForm implements OnInit {

    protected readonly modalService = inject(ModalService);

    @ViewChild(FORMS.AUTH) authForm! : NgForm;

    ngOnInit() : void {
        this.enterOnView();
    }

    ionViewWillEnter() : void {
        this.enterOnView();
    }

    doRefresh(event : any) : void {
        this.enterOnView();
        setTimeout(() => event.target.complete(), APP.TIME_REFRESH_MS);
    }

    enterOnView() : void {
        this.resetForm();
        this.modalService.dismissLoading();
    }

    resetForm() : void {
        this.clearErrors();
        if (this.authForm) {
            this.authForm.resetForm();
        }
    }
}