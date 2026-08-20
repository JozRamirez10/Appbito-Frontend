export interface HabitProgress {
    id : number;
    date : string;
    timesPerformed : number;
    note ? : string;
    habitId : number;
}

export type CreateHabitProgressRequest = Omit<HabitProgress, 'id'>;

export type UpdateHabitProgressRequest = Pick<HabitProgress, 'timesPerformed' | 'note'>;

export interface HabitProgressMonthly {
    year : number;
    month : number;
    totalTimesPerformed : number;
    habitId : number;
}