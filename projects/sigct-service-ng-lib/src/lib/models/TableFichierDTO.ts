import { ListeAvertissementDTO } from './liste-avertissement-dto';

/**
 * Classe représentant une donnée d'une table de référence.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.xxxxx.model.support.ReferenceDTO
 */
export class TableFichierDTO extends ListeAvertissementDTO {
    id : number;
    refId: number;
    refVId?: string;
    refTable: string;
    nom: string;
    description : string;
    contenu : any[];
    typeContenu? : string;
    tailleContenu? : number;
    titre?: string;

    file: any;
    idReferenceTypeFichier: number;

    linkTelechargement: string;
  }
