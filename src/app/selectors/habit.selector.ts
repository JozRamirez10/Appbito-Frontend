import { createFeatureSelector, createSelector } from "@ngrx/store";
import { HabitProgressState } from "../store/habitProgress/habit.progress.reducer";
import { HabitState } from "../store/habit/habits.reducer";
import { HabitProgressMonthlyState } from "../store/habitProgressMonthly/habit.progress.month.reducer";

export const selectHabitState = createFeatureSelector<HabitState>('habits');
export const selectHabitProgressState = createFeatureSelector<HabitProgressState>('habitProgress');
export const selectHabitProgressMonthState = createFeatureSelector<HabitProgressMonthlyState>('habitProgressMonthly');

export const selectHabits = createSelector(
    selectHabitState,
    (state) => state.habits
);

export const selectHabitProgess = createSelector(
    selectHabitProgressState,
    (state) => state.progressByIdHabit
);

export const selectHabitProgressByMonth = createSelector(
    selectHabitProgressMonthState,
    (state) => state.progressByMonth
);

export const selectHabitsWithProgress = createSelector(
    selectHabits,
    selectHabitProgess,
    (habits, progressByIdHabit) => {
        return habits.map(habit => {
            const habitData = progressByIdHabit[habit.id] || {habitProgress: [], startDate: '', endDate: ''};
            return {
                ... habit,
                habitProgress: habitData.habitProgress,
                startDate: habitData.startDate,
                endDate: habitData.endDate
            }
        })
    }
)
