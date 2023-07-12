/**
 * Il s'agit d'une représentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.UsagerOrganismeEnregistreurDTO
 */
export class OrganismeDTO {
    public id: number;
    public idOrganisme: number;
    public nomOrganisme: string;
    public codeOrganismeRRSS: string;
    public codeOrganismeMG: string;
    public idSite: number;
    public nomSite: string;
    public codeSiteRRSS: string;
    public codeSiteMG: string;
    public type: string;
    public typeSante: boolean;
    public typeSocial: boolean;
    public gestionnaire: string;
    public nomGestionnaire: string;
    public raison: string;
    public commentaires: string;
    public dateDebut: Date;
    public dateFermeturePrevue: Date;
    public dateFermetureEffective: Date;
    public fermetureFullDisplayName: string;
    public fermeture: boolean;
    public modifiable: boolean = true;
    public numeroDossier: string;

    constructor() {
    }
}
