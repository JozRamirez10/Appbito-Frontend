import { DaysOfWeek } from "../enums/days.enum";

export class Habit {
    id ! : number;
    name ! : string;
    description ! : string;
    hour ! : string ; // HH:mm
    days ! : DaysOfWeek[];
    habitProgress : HabitProgress[] = [];
    userId ! : number;
}

export class HabitProgress {
    id ! : number;
    date ! : Date;
    timesPerformed : number = 0;
    note ? : string = '';
    habitId ! : number;
}

export class HabitProgresMonthly {
    year ! : number;
    month ! : number;
    habitId ! : number;
    totalTimesPerformed ! : number;
}

export class HabitStreak {
    habit ! : Habit;
    streak ! : number;
}

export class DailyHabit {
    habit ! : Habit;
    check ! : boolean;
}

export class MonthlyHabit {
    name ! : string;
    count ! : number [];
}

