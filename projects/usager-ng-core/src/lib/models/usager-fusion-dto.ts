import { Fusion } from './fusion-interface';
import { UsagerCommDTO } from './usager-comm-dto';
import { UsagerDTO } from './usager-dto';
import { UsagerLieuResidenceDTO } from './usager-lieu-residence-dto';

/**
 * Classe représentant une fusion d'usagers.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.UsagerIdentFusionDTO
 */
export class UsagerFusionDTO extends UsagerDTO implements Fusion {
  idSource1: number;
  idSource2: number;

  dateDebutFusion: Date;

  listeCommunication: UsagerCommDTO[] = [];
  listeLieuResidence: UsagerLieuResidenceDTO[] = [];

  // Les champs suivants sont propres à Angular
  expiration: string;          // Concaténation de anneeExpr et moisExpr
  nomPrenomMere: string;       // Concaténation de prenomMere et nomMere
  nomPrenomPere: string;       // Concaténation de prenomPere et nomPere
  malentendantTxt: string;     // Version string de malentendant
  doublonPotentielTxt: string; // Version string de doublonPotentiel

  constructor() {
    super();
  }
}