import { createReducer, on } from "@ngrx/store";
import { loginError, loginSuccess, logoutError, logoutSuccess, removeSuccessAccount } from "./auth.action";

export const initialState = {
    id: null,
    token: sessionStorage.getItem('token') || null
}

export const authReducer = createReducer(
    initialState,
    on(loginSuccess, (state, {login}) => ({
        id: login.id,
        token: login.token
    })),
    on(loginError, (state, {error}) => ({
        id: null,
        token: null
    })),
    on(logoutSuccess, () => ({id: null, token: null})),
    on(logoutError, () => ({id: null, token: null})),
    on(removeSuccessAccount, () => ({id: null, token: null}))
)