import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { APP, ERRORS, GENERAL } from "../constants/constants";
import { DaysOfWeek } from "../enums/days.enum";
import { ModalActions } from "../enums/modal.actions.enum";
import { Months } from "../enums/months.enum";
import { HabitProgress } from "../models/dtos/habit.progress.model";
import { ModalService } from "../services/modal.service";

/**********************
 * Date
**********************/

export function getDayOfWeek() : DaysOfWeek{
    const dayMap = [
      DaysOfWeek.SUNDAY, DaysOfWeek.MONDAY, DaysOfWeek.TUESDAY,
      DaysOfWeek.WEDNESDAY, DaysOfWeek.THURSDAY, DaysOfWeek.FRIDAY, DaysOfWeek.SATURDAY
    ]
    return dayMap[new Date().getDay()];
}

export function dateToDatetimeStr(date : Date) : string {
  const hour = date.getHours().toString().padStart(APP.HOUR_CHARS, GENERAL.ZERO_STRING);
  const minutes = date.getMinutes().toString().padStart(APP.MINUTES_CHARS,
    GENERAL.ZERO_STRING);
  return[hour, minutes].join(GENERAL.COLON);
}

export function formatDateToString(date : Date) : string {

  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, GENERAL.ZERO_STRING);
  const day = d.getDate().toString().padStart(2, GENERAL.ZERO_STRING);

  return [year, month, day].join(GENERAL.HYPEN);
}

export function todayToString() : string {
  return formatDateToString(new Date());
}

export function isToday(day: Date): boolean {
  const today = new Date();
  if(day){
    return compareDay(day, today);
  }
  return false;
}

export function decodeDateString(dateString : string)
  : { year : number, month : number, day : number } {

  const [year, month, day] = dateString.split(GENERAL.HYPEN).map(Number);

  return { year, month: month - 1, day };
}

export function compareDay(day1 : Date, day2: Date) : boolean {
  return day1.getDate() === day2.getDate() &&
    day1.getMonth() === day2.getMonth() &&
    day1.getFullYear() === day2.getFullYear();
}

export function getTwoMonthlyRangesForDate(date : Date){
  const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  const lastMonth = getMonthlyRanges(prevMonthDate);
  const nextMonth = getMonthlyRanges(nextMonthDate);

  return {
    start: lastMonth.start,
    end: nextMonth.end
  }
}

export function getMonthlyRanges(day : Date) {
  const startOfCurrentMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  const endOfCurrentMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0);

  return {
    start: startOfCurrentMonth.toISOString().split(GENERAL.SEPARATE_DATETIME)[0],
    end: endOfCurrentMonth.toISOString().split(GENERAL.SEPARATE_DATETIME)[0]
  }
}

export function getMonthsFromRange(startDate : string, endDate: string )
  : { year : number, month : number }[] {

  const start = decodeDateString(startDate);
  const end = decodeDateString(endDate);

  const period = [];
  let currentYear = start.year;
  let currentMonth = start.month;

  while (currentYear < end.year || (currentYear === end.year && currentMonth <= end.month)) {
    period.push({ year: currentYear, month: currentMonth });
    currentMonth++;

    if (currentMonth > Months.DEC) {
      currentMonth = Months.JAN;
      currentYear++;
    }
  }

  return period;
}

/**********************
 * Progress
**********************/

export function getMonthlyProgressKey(year : number, month : number, habitId : number) : string {
  return [year, month, habitId].join(GENERAL.HYPEN);
}

export function getDone(day : Date, habitProgress : HabitProgress[]) : number {

  if (!day || !habitProgress) return 0;

  const dayStr = formatDateToString(day);
  const progress = habitProgress.find(p => p.date === dayStr && p.timesPerformed >= 1);

  return progress ? progress.timesPerformed : 0;
}

export function hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {

  if(!day || !habitProgress) return false;

  const dayStr = formatDateToString(day);
  return habitProgress.some(p => p.date === dayStr && p.note && p.note.length > 0);
}

/**********************
 * Errors
**********************/

export function hasNotErrorInterceptors(err : HttpErrorResponse) :  boolean {
    return !ERRORS.ERROR_STATUS_INTERCEPTOR.includes(err.status)
}

export function notifyError(err : HttpErrorResponse, action : ModalActions,
  modalService : ModalService, ignoreBadRequest = false) : void {

  if (!hasNotErrorInterceptors(err)) return;

  if (ignoreBadRequest && err.status === HttpStatusCode.BadRequest) return;

  modalService.showModal(action);
}

export function catchAndNotify<T>(action : ModalActions, modalService : ModalService,
  ignoreBadRequest = false) {
  return catchError<T, Observable<never>>((err : HttpErrorResponse) => {
      notifyError(err, action, modalService, ignoreBadRequest);
      return throwError(() => err);
  });
}