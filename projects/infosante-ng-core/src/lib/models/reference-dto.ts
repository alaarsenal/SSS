import { ListeAvertissementDTO } from './liste-avertissement-dto';

/**
 * Classe représentant une donnée d'une table de référence. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.ReferenceDTO
 */
export class ReferenceDTO extends ListeAvertissementDTO {
    id : number;
    code: string;
    nom: string;
    simpleNom: string;
    description : string;
    tri : number;
    min? : number;
    max? : number;
  }