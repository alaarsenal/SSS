import { ListeAvertissementDTO } from './liste-avertissement-dto';

export class RapportJournalisationDTO extends ListeAvertissementDTO {
  identifiant?: number;
  dateDebut?: Date;
  dateFin?: Date;
  nomRapport?: string;
  contenu?: any[];
  erreurs?: any[];
}
