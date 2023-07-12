import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { boutonCouleurItem } from './bouton-radio-couleur-interface';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * Ce composant affiche une liste de bouton radio dont le contenu de chaque bouton est défini par l'interface bouton-radio-couleur-interface.ts
 * L'utilisation de la directive ControlValueAccessor avec des boutons radio est inspiré de https://stackblitz.com/edit/angular-custom-radio-button
 */
@Component({
  selector: 'msss-bouton-radio-couleur',
  templateUrl: './bouton-radio-couleur-component.html',
  styleUrls: ['./bouton-radio-couleur-component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BoutonRadioCouleurComponent),
      multi: true
    }
  ]
})
export class BoutonRadioCouleurComponent implements OnInit, ControlValueAccessor {

  @Input('idComposant')
  idComposant: string;

  @Input('listeBouton')
  listeBouton: boutonCouleurItem[];

  @Input('disabledAll')
  disabledAll = false;

  set isDisabled(disabled: boolean) {
    this.disabledAll = disabled;
  }

  get isDisabled(): boolean {
    return this.disabledAll;
  }

  private valeurSelectionne: string;

  constructor() { }

  ngOnInit(): void {
  }

  /**
  * Selon l'indice fourni renvoi le style CSS selon le tableau de boutonCouleurItem reçu
  * @param i indice du bouton que l'on souhaite afficher
  */
  getBackGroundColor(i: number): string {
    return `background-color : ${this.listeBouton[i].codeCouleur}; ${this.disabledAll ? 'background-color: #EEEEEE; color: grey' : ''}`;
  }

  /**
   * Selon l'indice fourni renvoi la description si renseigne sinon le nom pour l'infobulle
   */
  getInfoBulle(i: number): string {
    return `${this.listeBouton[i].description ? this.listeBouton[i].description : this.listeBouton[i].nom}`;
  }

  /** Fonction à appeler lorsque la valeur change. */
  onChange: any = () => { };

  /** Fonction à appeler lorsque le input est touché. */
  onTouched: any = () => { };

  /**
   * Lecture de la valeur du composant par le model.
   */
  get value(): string {
    return this.valeurSelectionne;
  }

  set value(value: string) {
    if (value !== this.valeurSelectionne) {
      this.valeurSelectionne = value;
      this.change(value);
    }
  }

  /** Permet à Angular de s'abonner à la fonction appelée lorsque la valeur change. */
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /** Permet à Angular de s'abonner à la fonction appelée lorsque le input est touché. */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /** Valeur provenant du modèle. */
  writeValue(value: string) {
    if (value !== this.valeurSelectionne) {
      this.valeurSelectionne = value;
    }
  }

  change(value: string) {
    if (!this.disabledAll){
      this.valeurSelectionne = value;
      this.onChange(value);
      this.onTouched(value);
    }
  }
}
