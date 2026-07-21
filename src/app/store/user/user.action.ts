import { createAction, props } from "@ngrx/store";
import { UpdatePasswordRequest, User } from "../../models/user";

export const findById = createAction('[User] findById', props<{id : number}>());
export const findByIdSuccess = createAction('[User] findByIdSuccess', props<{user : User}>());

export const findImage = createAction('[User] findImage', props<{pathImage : string}>());
export const findImageSuccess = createAction('[User] findImageSuccess', props<{image : any}>());

export const add = createAction('[User] add', props<{user : User}>());
export const addSuccess = createAction('[User] addSuccess', props<{user : User}>());

export const edit = createAction('[User] edit', props<{userUpdate : User}>());
export const editSuccess = createAction('[User] editSuccess', props<{userUpdate : User}>());

export const editImage = createAction('[User] editImage', props<{formImage : FormData}>());
export const editImageSuccess = createAction('[User] editImageSuccess', props<{image : string}>());

export const editPassword = createAction('[User] editPassword', props<{request : UpdatePasswordRequest, id : number}>());
export const editPasswordSuccess = createAction('[User] editPasswordSuccess', props<{userUpdate : User}>());

export const remove = createAction('[User] remove', props<{request : any, id : number}>());
export const removeSuccess = createAction('[User] removeSuccess');

export const setErrors = createAction('setErrors', props<{userForm : User, errors : any}>());
export const setErrorsAny = createAction('setErrorsAny', props<{ errors : any}>());
export const setErrorsRemove = createAction('setErrorsRemove', props<{ errors : any}>());
export const setErrorImage = createAction('setErrorImage');

export const cleanUser = createAction('[User] logoutUser');