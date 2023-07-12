import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MoyenSocialDTO } from '../../../models/moyen-social-dto';

@Component({
  selector: 'app-consultation-liste-referentiels',
  templateUrl: './consultation-liste-referentiels.component.html',
  styleUrls: ['./consultation-liste-referentiels.component.css']
})
export class ConsultationListeReferentielsComponent implements OnInit {

  _moyenSocialDTOs: MoyenSocialDTO[];
  get moyenSocialDTOs(): MoyenSocialDTO[] {
    return this._moyenSocialDTOs;
  }

  @Input("moyenSocialDTOs")
  set moyenSocialDTOs(value: MoyenSocialDTO[]) {
    this.display(value);
  }

  @Output()
  referentielDeleteAction: EventEmitter<any> = new EventEmitter();

  @Output()
  referentielConsultAction: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  private display(value: MoyenSocialDTO[]): void {
    this._moyenSocialDTOs = value;
  }

  onConsultReferentielClick(idDocumentIdentificationSocial: number) {
    let moyen = this._moyenSocialDTOs.find(moyen => moyen.idDocumentIdentificationSocial == idDocumentIdentificationSocial);
    this.referentielConsultAction.emit({ idDocumentIdentificationSocial: idDocumentIdentificationSocial, nomReferentiel: moyen.nomDocumentIdentificationSocial, codeTypeReferentiel: moyen.codeDocumentIdentificationReferenceDocumentTypeSocial });
  }

  onDeleteReferentielClick(id: number) {
    let moyen = this._moyenSocialDTOs.find(moyen => moyen.id == id);
    this.referentielDeleteAction.emit({ id: id, nomReferentiel: moyen.nomDocumentIdentificationSocial });
  }

}
