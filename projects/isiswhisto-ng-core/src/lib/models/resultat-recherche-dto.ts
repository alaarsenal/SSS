import { AppelRechDTO } from "./appel-rech-dto";

/**
 * Classe contenant les critères de recherche d'un fiche d'appel ISISW.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.isiswhisto.model.solr.ResultatRechercheDTO
 */
 export class ResultatRechercheDTO {
    public listeAppel: AppelRechDTO[] = [];
    public nbTotalElements: number = 0;
}
