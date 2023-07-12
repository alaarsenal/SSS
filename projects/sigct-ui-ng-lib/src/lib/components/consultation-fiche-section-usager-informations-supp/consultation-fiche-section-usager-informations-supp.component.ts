import { Component, OnInit, Input } from '@angular/core';
import { UsagerDTO } from 'projects/usager-ng-core/src/lib/models';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ConsultationFicheSectionUsagerDTO } from '../consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { SectionInformationSuppDTO } from '../../model/section-information-supp-dto';

@Component({
  selector: 'msss-consultation-fiche-section-usager-informations-supp',
  templateUrl: './consultation-fiche-section-usager-informations-supp.component.html',
  styleUrls: ['./consultation-fiche-section-usager-informations-supp.component.css']
})
export class ConsultationFicheSectionUsagerInformationsSuppComponent implements OnInit {

  @Input()
  set consultationUsager(value: ConsultationFicheSectionUsagerDTO) {
    this.chargerDonnees(value);
  }

  nam: string;
  expiration: string;
  langue: string;
  malentendant: string;
  merenomprenom: string;
  perenomprenom: string;

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionInformationSuppDTO): void {
    if (section) {
      section.nam = this.nam ? this.nam : '';
      section.expiration = this.expiration ? this.expiration : '';
      section.langue = this.langue ? this.langue : '';
      section.malentendant = this.malentendant ? this.malentendant : '';
      section.merenomprenom = this.merenomprenom ? this.merenomprenom : '';
      section.perenomprenom = this.perenomprenom ? this.perenomprenom : '';
    }
  }

  private chargerDonnees(value: ConsultationFicheSectionUsagerDTO): void {
    this.nam = null;
    this.expiration = null;
    this.langue = null;
    this.malentendant = null;
    this.merenomprenom = null;
    this.perenomprenom = null;
    if (value) {
      if (value.usagerDTO) {
        this.chargerDonneesUsager(value.usagerDTO);
      } else if (value.usagerHistoDTO) {
        this.chargerDonneesHistoriqueUsager(value.usagerHistoDTO);
      }
    }
  }

  private chargerDonneesUsager(usager: UsagerDTO): void {
    this.nam = usager.nam;
    if (usager.anneeExpr && usager.moisExpr) {
      this.expiration = usager.anneeExpr + "-" + (usager.moisExpr < 10 ? '0' + usager.moisExpr : usager.moisExpr);
    }
    this.langue = usager.langueNom;
    this.malentendant = usager.malentendant ? "Oui" : "Non";
    if (!StringUtils.isBlank(usager.nomMere)
      && !StringUtils.isBlank(usager.prenomMere)) {
      this.merenomprenom = usager.nomMere + ", " + usager.prenomMere;
    } else {
      this.merenomprenom = !StringUtils.isBlank(usager.nomMere)
        ? usager.nomMere : usager.prenomMere;
    }
    if (!StringUtils.isBlank(usager.nomPere)
      && !StringUtils.isBlank(usager.prenomPere)) {
      this.perenomprenom = usager.nomPere + ", " + usager.prenomPere;
    } else {
      this.perenomprenom = !StringUtils.isBlank(usager.nomPere)
        ? usager.nomPere : usager.prenomPere;
    }
  }

  private chargerDonneesHistoriqueUsager(usager: UsagerIdentHistoDTO) {
    this.nam = usager.nam;
    if (usager.namAnneeExpir && usager.namMoisExpir) {
      this.expiration = usager.namAnneeExpir + "-" + (usager.namMoisExpir < 10 ? '0' + usager.namMoisExpir : usager.namMoisExpir);
    }
    this.langue = usager.nomReferenceLangueUsage;
    this.malentendant = usager.malentendant ? "Oui" : "Non";
    if (!StringUtils.isBlank(usager.nomMere)
      && !StringUtils.isBlank(usager.prenomMere)) {
      this.merenomprenom = usager.nomMere + ", " + usager.prenomMere;
    } else {
      this.merenomprenom = !StringUtils.isBlank(usager.nomMere)
        ? usager.nomMere : usager.prenomMere;
    }
    if (!StringUtils.isBlank(usager.nomPere)
      && !StringUtils.isBlank(usager.prenomPere)) {
      this.perenomprenom = usager.nomPere + ", " + usager.prenomPere;
    } else {
      this.perenomprenom = !StringUtils.isBlank(usager.nomPere)
        ? usager.nomPere : usager.prenomPere;
    }
  }

}
