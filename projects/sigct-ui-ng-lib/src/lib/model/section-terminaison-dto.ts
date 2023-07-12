import { ProjetRechercheDTO } from 'projects/infosante-ng-core/src/lib/models/projet-recherche-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { ConsultationInteractionDTO } from './section-interaction-dto';

export class SectionTerminaisonDTO extends GenericSectionImpressionDTO {

  //Donnees section validations fin intervention
  validations: ValidationDTO[] = [];
  details: string;
  opinionProf: string;

  //Donnees section resume intervention
  raisonsIntervention?: RaisonAppelDTO[];
  rolesAction?: RoleActionDTO[];
  centreActivite?: ReferenceDTO;
  langueIntervention?: ReferenceDTO;

  //Donnees section services utilises
  labelServicesInterprete: string;
  labelServicesRelaisBell: string;
  detailsInterprete?: string;
  detailsRelaisBell?: string;

  //Donnees section duree fiche
  labelDateDebutFiche: string;
  dateDebutFiche: Date;
  labelDateFinFiche: string;
  dateFinFiche: Date;
  labelDuree: string;
  labelDureeCalculee: string;
  labelDureeCorrigee: string;
  detailsDureeCorrigee: string;
  dateCreationFiche: Date;
  dateFinSaisieDiffereeFiche: Date;
  saisieDifferee: boolean;

  //Donnes section interaction
  interaction: ConsultationInteractionDTO;

  public codeRefRaisonCpInconnu: string;
  public codeRefCategorieAppelant: string;
  public codePostalUsagerInconnu: boolean;

  /**Elements utilisés pour la visualisation de l'intervention */
  public nomRefRaisonCpInconnu?: string;
  public nomRefCategorieAppelant?: string;
  public projetRecherches?: ProjetRechercheDTO[];
}
