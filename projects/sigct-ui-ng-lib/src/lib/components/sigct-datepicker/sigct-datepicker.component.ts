import { Component, ElementRef, forwardRef, Input, ViewChild, Renderer2, Injectable } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';


// extend NativeDateAdapter afin d'éliminer le problème de date qui change automatiquement à cause de la Locale
// Ex: à la saisie 2018-10-10 devient 2018-10-09
@Injectable()
export class YYYYMMDDDateAdapter extends NativeDateAdapter {
  useUtcForDisplay = true;

  parse(value: any): any {
    if (value) {
      let date_regex = /([0-9]{3,4})-([0]{1}[1-9]{1}|[1]{1}[0-2]{1})-([0]{1}[1-9]{1}|[12]{1}\d{1}|[3]{1}[01]{1})/;
      if (date_regex.test(value)) {
        let ymd = value.split("-");
        let dt = new Date(ymd[0], ymd[1] - 1, ymd[2], 0, 0, 0);
        return dt;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

@Component({
  selector: 'msss-sigct-datepicker',
  templateUrl: './sigct-datepicker.component.html',
  styleUrls: ['./sigct-datepicker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SigctDatepickerComponent),
      multi: true
    },
    { provide: DateAdapter, useClass: YYYYMMDDDateAdapter }
  ]
})

export class SigctDatepickerComponent implements ControlValueAccessor {
  private dateMinSaisissable: Date = null;
  dateMinSaisissableStr: string = null;

  private dateMaxSaisissable: Date = null;
  dateMaxSaisissableStr: string = null;

  @ViewChild("inputText", { static: true })
  inputText: ElementRef;

  @ViewChild("matFormField", { static: true })
  matFormField: MatFormField;

  @Input('value')
  valeurInput: Date;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input()
  label: string;

  @Input("ariaLabel")
  ariaLabel: string;

  @Input('startDate')
  set startDate(dtMinSaisissable: string | Date) {
    if (dtMinSaisissable) {
      let strDate: string = null;
      if (typeof dtMinSaisissable === "string") {
        strDate = dtMinSaisissable;
      } else {
        strDate = dtMinSaisissable.toLocaleDateString("fr-CA", {year: "numeric", month: "numeric", day: "numeric"}); // yyyy-MM-dd
      }
      let dt: Date = this.toUtcDate(strDate);
      this.dateMinSaisissable = new Date(dt);

      // Pour Material datepicker il faut ajouter 1 jour au min.
      dt = DateUtils.addDaysToDate(dt, 1);
      this.dateMinSaisissableStr = DateUtils.getDateToAAAAMMJJ(dt);
    } else {
      this.dateMinSaisissable = null;
      this.dateMinSaisissableStr = null;
    }
  };

  @Input('endDate')
  set endDate(dtMaxSaisissable: string | Date) {
    if (dtMaxSaisissable) {
      let strDate: string = null;
      if (typeof dtMaxSaisissable === "string") {
        strDate = dtMaxSaisissable;
      } else {
        strDate = dtMaxSaisissable.toLocaleDateString("fr-CA", {year: "numeric", month: "numeric", day: "numeric"}); // yyyy-MM-dd
      }
      let dt: Date = this.toUtcDate(strDate);
      this.dateMaxSaisissable = new Date(dt);

      // Pour Material datepicker il faut ajouter 1 jour au max.
      dt = DateUtils.addDaysToDate(dt, 1);
      this.dateMaxSaisissableStr = DateUtils.getDateToAAAAMMJJ(dt);
    } else {
      this.dateMaxSaisissable = null;
      this.dateMaxSaisissableStr = null;
    }
  }
  @Input("isRequired")
  isRequired: boolean = false;
  @Input('placeHolder')
  placeHolder: string;

  @Input('dateFormat')
  dateFormat: string;

  @Input()
  type: string = "text";

  @Input("valide")
  public set valide(value: boolean) {
    if (value != null) {
      //console.log("input-text - set valide - id : " + this.id + " - value : " + value); // On le garde car cela peut-être utile
      if (value == true) {
        this.render.setProperty(this.matFormField._elementRef.nativeElement, 'valid', true);
        this.render.removeClass(this.matFormField._elementRef.nativeElement, 'mat-form-field-invalid');
      }
      else {
        this.render.setProperty(this.matFormField._elementRef.nativeElement, 'valid', false);
        this.render.addClass(this.matFormField._elementRef.nativeElement, 'mat-form-field-invalid');
      }
    }
  }

  disabled: boolean = false;

  constructor(private render: Renderer2) {
  }

  /**
   * Parce que le YYYYMMDDDateAdapter.parse() s'effectue avant la directive sigct-date.onKeyUp(),
   * il est possible que la saisie d'une date non valide lors du parse devienne valide après le passage dans onKeyUp().
   * Pour contourner ce problème, on vérifie le contenu de l'input lorsqu'on quitte et sauvegarde son contenu s'il s'agit d'une date valide.
   * @param event
   */
  onBlur(event) {

    const dtSaisie: Date = (event.target.value) ? this.toUtcDate(event.target.value) : null;

    this.traiterDateInvalide(dtSaisie, this.dateMinSaisissable, this.dateMaxSaisissable);

  }

  /**
   * Gestion de la saisie d'une date via le calendrier
   * @param event
   */
  onChangeDate(event: MatDatepickerInputEvent<Date>) {

    let dtSaisie: Date = null;

    if (event.value) {
      dtSaisie = this.toUtcDate(DateUtils.getDateToAAAAMMJJ(event.value));
    }

    this.traiterDateInvalide(dtSaisie, this.dateMinSaisissable, this.dateMaxSaisissable);
  }

  onKeydownEnter(event) {

    const dtSaisie: Date = (event.target.value) ? this.toUtcDate(event.target.value) : null;

    this.traiterDateInvalide(dtSaisie, this.dateMinSaisissable, this.dateMaxSaisissable);
  }

  /**
   * Vider la date selon no règles si la date est incompléte, en dessous de la date min ou au dessus de la date max.
   *
   * @param dtSaisie
   * @param dtMinSaisissable
   * @param dtMaxSaisissable
   */
  public traiterDateInvalide(dtSaisie: Date, dtMinSaisissable: Date, dtMaxSaisissable: Date) {

    if (dtSaisie == null) {
      this.setValue(null);
      this.inputText.nativeElement.value = null;
      this.render.setProperty(this.matFormField._elementRef.nativeElement, 'valid', true);
      this.render.removeClass(this.matFormField._elementRef.nativeElement, 'mat-form-field-invalid');
  } else {
      // La date saisie est inférieure à la limite min, on vide.
      if (dtMinSaisissable && (dtSaisie.getTime() < dtMinSaisissable.getTime())) {
        this.setValue(null);
        this.render.setProperty(this.inputText.nativeElement, 'value', null);
        this.render.setProperty(this.matFormField._elementRef.nativeElement, 'valid', true);
        this.render.removeClass(this.matFormField._elementRef.nativeElement, 'mat-form-field-invalid');
        return;
      }

      // La date saisie est supérieure à la limite max, on vide.
      if (dtMaxSaisissable && dtSaisie.getTime() > dtMaxSaisissable.getTime()) {
        this.setValue(null);
        this.render.setProperty(this.inputText.nativeElement, 'value', null);
        this.render.setProperty(this.matFormField._elementRef.nativeElement, 'valid', true);
        this.render.removeClass(this.matFormField._elementRef.nativeElement, 'mat-form-field-invalid');
        return;
      }

      // La date saisie est différente, on la garde.
      if (this.valeurInput == null || dtSaisie.getTime() !== this.valeurInput.getTime()) {
        this.setValue(dtSaisie);
      }
    }
  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  get value() {
    return this.getValue();
  }

  set value(value) {
    // On ne veut pas que le changement soir émis pendant que l'utilisateur est entrain de saisir mais uniquement
    // quand il sort du champ ou qu'il appuie sur entrée
    //this.setValue(value);
  }

  getValue() {
    return this.valeurInput;
  }

  setValue(value) {
    this.valeurInput = value;
    this.onChange(value);
    this.onTouched(value);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value: Date | string) {
    if (value instanceof Date) {
      this.valeurInput = this.toUtcDate(DateUtils.getDateToAAAAMMJJ(value));
    } else {
      this.valeurInput = this.toUtcDate(value);
    }
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  set isDisabled(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * Méthode qui contourne le problème de date javascript impactée par le Locale.
   * Certaine date sont retranchées d'une journée. Ex: 2018-10-10 devient 2018-10-09
   * @param value
   */
  private toUtcDate(value: any): Date {
    let dt: Date = null;
    if (value) {
      let date_regex = /([0-9]{3,4})-([0]{1}[1-9]{1}|[1]{1}[0-2]{1})-([0]{1}[1-9]{1}|[12]{1}\d{1}|[3]{1}[01]{1})/;
      if (date_regex.test(value)) {
        let ymd = value.split("-");
        dt = new Date(ymd[0], ymd[1] - 1, ymd[2].substr(0, 2), 0, 0, 0);
      }
      return dt;
    }
  }

  /**
   * Méthode qui donne le focus au composant.
   */
  public focus() {
    // Pour fonctionner, cette méthode doit être appelé dans le ngAfterViewInit() d'un composant.
    // Par contre, ceci soulève l'erreur suivante : ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
    //                                              Previous value: 'mat-form-field-should-float: false'. Current value: 'mat-form-field-should-float: true'.
    // Pour éviter cette erreur, il faut inclure le focus() dans un setTimeout tel que décrit à cette adresse :
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error/#asynchronous-update
    setTimeout(() => {
      this.inputText.nativeElement.focus();
    });
  }
}
