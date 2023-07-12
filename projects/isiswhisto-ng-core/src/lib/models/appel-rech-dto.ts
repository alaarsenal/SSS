/**
 * Classe contenant les critères de recherche d'un fiche d'appel ISISW.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.isiswhisto.model.solr.AppelRechDTO
 */
 export class AppelRechDTO {
    callId: string;
    firstName: string;
    genderCode: string;
    lastName: string;
    princPhoneNumber: string;
    regionName: string;
    postalCode: string;
    beginCall: string;
}
