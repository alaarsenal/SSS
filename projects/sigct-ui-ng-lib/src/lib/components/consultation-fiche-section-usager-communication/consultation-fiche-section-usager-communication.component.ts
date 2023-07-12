import { Component, OnInit, Input } from '@angular/core';
import { UsagerCommDTO } from 'projects/usager-ng-core/src/lib/models';
import { Tuple } from '../../utils/tuple';
import { UsagerDataService } from 'projects/usager-ng-core/src/lib/services/usager-data.service';
import { SectionCommunicationUsagerDTO } from '../../model/section-communication-usager-dto';

export enum enumMoyenComm {
  COURELEC = "COURELEC",
  TEL = "TEL",
  TELSAT = "TELSAT"
}

@Component({
  selector: 'msss-consultation-fiche-section-usager-communication',
  templateUrl: './consultation-fiche-section-usager-communication.component.html',
  styleUrls: ['./consultation-fiche-section-usager-communication.component.css']
})
export class ConsultationFicheSectionUsagerCommunicationComponent implements OnInit {

  @Input()
  set communications(values: UsagerCommDTO[]) {
    this.chargerDonnees(values);
  }
  dtos: Tuple[] = [];

  constructor(private usagerDataService: UsagerDataService) { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionCommunicationUsagerDTO) {
    if (section) {
      let aux: Tuple[] = [];
      this.dtos?.forEach(item => {
        aux.push({
            key: ("" + item.key).replace('color:black;font-weight:bold;padding-left:10px;', ""),
            value: item.value
          });
      });
      section.communications = aux;
    }
  }

  private chargerDonnees(communications: UsagerCommDTO[]): void {
    this.dtos = [];
    if (communications) {
      communications.forEach(item => {
        const element: string = this.usagerDataService.formatActionUsagerCommunication(item);
        if (element) {
          const aux: string[] = element.split("</span> :");
          if (aux && aux.length == 2) {
            this.dtos.push({ key: aux[0] + '</span> :', value: aux[1] });
          }
        }
      })
    }
  }

}
