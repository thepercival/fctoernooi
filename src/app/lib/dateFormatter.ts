import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class DateFormatter {
    protected static readonly YMSD2TC: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "2-digit", hour12: false, hour: "2-digit", minute: "2-digit" };
    protected static readonly YMSD2: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "2-digit" };
    protected static readonly MSD2: Intl.DateTimeFormatOptions = { month: "short", "day": "2-digit" };
    protected static readonly MSD2TC: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", hour12: false, hour: "2-digit", minute: "2-digit" };
    protected static readonly TC: Intl.DateTimeFormatOptions = { hour12: false, hour: "2-digit", minute: "2-digit" };

    date(): Intl.DateTimeFormatOptions {
        return DateFormatter.MSD2;
    }

    dateWithYear(): Intl.DateTimeFormatOptions {
        return DateFormatter.YMSD2;
    }

    time(): Intl.DateTimeFormatOptions {
        return DateFormatter.TC;
    }

    datetime(): Intl.DateTimeFormatOptions {
        return DateFormatter.MSD2TC;
    }

    datetimeWithYear(): Intl.DateTimeFormatOptions {
        return DateFormatter.YMSD2TC;
    }

    toString(date: Date | undefined, format: Intl.DateTimeFormatOptions): string {
        return date ? date.toLocaleString("nl", format) : '';
    }

    toStringHelper(date: Date) {

    }
}