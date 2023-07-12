/**
 * Repésentation js de l'enum ca.qc.gouv.msss.sigct.infosante.enums.TypeManifestationSigneDemarcheAnterieure
 */
export enum TypeManifestationSigneDemarcheAnterieureEnum {
     MANIFESTATION = "MANIFESTATION",//
     SIGNE = "SIGNE", //
     AUTOSOIN = "AUTOSOIN", //
     TRAITEMENT = "TRAITEMENT"
}

/**
 * Classe représentant une manifestation, un signe vital, une démarche antérieure de traitement ou une démarche antérieure d'autosoin.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.ConsultationManifestationSigneDemarcheAnterieureDTO
 */
export class ConsultationManifestationSigneDemarcheAnterieureDTO {
     id: number;
     idFicheAppel: number;
     dateDemandeEvaluation: Date;
     detailDemandeEvaluation: string;
     heureDemandeEvaluation: string;

     type: TypeManifestationSigneDemarcheAnterieureEnum; // MANIFESTATION, SIGNE, AUTOSOIN, TRAITEMENT

     // Signes vitaux
     glycemie: string;
     temperatureValeur: number;
     temperatureUniteMesure: string;
     temperatureConvertie: string;
     temperatureVoie: string;
     tensionArterielleMin: string;
     tensionArterielleMax: string;
     frequenceCardiaque: number;
     frequenceRespiratoire: number;
     saturationTaux: number;
     saturationPrecision: string;
     glasgow: number;
     signeDetails: string;

     // Manifestation
     manifestation: string;
     manifestationPresence: boolean;
     manifestationDetails: string;

     // Démarche autosoin
     autosoin: string;
     autosoinResultat: string;
     autosoinDetails: string;

     // Démarche traitement
     traitement: string;
     traitementResultat: string;
     traitementDetails: string;
     traitementRessourceConsulte: string;
} 