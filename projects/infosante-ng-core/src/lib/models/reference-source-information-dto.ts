import { ListeAvertissementDTO } from './liste-avertissement-dto';

/**
 * Classe représentant une donnée de la table de référence Source Information. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.ReferenceSourceInformationDTO
 */
export class ReferenceSourceInformationDTO extends ListeAvertissementDTO {
    id : number;
    code: string;
    codeCn: string;
    nom: string;
    description : string;
    tri : number;
    min? : number;
    max? : number;
    attribut1? : string;
    attribut2? : string;
  }