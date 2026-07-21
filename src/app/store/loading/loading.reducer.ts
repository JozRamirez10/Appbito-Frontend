import { createReducer, on } from "@ngrx/store";
import { loadingState } from "./loading.action";

const initialState : boolean = false;

export const loadingReducer = createReducer(
    initialState,
    on(loadingState, (state, {loading}) => loading )
)