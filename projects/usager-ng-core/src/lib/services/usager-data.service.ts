import { UsagerLieuResidenceDTO, UsagerCommDTO } from '../models';
import { EnumMoyenCommunication } from '../enums/moyen-communication-enum';
import { EnumTypeAdresse } from '../enums/type-adresse-enum';
import { Injectable } from '@angular/core';






@Injectable({
  providedIn: 'root'
})
export class UsagerDataService {

  /**
   * Format d'un lieu de résidence affiché dans la liste des adresses.
   * @param usagerLieuResidence lieu de résidence à formater
   */
  formatActionUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO) {
    let formattedAddress: string = "";

    if (usagerLieuResidence) {
      let codePostal = "";
      if (usagerLieuResidence.codePostal && usagerLieuResidence.codePostal != null) {
        codePostal = usagerLieuResidence.codePostal.substring(0, 3) + " " + usagerLieuResidence.codePostal.substring(3, 6);
      }

      let adresseLigneUn = [usagerLieuResidence.adresse, usagerLieuResidence.nomCategSubdvImmeu, usagerLieuResidence.subdvImmeu, usagerLieuResidence.municNom, codePostal];
      let adresseLigneDeux = [usagerLieuResidence.codeRegion, ' - ', usagerLieuResidence.nomRegion, usagerLieuResidence.nomProvince, usagerLieuResidence.nomPays];
      let adresseLigneTrois = [usagerLieuResidence.rtsNom, usagerLieuResidence.rlsNom, usagerLieuResidence.clscNom];

      var couleur: string;

      if (usagerLieuResidence.actif) {
        couleur = 'black';
      } else {
        couleur = 'grey';
      }

      switch (usagerLieuResidence.codeTypeAdresse) {
        case EnumTypeAdresse.PRINC: {
          formattedAddress = '<div><table><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:29px; font-weight:bold;color:' + couleur + ';">Principale&nbsp;: </div></td><td>';// +

          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';

          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }


          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }

          + '</td></tr></table></div>';
          break;
        }
        case EnumTypeAdresse.SECOND: {
          formattedAddress = '<div><table cellspacing="0"><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:20px;font-weight:bold;color:' + couleur + ';">Secondaire&nbsp;: </div></td><td>';


          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';

          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }
          + '</td></tr></table></div>';
          break;
        }
        case EnumTypeAdresse.TEMP: {
          formattedAddress = '<div><table cellspacing="0"><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:20px;font-weight:bold;color:' + couleur + ';">Temporaire&nbsp;: </div></td><td>';

          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }
          + '</td></tr></table></div>';
          break;
        }
      }
    }
    return formattedAddress;
  }

  /**
   * Format d'un moyen de communication affiché dans la liste de droite.
   * @param usagerCommunication moyen de communication à formater
   */
  formatActionUsagerCommunication(usagerCommunication: UsagerCommDTO) {
    let usCommFormate: string;
    if (usagerCommunication.actif) {
      usCommFormate = "<span style='color:black;font-weight:bold;padding-left:10px;'>" + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    } else {
      usCommFormate = "<span style='color:grey;font-weight:bold;padding-left:10px;'>" + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    }


    let coordFormate = "";
    if (usagerCommunication.coordonnees != null) {
      if (usagerCommunication.codeTypeEquipComm == EnumMoyenCommunication.COURELEC) {
        coordFormate = usagerCommunication.coordonnees;
      } else if (usagerCommunication.codeTypeEquipComm == EnumMoyenCommunication.TEL || usagerCommunication.codeTypeEquipComm == EnumMoyenCommunication.TEL2 ) {
        if (usagerCommunication.coordonnees.includes('#')) {
          let tabCoordonnes = usagerCommunication.coordonnees.split('#');
          coordFormate = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            coordFormate = coordFormate + " Poste " + tabCoordonnes[1];
          }
        } else {
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
        }
      } else if (usagerCommunication.codeTypeEquipComm == EnumMoyenCommunication.TELSAT) {
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
