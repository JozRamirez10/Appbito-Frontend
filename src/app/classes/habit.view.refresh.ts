import { Directive, inject } from "@angular/core";
import { HabitState } from "../states/habit.state";
import { BaseViewRefresh } from "./base.view.refresh";

@Directive()
export abstract class HabitViewRefresh extends BaseViewRefresh {

    protected readonly habitState = inject(HabitState);

    protected override checkIsLoading(): boolean {
        return this.habitState.isLoading();
    }

    protected override checkHasData(): boolean {
        return this.habitState.habits().length > 0;
    }

}