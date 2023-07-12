import { ReferenceDTO } from './reference-dto';

/**
 * Classe représentant un appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.fiche.model.support.AppelDTO
 */
export class AppelDTO {
    id: number;
    codeAppel: string;
    details?: string;
    dtDebut: Date;
    dtFin: Date;
    nomInterprete: string;
    telephoneCti: string;
    triage: string;
    usernameIntervenant: string;
    utilServcInterprete: string;
    utilServcRelaisBell: string;

    referenceCentreActivite: ReferenceDTO;
    referenceLangueAppel: ReferenceDTO;
    referenceLigneComm: ReferenceDTO;
    referenceTypeCommunication: ReferenceDTO;

    saisieDifferee: boolean = false;

    fileCti: string;
    idInteraction: string;
    dureeInteraction: string;
    dureeComplete: number;

    public validationsFinales: Map<string, string>;
    public avertissements: Map<string, string>;
    public erreursFinales: Map<string, string[]>;

    constructor() { }
}
