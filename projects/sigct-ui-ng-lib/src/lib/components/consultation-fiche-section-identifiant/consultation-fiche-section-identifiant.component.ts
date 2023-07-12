import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { IdentifiantDTO } from './identifiant-dto';
import { SectionIdentifiantDTO } from '../../model/section-identifiant-dto';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'msss-consultation-fiche-section-identifiant',
  templateUrl: './consultation-fiche-section-identifiant.component.html',
  styleUrls: ['./consultation-fiche-section-identifiant.component.css']
})
export class ConsultationFicheSectionIdentifiantComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input()
  domaine: string;

  @Input("identifiantDTO")
  set identifiantDTO(value: IdentifiantDTO) {
    this._identifiantDTO = value;
  }

  _identifiantDTO: IdentifiantDTO;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionIdentifiantDTO) {
    if (section && this._identifiantDTO) {
      section.labelIdentifiantUsager = this.translateService.instant('sigct.ss.f_appel.consultation.identifiantusager');
      section.labelIdentifiantFicheAppel = this.translateService.instant('sigct.ss.f_appel.consultation.identifiantfiche');
      section.labelIdentifiantAutresFichesAppel = this.translateService.instant('sigct.ss.f_appel.consultation.autresfichesreliees');
      section.idUsagerIdent = this._identifiantDTO.idUsagerIdent;
      section.idFicheAppel = this._identifiantDTO.idFicheAppel;
      section.autresFichesReliees = this._identifiantDTO.autresFichesReliees;
      section.dureeCompleteAppel = this._identifiantDTO.dureeCompleteAppel;
    }
  }
}
