import { CriteresUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import { RechercheUsagerCritereDoublonDTO } from './recherche-usager-critere-doublon-dto';

/**
 * Classe contenant les critères de recherche d'usagers + la pagination en cours. Elle sert à garder en mémoire la dernière recherche.
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.solr.SCritereRechercheUsager
 */
export class RechercheUsagerCritereDTO extends CriteresUsagerDTO {
  // Voir CriteresUsagerDTO

  /** Critères de recherche à partir de la sélection d'un doublon */
  public critereDoublon?: RechercheUsagerCritereDoublonDTO;

  /** Nombre maximum de lignes à retourner */
  public nbRows: number;

  public pageIndex: number;
  public pageSize: number;
  public length: number = 0;
}