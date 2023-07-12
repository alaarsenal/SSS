import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { stringify } from 'querystring';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';

@Directive({
  selector: '[msss-sigct-only-number]'
})
export class SigctOnlyNumberDirective {

  @Input()
  public disableNumberCheck: boolean = false;

  @Input()
  public decimalPatternCheck: boolean = false;

  @Input()
  public decimalIntegerPrecision: number = 0;

  @Input()
  public decimalFractionPrecision: number = 0;

  constructor(private el: ElementRef) {
  }


  @HostListener('keypress', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

    // Touches d'édition et de déplacement
    if (["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight", "Delete", "Enter"].indexOf(event.key) !== -1) {
      return;
    }

    // Copier-coller
    if (event.ctrlKey && ["a", "A", "x", "X", "c", "C", "v", "V"].indexOf(event.key) !== -1) {
      return;
    }

    // Copier-coller
    if (event.shiftKey && ["Delete", "Insert"].indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);

    this.prevenirCaractereNonNumerique(event);

    if (!this.validerNumber(next)) {
      event.preventDefault();
    }

  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    let currentText: string = this.el.nativeElement.value;
    let pasteText: string = event.clipboardData.getData('text/plain');

    if (!this.disableNumberCheck) {

      // Retire du texte à coller les caractères autres que les caractères numériques.
      pasteText = pasteText.replace(/[^0-9]/g, "");

      if (this.validerNumber(pasteText)) {
        if (this.validerNumber(currentText + pasteText)) {
          document.execCommand('insertText', false, pasteText);
        }
      }

    } else {
      document.execCommand('insertText', false, pasteText);
    }

  }

  /**
   * Valide le
   * @param text
   */
  private validerNumber(text: string): boolean {
    if (this.disableNumberCheck) {
      return true;
    }
    if (text) {
      let number_regex = new RegExp(/^[0-9]+$/);
      if (this.decimalPatternCheck) {
        text = text.replace(",", ".");
        if ((this.decimalIntegerPrecision || this.decimalFractionPrecision)) {
          const aux: string[] = text.split(".");
          if (CollectionUtils.isNotBlank(aux)
            && ((this.decimalIntegerPrecision
              && aux[0].length > this.decimalIntegerPrecision)
              || (this.decimalFractionPrecision
                && aux.length > 1
                && aux[1].length > this.decimalFractionPrecision))) {
            return false;
          }
        }
        number_regex = new RegExp(/^\d+(\.)?(\d+)?$/);
      }
      return number_regex.test(text);
    }
  }

  /**
   * Si la touche n'est pas un nombre de 0 à 9, stopper l'événement de la touche
   * @param event 
   */
  private prevenirCaractereNonNumerique(event) : void {
    
    if (!this.disableNumberCheck) {

      const e = <KeyboardEvent>event;

      if(this.decimalIntegerPrecision == 0 && this.decimalFractionPrecision == 0){
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
          e.preventDefault();
        } 
      } else {
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0','.',','].indexOf(e.key) === -1) {
          e.preventDefault();
        } 
      }
     

    }

  }

}
