import { Directive, effect, OnInit } from "@angular/core";

interface IonicRefreshEvent extends CustomEvent {
  target : HTMLIonRefresherElement;
}

@Directive()
export abstract class BaseViewRefresh implements OnInit {

    private refresherTarget : HTMLIonRefresherElement  | null = null;

    constructor(){
        effect(() => {
            if (!this.checkIsLoading() && this.refresherTarget) {
                this.refresherTarget.complete();
                this.refresherTarget = null;
            }
        });
    }

    ngOnInit() : void {
        this.enterOnView();
    }

    ionViewWillEnter() : void {
        this.enterOnView();
    }

    doRefresh(event : IonicRefreshEvent) : void {
        this.refresherTarget = event.target;
        this.enterOnView(true);
    }

    private enterOnView(forceRefresh = false) : void {
        if (this.checkHasData() && !forceRefresh) {
            return;
        }

        this.loadData();
    }

    protected abstract checkIsLoading() : boolean;
    protected abstract checkHasData() : boolean;
    abstract loadData() : void;

}