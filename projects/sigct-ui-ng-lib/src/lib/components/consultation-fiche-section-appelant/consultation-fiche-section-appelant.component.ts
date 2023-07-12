import { Input, ViewChildren } from '@angular/core';
import { QueryList } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ConsultationAppelantDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-appelant-dto';
import { EnumMoyenCommunication } from 'projects/usager-ng-core/src/lib/enums/moyen-communication-enum';
import { Tuple } from '../../utils/tuple';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { ConsultationSectionAppelantCommDTO } from './consultation-appelant-comm-dto';
import { SectionAppelantInitialDTO } from '../../model/section-appelant-initial-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';

@Component({
  selector: 'msss-consultation-fiche-section-appelant',
  templateUrl: './consultation-fiche-section-appelant.component.html',
  styleUrls: ['./consultation-fiche-section-appelant.component.css']
})
export class ConsultationFicheSectionAppelantComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;


  dto: ConsultationAppelantDTO;

  categorieAppelant: string;
  nom: string;
  prenom: string;
  organisme: string;
  details: string;
  listeCommunications: ConsultationSectionAppelantCommDTO[];


  dtos: Tuple[] = [];

  @Input()
  set consultationAppelantDTO(obj: ConsultationAppelantDTO) {
    if (obj) {
      this.dto = obj;

      this.categorieAppelant = this.dto.categorieUsager;
      this.details = this.dto.appelantDTO?.details;
      this.nom = this.dto.appelantDTO?.nom;
      this.prenom = this.dto.appelantDTO?.prenom;
      this.organisme = this.dto.appelantDTO?.rrssDTO?.rrssNom;
      this.listeCommunications = this.dto.listeCommunications;

      this.dtos = [];
      if (this.listeCommunications) {
        this.listeCommunications.forEach(item => {
          const element: string = this.formatActionUsagerCommunication(item);
          if (element) {
            const aux: string[] = element.split("</span> :");
            if (aux && aux.length == 2) {
              this.dtos.push({ key: aux[0] + '</span> :', value: aux[1] });
            }
          }
        });
      }
    }

  }

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionAppelantInitialDTO): void {
    if (section) {
      section.categorieAppelant = this.categorieAppelant;
      section.nomPrenom = !StringUtils.isBlank(this.nom)
        ? this.nom + (!StringUtils.isBlank(this.prenom) ? ", " + this.prenom : "")
        : "";
      section.organismeRrss = this.organisme;
      section.details = this.details;

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

  /**
   * Format d'un moyen de communication affiché dans la liste de droite.
   * @param usagerCommunication moyen de communication à formater
   */
  formatActionUsagerCommunication(usagerCommunication: ConsultationSectionAppelantCommDTO) {
    let usCommFormate: string;
    usCommFormate = "<span style='color:black;font-weight:bold;padding-left:10px;'>" + usagerCommunication.typeEquip + " " + usagerCommunication.typeCoord.toLowerCase() + "</span> : ";



    let coordFormate = "";
    if (usagerCommunication.coordonnees != null) {
      if (usagerCommunication.codeTypeEquip == EnumMoyenCommunication.COURELEC) {
        coordFormate = usagerCommunication.coordonnees;
      } else if (usagerCommunication.codeTypeEquip == EnumMoyenCommunication.TEL) {
        if (usagerCommunication.coordonnees.includes('#')) {
          let tabCoordonnes = usagerCommunication.coordonnees.split('#');
          coordFormate = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            coordFormate = coordFormate + " Poste " + tabCoordonnes[1];
          }
        } else {
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
        }
      } else if (usagerCommunication.codeTypeEquip == EnumMoyenCommunication.TELSAT) {
        if (usagerCommunication.coordonnees.length == 15) {
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + "-" + usagerCommunication.coordonnees.substr(3, 4) + "-" + usagerCommunication.coordonnees.substr(7, 3) + "-" + usagerCommunication.coordonnees.substr(10, 5);
        } else {
          coordFormate = usagerCommunication.coordonnees.substr(0, 4) + "-" + usagerCommunication.coordonnees.substr(4, 3) + "-" + usagerCommunication.coordonnees.substr(7, 5);
        }
      } else {
        coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
      }
    }

    usCommFormate += coordFormate;
    if (usagerCommunication.detail != null) {
      usCommFormate += " (<i>" + usagerCommunication.detail + "</i>)";
    }

    return usCommFormate;
  }




}
