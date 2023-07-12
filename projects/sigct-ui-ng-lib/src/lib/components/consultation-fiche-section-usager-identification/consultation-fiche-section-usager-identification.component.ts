import { Component, Input, OnInit } from '@angular/core';
import AgeUtils from 'projects/sigct-service-ng-lib/src/lib/utils/age-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ReferenceDTO, UsagerDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { SectionIdentificationUsagerDTO } from '../../model/section-identification-usager-dto';
import { ConsultationFicheSectionUsagerDTO } from '../consultation-fiche-section-usager/consultation-fiche-section-usager-dto';

@Component({
  selector: 'msss-consultation-fiche-section-usager-identification',
  templateUrl: './consultation-fiche-section-usager-identification.component.html',
  styleUrls: ['./consultation-fiche-section-usager-identification.component.css']
})
export class ConsultationFicheSectionUsagerIdentificationComponent implements OnInit {

  @Input()
  referencesGroupeAges: ReferenceDTO[];

  @Input()
  set consultationUsager(value: ConsultationFicheSectionUsagerDTO) {
    this.chargerDonnees(value);
  }
  nomPrenom: string;
  dateNaissance: Date;
  ageGroupeAge: string
  sex: string;
  details: string;

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionIdentificationUsagerDTO): void {
    if (section) {
      section.nomPrenom = this.nomPrenom ? this.nomPrenom : '';
      section.dateNaissance = this.dateNaissance ? new Date(this.dateNaissance + ' 00:00:00.0') : null;
      section.age = this.ageGroupeAge ? this.ageGroupeAge : '';
      // section.age = this.ageGroupeAge ? this.ageGroupeAge.replace("=", '&lt;=').replace("=", '&gt;=') : '';
      section.sex = this.sex ? this.sex : '';
      section.details = this.details ? this.details : '';
    }
  }

  private chargerDonnees(value: ConsultationFicheSectionUsagerDTO): void {
    this.nomPrenom = null;
    this.dateNaissance = null;
    this.ageGroupeAge = null;
    this.sex = null;
    this.details = null;
    if (value) {
      if (value.usagerDTO) {
        this.chargerDonneesUsager(value.usagerDTO);
      } else if (value.usagerHistoDTO) {
        this.chargerDonneesHistoriqueUsager(value.usagerHistoDTO);
      }
      this.chargerAgeGroupeAge(value);
    }
  }

  private chargerDonneesUsager(usager: UsagerDTO): void {
    this.dateNaissance = usager.dtNaiss;
    this.sex = usager.sexeNom;
    this.details = usager.detail;
    this.chargerNomPrenom(usager.nom, usager.prenom);
  }

  private chargerDonneesHistoriqueUsager(usager: UsagerIdentHistoDTO) {
    this.dateNaissance = usager.dtNaiss;
    this.sex = usager.nomReferenceSexe;
    this.details = usager.detail;
    this.chargerNomPrenom(usager.nom, usager.prenom);
  }

  private chargerNomPrenom(nom: string, prenom: string): void {
    if (!StringUtils.isBlank(nom) && !StringUtils.isBlank(prenom)) {
      this.nomPrenom = nom + ', ' + prenom;
    }
    else {
      this.nomPrenom = !StringUtils.isBlank(nom) ? nom : prenom;
    }
  }

  private chargerAgeGroupeAge(value: ConsultationFicheSectionUsagerDTO): void {
    this.ageGroupeAge = "";

    const annes: number = value.ageAnnees;
    const mois: number = value.ageMois;
    const jours: number = value.ageJours;
    if (annes || mois || jours) {
      const age: string = AgeUtils.formaterAgeFormatLong(annes, mois, jours);
      const groupeAge: string = AgeUtils.getNomGroupeAge(this.referencesGroupeAges, annes, mois, jours);

      this.ageGroupeAge = age;
      if (!StringUtils.isBlank(groupeAge)) {
        this.ageGroupeAge += " (" + groupeAge + ")";
      }
    }
  }

}
