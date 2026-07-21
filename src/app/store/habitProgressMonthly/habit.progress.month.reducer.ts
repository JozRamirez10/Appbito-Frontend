import { createReducer, on } from "@ngrx/store"
import { addHabitProgressByMonth, cleanHabitProgressMonthly, loadHabitProgressByMonthSuccess, removeHabitProgressByMonth, updateHabitProgressByMonth } from "./habit.progress.month.action"

export interface HabitProgressMonthlyState{
    progressByMonth: {
        [year : number]: {
            [month : number] : {
                [habitId: number] : number
            }
        }
    }
}

const initialState : HabitProgressMonthlyState = {
    progressByMonth: {}
}

export const habitProgressMonthlyReducer = createReducer(
    initialState,
    on(loadHabitProgressByMonthSuccess, (state, {progress}) => {
        const newProgressByMonth = {...state.progressByMonth};

        progress.forEach(({year, month, habitId, totalTimesPerformed}) => {
            if(!newProgressByMonth[year]) {
                newProgressByMonth[year] = {}
            }
            if(!newProgressByMonth[year][month]) {
                newProgressByMonth[year][month] = {}
            }
            newProgressByMonth[year][month][habitId] = totalTimesPerformed;
        });

        return {
            ... state,
            progressByMonth: newProgressByMonth
        }
    }),
    on(addHabitProgressByMonth, (state, {year, month, habitId, timesPerformed}) => ({
        ...state,
        progressByMonth: {
            ...state.progressByMonth,
            [year]: {
                ...state.progressByMonth[year],
                [month]: {
                    ...state.progressByMonth[year][month],
                    [habitId]: (state.progressByMonth[year]?.[month]?.[habitId] || 0) + timesPerformed
                }
            }
        }
    })),
    on(updateHabitProgressByMonth, (state, {year, month, habitId, timesPerformed}) => ({
        ...state,
        progressByMonth: {
            ...state.progressByMonth,
            [year]: {
                ...state.progressByMonth[year],
                [month]: {
                    ...state.progressByMonth[year]?.[month],
                    [habitId]: timesPerformed || 0
                }
            }
        }
    })),
    on(removeHabitProgressByMonth, (state, {year, month, habitId, timesPerformed}) => {
        const currentTimesPerformed = state.progressByMonth[year]?.[month]?.[habitId] || 0;
        const updateTimesPerformed = Math.max(currentTimesPerformed - timesPerformed, 0);
        return {
            ...state,
            progressByMonth: {
                ...state.progressByMonth, 
                [year]: {
                    ...state.progressByMonth[year],
                    [month]: {
                        ...state.progressByMonth[year]?.[month],
                        [habitId]: updateTimesPerformed 
                    }
                }
            }
        }

    }),
    on(cleanHabitProgressMonthly, (state) => ({
        progressByMonth: initialState.progressByMonth
    }))
)