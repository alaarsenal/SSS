import { ProjetRechercheDTO } from 'projects/infosante-ng-core/src/lib/models/projet-recherche-dto';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { GenericSectionImpressionDTO } from '../../model/generic-section-impression-fiche-dto';
import { ConsultationInteractionDTO } from '../../model/section-interaction-dto';
import { ValidationDTO } from '../indicateurs-fin-intervention/validation-dto';

export class ConsultationFicheSectionTerminaisonDTO extends GenericSectionImpressionDTO {

  //Donnees section resume intervention
  raisonsIntervention?: RaisonAppelDTO[];
  rolesAction?: RoleActionDTO[];
  centreActivite?: ReferenceDTO;
  langueIntervention?: ReferenceDTO;

  //Donnees section services utilises
  servicesInterprete?: number;
  servicesRelaisBell?: number;
  detailsInterprete?: string;
  detailsRelaisBell?: string;

  //Donnees section duree fiche
  dureeFiche?: DureeFicheAppelDTO;

  //Donnees section interaction
  interaction?: ConsultationInteractionDTO;

  public validations: ValidationDTO[] = [];
  public codeRefRaisonCpInconnu: string;
  public codeRefCategorieAppelant: string;
  public details: string;
  public codePostalUsagerInconnu: boolean;

  /**Elements utilisés pour la visualisation de l'intervention */
  public nomRefRaisonCpInconnu?: string;
  public nomRefCategorieAppelant?: string;
  public projetRecherches?: ProjetRechercheDTO[];

  opinionProf?: string;
  dateDebutFiche?: Date;
  dateFinFiche?: Date;
  labelDuree?: string;
  labelDureeCalculee?: string;
  labelDureeCorrigee?: string;
  detailsDureeCorrigee?: string;
  dateCreationFiche?: Date;
  dateFinSaisieDiffereeFiche?: Date;
  saisieDifferee?: boolean;

  labelServicesInterprete?: string;
  labelServicesRelaisBell?: string;

}
