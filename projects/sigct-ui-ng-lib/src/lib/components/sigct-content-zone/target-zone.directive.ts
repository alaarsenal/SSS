import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[target-zone]'
})
export class TargetZoneDirective {

  @Input() test:string;
  constructor() { }

}
