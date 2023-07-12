import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[msss-sigct-decimal]'
})
export class SigctDecimalDirective {

  /** La précision du nombre décimal. Correspond au nombre total de chiffres d'un nombre décimal. Ex: la précision de 123.456 = 6 */
  @Input()
  precision: number = 1;
  /** Le scale du nombre décimal. Correspond au nombre de chiffres après la décimale. Ex: le scale de 123.456 = 3 */
  @Input()
  scale: number = 1;

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
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

    // Remplace le texte sélectionné par la touche.  
    let futur: string = current.substring(0, this.el.nativeElement.selectionStart) + event.key + current.substring(this.el.nativeElement.selectionEnd);

    // Valide le futur texte.
    if (!this.validerRegexDecimal(futur) || !this.validerPrecision(futur) || !this.validerScale(futur)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    let current: string = this.el.nativeElement.value;
    let pasteText: string = event.clipboardData.getData('text/plain');

    // Remplace le texte sélectionné par le texte collé.
    let futur: string = current.substring(0, this.el.nativeElement.selectionStart) + pasteText + current.substring(this.el.nativeElement.selectionEnd);

    // Valide le futur texte.
    if (this.validerRegexDecimal(futur) && this.validerPrecision(futur) && this.validerScale(futur)) {
      document.execCommand('insertText', false, pasteText);
    }
  }

  /** Vérifie la précision du nombre. */
  private getPrecision(): number {
    if (this.precision) {
      return Number(this.precision);
    }
    return 1;
  }

  /** Vérifie le scale du nombre. */
  private getScale(): number {
    if (this.scale) {
      return Number(this.scale);
    }
    return 1;
  }

  /**
   * Vérifie si text est un nombre décimal valide.
   * @param text 
   */
  private validerRegexDecimal(text: string): boolean {
    if (text) {
      const decimal_regex = new RegExp(/^[0-9]*[\.\,]?[0-9]*$/g);

      if (!String(text).match(decimal_regex)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Vérifie si text est un nombre décimal valide.
   * @param text 
   */
  private validerPrecision(text: string): boolean {
    if (text) {
      let digits = text.replace(".", "");
      digits = digits.replace(",", "");

      let positionDecimal = text.indexOf(".");

      if (positionDecimal == -1) {
        positionDecimal = text.indexOf(",");
      }

      if (positionDecimal == -1) {
        if (digits.length > this.getPrecision() - this.getScale()) {
          return false;
        }
      } else {
        if (digits.length > this.getPrecision()) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Vérifie si text est un nombre décimal valide.
   * @param text 
   */
  private validerScale(text: string): boolean {
    if (text) {
      let positionDecimal = text.indexOf(".");

      if (positionDecimal == -1) {
        positionDecimal = text.indexOf(",");
      }

      if (positionDecimal > -1) {
        if (text.length - positionDecimal - 1 > this.getScale()) {
          return false;
        }
      }
    }
    return true;
  }
}
