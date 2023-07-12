export class ProtocoleDTO {
    id?: number;
    idFicheAppel: number;
    libelle: string;
    refDocumentDrupal: number;
    titre: string;
    versionDoc: number;
    idDocIdent?: number;
    checkedPuceOrSousSection?: boolean;
    erreurs?: Map<string, string>;
    typeDocument?: string;
}