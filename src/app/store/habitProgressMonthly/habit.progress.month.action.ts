import { createAction, props } from "@ngrx/store";
import { HabitProgresMonthly } from "../../models/habit";

export const loadHabitProgressByMonth = createAction('[HabitProgressMonthly] loadHabitProgressByMonth', 
    props<{years : number[], habitIds : number[]}>());

export const loadHabitProgressByMonthSuccess = createAction('[HabitProgressMonthly] loadHabitProgressByMonthSuccess',
    props<{progress : HabitProgresMonthly[]}>());

export const addHabitProgressByMonth = createAction('[HabitProgressMonthly] addHabitProgressByMonth', 
    props<{year: number, month: number, habitId: number, timesPerformed : number}>());

export const updateHabitProgressByMonth = createAction('[HabitProgressMontly] updateHabitProgressByMonth',
    props<{year : number, month : number, habitId : number, timesPerformed : number}>());

export const removeHabitProgressByMonth = createAction('[HabitProgressMonthly] removeHabitProgressByMonth', 
    props<{year: number, month: number, habitId: number, timesPerformed : number}>());

export const cleanHabitProgressMonthly = createAction('[HabitProgressMonthly] cleanHabitProgressMonthly');


