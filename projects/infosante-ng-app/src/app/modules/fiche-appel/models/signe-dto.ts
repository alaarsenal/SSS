/**
 * Classe représentant un signe vital
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.SigneDTO
 */
export class SigneDTO {
    id?: number;
    ficheAppelId: number;
    dateDemandeEvaluation?: Date;
    details?: string;
    detailDemandeEvaluation?:string;
    heures?: string;
    referenceTemperatureVoieId?: number;
    referenceTemperatureVoieNom?: string;
    glasgow?: number;
    glycemie?: string;
    frequenceCardiaque?: number;
    frequenceRespiratoire?: number;
    saturationPrecision?: string;
    saturationTaux?: number;
    tensionArterielleMax?: string;
    tensionArterielleMin?: string;
    temperatureUniteMesure?: string;
    infoBullTemperatureUniteMesure?: string;
    temperatureConvertie?: string;
    temperatureValeur?: number;
    temperatureValeurStr?: string;
}
