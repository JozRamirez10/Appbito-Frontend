import { Directive, inject } from "@angular/core";
import { UserState } from "../states/user.state";
import { BaseViewRefresh } from "./base.view.refresh";

@Directive()
export abstract class UserViewRefresh extends BaseViewRefresh {

    protected readonly userState = inject(UserState);

    protected override checkIsLoading(): boolean {
        return this.userState.isLoading();
    }

    protected override checkHasData(): boolean {
        return this.userState.user() !== null;
    }

}