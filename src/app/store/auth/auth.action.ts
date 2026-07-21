import { createAction, props } from "@ngrx/store";

export const login = createAction('login', props<{email : string, password : string}>());

export const loginSuccess = createAction('loginSuccess', props<{login : any}>());
export const loginError = createAction('loginError', props<{error : string}>());

export const logout = createAction('logout');
export const logoutSuccess = createAction('logoutSuccess');
export const logoutError = createAction('logoutForError');

export const removeAccount = createAction('remove');
export const removeSuccessAccount = createAction('removeSuccess');