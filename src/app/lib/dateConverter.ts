import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class DateConverter {
    public getDate(dateFormControl: AbstractControl): Date {
        return new Date(
            dateFormControl.value.year,
            dateFormControl.value.month - 1,
            dateFormControl.value.day
        );
    }

    public setDate(dateFormControl: AbstractControl, date: Date) {
        dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    }

    public getDateTime(dateFormControl: AbstractControl, timeFormControl: AbstractControl): Date {
        return new Date(
            dateFormControl.value.year,
            dateFormControl.value.month - 1,
            dateFormControl.value.day,
            timeFormControl.value.hour,
            timeFormControl.value.minute
        );
    }

    public setDateTime(dateFormControl: AbstractControl, timeFormControl: AbstractControl, date: Date) {
        dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        timeFormControl.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    }
}