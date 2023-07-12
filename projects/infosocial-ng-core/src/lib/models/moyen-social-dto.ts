export class MoyenSocialDTO {
    id: number;
    idDocumentIdentificationSocial: number;
    nomDocumentIdentificationSocial: string;
    codeDocumentIdentificationReferenceDocumentTypeSocial: string;

    idFicheAppel: number;

    avertissements: Map<string, string>;  

    constructor() { }
}
