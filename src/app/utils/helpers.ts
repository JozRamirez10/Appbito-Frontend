import { DaysOfWeek } from "../enums/days.enum";
import { HabitProgress } from "../models/habit";

/**********************
 * Date
**********************/

export const weekDays : string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const monthNames : string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function dayWihtoutTime(date : Date) : Date{
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDayOfWeek() : DaysOfWeek{
    const today : DaysOfWeek = ( () => {
      const dayMap = [
        DaysOfWeek.SUNDAY,
        DaysOfWeek.MONDAY,
        DaysOfWeek.TUESDAY,
        DaysOfWeek.WEDNESDAY,
        DaysOfWeek.THURSDAY,
        DaysOfWeek.FRIDAY,
        DaysOfWeek.SATURDAY
      ];
      return dayMap[new Date().getDay()];
    })()
    return today;
}

export const daysMap:{ [kay in DaysOfWeek] : number } = {
  [DaysOfWeek.SUNDAY]: 0,
  [DaysOfWeek.MONDAY]: 1,
  [DaysOfWeek.TUESDAY]: 2,
  [DaysOfWeek.WEDNESDAY]: 3,
  [DaysOfWeek.THURSDAY]: 4,
  [DaysOfWeek.FRIDAY]: 5,
  [DaysOfWeek.SATURDAY]: 6,
};

export function isToday(day: Date): boolean {
  const today = new Date();
  if(day){
    return compareDay(day, today);
  }
  return false;
}

export function dayExists(day : Date, days : Date[]) : boolean{
  return days.some(d => {
    return compareDay(d, day);
  });
}

export function compareDay(day1 : Date, day2: Date) : boolean {
  return day1.getDate() === day2.getDate() &&
    day1.getMonth() === day2.getMonth() &&
    day1.getFullYear() === day2.getFullYear();
}

export function getWeeklyRanges(day : Date){

  const startOfWeek = new Date(day);
  startOfWeek.setDate(day.getDate() - day.getDay() + 1); // Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  }
}

export function getTwoMonthlyRangesForToday(){
  const today = dayWihtoutTime(new Date())
  const lastDayMonth = dayWihtoutTime(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
  const nextDayMonth = dayWihtoutTime(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()));

  const lastMonth = getMonthlyRanges(lastDayMonth);
  const nextMonth = getMonthlyRanges(nextDayMonth);

  return {
    start: lastMonth.start,
    end: nextMonth.end
  }
}

export function getMonthlyRanges(day : Date) {
  // Current Month
  const startOfCurrentMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  const endOfCurrentMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0);

  return {
    start: startOfCurrentMonth.toISOString().split('T')[0],
    end: endOfCurrentMonth.toISOString().split('T')[0]
  }
}

/**********************
 * Progress
**********************/

export function getDone(day : Date, habitProgress : HabitProgress[]) : number {
  const progress = habitProgress.find(progress => compareDay(day, progress.date) && progress.timesPerformed >= 1);
    
    if(progress){
      return progress.timesPerformed;
    }

    return 0;
}

export function hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {
  return habitProgress.some(progress => compareDay(day, progress.date) && progress.note && progress.note?.length > 0);
}

export function compareHabitProgress(progress1 : HabitProgress[], progress2 : HabitProgress[]) : boolean {
  if(progress1.length !== progress2.length)
    return false;
  return progress1.every(prog1 => progress2.some(prog2 => compareDay(prog1.date, prog2.date)));
}

export function getStreak(progress: Date[], days: DaysOfWeek[]): number {
  if (progress.length === 0) return 0;

  const allowedDaysArray = days.map(day => daysMap[day]);
  const allowedDays = new Set(allowedDaysArray);

  const filteredProgress = progress
    .filter(date => allowedDays.has(date.getDay()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (filteredProgress.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let countDay = 0;

  filteredProgress.reduce((prev, day, index) => {    
    
    if (currentStreak === 0) {
      countDay = allowedDaysArray.findIndex(d => d === day.getDay());
    }

    const currentDay = day.getDay();

    const diffDays = (day.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (currentDay === allowedDaysArray[countDay] && diffDays < 8 ) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }

    countDay = (countDay + 1) % allowedDaysArray.length;

    return day;
  }, filteredProgress[0]);

  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
}