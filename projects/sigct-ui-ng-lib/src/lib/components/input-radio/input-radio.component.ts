import { Component, OnInit, forwardRef, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOptionCollection } from "../../utils/input-option";

@Component({
  selector: 'msss-input-radio',
  templateUrl: './input-radio.component.html',
  styleUrls: ['./input-radio.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRadioComponent),
      multi: true
    }
  ]
})
export class InputRadioComponent implements OnInit, ControlValueAccessor {

  @ViewChild("radiogroup", { static: true })
  radioGroup: ElementRef;


  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("label")
  label: string;

  @Input('value')
  val: string;

  @Input('options')
  public inputOptionCollection: InputOptionCollection;

  @Input('disabled')
  public isDisabled = false;

  @Input('valide')
  public isValide:boolean = true;

  @Output('label_id')
  label_id: string;

  @Input("ariaLabel")
  ariaLabel: string;

  @Input("required")
  required: string;

  constructor() {
  }

  ngOnInit() {
    this.label_id = "label_" + this.id;
  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  getValue() {
    return this.val;
  }

  get value(){
    return this.getValue();
  }

  set value(value){
    this.setValue(value);
  }

  setValue(val) {
    this.onChange(val);
    this.onTouched(val);
    this.val = val;
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
      this.setValue(value);
      this.onChange(value);
  }

  getInvalidClass():string {
    return this.isValide ? '' : 'invalid' && (this.isDisabled)?' disabled':'';
  }

  setFocus(){
    //Pour mettre le focus sur la première option du groupe de bouton
    this.radioGroup.nativeElement.firstElementChild.focus();
  }

  setDisplayOff(){
    this.radioGroup.nativeElement.setAttribute("style","display:none;");
  }

  setDisplayOn(){
    this.radioGroup.nativeElement.setAttribute("style","display:block;");
  }



}
