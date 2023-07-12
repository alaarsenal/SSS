/**
 * Classe contenant les critères de recherche des fusions d'usagers + la pagination en cours. Elle sert à garder en mémoire la dernière recherche.
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.support.RapportUsagerFusionDTO
 */
 export class RapportUsagerFusionDTO {
  idUsagerFusion: number;
  dateHeureFusion: Date;

  idUsagerIdentOrigine1: number;
  nomPrenomUsagerIdentOrigine1: string;

  idUsagerIdentOrigine2: number;
  nomPrenomUsagerIdentOrigine2: string;

  idUsagerIdentResultat: number;
  nomPrenomUsagerIdentResultat: string;

  usernameIntervenantFusion: string;
  nomPrenomIntervenantFusion: string;

  idStOrganismesFusion: number;
  nomOrganismeFusion: string;
}