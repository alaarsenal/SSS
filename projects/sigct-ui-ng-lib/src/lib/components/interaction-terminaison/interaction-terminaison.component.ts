import { Component, Input } from '@angular/core';
import { AppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/appel-dto';

@Component({
  selector: 'msss-interaction-terminaison',
  templateUrl: './interaction-terminaison.component.html',
  styleUrls: ['./interaction-terminaison.component.css']
})
export class InteractionTerminaisonComponent {
  @Input()
  appelDto: AppelDTO;

  constructor() { }
}
