/**
 * Classe représentant un antecedent
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.ProjetRecherche
 */
export class ProjetRechercheDTO {

    id?: number;
    referenceProjetRechercheCode?: string;
    referenceProjetRechercheNom?: string;
    idFicheAppel?: number;
    actif?: boolean;
    execution?: string;
    valid?: boolean;

    erreurs?: [];

    public validationsFinales?: Map<string, string>;
    public avertissements?: Map<string, string>;
    public erreursFinales?: Map<string, string[]>;

}
