import { Component, Input } from '@angular/core';
import { ConsultationInteractionDTO } from '../../model/section-interaction-dto';

@Component({
  selector: 'msss-consultation-fiche-section-terminaison-interaction',
  templateUrl: './consultation-fiche-section-terminaison-interaction.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-interaction.component.css']
})
export class ConsultationFicheSectionTerminaisonInteractionComponent {

  @Input()
  consultationInteractionDto: ConsultationInteractionDTO = new ConsultationInteractionDTO();

  constructor() { }
}
