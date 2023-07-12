import { RapportUsagerFusionDTO } from "../../../../sigct-service-ng-lib/src/lib/models/rapport-usager-fusion-dto";

/**
 * Classe contenant les critères de recherche des fusions d'usagers + la pagination en cours. Elle sert à garder en mémoire la dernière recherche.
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.support.RechercheUsagerFusionResultatDTO
 */
export class RechercheFusionUsagerResultatDTO {
  public listeRapportUsagerFusionDto: RapportUsagerFusionDTO[] = [];
  public nbTotalElements: number = 0;
}