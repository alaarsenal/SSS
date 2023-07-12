import { CriteresPagination } from "projects/sigct-ui-ng-lib/src/lib/components/table-pagination/criteres-pagination";

/**
 * Classe contenant les critères de recherche des fusions d'usagers + la pagination en cours. Elle sert à garder en mémoire la dernière recherche.
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.support.RechercheUsagerFusionCritereDTO
 */
export class RechercheFusionUsagerCritereDTO {
  public dateDebut: Date;
  public dateFin: Date;
  public idUsagerIdent: number;
  public usernameIntervenantFusion: string;
  public idStOrganismesFusion: number;

  public criteresPagination: CriteresPagination;
}