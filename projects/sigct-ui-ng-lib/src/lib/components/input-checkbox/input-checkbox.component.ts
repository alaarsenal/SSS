import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOptionCollection, InputOption } from "../../utils/input-option";

@Component({
  selector: 'msss-input-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCheckboxComponent),
      multi: true
    }
  ]
})
export class InputCheckboxComponent implements OnInit, ControlValueAccessor {

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

  @Input()
  disabled: boolean;

  @Input()
  get isDisabled() {
    return this.disabled;
  }
  set isDisabled(disabled: boolean){
    this.disabled = disabled;
  }

  @Output()
  itemLinkClickEvent = new EventEmitter<InputOption>();

  constructor() {
  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  getValue() {
    return this.val;
  }

  get value() {
    return this.getValue();
  }

  set value(value) {
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

  ngOnInit() { }

  /**Invoquer lorsqu'un lien d'une des options du label
   * des checkbox est cliquée.
   */
  onClickItemLink(item: InputOption): void {
    this.itemLinkClickEvent.emit(item);
  }

}
