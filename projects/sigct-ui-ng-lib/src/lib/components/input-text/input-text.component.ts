import { Component, forwardRef, Input, OnInit, Output, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { RaccourciService } from 'projects/sigct-service-ng-lib/src/lib/services/raccourcis/raccourcis-api.service';

@Component({
  selector: 'msss-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ]
})
export class InputTextComponent implements OnInit {

  formControl = new FormControl();
  public inputValide: boolean = true;

  @ViewChild('inputchamp')
  inputchamp: ElementRef;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("label")
  label: string;

  @Input("maxlength")
  maxlength: string;

  @Input("minlength")
  minlength: string;

  @Input("labelTop")
  labelTop: boolean = true;

  @Input('placeholder')
  placeholder: string;

  @Input('patternMask')
  patternMask: string;

  @Input("showX")
  showX: boolean = false;

  @Input("validationMask")
  validationMask: string = "true";

  @Input("disabled")
  set isDisabled( value: boolean) {
    if (value) {
     this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  get isDisabled() {
    return this.formControl.disabled;
  }

  @Input()
  isReadonly: Boolean = false;

  @Input()
  disableNumberCheck: Boolean = true;

  @Input()
  public decimalPatternCheck: boolean = false;

  @Input()
  public decimalIntegerPrecision: number;

  @Input()
  public decimalFractionPrecision: number;

  @Input()
  cssClass: string = "";

  @Input('autocomplete')
  public autocompletion: string = "off";

  @Input("showAsterisk")
  showAsterisk: boolean = false;

  @Input("raccourcis")
  public raccourcis: boolean = false;

  @Input()
  forceCommas: boolean = false;

  @Input("valide")
  public set valide(value: boolean | string) {
    if (value != null) {
      //console.log("input-text - set valide - id : " + this.id + " - value : " + value + " - typeof value : " + typeof value); // On le garde car cela peut-être utile
      if (value == true || value == "true") {
        this.inputValide = true;
        this.formControl.setErrors({ 'incorrect': null });
        this.formControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
      else {
        this.inputValide = false;
        this.formControl.setErrors({ 'incorrect': true });
        this.formControl.markAsTouched(); // En lien avec le Mantis 3864
      }
    }
  }

  @Input("ariaLabel")
  ariaLabel: string;

  @Output('label_id')
  label_id: string;

  @Output("focus")
  focusEmitter = new EventEmitter<string>();

  @Output("blur")
  blurEmitter = new EventEmitter<any>();

  constructor(private raccourciService: RaccourciService) {

  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  get value() {
    return this.formControl.value;
  }

  /**
   * Inscrit la valeur value dans le composant
   * @param value valeur à afficher dans le composant
   * @param fireEvents indique si le changement de valeur active les événements
   */
  private setValue(value: string, fireEvents: boolean) {
    this.formControl.setValue(value);

    if (fireEvents) {
      this.onChange(value);
      this.onTouched(value);
    }
  }

  // We implement this method to keep a reference to the onChange
  // callback function passed by the forms API
  registerOnChange(fn) {
    this.onChange = fn;
  }
  // We implement this method to keep a reference to the onTouched
  //callback function passed by the forms API
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  // This is a basic setter that the forms API is going to use
  writeValue(value: string) {
    this.setValue(value, false);
  }


  ngOnInit() {
    this.label_id = "label_" + this.id;

    this.formControl.valueChanges.subscribe((value: string) => {
      this.onChange(value); //Notifie le model d'un changement
      this.onTouched(value);
    });
  }

  /**
   * Sur le focus du composant on émet avec l'id du composant
   */
  onFocus() {
    this.focusEmitter.emit(this.id);
  }

  getInputType(): string {
    return this.showX ? "search" : "text";
  }

  ngAfterViewInit() {
  }

  onBlur($event) {
    const value: any = $event.target.value;

    if (this.decimalPatternCheck && value) {
      let aux: string = (<string>value).replace(",", ".");
      const decimal: number = parseFloat(aux);
      // Controller l'obligation d'une virgule dans le nombre
      if (this.forceCommas) {
        this.writeValue(decimal.toString().replace(".", ","));
        this.blurEmitter.emit(decimal.toString().replace(".", ","));
      } else {
        this.writeValue(decimal.toString());
        this.blurEmitter.emit(decimal);
      }
    } else {
      this.blurEmitter.emit(value);
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
      this.inputchamp.nativeElement.focus();
    });

  }

  onKeySpaceDown(ev: KeyboardEvent){
    if (this.raccourcis) {
      const newValue = this.raccourciService.parseRaccousi(ev);
      if (newValue) {
        this.formControl.setValue(newValue);
        return false;
      }
    }
  }

}
