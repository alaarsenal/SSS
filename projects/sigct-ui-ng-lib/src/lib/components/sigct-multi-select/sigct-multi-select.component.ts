import { Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InputOption } from '../../utils/input-option';

@Component({
  selector: 'msss-sigct-multi-select',
  templateUrl: './sigct-multi-select.component.html',
  styleUrls: ['./sigct-multi-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SigctMultiSelectComponent),
      multi: true
    }
  ]
})
export class SigctMultiSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private subscriptions: Subscription = new Subscription();
  private isFilterTextBoxFocused: boolean = false;

  // Texte en surbrillance dans les options
  txtHighlight: string = '';

  isDisabled: boolean = false;

  // Controle servant à filtrer les options
  filterTextboxControl = new FormControl();
  selectFormControl = new FormControl();
  // Valeurs sélectionnées
  selectedValues: string[] = [];

  // Infobulle
  toolTip: string = "";

  // Options filtrées
  filteredOptions: Observable<InputOption[]>;

  inputOptions: InputOption[] = [];

  onChange: any = () => { };
  onTouched: any = () => { };

  @Input()
  label: string = "";

  @Input()
  nbMaxToolTip: number = 10;

  @Input()
  isValide: boolean = true;

  @Input()
  placeholder: string = "option.select.message";

  @Input()
  showAsterisk: boolean = false;

  @Input()
  get disabled() {
    return this.disabled;
  }
  set disabled(isDisabled: boolean) {
    this.setDisabledState(isDisabled)
  }

  @Input('options')
  set options(options: InputOption[]) {
    if (options && options.length > 0) {
      this.inputOptions = options;
      this.filterTextboxControl.setValue("");
      // Construit l'info-bulle selon la sélection
      this.setToolTip();
    }
  }

  @Input('valide')
  set valide(value: boolean | string) {
    if (value == true || value == "true") {
      this.isValide = true;
      this.selectFormControl.setErrors({ 'incorrect': null });
      this.selectFormControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    else {
      this.isValide = false;
      this.selectFormControl.setErrors({ 'incorrect': true });
      this.selectFormControl.markAsTouched({ onlySelf: true });
    }
  }

  @Input()
  set value(values: string[]) {
    if (values !== undefined && this.selectFormControl.value != values) {
      this.selectFormControl.setValue(values, { onlySelf: true });
      this.onChange(values);
      this.onTouched(values);
    }
    this.synchroSelectedValues();
  }
  get value(): string[] {
    return this.selectFormControl.value;
  }

  @ViewChild('filterTextBox')
  filterTextBox: ElementRef;

  @ViewChild('matSelect')
  matSelect: MatSelect;

  constructor() {
  }

  ngOnInit() {
    // Filtre les options lorsque le contenu du filtre change.
    this.filteredOptions = this.filterTextboxControl.valueChanges
      .pipe(
        startWith<string | InputOption>(""),
        map((value: any) => {
          return typeof value === 'string' ? this._filter(value) : this._filter(value?.label)
        })
      );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  writeValue(values: string[]): void {
    this.selectFormControl.setValue(values, { onlySelf: true });
    this.synchroSelectedValues();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.selectFormControl.disable();
    } else {
      this.selectFormControl.enable();
    }
  }

  /**
   * Retourne la liste des options respectant le filtre.
   */
  private _filter(filtre: string): InputOption[] {
    this.selectFormControl.patchValue(this.selectedValues);

    if (filtre) {
      this.txtHighlight = filtre;
      return this.inputOptions.filter(option => this.includesIgnoreAccents(option.label, filtre));
    } else {
      this.txtHighlight = '';
      return this.inputOptions;
    }
  }

  /**
   * Vérifie si text contient searchingText en ignorant les accents.
   * @param text 
   * @param searchingText 
   * @returns 
   */
  private includesIgnoreAccents(text: string, searchingText: string): boolean {
    if (text && searchingText) {
      const unaccentText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const unaccentSearchingText = searchingText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return unaccentText.toLowerCase().includes(unaccentSearchingText.toLowerCase());
    }
    return false;
  }

  /**
   * Construit le contenu de l'info-bulle selon la sélection en cours.
   */
  private setToolTip(): void {
    let infoBulle: string = "";
    let nbToolTip: number = 0;

    this.selectedValues.forEach((value: string) => {
      nbToolTip++;
      if (nbToolTip <= this.nbMaxToolTip) {
        if (infoBulle.length > 0) {
          infoBulle += "\n";
        }

        infoBulle += this.findOptionFromValue(value)?.label;

        if (nbToolTip == this.nbMaxToolTip) {
          infoBulle += "\n...";
        }
      }
    });

    this.toolTip = infoBulle;
  }

  /**
   * Synchronise le contenu de selectedValues avec le contenu de selectFormControl.
   */
  private synchroSelectedValues(): void {
    this.selectedValues = [];
    if (this.selectFormControl.value && this.selectFormControl.value.length > 0) {
      this.selectFormControl.value.forEach((value: string) => {
        this.selectedValues.push(value);
      });
    }
    // Construit l'info-bulle selon la sélection
    this.setToolTip();
  }

  /**
   * Retourne le InputOption dont la valeur = value.
   * @param value 
   * @returns 
   */
  findOptionFromValue(value: string): InputOption {
    let option: InputOption = null;
    if (value) {
      this.inputOptions.find((opt: InputOption) => {
        if (opt.value == value) {
          option = opt;
        }
      });
    }
    return option;
  }

  /**
   * Ajuste le contenu de selectedValues lorsque la sélection change.
   * @param event
   */
  onSelectionChange(event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      if (event.source.selected == false) {
        const index = this.selectedValues.indexOf(event.source.value);
        this.selectedValues.splice(index, 1);
      } else {
        this.selectedValues.push(event.source.value);
      }
      // Construit l'info-bulle selon la sélection
      this.setToolTip();
    }
  }

  /**
   * Lorsque le popup de sélection apparait/disparait.
   * @param opened 
   */
  onOpenedChange(opened: boolean): void {
    if (opened == true) {
      // Focus to search textbox while clicking on selectbox
      this.filterTextBox.nativeElement.focus();
      // Set filter textbox value as empty while opening selectbox 
      this.filterTextboxControl.setValue("");
    } else {
      this.filterTextboxControl.patchValue("");
      this.selectFormControl.setValue(this.selectedValues);
      this.onChange(this.selectFormControl.value);
      this.onTouched(this.selectFormControl.value);
    }
  }

  /**
   * Lorsqu'un caractère est saisi dans le filtre.
   * @param event 
   */
  onKeydownSpace(event: KeyboardEvent): void {
    if (this.isFilterTextBoxFocused) {
      // Empêche la sélection d'éléments dans la liste lorsque un espace est saisi dans le filtre.
      event.stopPropagation();
    }
  }

  /**
   * Loprsque la touche ArrowDown est utilisée.
   * @param event 
   */
  onKeydownArrowDown(event: KeyboardEvent): void {
    // Si le curseur est dans le champ du filtre
    if (this.isFilterTextBoxFocused) {
      // On sort le focus du champ de saisie afin de pouvoir sélectionner une option de la liste avec "space bar".
      this.matSelect.focus({ preventScroll: true });
      // Positionne la liste sur le premier élément.
      // this.matSelect._keyManager.setActiveItem(0);
      // event.stopPropagation();
    }
  }

  /**
   * Loprsque la touche ArrowUp est utilisée.
   * @param event 
   */
  onKeydownArrowUp(event: KeyboardEvent): void {
    // Si le focus n'est pas dans le champs de saisie du filtre.
    if (!this.isFilterTextBoxFocused) {
      // Si la 1ere option de la liste est sélectionnée.
      if (this.matSelect._keyManager.activeItemIndex == 0) {
        // On met le focus sur le champ de saisie du filtre.
        this.filterTextBox.nativeElement.focus();
      }
    }
  }

  /**
   * Lorsque le focus est mis sur le champ de saisie du filtre.
   * @param event 
   */
  onFilterTextBoxFocus(event): void {
    this.isFilterTextBoxFocused = true;
  }

  /**
   * Lorsque le focus quitte le champ de saisie du filtre.
   * @param event 
   */
  onFilterTextBoxBlur(event): void {
    this.isFilterTextBoxFocused = false;
  }

}