import { createReducer, on } from "@ngrx/store";
import { addSuccess, cleanHabits, editBatchSuccess, editSucess, find, loadByUserId, loadByUserIdRange, removeSucess, resetHabit, setErrors } from "./habits.action";
import { Habit } from "../../models/habit";
import { DaysOfWeek } from "../../enums/days.enum";

export interface HabitState {
    habits : Habit[];
    habit : Habit;
    errors : any;
}

const initialState : HabitState = {
    habits: [],
    habit: new Habit(),
    errors: {}
}

const sortedDays = (days : DaysOfWeek[]) : DaysOfWeek[] => {
    const daysOrder = [
        DaysOfWeek.SUNDAY,
        DaysOfWeek.MONDAY,
        DaysOfWeek.TUESDAY,
        DaysOfWeek.WEDNESDAY,
        DaysOfWeek.THURSDAY,
        DaysOfWeek.FRIDAY,
        DaysOfWeek.SATURDAY,
    ];
    return  [... (days || [] ) ].sort((a,b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
}

export const habitReducer = createReducer(
    initialState,
    on(resetHabit, (state) => ({
        ... state,
        habits: state.habits,
        habit: new Habit()
    })),
    on(loadByUserId, (state, {habits}) => ({
        ... state,
        habits: habits.map(habit => ({...habit, days: sortedDays(habit.days)})),
    })),
    on(loadByUserIdRange, (state, {habits, startDate, endDate}) => ({
        ... state,
        habits: habits.map(habit => ({...habit, days: sortedDays(habit.days)})),
    })),
    on(find, (state, {id}) => ({
        ...state,
        habit: state.habits.find(habit => habit.id == id) || new Habit(),
    })),
    on(addSuccess, (state, {habitNew}) => ({
        ...state,
        habits: [... state.habits, {... habitNew, days: sortedDays(habitNew.days)}],
    })),
    on(editSucess, (state ,{habitUpdate}) => ({ 
        ...state,
        habits: state.habits.map(habit => (habit.id == habitUpdate.id) ? {...habitUpdate, days: sortedDays(habitUpdate.days)} : habit),
    })),
    on(editBatchSuccess, (state ,{habitsUpdate}) => ({ 
        ...state,
        habits: state.habits.map( habit => {
            const updated = habitsUpdate.find(h => h.id === habit.id);
            return updated ? {... habit, ...updated} : habit;
        }),
    })),
    on(removeSucess, (state, {id}) => ({
        ...state,
        habits: state.habits.filter(habit => habit.id !== id),
    })),
    on(setErrors, (state, {habitForm, errors}) => ({
        ...state,
        habit: {... habitForm},
        errors: {... errors}
    })),
    on(cleanHabits, (state) => ({
        habits: initialState.habits,
        habit: initialState.habit,
        errors: initialState.errors
    }))
)