import { Injectable } from '@angular/core';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { nam_validator } from 'projects/sigct-ui-ng-lib/src/lib/utils/nam-validator';
import { NiveauIdentificationUsager } from '../enums/niveau-identification-usager-enum';
import { UsagerCommDTO } from '../models/usager-comm-dto';
import { UsagerDTO } from '../models/usager-dto';
import { UsagerLieuResidenceDTO } from '../models/usager-lieu-residence-dto';






@Injectable({
  providedIn: 'root'
})
export default class UsagerUtils {
  /**
   * Calcule le niveau d'identification de l'usager selon son contenu.
   * 
   * L'usager est totalement identifié = "TOTAL".
   * Dès que les 5 champs suivants sont remplis (Nom, prénom, date de naissance, Sexe et une autre information) = "TOTAL" 
   *
   * Autre information = moyen de communication, NAM avec ou sans la date d'expiration, code postal complet, nom et prénom de la mère, nom et prénom du père, adresse ajouté avec champ adresse.
   * 
   * L'usager est partiellement identifié = "PARTIEL"
   * Dès que le nom et le prénom sont indiqués mais dès qu'il manque un champ (4 champs obligatoires) = "PARTIEL" 
   * Les deux champs en plus du Nom et du prénom sont parmis : date de naissance, Sexe et une autre information.
   * Autre information = moyen de communication, NAM avec ou sans la date d'expiration, code postal complet, nom et prénom de la mère, nom et prénom du père, adresse ajouté avec champ adresse.
   * NIVEAU_IDENT prend la valeur "PARTIEL" 
   * 
   * 
   * L'usager n'est pas identifié = "ANONYME"
   * 
   * Tous les autres cas : 
   * -	Dès qu'il manque le nom et/ou le prénom peu importe les autres champs complétés = "ANONYME"
   * -	Si le nom et le prénom sont saisis mais qu'il manque deux informations dans les champs obligatoires = "ANONYME"
   * 
   * NB: Les données archivées ne sont pas utilisées pour identifier un usager.
   * 
   * @param usagerDto 
   * @param listeUsagerCommDto liste des communications de l'usager
   * @param listeLieuResidenceDto liste des adresses de l'usager
   * @returns NiveauIdentificationUsager
   */
  static calculerNiveauIdent(usagerDto: UsagerDTO, listeUsagerCommDto: UsagerCommDTO[], listeLieuResidenceDto: UsagerLieuResidenceDTO[]): NiveauIdentificationUsager {
    const hasNomPrenom: boolean = !StringUtils.isEmpty(usagerDto.nom) && !StringUtils.isEmpty(usagerDto.prenom);
    if (!hasNomPrenom) {
      return NiveauIdentificationUsager.ANONYME;
    }

    let nbComm: number = 0;
    if (listeUsagerCommDto) {
      nbComm = listeUsagerCommDto.filter(comm => comm.actif).length;
    }

    let nbAdr: number = 0;
    let codePostalLength: number = 0;
    if (listeLieuResidenceDto) {
      let listeAdr: UsagerLieuResidenceDTO[] = listeLieuResidenceDto.filter(lieuRes => lieuRes.actif && (lieuRes.codePostal || lieuRes.noCiviq || lieuRes.noCiviqSuffx || lieuRes.rue));
      nbAdr = listeAdr.length;

      if (nbAdr > 0) {
        // Longueur du code postal le plus long
        codePostalLength = Math.max(...listeAdr.map(adr => adr.codePostal ? adr.codePostal.length : 0));
      }
    }

    const hasAdresse: boolean = (nbAdr > 0); // adresse ajouté avec champ adresse
    const hasCodePostalComplet: boolean = (codePostalLength === 6); // code postal complet
    const hasDtNaiss: boolean = usagerDto.dtNaiss != null;
    const hasMoyenCommunication: boolean = (nbComm > 0); // 1 moyen de communication
    const hasNamValide: boolean = this.isNamValid(usagerDto.nam); // NAM avec ou sans la date d'expiration
    const hasNomPrenomMere: boolean = !StringUtils.isEmpty(usagerDto.nomMere) && !StringUtils.isEmpty(usagerDto.prenomMere); // nom et prénom de la mère 
    const hasNonPrenomPere: boolean = !StringUtils.isEmpty(usagerDto.nomPere) && !StringUtils.isEmpty(usagerDto.prenomPere); // nom et prénom du père
    const hasSexe: boolean = usagerDto.sexeCode != null;

    if (hasNomPrenom && hasDtNaiss && hasSexe && (hasMoyenCommunication || hasNamValide || hasCodePostalComplet || hasNomPrenomMere || hasNonPrenomPere || hasAdresse)) {
      return NiveauIdentificationUsager.TOTAL;
    } else {
      return NiveauIdentificationUsager.PARTIEL;
    }
  }

  static isNamValid(nam: string): boolean {
    let isNamValid: boolean = false;
    let namFormat: string;
    if (nam?.length == 12) {
      namFormat = nam.substring(0, 4) + "-" + nam.substring(4, 8) + "-" + nam.substring(8, 12)

      if (nam_validator(namFormat)) {
        isNamValid = true;
      }
    }
    return isNamValid;
  }

}
