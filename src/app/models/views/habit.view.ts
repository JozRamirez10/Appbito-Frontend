import { Habit } from "../dtos/habit.model";
import { HabitProgress } from "../dtos/habit.progress.model";


export interface HabitView extends Habit {
    progress : HabitProgress[];
    hasProgressError? : boolean;
    streak? : number | null;
}