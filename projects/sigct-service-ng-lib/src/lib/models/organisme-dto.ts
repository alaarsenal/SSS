/**
 * Classe représentant un organisme.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.commons.model.support.OrganismeDTO
 */
export class OrganismeDTO {
    id: number;
    nom: string;
    publiccode: string;
    region: number;
    etablissement: number;
    categorieOrganisme: number;
    actif: boolean;
    codeRRSS: string;
    codeMG: string;
    nbSites: number;
}