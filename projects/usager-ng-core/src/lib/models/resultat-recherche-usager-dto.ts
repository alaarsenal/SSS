import { RechercheUsagerResultatDTO } from './recherche-usager-resultat-dto';

/**
 * Classe représentant le résulat de la recherche d'usager. 
 * Elle est basée sur la classe ca.qc.gouv.msss.sigct.usager.model.support.ResultatRechercheUsagerDTO
 */
export class ResultatRechercheUsagerDTO {
  listeUsagers: RechercheUsagerResultatDTO[];
  nbUsagerTotal: number;

  listeDoublons: string[][];
}