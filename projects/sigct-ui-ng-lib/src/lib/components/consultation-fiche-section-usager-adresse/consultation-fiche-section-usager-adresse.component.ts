import { Component, Input, OnInit } from '@angular/core';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { UsagerLieuResidenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { SectionAdresseUsagerDTO } from '../../model/section-adresse-usager-dto';
import { Tuple } from '../../utils/tuple';

@Component({
  selector: 'msss-consultation-fiche-section-usager-adresse',
  templateUrl: './consultation-fiche-section-usager-adresse.component.html',
  styleUrls: ['./consultation-fiche-section-usager-adresse.component.css']
})
export class ConsultationFicheSectionUsagerAdresseComponent implements OnInit {

  @Input()
  set lieuxResidence(values: UsagerLieuResidenceDTO[]) {
    this.chargerDonnees(values);
  }
  dtos: Tuple[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionAdresseUsagerDTO) {
    if (section && this.dtos) {
      section.adresses = this.dtos;
    }
  }

  private chargerDonnees(lieuxResidence: UsagerLieuResidenceDTO[]): void {
    this.dtos = [];
    if (lieuxResidence) {
      lieuxResidence.forEach(item => {
        this.dtos.push(this.formaterLieuxResidence(item));
      })
    }
  }

  private formaterLieuxResidence(usagerLieuResidence: UsagerLieuResidenceDTO): Tuple {
    if (!usagerLieuResidence) {
      return null;
    }
    let result: Tuple = { key: usagerLieuResidence.nomTypeAdresse, value: "" };

    const codePostal = !StringUtils.isBlank(usagerLieuResidence.codePostal)
      ? usagerLieuResidence.codePostal.substring(0, 3) + " " + usagerLieuResidence.codePostal.substring(3, 6)
      : "";

    const adresseLigneUn: string = [
      usagerLieuResidence.adresse,
      usagerLieuResidence.nomCategSubdvImmeu,
      usagerLieuResidence.subdvImmeu,
      usagerLieuResidence.municNom,
      codePostal
    ].filter(Boolean).join(" ");

    const adresseLigneDeux: string = [
      usagerLieuResidence.codeRegion,
      ' - ',
      usagerLieuResidence.nomRegion,
      usagerLieuResidence.nomProvince,
      usagerLieuResidence.nomPays
    ].filter(Boolean).join(" ");

    const adresseLigneTrois: string = [
      usagerLieuResidence.rtsNom,
      usagerLieuResidence.rlsNom,
      usagerLieuResidence.clscNom
    ].filter(Boolean).join(" ");

    if (!StringUtils.isBlank(adresseLigneUn)) {
      result.value += '<div>' + adresseLigneUn + '</div>';
    }
    if (!StringUtils.isBlank(adresseLigneDeux)) {
      result.value += '<div>' + adresseLigneDeux + '</div>';
    }
    if (!StringUtils.isBlank(adresseLigneTrois)) {
      result.value += '<div>' + adresseLigneTrois + '</div>';
    }
    if (!StringUtils.isBlank(usagerLieuResidence.detail)) {
      result.value += '<div>(<i>' + usagerLieuResidence.detail + '</i>)</div>';
    }
    return result;
  }

}
