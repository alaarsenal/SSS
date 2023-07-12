import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { SectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-terminaison-dto';
import { ConsultationFicheSectionTerminaisonDTO } from '../consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.dto';

@Component({
  selector: 'msss-consultation-fiche-section-terminaison-duree-fiche',
  templateUrl: './consultation-fiche-section-terminaison-duree-fiche.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-duree-fiche.component.css']
})
export class ConsultationFicheSectionTerminaisonDureeFicheComponent implements OnInit {

  @Input()
  set dureeFicheDTO(value: DureeFicheAppelDTO) {
    this.chargerDonnees(value);
  }

  @Input()
  domaine: string;

  @Input()
  saisieDifferee: boolean;

  dateDebutFiche: Date;
  dateFinFiche: Date;
  dateCreationFiche: Date;
  dateFinSaisieDiffereeFiche: Date;
  labelDuree: string;
  labelDureeCalculee: string
  labelDureeCorrigee: string;
  detailsDureeCorrigee: string;
  isDureeVisible: boolean;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionTerminaisonDTO) {
    if (section) {
      section.dateDebutFiche = this.dateDebutFiche;
      section.dateFinFiche = this.dateFinFiche;
      section.labelDuree = this.labelDuree;
      section.labelDureeCalculee = this.labelDureeCalculee;
      section.labelDureeCorrigee = this.labelDureeCorrigee;
      section.detailsDureeCorrigee = this.detailsDureeCorrigee;
      section.dateCreationFiche = this.dateCreationFiche;
      section.dateFinSaisieDiffereeFiche = this.dateFinSaisieDiffereeFiche;
      section.saisieDifferee = this.saisieDifferee;
    }
  }

  loadDonneesImpressionSante(section: ConsultationFicheSectionTerminaisonDTO) {
    if (section) {
      section.dateDebutFiche = this.dateDebutFiche;
      section.dateFinFiche = this.dateFinFiche;
      section.labelDuree = this.labelDuree;
      section.labelDureeCalculee = this.labelDureeCalculee;
      section.labelDureeCorrigee = this.labelDureeCorrigee;
      section.detailsDureeCorrigee = this.detailsDureeCorrigee;
      section.dateCreationFiche = this.dateCreationFiche;
      section.dateFinSaisieDiffereeFiche = this.dateFinSaisieDiffereeFiche;
      section.saisieDifferee = this.saisieDifferee;
    }
  }

  private chargerDonnees(value: DureeFicheAppelDTO): void {
    this.dateDebutFiche = null;
    this.dateFinFiche = null;
    this.labelDuree = null;
    this.labelDureeCalculee = null;
    this.labelDureeCorrigee = null;
    this.detailsDureeCorrigee = null;
    this.dateCreationFiche = null;
    this.dateFinSaisieDiffereeFiche = null;
    this.isDureeVisible = false;

    if (value) {
      this.dateDebutFiche = value.dateDebut;
      this.dateFinFiche = value.dateFin;
      this.labelDuree = null;
      this.labelDureeCalculee = null;
      this.detailsDureeCorrigee = value.detailsDureeCorrigee;
      this.dateCreationFiche = value.dateCreation;
      this.dateFinSaisieDiffereeFiche = value.dateFinSaisieDifferee;
      this.isDureeVisible = value.isDureeVisible;

      if (value.dureeCorrigee) {
        this.labelDureeCorrigee = DateUtils.secondesToHHMMSS(value.dureeCorrigee);
      }

      if (value.isDureeVisible) {
        if (value.dureeCumulee) {
          this.labelDuree = this.translateService.instant("sigct.ss.f_appel.consultation.terminaison.dureefiche.dureechronometree");
          this.labelDureeCalculee = DateUtils.secondesToHHMMSS(value.dureeCumulee);
        } else if (this.dateDebutFiche && this.dateFinFiche) {
          this.labelDuree = this.translateService.instant("sigct.ss.f_appel.consultation.terminaison.dureefiche.dureecalculee");
          // S'assure que la date est une Date et non un number.
          const _dateDebut: Date = typeof this.dateDebutFiche == "number" ? new Date(this.dateDebutFiche) : this.dateDebutFiche;
          const _dateFin: Date = typeof this.dateFinFiche == "number" ? new Date(this.dateFinFiche) : this.dateFinFiche;
          const dureeFiche = DateUtils.calculerNbSecondesBetween(_dateDebut, _dateFin);
          this.labelDureeCalculee = DateUtils.secondesToHHMMSS(dureeFiche);
        }
      }
    }
  }

  get displaySection(): boolean {
    return this.displayDatDebutFiche || this.displayDatFinFiche || this.displayDureeCalculee || this.displayDureeCorrigee ||
      this.saisieDifferee;
  }

  get displayDatDebutFiche(): boolean {
    return this.dateDebutFiche != undefined && this.dateDebutFiche != null;
  }

  get displayDatFinFiche(): boolean {
    return this.dateFinFiche != undefined && this.dateFinFiche != null;
  }

  get displayDureeCalculee(): boolean {
    //    return !StringUtils.isBlank(this.labelDureeCalculee);
    return this.isDureeVisible;
  }

  get displayDureeCorrigee(): boolean {
    return !StringUtils.isBlank(this.labelDureeCorrigee);
  }

  get displayDetailDureeCorrigee(): boolean {
    return !StringUtils.isBlank(this.detailsDureeCorrigee);
  }
}
