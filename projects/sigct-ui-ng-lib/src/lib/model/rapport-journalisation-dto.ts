import { TypeRapportJournalisationUtilisateur } from './type-rapport-journalisation-utilisateur-enum';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';

/**
 * Représentation javascript de la classe ca.qc.gouv.msss.sigct.commons.model.support.RapportJournalisationDTO
 */
export class RapportJournalisationDTO {
  identifiant?: number;
  dateDebut?: Date;
  dateFin?: Date;
  idAppel?: number;
  nomUsagerHisto?: string;
  prenomUsagerHisto?: string;
  nomRapport?: string;
  contenu?: any[];
  erreurs?: Map<string, string>;

  //Données Rapport Journal Utilisateur
  codeUtilisateur?: string;
  typeRapportUtilisateur?: TypeRapportJournalisationUtilisateur

  /**Les listes ci-dessous contiennent des données du module US, que SA et
   * SO ne peuvent pas accèder directement via backend, vu qu'il n'existe pas
   * encore cette possibilité dans SIGCT. Donc on passe par le frontend pour
   * consulter des données d'un module, dont les ids sont utilisés, par conséquent,
   * sauvegardés dans un autre module.
   */
  moyensCommunication?: ReferenceDTO[];
  typesCoordMoyenCommunication?: ReferenceDTO[];
}
