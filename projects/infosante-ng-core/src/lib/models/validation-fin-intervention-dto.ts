import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { ProjetRechercheDTO } from './projet-recherche-dto';

export class ValidationFinInterventionDTO {

  public validations: ValidationDTO[] = [];
  public codeRefRaisonCpInconnu: string;
  public codeRefCategorieAppelant: string;
  public details: string;
  public codePostalUsagerInconnu: boolean;

  /**Elements utilisés pour la visualisation de l'intervention */
  public nomRefRaisonCpInconnu?: string;
  public nomRefCategorieAppelant?: string;
  public projetRecherches?: ProjetRechercheDTO[];

  opinionProf: string; 
  labelServicesInterprete?: string;
  labelServicesRelaisBell?: string;
  labelDateDebutFiche?: string;
  dateDebutFiche?: Date;
  labelDateFinFiche?: string;
  dateFinFiche?: Date;
  labelDureeCalculee?: string;
  labelDureeCorrigee?: string; 
  detailsDureeCorrigee?: string;

  constructor() {
  }
}
