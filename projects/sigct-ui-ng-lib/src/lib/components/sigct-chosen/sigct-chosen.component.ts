import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InputOption, InputOptionCollection } from "../../utils/input-option";

@Component({
  selector: 'msss-sigct-chosen',
  templateUrl: './sigct-chosen.component.html',
  styleUrls: ['./sigct-chosen.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SigctChosenComponent),
      multi: true
    }
  ]
})

export class SigctChosenComponent implements OnInit, ControlValueAccessor {
  static readonly OPTION_NULL: InputOption = { value: null, label: "" };

  // J'ai renommé val par valeurSelectionne car je pense que c'est son utilité - JFC - 2019-11-08
  valeurSelectionne: string;

  public inputValide: boolean = true;

  @ViewChild("inputText", { static: true })
  inputText: ElementRef;

  @ViewChild(MatAutocomplete)
  matAutocomplete: MatAutocomplete;

  @ViewChild(MatAutocompleteTrigger)
  matAutocompleteTrigger: MatAutocompleteTrigger;

  @Input("label")
  label: string;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input('options')
  public inputOptionCollection: InputOptionCollection;

  @Input()
  placeholder: string = "Sélectionnez...";

  @Input("disabled")
  public disabled: boolean = false;

  @Input("required")
  public required: boolean = false;

  @Input()
  dropdownTitlesVisible: boolean = true;

  @Input("autoComplete")
  public autoComplete = true;

  @Input('valide')
  public set valide(value: boolean | string) {
    if (value == true || value == "true") {
      this.inputValide = true;
      this.formControl.setErrors({ 'incorrect': null });
      this.formControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    else {
      this.inputValide = false;
      this.formControl.setErrors({ 'incorrect': true });
      this.formControl.markAsTouched({ onlySelf: true });
    }
  }

  @Input("ariaLabel")
  ariaLabel: string;

  @Output('label_id')
  label_id: string;

  @Output("optionSelected")
  optionSelectedEmiter: EventEmitter<InputOption> = new EventEmitter<InputOption>();

  @Output("cancelOptionSelected")
  cancelOptionSelectedEmiter: EventEmitter<InputOption> = new EventEmitter<InputOption>();

  @Output("focus")
  focusEmitter = new EventEmitter<string>();

  // FormControl permettant de gérer la liste déroulante. On doit s'assurer que sa value soit synchroniée avec this.valeurSelectionne
  formControl = new FormControl();

  listeOptions: InputOption[];
  filteredOptions: Observable<InputOption[]>;

  // Texte en surbrillance dans le dropdown
  toHighlight: string = '';

  infoBulle: string = '';

  ngOnInit() {
    this.label_id = "label_" + this.id;
  }

  /**
   * action après cliquer sur la touche flèche bas. permet naviguer dans la liste déroulante
   * @param event
   */
  onArrowDown(event: any) {
    if (event.code == "ArrowDown" && (typeof this.toHighlight == "object" || this.toHighlight == "")) {
      this.cleanList();
    }
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  /**
   * Le composant reçoit le focus. On réinitialise la recherche et le contenu de la liste déroulante.
   * @param event
   */
  onFocus() {
    this.focusEmitter.emit(this.id);
    this.cleanList();
  }



  /**
   * Lorsque la souris va sur le champ et qu'une valeur est sélectionnée, une infobulle apparaît avec la description si renseignée sinon le libellé
   */
  onMouseEnter() {
    if (this.valeurSelectionne) {
      const optionSelection = this.inputOptionCollection.options.find((option: InputOption) => option.value == this.valeurSelectionne);

      if (optionSelection) {
        if (optionSelection.description) {
          this.infoBulle = optionSelection.description;
        } else {
          this.infoBulle = optionSelection.label;
        }
      }
    } else {
      this.infoBulle = '';
    }


  }

  /**
   * Le composant perd le focus. On s'assure que la dernière valeur sélectionnée est affichée.
   */
  onBlur() {
    if (this.valeurSelectionne) {
      let selectedOption: InputOption = this.getOptionByValue(this.valeurSelectionne);
      // Affiche l'option sélectionnée.
      this.formControl.value == selectedOption;
      this.inputText.nativeElement.value = selectedOption.label;
    } else {
      // Affiche l'option NULL par défaut.
      this.formControl.value == SigctChosenComponent.OPTION_NULL;
      this.inputText.nativeElement.value = SigctChosenComponent.OPTION_NULL.label;
    }

    this.onTouched(this.valeurSelectionne);

    this.focus(false);
  }

  /**
   * Lorsque la liste déroulante s'ouvre, on se positionne sur l'option déjà sélectionnée.
   */
  onOpenDropdown(): void {
    this.matAutocomplete.options?.forEach((matOption: MatOption) => matOption.setInactiveStyles());

    // Récupère le MatOption correspondant à la valeur sélectionnée.
    const matOption: MatOption = this.getMatOptionSelectionne();
    if (matOption) {
      matOption.select();
      matOption.setActiveStyles();
      matOption.focus();
    }
  }

  /**
   * Selection la valeur de la liste derroulante lorsqu'il y a qu'une seule option ou
   * l'élément en subrillance dans la liste déroulante.
   * @param event
   */
  onTab(event: any) {
    const oldValue: string = this.valeurSelectionne;

    if (this.matAutocompleteTrigger?.activeOption?.value) {
      // Sélectionne automatiquement l'élément en subrillance dans la liste déroulante
      this.valeurSelectionne = this.matAutocompleteTrigger?.activeOption?.value.value;
    } else {
      // Selectionne la valeur de la liste derroulante lorsqu'il y a qu'une seule option
      if (event.target.value) {
        const options: InputOption[] = this._filter(event.target.value);
        if (options?.length == 1) {
          this.valeurSelectionne = options[0].value;
        }
      } else {
        if (this.isNullable()) {
          this.valeurSelectionne = null;
        }
      }
    }

    const option: InputOption = this.getOptionByValue(this.valeurSelectionne);
    this.formControl.setValue(option);

    this.onTouched(this.valeurSelectionne);

    if (oldValue != this.valeurSelectionne) {
      this.onChange(this.valeurSelectionne);
      this.optionSelectedEmiter.emit(this.formControl.value);
    }
  }

  onKeyDow(event: any) {
    // Trape TAB et SHFT+TAB
    if (event.key == 'Tab') {
      this.onTab(event);
    }
  }

  /**
   * Affiche le label de l'option dans la liste déroulante
   * @param option
   */
  displayFn(option?: InputOption): string | undefined {
    return option ? option.label : undefined;
  }

  /**
   * Affiche l'infobulle de l'option dans la liste déroulante.
   * @param option
   */
  displayTitleFn(option?: InputOption): string {
    let title: string = '';
    if (option) {
      title = option.label;
      if (option.description) {
        title += "\n\n" + option.description;
      }
    }
    return title;
  }

  /**
   * Retour à l'état initial de la liste.
   */
  cleanList() {
    this.listeOptions = this.inputOptionCollection.options;
    this.filteredOptions = this.formControl.valueChanges
      .pipe(
        // startWith(''),
        // map(value => this._filter(value)
        startWith<string | InputOption>(''),
        map(value => typeof value === 'string' ? this._filter(value) : (value == null ? this._filter(null) : this._filter(value.label)))
      );
  }

  /**
   * filtrer la liste selon les critères saisies
   * @param name
   */
  private _filter(name: string): InputOption[] {
    if (name) {
      this.toHighlight = name;
      return this.listeOptions.filter(option => this.includeIgnoreAccents(option.label.toString(), name.toString()));
    } else {
      this.toHighlight = '';
      return this.listeOptions;
    }
  }

  private includeIgnoreAccents(text: string, searchingText: string): boolean {
    if (text && searchingText) {
      const unaccentText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const unaccentSearchingText = searchingText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return unaccentText.toLowerCase().includes(unaccentSearchingText.toLowerCase());
    }
    return false;
  }

  /**
   * Retourne true si la valeur null fait parti de la liste de choix.
   */
  private isNullable(): boolean {
    const option: InputOption = this.listeOptions?.find((option: InputOption) => !option.value);
    if (option) {
      return true;
    }
    return false;
  }

  get value() {
    return this.getValeurSelectionne();
  }

  @Input("value")
  set value(value) {
    this.setValue(value, true);
  }

  private getValeurSelectionne() {
    return this.valeurSelectionne;
  }

  /**
   * Retourne le MatOption correspondant à la valeur sélectionnée.
   * @returns un MatOption
   */
  private getMatOptionSelectionne(): MatOption {
    return this.matAutocomplete.options.find((option: MatOption) =>
      option?.value?.value === this.getValeurSelectionne()
    );
  }

  /**
   * Inscrit la valeur value dans le composant et sélectionne la valeur dans la liste.
   * @param value valeur à afficher dans le composant
   * @param fireEvents indique si le changement de valeur active les événements
   */
  private setValue(value: string, fireEvents: boolean) {
    if (this.valeurSelectionne !== value) {

      if (value == undefined || value == null || value == "") {
        // Si la valeur est vide, on la remplace par la valeur par défaut.
        this.formControl.setValue(SigctChosenComponent.OPTION_NULL);
        this.valeurSelectionne = value;
      } else {
        // Recherche la valeur dans la liste d'options et l'affecte au formControl
        let option: InputOption = this.getOptionByValue(value);
        if (option != SigctChosenComponent.OPTION_NULL) {
          this.valeurSelectionne = value;
          this.formControl.setValue(option);
        } else {
          this.formControl.setValue(SigctChosenComponent.OPTION_NULL);
        }
      }

      if (fireEvents) {
        this.onChange(value);
        this.onTouched(value);
      }
    }
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value: string) {
    this.setValue(value, false);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  @Input()
  get isDisabled() {
    return this.disabled;
  }

  set isDisabled(isDisabled: boolean) {
    this.setDisabledState(isDisabled)
  }

  /**
   * Met à jour le contenu du composant lorsqu'un élément est sélectionné dans la liste déroulante.
   * @param value
   */
  onOptionSelected(value: InputOption) {
    const oldValue: string = this.valeurSelectionne;

    if (this.formControl.value) {
      if (this.formControl.value.value == undefined) {
        this.formControl.reset()
        this.setValue(null, true)
      } else {
        this.setValue(this.formControl.value.value, true)
      }
    }

    if (oldValue != this.valeurSelectionne) {
      this.onChange(this.valeurSelectionne);
      this.optionSelectedEmiter.emit(this.formControl.value);
    }
  }

  /**
   * Retourne l'option correspondant à value.
   * @param value
   */
  private getOptionByValue(value: string): InputOption {
    let option: InputOption = SigctChosenComponent.OPTION_NULL;

    if (this.inputOptionCollection && this.inputOptionCollection.options) {
      let trouve: boolean = false;
      this.inputOptionCollection.options.forEach(inputOption => {
        if (inputOption.value == value) {
          option = inputOption;
          trouve = true;
        }
      });

      if (!trouve) {
        // Si la liste a plus d'un élément et que l'on n'a pas trouvé la valeur envoyé par le composant on a un problème
        // Par défaut il y a au moins la valeur 'Sélectionnez...' c'est pour cela qu'on teste > 1
        if (this.inputOptionCollection.options.length > 1) {
          console.error("SIGCT-CHOSEN - La valeur de cette option >" + value + "< n'existe pas dans la liste dont l'id : " + this.id);
        }
      }
    }
    return option;
  }

  /**
  * Méthode qui donne le focus au composant.
  * @param showDropdown
  */
  public focus(showDropdown: boolean = false) {
    // Pour fonctionner, cette méthode doit être appelé dans le ngAfterViewInit() d'un composant.
    // Par contre, ceci soulève l'erreur suivante : ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
    //                                              Previous value: 'mat-form-field-should-float: false'. Current value: 'mat-form-field-should-float: true'.
    // Pour éviter cette erreur, il faut inclure le focus() dans un setTimeout tel que décrit à cette adresse :
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error/#asynchronous-update

    setTimeout(() => {
      this.inputText.nativeElement.focus();
      if (!showDropdown) {
        this.matAutocompleteTrigger.closePanel();
      }
    });
  }

    /**
   * Valider que la liste comporte une option null ou vide, et que la valeur sélectionner n'est pas null
   */
  checkEmptyOrNull(): boolean {
    const option: InputOption = this.inputOptionCollection?.options?.find((option: InputOption) => option.value == null || option.value == "");
    return (option != undefined && this.valeurSelectionne != null && !this.disabled);
  }

  /**
  * Action lorsque l'on clique sur le X. Set la valeur selectionner a null
  */
  cancelOption(): void {
    this.setValue(null, true)
    this.cancelOptionSelectedEmiter.emit(null);
  }
}
