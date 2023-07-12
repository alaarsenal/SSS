import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[msss-sigct-code-postal]'
})
export class SigctCodePostalDirective {

  @Input("longueurMin")
  minlength: number = 3;

  constructor(private el: ElementRef) {
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    const txtCourrant: string = this.el.nativeElement.value;

    if (txtCourrant && txtCourrant.length < this.minlength) {
      this.el.nativeElement.value = "";
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

    // Touches de déplacement
    if (["Tab", "End", "Home", "ArrowLeft", "ArrowRight", "Enter"].indexOf(event.key) !== -1) {
      return;
    }

    // Select all, copier-coller, annuler
    if (event.ctrlKey && ["a", "A", "c", "C", "v", "V", "z", "Z", "Insert"].indexOf(event.key) !== -1) {
      return;
    }

    // Copier-coller
    if (event.shiftKey && ["Insert"].indexOf(event.key) !== -1) {
      return;
    }

    // Touches de suppression (BKSPACE, DEL, Shift + DEL, CTRL + X)
    const isDelete: boolean = (["Backspace", "Delete"].indexOf(event.key) !== -1);    // BKSPACE, DEL
    const isShftDelete: boolean = (event.shiftKey && "Delete" == event.key);          // Shift + DEL
    const isCtrlX: boolean = (event.ctrlKey && ["x", "X"].indexOf(event.key) !== -1); // CTRL + X
    if (isDelete || isShftDelete || isCtrlX) {
      const txtCourant: string = this.el.nativeElement.value ? this.el.nativeElement.value : "";

      // Permet uniquement la suppression des derniers caractères pour ne pas briser le format du code postal.
      if (this.el.nativeElement.selectionEnd != txtCourant.length) {
        event.preventDefault();
      }
      return;
    }

    // Lettre, chiffre ou espace
    var regexKey = /^[A-Za-z]|[0-9]|[ ]$/;
    if (event.key.match(regexKey)) {
      const txtCourant: string = this.el.nativeElement.value ? this.el.nativeElement.value : "";

      let txtFutur: string = txtCourant.substr(0, this.el.nativeElement.selectionStart) + event.key + txtCourant.substr(this.el.nativeElement.selectionEnd);

      if (!this.validerCodePostal(txtFutur)) {
        event.preventDefault();
      }

      return;
    }

    event.preventDefault();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    let txtCourrant: string = this.el.nativeElement.value;

    if (txtCourrant && txtCourrant.length > 3) {
      if (txtCourrant.charAt(3) != " ") {
        this.el.nativeElement.value = txtCourrant.substr(0, 3) + " " + txtCourrant.substr(3);
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    let txtColle: string = event.clipboardData.getData('text');
    if (!txtColle) {
      return;
    }

    const txtCourant: string = this.el.nativeElement.value ? this.el.nativeElement.value : "";

    let txtFutur: string = txtCourant.substr(0, this.el.nativeElement.selectionStart) + txtColle.toUpperCase() + txtCourant.substr(this.el.nativeElement.selectionEnd);

    if (!this.validerCodePostal(txtFutur)) {
      event.preventDefault();
      return;
    }
  }

  /**
   * Vérifie si le format d'un code postal est valide.
   * Un code postal vide est considéré valide.
   * @param codePostal code postal à valider
   */
  private validerCodePostal(codePostal: string): boolean {
    if (!codePostal) {
      return true;
    }

    // L'espace doit être absent ou à la position 3.
    const posEspace = codePostal.indexOf(" ");
    if (posEspace != -1 && posEspace != 3) {
      event.preventDefault();
      return;
    }

    codePostal = codePostal.replace(" ", "").toUpperCase();

    let regexCodePostal = /^$/;
    switch (codePostal.length) {
      case 1:
        regexCodePostal = /^[A-Z]$/;
        break;
      case 2:
        regexCodePostal = /^[A-Z][0-9]$/;
        break;
      case 3:
        regexCodePostal = /^[A-Z][0-9][A-Z]$/;
        break;
      case 4:
        regexCodePostal = /^[A-Z][0-9][A-Z][0-9]$/;
        break;
      case 5:
        regexCodePostal = /^[A-Z][0-9][A-Z][0-9][A-Z]$/;
        break;
      case 6:
        regexCodePostal = /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/;
        break;
      default:
        return false;
    }

    // Retire l'espace pour valider le format du code postal.
    return regexCodePostal.test(codePostal);
  }
}
