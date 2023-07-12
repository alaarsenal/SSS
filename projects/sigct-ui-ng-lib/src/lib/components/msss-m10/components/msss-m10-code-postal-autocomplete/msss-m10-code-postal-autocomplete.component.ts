import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MsssM10CodePostal } from 'projects/sigct-service-ng-lib/src/lib/models/msss-m10-code-postal';
import { MsssM10Territoire, TypeTerritoireEnum } from 'projects/sigct-service-ng-lib/src/lib/models/msss-m10-models';
import { MsssM10Service } from 'projects/sigct-service-ng-lib/src/lib/services/msss-m10/msss-m10.service';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { of, Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'm10-code-postal-autocomplete',
  templateUrl: './msss-m10-code-postal-autocomplete.component.html',
  styleUrls: ['./msss-m10-code-postal-autocomplete.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MsssM10CodePostalAutocompleteComponent),
      multi: true
    }
  ]
})
export class MsssM10CodePostalAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** Liste de suggestions provenent de M10. */
  autoCompleteItems: MsssM10CodePostal[] = null;
  /** Value provenant de M10. */
  valeurM10: string = null;
  /** Indique si un appel à M10 est en cours. */
  isLoading: boolean = false;
  /** Texte mis en surbrillance dans les suggestions */
  textToHighlight: string = '';

  formControl = new FormControl();

  subscriptions: Subscription = new Subscription();

  @Input("label")
  label: string;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("nbCarMinAutocomplete")
  nbCarMinAutocomplete: number = 3;

  @Input("placeholder")
  placeholder: string;

  @Input("longueurMin")
  longueurMin: number = 3;

  @Input("disabled")
  disabled: boolean = false;

  @Input("dropdownWidth")
  dropdownWidth: string = "300px";

  @Output("blur")
  blurEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output("optionSelected")
  valueSelectedEmitter: EventEmitter<MsssM10CodePostal> = new EventEmitter<MsssM10CodePostal>();

  @ViewChild("matAutocomplete", { static: true })
  matAutocomplete: MatAutocomplete;

  constructor(private msssM10Service: MsssM10Service) {
  }

  ngOnInit() {
    // Définit la largeur du dropdown.
    this.matAutocomplete.panelWidth = this.dropdownWidth;

    this.formControl.valueChanges.subscribe((value: string) => {
      this.onChange(value); //Notifie le model d'un changement
      this.onTouched(value);
    });

    // Récupère la liste des codes postaux correspondant à la valeur saisie.
    this.subscriptions.add(
      this.formControl.valueChanges.pipe(
        debounceTime(300),  // délai en ms pour permettre d'écrire plus d'une lettre entre chaque recherche
        tap(() => {
          this.textToHighlight = "";
          this.autoCompleteItems = [];
        }),
        switchMap((value: string) => {
          let critere: string = "";

          if (value) {
            // La recherche doit se faire avec un code postal non formaté.
            critere = value.replace(" ", "");
          }

          if (!critere || critere.length < this.nbCarMinAutocomplete || critere.length > 6) {
            return of([]);
          }

          return this.msssM10Service.rechercherCodesPostaux(critere)
            .pipe(
              tap(() => this.isLoading = true),
              finalize(() => {
                this.isLoading = false;
                this.textToHighlight = value.substring(0, 3) + " " + value.substring(3);
              }),
            )
        })
      ).subscribe((m10CodesPostaux: MsssM10CodePostal[]) => {
        if (m10CodesPostaux && m10CodesPostaux.length > 0) {
          const municipalitesMap: Map<string, MsssM10CodePostal> = new Map();

          // Parcourt les codes postaux pour déterminer l'unicité des municipalités couvertes.
          m10CodesPostaux.forEach((m10CodePostal: MsssM10CodePostal) => {
            if (!municipalitesMap.has(m10CodePostal.codeMunicipalite)) {
              municipalitesMap.set(m10CodePostal.codeMunicipalite, m10CodePostal);
            }
          });

          // Si tous les codes postaux sont inclus dans une seule municipalité, on ajoute un choix représentant 
          // les 3 premiers caractères des codes postaux suivi de la municipalité commune.
          if (municipalitesMap.size == 1) {
            const iterator = municipalitesMap.values();
            const m10CodePostal: MsssM10CodePostal = iterator.next().value;

            let m10CodePostal3Car: MsssM10CodePostal = new MsssM10CodePostal();
            m10CodePostal3Car.codePostal = m10CodePostal.codePostal.substring(0, 3); // 3 premiers caractères du code postal
            m10CodePostal3Car.codeMunicipalite = m10CodePostal.codeMunicipalite;
            m10CodePostal3Car.nomMunicipalite = m10CodePostal.nomMunicipalite;
            m10CodePostal3Car.territoires = m10CodePostal.territoires.filter((m10Territoire: MsssM10Territoire) =>
              // Garde que la région et le RTS
              (m10Territoire.type == TypeTerritoireEnum.RSS || m10Territoire.type == TypeTerritoireEnum.RTS)
            );

            // Insère le code postal à la première position de la liste
            m10CodesPostaux.unshift(m10CodePostal3Car);
          } else {
            // Les codes postaux concernent plusieurs municipalités, on ajoute un choix représentant 
            // les 3 premiers caractères des codes postaux sans mention de municipalité.

            const iterator = municipalitesMap.values();
            // Récupère le code postal du premier élément de la liste
            const codePostal: string = iterator.next().value.codePostal;

            let m10CodePostal3Car: MsssM10CodePostal = new MsssM10CodePostal();
            // Garde les 3 premiers caractères du code postal
            m10CodePostal3Car.codePostal = codePostal.substring(0, 3);
            // Aucune municipalité
            m10CodePostal3Car.codeMunicipalite = null;
            m10CodePostal3Car.nomMunicipalite = null;
            // Uniquement la région "00 - Aucune"
            const m10Territoire: MsssM10Territoire = new MsssM10Territoire(TypeTerritoireEnum.RSS, "00", "Aucune");
            m10CodePostal3Car.territoires = [m10Territoire];

            // Insère le code postal à la première position de la liste
            m10CodesPostaux.unshift(m10CodePostal3Car);
          }
        }
        this.autoCompleteItems = m10CodesPostaux;
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
      return this.formControl.value.codePostal;
    } else {
      return null;
    }
  }

  /** Valeur provenant du modèle. */
  writeValue(value: string): void {
    this.valeurM10 = value;      // On considère que la valeur du modèle provient de M10.
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
   * Affichage du code postal saisi.
   * @param codePostal code postal saisi
   */
  displayFn(codePostal: string) {
    if (codePostal) {
      if (codePostal.length > 3) {
        return codePostal.substring(0, 3) + " " + codePostal.substring(3);
      } else {
        return codePostal;
      }
    }
    return "";
  }

  /**
   * Retourne true si la valeur saisie est identique à la valeur initiale.
   * Retourne true si la valeur saisie est différente de la valeur initiale et qu'elle provient de M10.
   * Retourne false si la valeur initiale a été supprimé.
   */
  isValeurSaisieValide(): boolean {
    const valide = StringUtils.safeEquals(this.formControl.value, this.valeurM10);
    return valide;
  }

  /**
   * Set touched on blur 
   */
  onBlur() {
    this.blurEmitter.emit(this.isValeurSaisieValide());
    this.onTouched();
  }

  /**
   * Lorsqu'un option est sélectionné parmi les suggestions.
   * @param optionSelected option sélectionnés
   */
  onSelected(optionSelected: MsssM10CodePostal) {
    if (!StringUtils.safeEqualsIgnoreCase(this.valeurM10, optionSelected.codePostal)) {
      this.valeurM10 = optionSelected.codePostal;
      this.valueSelectedEmitter.emit(optionSelected);
    }
  }

  /**
   * Valeur affichée dans un composant AutoComplete. 
   * Utilisé dans le HTML.
   * @param msssM10CodePostal 
   */
  getAutoCompleteDisplay(msssM10CodePostal: MsssM10CodePostal): string {
    let display: string = "";
    if (msssM10CodePostal) {
      if (msssM10CodePostal.codePostal) {
        if (msssM10CodePostal.codePostal.length > 3) {
          display += this.formaterCodePostal(msssM10CodePostal.codePostal);
        } else {
          display += msssM10CodePostal.codePostal;
        }

        display += ((msssM10CodePostal.nomMunicipalite && msssM10CodePostal.nomMunicipalite.length > 0) ? " (" + msssM10CodePostal.nomMunicipalite + ")" : "");
      }
    }
    return display;
  }

  /**
   * Formate un code postal en insérant un espace au centre. 
   * @param codePostal code postal à formater
   */
  private formaterCodePostal(codePostal: string): string {
    if (codePostal && codePostal.length > 3) {
      return codePostal.substring(0, 3) + " " + codePostal.substring(3);
    }

    return "";
  }

  /**
   * Inscrit la valeur dans le FormControl.
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