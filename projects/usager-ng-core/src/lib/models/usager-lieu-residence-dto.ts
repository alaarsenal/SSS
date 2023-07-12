import { ListeAvertissementDTO } from './liste-avertissement-dto';

export class UsagerLieuResidenceDTO extends ListeAvertissementDTO {
    actif: boolean = true;
    adresse: string = "";  // No civique + no civique suffixe + rue
    clscCode: string;
    clscNom: string;
    codePostal: string = "";
    codePostalInconnu: boolean = null;
    detail: string = "";
    id: number;
    idAdresseToArchive: number;
    codeCategSubdvImmeu: string;
    codePays: string;
    codeProvince: string;
    codeRegion: string;
    codeTypeAdresse: string = "PRINC";
    idUsagerIdentification: number;
    idRegion:number;
    municCode: string;
    municNom: string = "";
    noCiviq: number;
    noCiviqSuffx: string;
    nomCategSubdvImmeu: string;
    nomPays: string;
    nomProvince: string;
    nomRegion: string;
    nomTypeAdresse: string;
    rlsCode: string;
    rlsNom: string;
    rtsCode: string
    rtsNom: string;
    rue: string = "";
    subdvImmeu: string = "";
    isActionToModifyAdress: boolean = false;
    isSimilarityCheckIsDone: boolean = false;
    idIdentifLinkedUsager: number;

    // /**
    //  * Formate une adresse en assemblant un numéro civique, un suffixe du numéro civique et une rue.
    //  */
    // public static formaterAdresse(noCiviq: number, noCiviqSuffx: string, rue: string): string {
    //     let adresseFormatee: string = "";
    //     if (noCiviq) {
    //         adresseFormatee += noCiviq;
    //     }

    //     if (noCiviqSuffx) {
    //         if (adresseFormatee) {
    //             adresseFormatee += " ";
    //         }
    //         adresseFormatee += noCiviqSuffx;
    //     }

    //     if (rue) {
    //         if (adresseFormatee) {
    //             adresseFormatee += " ";
    //         }
    //         adresseFormatee += rue;
    //     }

    //     return adresseFormatee;
    // }

    public equals(obj: UsagerLieuResidenceDTO): boolean {
        let equals: boolean = (obj != undefined && obj != null);
        equals = equals && (this.codePostal ? obj.codePostal && this.codePostal == obj.codePostal : !obj.codePostal);
        equals = equals && (this.adresse ? obj.adresse && this.adresse == obj.adresse : !obj.adresse);
        equals = equals && (this.municNom ? obj.municNom && this.municNom == obj.municNom : !obj.municNom);
        equals = equals && (this.rlsCode ? obj.rlsCode && this.rlsCode == obj.rlsCode : !obj.rlsCode);
        equals = equals && (this.rtsCode ? obj.rtsCode && this.rtsCode == obj.rtsCode : !obj.rtsCode);
        equals = equals && (this.detail ? obj.detail && this.detail == obj.detail : !obj.detail);
        equals = equals && (this.id ? obj.id && this.id == obj.id : !obj.id);
        equals = equals && (this.idUsagerIdentification ? obj.idUsagerIdentification && this.idUsagerIdentification == obj.idUsagerIdentification : !obj.idUsagerIdentification);
        equals = equals && (this.codeCategSubdvImmeu ? obj.codeCategSubdvImmeu && this.codeCategSubdvImmeu == obj.codeCategSubdvImmeu : !obj.codeCategSubdvImmeu);
        equals = equals && (this.subdvImmeu ? obj.subdvImmeu && this.subdvImmeu == obj.subdvImmeu : !obj.subdvImmeu);
        equals = equals && (this.codePays ? obj.codePays && this.codePays == obj.codePays : !obj.codePays);
        equals = equals && (this.codeProvince ? obj.codeProvince && this.codeProvince == obj.codeProvince : !obj.codeProvince);
        equals = equals && (this.codeRegion ? obj.codeRegion && this.codeRegion == obj.codeRegion : !obj.codeRegion);
        equals = equals && (this.codeTypeAdresse ? obj.codeTypeAdresse && this.codeTypeAdresse == obj.codeTypeAdresse : !obj.codeTypeAdresse);
        equals = equals && (this.municNom ? obj.municNom && this.municNom == obj.municNom : !obj.municNom);
        equals = equals && (this.actif == obj.actif);
        equals = equals && (this.isActionToModifyAdress == obj.isActionToModifyAdress);
        equals = equals && (this.isSimilarityCheckIsDone == obj.isSimilarityCheckIsDone);
        return equals;
    }
}
