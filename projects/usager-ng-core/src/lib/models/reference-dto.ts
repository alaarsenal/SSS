import { ListeAvertissementDTO } from './liste-avertissement-dto';

export class ReferenceDTO extends ListeAvertissementDTO{
    id : number;
    code: string;
    codeCn?: string;
    nom: string;
    simpleNom: string;
    description : string;
    tri : number;
    min? : number;
    max? : number;
    actif?: boolean = true;
  }