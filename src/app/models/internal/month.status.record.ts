import { MonthStatus } from "src/app/enums/month.status.enum";
import { Months } from "src/app/enums/months.enum";

export interface MonthStatusRecord {
    habitId : number;
    year: number;
    month: Months,
    status: MonthStatus
}

export type MonthRecord = Omit<MonthStatusRecord, 'status'>;