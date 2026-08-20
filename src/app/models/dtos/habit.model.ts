import { DaysOfWeek } from "src/app/enums/days.enum";

export interface Habit {
    id : number,
    name : string,
    description ? : string,
    hour ? : string,
    days : DaysOfWeek[]
}

export type HabitRequest = Omit<Habit, 'id'>;

export type CreateHabitRequest = HabitRequest;
export type UpdateHabitRequest = HabitRequest;

export type UpdateHabitBatchRequest = Habit;