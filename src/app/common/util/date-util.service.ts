import { Injectable } from "@angular/core";
import * as moment from "moment-timezone";


@Injectable({
    providedIn: 'root'
})

export class DateUtilService {
    constructor() {
        // moment.tz.setDefault('asia/kolkata');
    }

    private toMoment(input: any): moment.Moment | null {
        if (input == null) return null;
        if (moment.isMoment(input)) return input;
        if (input instanceof Date) return moment(input);
        if (typeof input === 'number') return moment(input);

        // Firestore Timestamp (compat / admin) shapes
        if (typeof input === 'object') {
            if (typeof input.toDate === 'function') {
                return moment(input.toDate());
            }
            if (typeof input.seconds === 'number') {
                return moment.unix(input.seconds);
            }
        }

        if (typeof input === 'string') {
            const trimmed = input.trim();
            if (!trimmed) return null;

            // Prefer strict parsing of the app's common formats
             const formats = [
                 'YYYY-MM-DD hh:mm A',
                 // Some data sources (or manual edits) use 24h time with AM/PM (e.g. "15:15 PM")
                 'YYYY-MM-DD HH:mm A',
                 'YYYY-MM-DD HH:mm',
                 'YYYY-MM-DD',
                 'DD-MM-YYYY hh:mm A',
                 'DD/MM/YYYY hh:mm A',
                 'DD-MM-YYYY',
                 'DD/MM/YYYY',
             ];
            let parsed = moment(trimmed, formats, true);
            if (!parsed.isValid()) {
                parsed = moment(trimmed); // ISO / browser fallback
            }
            return parsed.isValid() ? parsed : null;
        }

        return null;
    }

    toDate(input: any): Date | null {
        const parsed = this.toMoment(input);
        return parsed ? parsed.toDate() : null;
    }

    formatDisplayDate(input: any, format: string = 'Do MMM, YYYY'): string {
        const parsed = this.toMoment(input);
        return parsed ? parsed.format(format) : '';
    }

    isExpired(expiry: any): boolean {
        const expiryMoment = this.toMoment(expiry);
        if (!expiryMoment) return false;
        return moment().isAfter(expiryMoment);
    }

    getMonth() {
        return moment().format('MMMM');
    }

    getCurrentDate() {
        let tzDate = moment();
        return tzDate;
    }


    getCurrentMilliSeconds() {
        return moment().valueOf();
    }

    /**
     * Epoch microseconds (µs) with best-available resolution.
     * Uses Performance API when available; falls back to Date.now().
     */
    getCurrentEpochMicroSeconds(): number {
        const perf: any = (globalThis as any)?.performance;
        if (perf && typeof perf.now === 'function') {
            const timeOrigin =
                typeof perf.timeOrigin === 'number'
                    ? perf.timeOrigin
                    : Date.now() - perf.now(); // fallback approximation
            return Math.round((timeOrigin + perf.now()) * 1000);
        }
        return Math.round(Date.now() * 1000);
    }

    getTimeDifferenceInMicroSecondsFromEpoch(startEpochUs: any, endEpochUs: any): number | null {
        const start = Number(startEpochUs);
        const end = Number(endEpochUs);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
        return end - start;
    }

    formatMicroSecondsToHhMmSsUs(us: any): string {
        const totalUs = Number(us);
        if (!Number.isFinite(totalUs) || totalUs < 0) return '';

        const totalSeconds = Math.floor(totalUs / 1_000_000);
        const microRemainder = Math.floor(totalUs % 1_000_000);

        const hh = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const mm = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const ss = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
        const micros = microRemainder.toString().padStart(6, '0');

        return `${hh}:${mm}:${ss}.${micros}`;
    }

    formatMicroSecondsAsSeconds(us: any, fractionDigits: number = 6): string {
        const totalUs = Number(us);
        if (!Number.isFinite(totalUs) || totalUs < 0) return '';
        const seconds = totalUs / 1_000_000;
        return seconds.toFixed(fractionDigits);
    }


    getCurrentDateWithYYYYMMDD() {
        let tzDate = this.getCurrentDate().format('YYYY-MM-DD');
        return tzDate;
    }

    addDayToCurrentData(days: number) {
        return this.getCurrentDate().add(days, 'days').format('YYYY-MM-DD hh:mm A');
    }



    getCurrentTimeWith12hrFormat() {
        let tzDate = this.getCurrentDate().format('hh:mm A');
        return tzDate;
    }

    getCurrentDateWithMinAndSecondFormat() {
        let tzDate = this.getCurrentDate().format('HH:mm:ss');
        return tzDate;
    }



    getTimeDifferenceInMins(eventStartTime: string, eventEndTime: string) {
        var startTime = moment(eventStartTime, 'hh:mm A');
        var endTime = moment(eventEndTime, 'hh:mm A');

        return moment(endTime).diff(moment(startTime), 'minutes');
    }

    getTimeDifferenceInSeconds(eventStartTime: string, eventEndTime: string) {
        var startTime = moment(eventStartTime, 'HH:mm:ss');
        var endTime = moment(eventEndTime, 'HH:mm:ss');

        return moment(endTime).diff(moment(startTime), 'seconds');
    }
    formattTimeDifferenceInSeconds(timeInSeconds: any) {
        return moment.utc(timeInSeconds * 1000).format('HH:mm:ss');
    }

    formatDate(date: string) {
        return moment(date, "YYYY-MM-DD hh:mm A").format('YYYY-MM-DD hh:mm A');
    }



    formatTimeZone(date: string) {
        return moment(date, "YYYY-MM-DD hh:mm A").format('hh:mm A'); //changes by Masud
        //return moment(new Date(date)).format('hh:mm A');
    }

    getDateDifferenceInDays(sDate: string, eDate: string) {
        return moment(new Date(eDate)).diff(moment(new Date(sDate)), "days");
    }

    getTimeDifferenceInHoursWithCurrentTime(eDate: string) {
        var endFormatedDate = moment(eDate, 'YYYY-MM-DD hh:mm A');
        var edate = moment(endFormatedDate).format('YYYY-MM-DD HH:mm');
        var cur = this.getCurrentDate().format('YYYY-MM-DD HH:mm');
        return moment(edate).diff(moment(cur), 'hours');
    }
    getFormatDate(date: string) {
        return moment(date, "DD-MM-YYYY").format('DD/MM/YYYY');
    }
    getFormatDateT(date: string) {
        return moment(date, "DD-MM-YYYY").format();
    }

    sortingBasedOnCreationTime(target: Array<any>) {
        return target.sort((b, a) => moment(a.creationDate).unix() - moment(b.creationDate).unix());
    }

    getCurrentDateWithTime() {
        let tzDate = this.getCurrentDate().format('YYYY-MM-DD hh:mm A');
        return tzDate;
    }

    sortingBasedOnAppearedDate(target: Array<any>) {
        return target.sort((b, a) => moment(a.appearedDate).unix() - moment(b.appearedDate).unix());
    }

    sortingBasedOnEventDate(target: Array<any>) {
        return target.sort((b, a) => moment(a.eventDate).unix() - moment(b.eventDate).unix());
    }

    checkDateInBetween(inputDate: string, startDate: string, endDate: string) {
        return moment(inputDate, 'YYYY-MM-DD').isBetween(moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD'), 'day', '[]');
    }

    checkDateBefore(inputDate: any, eventDate: any) {
        return moment(inputDate, 'YYYY-MM-DD').isBefore(moment(eventDate, 'YYYY-MM-DD'));
    }
    checkDateIsAfter(inputDate: any, eventEndDate: any) {
        return moment(inputDate, 'YYYY-MM-DD').isAfter(moment(eventEndDate, 'YYYY-MM-DD'));
    }

    fomrmatDateToMonthAndDate(eventEndDate: any) {
        return moment(eventEndDate).format("Do MMMM");
    }

    sortingBasedSubscriptionDate(target: Array<any>) {
        return target.sort((b, a) => moment(a.endDate).unix() - moment(b.endDate).unix());
    }

    formatSecondsToTime(e: number) {
        const h = Math.floor(e / 3600).toString().padStart(2, '0'),
            m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
            s = Math.floor(e % 60).toString().padStart(2, '0');

        return h + ':' + m + ':' + s;
    }

    formatSecondsToTimeMS(e: number) {
        const m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
            s = Math.floor(e % 60).toString().padStart(2, '0');

        return m + ':' + s;
    }
    getCurrentEpochTime() {
        return moment().unix();
    }

    getUnixTime(date: string) {
        return moment(date, "YYYY-MM-DD").unix();
    }

    getExpiredDays(eDate: string) {
        return moment().diff(moment(eDate), 'days');
    }

    getCurrentMonth() {
        return moment().format('MMM');
    }

    getCurrentYear() {
        return moment().format('YYYY');
    }


    generateGreetings() {
        let currentHour = moment().format("HH");
        if (Number(currentHour) >= 3 && Number(currentHour) < 12) {
            return "Good Morning";
        } else if (Number(currentHour) >= 12 && Number(currentHour) < 15) {
            return "Good Afternoon";
        } else if (Number(currentHour) >= 15 && Number(currentHour) < 20) {
            return "Good Evening";
        } else if (Number(currentHour) >= 20 || Number(currentHour) < 3) {
            return "Good Night";
        } else {
            return "Hello"
        }
    }

    getNextSunday() {
        // Get the next Sunday
        const nextSunday = moment().isoWeekday(7); // 7 represents Sunday in ISO format
        return nextSunday.format('YYYY-MM-DD'); // Format the date as needed
    }

    addDaysToInputDate(inputDate, i) {
        return moment(inputDate).add(i, 'days').format('YYYY-MM-DD hh:mm A');
    }

    get12Months() {
        let months: any[] = [];
        for (var i = 0; i < 12; i++) {
            let mothObj = { id: i, title: moment().add(i, 'months').format('MMM'), name: moment().add(i, 'months').format('MMMM') };
            months.push(mothObj);
        }
        return months;
    }

    getLastMonth() {
        return moment().subtract(1, 'months').format('MMM');
    }

}
