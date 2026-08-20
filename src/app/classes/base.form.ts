import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { Directive, signal } from "@angular/core";

@Directive()
export abstract class BaseForm {

    readonly errors = signal<Record<string, string>>({});

    protected handleFormError(err : HttpErrorResponse) : void {
        if (err.status === HttpStatusCode.BadRequest && err.error) {
            this.errors.set(err.error as Record<string, string>);
        }
    }

    protected clearErrors() : void {
        this.errors.set({});
    }
}