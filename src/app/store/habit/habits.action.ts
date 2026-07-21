import { createAction, props } from "@ngrx/store";
import { Habit } from "../../models/habit";

export const resetHabit = createAction('resetHabit');

export const findByUserId = createAction('[Habit[]] findByUserId', props<{id : number}>());
export const loadByUserId = createAction('[Habit[]] loadByUserId', props<{habits : Habit[]}>());

export const findByUserIdRange = createAction('[Habit[]] findByUserIdRange', props<{id : number, startDate : string, endDate : string}>());
export const loadByUserIdRange = createAction('[Habit[]] findAloadByUserIdRange', props<{habits : Habit[], startDate : string, endDate : string}>());

export const find = createAction('[Habit] find', props<{id : number}>());

export const add = createAction('[Habit] add', props<{habitNew: Habit}>());
export const addSuccess = createAction('[Habit] addSuccess', props<{habitNew: Habit}>());

export const edit = createAction('[Habit] edit', props<{habitUpdate : Habit}>());
export const editSucess = createAction('[Habit] editSucess', props<{habitUpdate : Habit}>());

export const editBatch = createAction('[Habit[]] editBatch', props<{habitsUpdate : Habit[]}>());
export const editBatchSuccess = createAction('[Habit[]] editBatchSuccess', props<{habitsUpdate : Habit[]}>());

export const remove = createAction('[Habit] remove', props<{id : number}>());
export const removeSucess = createAction('[Habit] removeSuccess', props<{id : number}>());

export const setErrors = createAction('setErrors', props<{habitForm : Habit, errors : any}>());

export const cleanHabits = createAction('[Habit] cleanHabits');