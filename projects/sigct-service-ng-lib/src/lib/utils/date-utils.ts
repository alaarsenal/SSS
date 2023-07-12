import { formatNumber } from '@angular/common';
import StringUtils from './string-utils';

export default class DateUtils {

  /**
   * Reçoit un argument de type Date et le transforme en string au format AAAA-MM-JJ
   * Aucune validation est faite
   * @param date
   */
  static getDateToAAAAMMJJ(date: Date): string {
    if (!date) {
      return null;
    }
    let dtTemp: string;

    let anneeTemp: string = "" + date.getFullYear();
    let moisTemp: string = "" + (date.getMonth() + 1); // Le mois de janvier a pour valeur 0
    if (moisTemp.length == 1) { moisTemp = "0" + moisTemp; }

    let jourTemp: string = "" + date.getDate();
    if (jourTemp.length == 1) { jourTemp = "0" + jourTemp };

    dtTemp = anneeTemp + "-" + moisTemp + "-" + jourTemp;

    return dtTemp;
  }

  /**
   * Reçoit un argument de type Date et le transforme en string au format AAAA-MM-JJ
   * Aucune validation est faite
   * @param date
   */
   static getDateFromAAAAMMJJ(aaaammjj: String): Date {
    if (!aaaammjj) {
      return null;
    }

    return new Date(aaaammjj + "T00:00:00.000Z")
  }

  /**
   * Reçoit un argument de type Date et retourne la date avec le nombre de jours ajouté.
   * @param date
   * @param nbDays
   */
  static addDaysToDate(date: Date, nbDays: number): Date {
    return new Date(date.setDate(date.getDate() + nbDays));
  }

  /**
   * Reçoit un argument de type Date et retourne la date avec le nombre de mois ajouté.
   * @param date
   * @param nbMonths
   */
  static addMonthsToDate(date: Date, nbMonths: number): Date {
    return new Date(date.setMonth(date.getMonth() + nbMonths));
  }

  /**
   * Reçoit un argument de type Date et retourne la date avec le nombre d'années ajouté.
   * @param date
   * @param nbYears
   */
  static addYearsToDate(date: Date, nbYears: number): Date {
    return new Date(date.setFullYear(date.getFullYear() + nbYears));
  }

  /**
   * Calcule le nombre de secondes qui séparent deux dates.
   * @param dateDebut
   * @param dateFin
   */
  static calculerNbSecondesBetween(dateDebut: Date, dateFin: Date): number {
    if (!dateDebut || !dateFin) {
      return null;
    }

    // S'assure que les dates sont de type Date et non des Number.
    const debut: Date = new Date(dateDebut);
    const fin: Date = new Date(dateFin);

    const diffInMillis: number = fin.getTime() - debut.getTime();

    // Retourne le nombre de secondes.
    return Math.floor(diffInMillis / 1000);
  }

  /**
   * Transforme un nombre de secondes en hh:mm:ss. Si le nombre de secondes correspond à 2 jours, 48:00:00 sera retourné.
   * Si secondes est null, 00:00:00 sera retourné.
   * @param secondes
   */
  static secondesToHHMMSS(secondes: number): string {
    if (!secondes || secondes === 0) {
      return "00:00:00";
    }

    const isNegatif: boolean = secondes < 0;
    let duree: number = secondes;

    const hh: string = "" + Math.abs(Math.floor(duree / 3600));
    duree = duree % 3600;

    const mm: string = "" + Math.abs(Math.floor(duree / 60));
    const ss: string = "" + (duree % 60);

    return (isNegatif ? "-" : "") +  hh.padStart(2, "0") + ":" + mm.padStart(2, "0") + ":" + ss.padStart(2, "0");
  }

  static updateDateTimeInString(date: Date, hour: string): Date {
    if (!date || StringUtils.isBlank(hour)) {
      return DateUtils.updateDateTime(date, 0, 0, 0);
    }
    const _hour: number = +(hour[0] + hour[1]);
    const _minutes: number = +(hour[2] + hour[3]);
    return DateUtils.updateDateTime(date, _hour, _minutes, 0);
  }

  /**
   * Ajouter les heures, minutes et secondes à la date date
   * @param date
   * @param hours
   * @param minutes
   * @param seconds
  */
  static updateDateTime(date: Date, hours: number, minutes: number, seconds: number): Date {
    if (!date) {
      return date;
    }
    let _date: Date = new Date(date);
    _date.toLocaleString("en-US", { timeZone: "America/New_York" });
    _date.setHours(hours);
    _date.setMinutes(minutes);
    _date.setSeconds(seconds);
    return _date;
  }

  static isValidTime(time: string): boolean {
    if (StringUtils.isBlank(time)) {
      return false;
    }
    if (isNaN(+time)) {
      return false;
    }
    switch (time.length) {
      case 1: return true;
      case 2: return DateUtils.isValidHour(time);
      case 3:
        return this.isValidHour(time[0] + time[1])
          && this.isValidMinutesOrSeconds(time[2] + '0');
      case 4:
        return this.isValidHour(time[0] + time[1])
          && this.isValidMinutesOrSeconds(time[2] + time[3]);
      case 5:
        return this.isValidHour(time[0] + time[1])
          && this.isValidMinutesOrSeconds(time[2] + time[3])
          && this.isValidMinutesOrSeconds(time[4] + '0');
      case 6:
        return this.isValidHour(time[0] + time[1])
          && this.isValidMinutesOrSeconds(time[2] + time[3])
          && this.isValidMinutesOrSeconds(time[4] + time[5]);
      default: return false;
    }
  }

  static isValidHour(time: string): boolean {
    const _time: number = +time;
    return 0 <= _time && _time <= 23;
  }

  static isValidMinutesOrSeconds(time: string): boolean {
    const _time: number = +time;
    return 0 <= _time && _time <= 60;
  }

  static getHourAndMinutesFromDate(date: Date, mask?: boolean): string {
    if (!date) {
      return null;
    }
    let h: string = date.getHours().toString();
    if (h?.length == 1) {
      h = '0' + h;
    }
    let m: string = date.getMinutes().toString();
    if (m?.length == 1) {
      m = '0' + m;
    }
    return mask ? h + ':' + m : h + m;
  }


  /**
   * Valide que hhmm est une heure valide sous 23:59.
   * @param hhmm heure/minute au format 0530 pour 05:30
   * @returns true si l'heure est valide ou vide
   */
  static validerHHMM(hhmm: string): boolean {
    if (!hhmm) {
      return true;
    }

    // Vérifie si que des chiffres.
    if (!/^\d+$/.test(hhmm)) {
      return false;
    }

    let heure: number = +hhmm.substr(0, 2);
    let minute: number = +hhmm.substr(2, 2);

    if (heure > 23 || minute > 59) {
      return false
    }

    return true;
  }

  /**Complete le temps avec des zero de gauche à droite
   * @param time heure/minute au format 0530 pour 05:30 */
  static completeTimeFormatHHMM(time: string): string {
    if (!time || time.length >= 4) {
      return time;
    }
    switch (time.length) {
      case 1: return '0' + time + '00';
      case 2: return time + '00'
      case 3: return time + '0'
      default: return time;
    }
  }

}
