import { createReducer, on } from "@ngrx/store";
import { Habit, HabitProgress } from "../../models/habit";
import { addHabitProgressSuccess, cleanHabitProgress, findHabitProgress, loadByIdHabit, loadByIdHabitRange, removeHabitProgressSuccess, updateHabitProgressSuccess } from "./habit.progress.action";
import { compareDay, dayWihtoutTime } from "../../utils/helpers";

export interface HabitProgressState {
    progressByIdHabit: { 
        [habitId : number]: {
            habitProgress: HabitProgress[];
            startDate: string,
            endDate: string
        }
    };
    habitProgress : HabitProgress;
    habit : Habit;
    day : Date;
    lastRemovedProgress?: HabitProgress | null;
}

const initialState : HabitProgressState = {
    progressByIdHabit: {},
    habitProgress: new HabitProgress(),
    habit: new Habit(),
    day: new Date(),
}

export const habitProgressReducer = createReducer(
    initialState,
    on(loadByIdHabitRange, (state, {habitId, habitProgress, startDate, endDate}) => {
        const existingData = state.progressByIdHabit[habitId] || {habitProgress: [], startDate, endDate};
        
        return {
            ...state,
            progressByIdHabit: {
                ...state.progressByIdHabit, 
                [habitId] : {
                    habitProgress: [
                        ...(state.progressByIdHabit[habitId]?.habitProgress || []),
                        ...habitProgress
                    ],
                    startDate: dayWihtoutTime(new Date(startDate)) < dayWihtoutTime(new Date(existingData.startDate)) ? startDate : existingData.startDate,
                    endDate: dayWihtoutTime(new Date(endDate)) > dayWihtoutTime(new Date(existingData.endDate)) ? endDate : existingData.endDate
                }
            }
        }
    }),
    on(findHabitProgress, (state, {habit, day}) => ({
        ...state,
        habitProgress: state.progressByIdHabit[habit.id]?.habitProgress.find(progress => compareDay(progress.date, day)) || new HabitProgress(),
        habit: {... habit},
        day: day
    })),
    on(addHabitProgressSuccess, (state, {habitId, habitProgressNew}) => {
        const existingData = state.progressByIdHabit[habitId] || {habitProgress: [], startDate: '', endDate: ''};

        return {
            ...state,
            progressByIdHabit: {
                ...state.progressByIdHabit,
                [habitId]: {
                    habitProgress:[...existingData.habitProgress, habitProgressNew],
                    startDate: existingData.startDate,
                    endDate: existingData.endDate
                }
            }
        }
    }),
    on(updateHabitProgressSuccess, (state, {habitId, habitProgressUpdate}) => {
        const existingData = state.progressByIdHabit[habitId] || {habitProgress: [], startDate: '', endDate: ''};

        return {
            ...state,
            progressByIdHabit: {
                ... state.progressByIdHabit,
                [habitId]:{
                    habitProgress: existingData.habitProgress.map(habitProgress => 
                        habitProgress.id === habitProgressUpdate.id ? {...habitProgress, ...habitProgressUpdate} : habitProgress
                    ),
                    startDate: existingData.startDate,
                    endDate: existingData.endDate
                }
            }
        }
    }),
    on(removeHabitProgressSuccess, (state, {habitId, habitProgressId}) => {
        const existingData = state.progressByIdHabit[habitId] || {habitProgress: [], startDate: '', endDate: ''};

        const removedProgress = existingData.habitProgress.find(progress => progress.id === habitProgressId) || null;
        
        return {
            ...state,
            progressByIdHabit: {
                ...state.progressByIdHabit,
                [habitId]: {
                    habitProgress: existingData.habitProgress.filter(progress => progress.id !== habitProgressId),
                    startDate: existingData.startDate,
                    endDate: existingData.endDate
                }
            },
            lastRemovedProgress: removedProgress
        }
    }),
    on(cleanHabitProgress, (state) => ({
        progressByIdHabit: initialState.progressByIdHabit,
        habitProgress: initialState.habitProgress,
        habit: initialState.habit,
        day: initialState.day,
    }))
)

