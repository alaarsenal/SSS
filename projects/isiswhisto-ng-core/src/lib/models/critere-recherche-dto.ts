
/**
 * Classe contenant les critères de recherche d'un fiche d'appel ISISW.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.isiswhisto.model.solr.CritereRechercheDTO
 */
export class CritereRechercheDTO {
    public idAppel: number;
    public dateAppelMin: Date;
    public dateAppelMax: Date;
    public dateNaissance: Date;
    public nom: string;
    public prenom: string;
    public sexeCode: string;
    public idRegion: number;
    public idRegionTraitAppel: number;
    public createdUsername: string;
    public telephone: string;

    // public criteresPagination: CriteresPagination;
    // public nbRows: number;

    public sortDirection: string;
    public sortField: string;

    public page: number;
    public pageSize: number;

    public nbMaxRows: number = 500;
}
