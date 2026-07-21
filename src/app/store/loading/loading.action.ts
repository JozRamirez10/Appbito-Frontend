import { createAction, props } from "@ngrx/store";

export const loadingState = createAction('loadingStart', props<{loading : boolean}>());