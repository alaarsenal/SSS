import { Component, OnInit, ViewChildren, QueryList, Input, ViewChild } from '@angular/core';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { ConsultationFicheSectionTerminaisonDTO } from './consultation-fiche-section-terminaison.dto';
import { SectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-terminaison-dto';
import { TranslateService } from '@ngx-translate/core';
import { ConsultationFicheSectionTerminaisonDureeFicheComponent } from '../consultation-fiche-section-terminaison-duree-fiche/consultation-fiche-section-terminaison-duree-fiche.component';

import { ConsultationFicheSectionTerminaisonServicesUtiliseesComponent } from '../consultation-fiche-section-terminaison-services-utilisees/consultation-fiche-section-terminaison-services-utilisees.component';
import { ValidationFinInterventionDTO } from 'projects/infosocial-ng-core/src/lib/models/validation-fin-intervention-dto';
import { ImpressionFicheSanteDTO } from 'projects/infosante-ng-core/src/lib/models/impression-fiche-sante-dto';
import { ConsultationFicheSectionTerminaisonInteractionComponent } from '../consultation-fiche-section-terminaison-interaction/consultation-fiche-section-terminaison-interaction.component';

@Component({
  selector: 'msss-consultation-fiche-section-terminaison',
  templateUrl: './consultation-fiche-section-terminaison.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison.component.css']
})
export class ConsultationFicheSectionTerminaisonComponent implements OnInit {

  @ViewChild('sectionServicesUtilisees', { static: true })
  sectionServicesUtilisees: ConsultationFicheSectionTerminaisonServicesUtiliseesComponent;

  @ViewChild('sectionDureeFiche', { static: true })
  sectionDureeFiche: ConsultationFicheSectionTerminaisonDureeFicheComponent;

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input()
  domaine: string;

  @Input()
  labelSectionResumeIntervention: string;

  @Input()
  labelChampLangue: string;

  @Input()
  set consultationFicheSectionTerminaison(value: ConsultationFicheSectionTerminaisonDTO) {
    this.chargerDonnees(value);
  };
  dto: ConsultationFicheSectionTerminaisonDTO;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionTerminaisonDTO, validationFinIntervention: ValidationFinInterventionDTO) {
    if (section) {
      if (validationFinIntervention) {
        section.validations = validationFinIntervention.validations;
        section.details = validationFinIntervention.details;
        section.opinionProf = validationFinIntervention.opinionProf;
      }
      section.raisonsIntervention = this.dto.raisonsIntervention;
      section.rolesAction = this.dto.rolesAction;
      section.centreActivite = this.dto.centreActivite;
      section.langueIntervention = this.dto.langueIntervention;
      section.detailsInterprete = this.dto.detailsInterprete;
      section.detailsRelaisBell = this.dto.detailsRelaisBell;
      section.interaction = this.dto.interaction;
      this.sectionDureeFiche.loadDonneesImpression(section);
      this.sectionServicesUtilisees.loadDonneesImpression(section);
    }
  }

  /** Nous avons un composant dans la librairie commune qui fait des références directes à info-santé */
  /** mais il existe des différences entre Santé et Social qui devrait faire en sorte que de code  ne */
  /** soit pas commun.  À cause du délais de temps, Steve accepte qu'un composant "commun" possède des*/
  /** références à Santé et Social.  Une méthode de chargement distincte a été ajoutée.               */
  loadDonneesImpressionSante(section: ImpressionFicheSanteDTO, validationFinIntervention: ValidationFinInterventionDTO) {
    if (section) {
      if (validationFinIntervention) {
        section.sectionTerminaisonDto.validations = validationFinIntervention.validations;
        section.sectionTerminaisonDto.details = validationFinIntervention.details;
        section.sectionTerminaisonDto.opinionProf = validationFinIntervention.opinionProf;
      }
      section.sectionTerminaisonDto.raisonsIntervention = this.dto.raisonsIntervention;
      section.sectionTerminaisonDto.rolesAction = this.dto.rolesAction;
      section.sectionTerminaisonDto.centreActivite = this.dto.centreActivite;
      section.sectionTerminaisonDto.langueIntervention = this.dto.langueIntervention;
      section.sectionTerminaisonDto.detailsInterprete = this.dto.detailsInterprete;
      section.sectionTerminaisonDto.detailsRelaisBell = this.dto.detailsRelaisBell;
      section.sectionTerminaisonDto.interaction = this.dto.interaction;
      this.sectionDureeFiche.loadDonneesImpressionSante(section.sectionTerminaisonDto);
      this.sectionServicesUtilisees.loadDonneesImpressionSante(section.sectionTerminaisonDto);
    }
  }

  private chargerDonnees(value: ConsultationFicheSectionTerminaisonDTO): void {
    this.dto = value ? value : new ConsultationFicheSectionTerminaisonDTO();
  }
}
