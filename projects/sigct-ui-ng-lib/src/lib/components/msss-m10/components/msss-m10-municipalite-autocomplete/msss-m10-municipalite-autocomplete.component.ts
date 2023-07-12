import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MsssM10Municipalite } from 'projects/sigct-service-ng-lib/src/lib/models/msss-m10-models';
import { MsssM10Service } from 'projects/sigct-service-ng-lib/src/lib/services/msss-m10/msss-m10.service';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { of, Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'm10-municipalite-autocomplete',
  templateUrl: './msss-m10-municipalite-autocomplete.component.html',
  styleUrls: ['./msss-m10-municipalite-autocomplete.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MsssM10MunicipaliteAutocompleteComponent),
      multi: true
    }
  ]
})
export class MsssM10MunicipaliteAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** Liste de suggestions provenent de M10. */
  autoCompleteItems: MsssM10Municipalite[] = null;
  /** Valeur provenant de M10. */
  valeurM10: string = null;
  /** Indique si un appel à M10 est en cours. */
  isLoading: boolean = false;
  /** Texte mis en surbrillance dans les suggestions */
  textToHighlight: string = '';

  formControl = new FormControl();

  subscriptions: Subscription = new Subscription();

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("label")
  label: string;

  @Input("maxlength")
  maxlength: string;

  @Input("nbCarMinAutocomplete")
  nbCarMinAutocomplete: number = 3;

  @Input("disabled")
  disabled: boolean = false;

  @Input("dropdownWidth")
  dropdownWidth: string = "300px";

  @ViewChild("matAutocomplete", { static: true })
  matAutocomplete: MatAutocomplete;

  @Output("optionSelected")
  valueSelectedEmitter: EventEmitter<MsssM10Municipalite> = new EventEmitter<MsssM10Municipalite>();

  @Output("blur")
  blurEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private msssM10Service: MsssM10Service) {
  }

  ngOnInit() {
    // Définit la largeur du dropdown.
    this.matAutocomplete.panelWidth = this.dropdownWidth;

    this.subscriptions.add(
      this.formControl.valueChanges.subscribe((value: string) => {
        this.onChange(value); //Notifie le model d'un changement
        this.onTouched(value);
      })
    );

    // Récupère la liste des codes postaux correspondant à la valeur saisie.
    this.subscriptions.add(
      this.formControl.valueChanges.pipe(
        debounceTime(300),  // délai en ms pour permettre d'écrire plus d'une lettre entre chaque recherche
        tap(() => {
          this.textToHighlight = "";
          this.autoCompleteItems = [];
        }),
        switchMap((value: string) => {
          // Pas de recherche en bas de nbCarMinAutocomplete caractères
          if (!value || value.length < this.nbCarMinAutocomplete) {
            return of([]);
          }

          return this.msssM10Service.rechercherMunicipalites(value)
            .pipe(
              tap(() => this.isLoading = true),
              finalize(() => {
                this.textToHighlight = value;
                this.isLoading = false;
              }),
            )
        })
      ).subscribe((result: MsssM10Municipalite[]) => {
        this.autoCompleteItems = result;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** Fonction à appeler lorsque la valeur change. */
  onChange: any = () => { };

  /** Fonction à appeler lorsque le input est touché. */
  onTouched: any = () => { };

  set value(value: string) {
    this.setValue(value, true);
  }

  /**
   * Lecture de la valeur du composant par le model.
   */
  get value(): string {
    if (this.formControl.value) {
      return this.formControl.value.nom;
    } else {
      return null;
    }
  }

  /** Valeur provenant du modèle. */
  writeValue(value: string): void {
    this.valeurM10 = value; // On considère que la valeur du modèle provient de M10.
    this.setValue(value, false);
  }

  /** Permet à Angular de s'abonner à la fonction appelée lorsque la valeur change. */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Permet à Angular de s'abonner à la fonction appelée lorsque le input est touché. */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** Permet à Angular de désactiver le input. */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  /**
   * Affichage de l'item saisi.
   * @param item item saisi
   */
  displayFn(value: string) {
    return value ? value : "";
  }

  /**
   * Retourne true si la valeur saisie provient de M10.
   * Retourne false si la valeur a été supprimé.
   */
  isValeurSaisieValide(): boolean {
    const valide = StringUtils.safeEqualsIgnoreCase(this.formControl.value, this.valeurM10);
    return valide;
  }

  /**
   * Notifie le parent à la sortie du champ en lui indiquant si la valeur saisie est valide.
   * @param event
   */
  onBlur(event: FocusEvent) {
    this.blurEmitter.emit(this.isValeurSaisieValide());
    this.onTouched();
  }

  /**
   * À chaque touche saisie.
   * Limite la saisie à lettre, chiffre, trait d'union, apostrophe ou espace.
   * @param event 
   */
  onKeydown(event: KeyboardEvent) {
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

    // Touches de déplacement et édition
    if (["Tab", "End", "Home", "ArrowLeft", "ArrowRight", "Enter", "Backspace", "Delete"].indexOf(event.key) !== -1) {
      return;
    }

    // Select all, copier-coller, annuler
    if (event.ctrlKey && ["a", "A", "x", "X", "c", "C", "v", "V", "z", "Z", "Insert"].indexOf(event.key) !== -1) {
      return;
    }

    // Copier-coller
    if (event.shiftKey && ["Insert", "Delete"].indexOf(event.key) > -1) {
      return;
    }

    // Lettre, chiffre, trait d'union, apostrophe ou espace
    var regexKey = /^[0-9A-Za-z-' ]$/;
    let keySansAccent = event.key.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    if (keySansAccent.match(regexKey)) {
      return;
    }

    event.preventDefault();
  }

  /**
   * Lorsqu'un item est sélectionné parmi les suggestions.
   * @param itemSelected option sélectionnés
   */
  onSelected(itemSelected: MsssM10Municipalite) {
    if (!StringUtils.safeEqualsIgnoreCase(this.valeurM10, itemSelected.nom)) {
      // Garde en mémoire la valeur M10 sélectionnée.
      this.valeurM10 = itemSelected.nom;
      // Notifie le parent.
      this.valueSelectedEmitter.emit(itemSelected);
    }
  }

  /**
   * Valeur affichée dans chaque item de la liste de suggestions. 
   * Utilisé dans le HTML.
   * @param item 
   */
  getAutoCompleteDisplay(item: MsssM10Municipalite): string {
    return item ? item.highlight : "";
  }

  /**
   * Inscrit la valeur dans le FormControl et notifie le changement de valeur au besoin.
   * @param value valeur à inscrire
   * @param fireEvents indique si on notifie le changement de valeur
   */
  private setValue(value: string, fireEvents: boolean) {
    if (this.formControl.value !== value) {
      this.formControl.setValue(value);

      if (fireEvents) {
        this.onChange(value);
        this.onTouched(value);
      }
    }
  }
}