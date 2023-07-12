import { RrssDTO } from '../rrss/rrss-dto';

export class AppelantDTO {
    id: number = null;
    nom: string = "";
    prenom: string = "";
    details: string = "";
    idAppel: string = null;
    rrssDTO: RrssDTO = new RrssDTO();

    validationsFinales: Map<string, string>;
    avertissements: Map<string, string>;
    erreursFinales: Map<string, string[]>;

    constructor() { }
}
