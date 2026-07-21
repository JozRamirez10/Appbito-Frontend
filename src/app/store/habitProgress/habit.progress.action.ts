import { createAction, props } from "@ngrx/store";
import { Habit, HabitProgress } from "../../models/habit";

export const loadByIdHabit = createAction('[HabitProgress[]] findAll', props<{habitId : number, habitProgress : HabitProgress[]}>());

export const findByIdHabitAndRange = createAction('[HabitProgress[]] findByIdHabitAndRange', props<{habits : Habit[], startDate : string, endDate : string}>());
export const loadByIdHabitRange = createAction('[HabitProgress[]] loadByIdHabitRange', props<{habitId : number, habitProgress : HabitProgress[], startDate : string, endDate : string}>());

export const findHabitProgress = createAction('[HabitProgress] findHabitProgress', props<{habit : Habit, day : Date}>());

export const addHabitProgress = createAction('[HabitProgress] addHabitProgress', props<{habitProgressNew : HabitProgress}>());
export const addHabitProgressSuccess = createAction('[HabitProgress] addHabitProgressSuccess', props<{habitId: number, habitProgressNew : HabitProgress}>());

export const updateHabitProgress = createAction('[HabitProgress] updateHabitProgress', props<{habitProgressUpdate : HabitProgress}>());
export const updateHabitProgressSuccess = createAction('[HabitProgress] updateHabitProgressSuccess', props<{habitId: number, habitProgressUpdate : HabitProgress}>());

export const removeHabitProgress = createAction('[HabitProgress] removeHabitProgress', props<{habitId : number, habitProgressId : number}>());
export const removeHabitProgressSuccess = createAction('[HabitProgress] removeHabitProgressSuccess',props<{habitId : number, habitProgressId : number}>());

export const cleanHabitProgress = createAction('[HabitProgress] cleanHabitProgress');
