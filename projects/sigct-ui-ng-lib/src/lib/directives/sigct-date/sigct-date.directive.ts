import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[msss-sigct-date]'
})
export class SigctDateDirective {

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

    // Chiffre ou tiret
    if (["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(event.key) !== -1) {
      return;
    }

    event.preventDefault();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    let current: string = this.el.nativeElement.value;

    if (["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(event.key) !== -1) {
      let date = current.replace(/-/g, "").trim();
      if (/^\d{4,}$/.test(date)) {
        let _aaaa = date.slice(0, 4);
        let _rest = date.slice(4);

        if (_rest.length == 1) {
          if (parseInt(_rest) > 2) {
            this.el.nativeElement.value = _aaaa + "-";
          } else {
            this.el.nativeElement.value = _aaaa + "-" + _rest;
          }
        } else if (_rest.length == 2) {
          if (parseInt(_rest) > 12) {
            this.el.nativeElement.value = _aaaa + "-";
          } else {
            this.el.nativeElement.value = _aaaa + "-" + _rest + "-";
          }
        } else if (_rest.length > 2) {
          let mm = _rest.slice(0, 2);
          let jj = _rest.slice(2);
          jj = jj.slice(0,2);

          if ((["01", "03", "05", "07", "08", "10", "12"].indexOf(mm) != -1 && parseInt(jj) > 31) ||
            (["04", "06", "09", "11"].indexOf(mm) != -1 && parseInt(jj) > 30) ||
            (mm == "02" && parseInt(jj) > 29)) {
            jj = "";
          }
          this.el.nativeElement.value = _aaaa + "-" + mm + "-" + jj;
        } else {
          this.el.nativeElement.value = _aaaa + "-" + _rest;
        }
      }
    }
  }
}
