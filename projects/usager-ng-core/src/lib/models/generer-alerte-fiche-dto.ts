/**
 * Classe contenant les informations nécessaires à la création d'alerte pour un usager d'une fiche d'appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.GenererAlerteFicheDTO
 */
export class GenererAlerteFicheDTO {
    public idUsagerIdent: number;
    public idFicheAppelSante?: number;
    public idFicheAppelSocial?: number;
    public dtAppel: Date;
}