/**
 * Classe représentant un antecedent
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.RoleActionDTO
 */
export class RoleActionDTO {

    id?: number;
    referenceRoleActionCode?: string;
    referenceRoleActionNom?: string;
    referenceRoleActionCodeCn?: string;
    idFicheAppel?: number;
    execution?: string;
    valid?: boolean;

    erreurs?: [];

    public validationsFinales?: Map<string, string>;
    public avertissements?: Map<string, string>;
    public erreursFinales?: Map<string, string[]>;

}
