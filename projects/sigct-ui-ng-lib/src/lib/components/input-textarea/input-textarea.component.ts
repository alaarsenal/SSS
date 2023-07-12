import { Component, ElementRef, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RaccourciService } from 'projects/sigct-service-ng-lib/src/lib/services/raccourcis/raccourcis-api.service';

@Component({
  selector: 'msss-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextAreaComponent),
      multi: true
    }
  ]
})
export class InputTextAreaComponent implements OnInit {

  @ViewChild('inputchamp')
  inputchamp: ElementRef;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("label")
  label: string;

  @Input('value')
  val: string;

  @Input("maxlength")
  maxlength: string;

  @Input("minlength")
  minlength: string;

  @Input("rows")
  rows: number;

  @Input("labelTop")
  labelTop: boolean = true;

  @Input('placeholder')
  placeholder: string;

  @Input("showX")
  showX: boolean = false;

  @Input("disabled")
  isDisabled: boolean = false;

  @Input("CSSResize")
  CSSResize: string = "none";

  @Input("cssClass")
  cssClass: string = "cssClass";

  @Output('label_id')
  label_id: string;

  @Input("raccourcis")
  raccourcis: boolean = false;

  @Input("minRows")
  minRows: number = 0;

  @Input("ariaLabel")
  ariaLabel: string;

  @Input("required")
  isRequired: boolean = false;


  constructor(
    private raccourciService: RaccourciService) {
  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  /**
   * Selon le contenu de l'input CSSResize cette méthode retourne la classe CSS utilisée par le textarea
   */
  getCSSResize(): string {
    let classeCSS: string;

    switch(this.CSSResize.toLowerCase()) {
      case "vertical": {
        classeCSS = "textarea-resize-vertical " + this.cssClass;
        break;
      }
      case "horizontal": {
        classeCSS = "textarea-resize-horizontal " + this.cssClass;
        break;
      }
      case "both": {
        classeCSS = "textarea-resize-both " + this.cssClass;
        break;
      }
      default: {
        classeCSS = "textarea-resize-none " + this.cssClass;
        break;
      }
    }

    return classeCSS;
  }

  get value() {
    return this.val;
  }

  set value(value) {
    this.val = value;
    this.onChange(value);
    this.onTouched(value);
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
  writeValue(value) {
    this.val = value;
  }

  ngOnInit() {
    this.label_id = "label_" + this.id;
  }


  ngAfterViewInit() {
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
      const newValue: string = this.raccourciService.parseRaccousi(ev);
      if (newValue) {
        this.value = newValue;
        return false;
      }
    }
  }

  getMinHeight(): string {
    const HOW_SIZE: number = 19;
      if (this.CSSResize != "none" && this.minRows > 0) {
        const minHeight: number =  this.minRows * HOW_SIZE;
        return "min-height: " + minHeight + "px;"
      }
    return "";
  }

}
