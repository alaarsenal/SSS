/**
 * Classe représentant un antecedent
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.RaisonAppelDTO
 */
export class RaisonAppelDTO {

    id?: number;
    referenceRaisonAppelCode?: string;
    referenceRaisonAppelNom?: string;
    referenceRaisonAppelCodeCn?: string;
    idFicheAppel?: number;
    execution?: string;
    valid?: boolean;

    erreurs?: [];

    public validationsFinales?: Map<string, string>;
    public avertissements?: Map<string, string>;
    public erreursFinales?: Map<string, string[]>;

}
