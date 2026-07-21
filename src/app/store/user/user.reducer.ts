import { createReducer, on } from "@ngrx/store";
import { User } from "../../models/user";
import { setErrors, addSuccess, editSuccess, cleanUser, editPasswordSuccess, removeSuccess, setErrorsAny, findByIdSuccess, editImageSuccess, findImageSuccess } from "./user.action";

export interface UserState {
    user : User;
    errors : any;
}

const initialState : UserState = {
    user: new User(),
    errors: {}
}

export const userReducer = createReducer(
    initialState,
    on(findByIdSuccess, (state, {user}) => ({
        user: {... user},
        errors: {}
    })),
    on(findImageSuccess, (state, {image}) => ({
        user: {... state.user, imageProfile: image},
        errors: {}
    })),
    on(addSuccess, (state, {user}) => ({
        user: user,
        errors: {}
    })),
    on(editSuccess, (state, {userUpdate}) => ({
        user: {... userUpdate},
        errors: {}
    })),
    on(editImageSuccess, (state, {image}) => ({
        user: {... state.user, image},
        errors: {}
    })),
    on(editPasswordSuccess, (state, {userUpdate}) => ({
        user: {... userUpdate},
        errors: {}
    })),
    on(removeSuccess, (state) => ({
        user: new User(),
        errors: {} 
    })),
    on(setErrors, (state, {userForm, errors}) => ({
        user: {... userForm},
        errors: {... errors}
    })),
    on(setErrorsAny, (state, {errors}) => ({
        user: state.user,
        errors: {... errors}
    })),
    on(cleanUser, (state) => ({
        user: new User(),
        errors: {}
    }))
)