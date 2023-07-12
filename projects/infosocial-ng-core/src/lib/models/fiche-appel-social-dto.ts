import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { ListeAvertissementDTO } from './liste-avertissement-dto';
import { MoyenSocialDTO } from './moyen-social-dto';
import { UsagerDTO } from './usager-dto';


/**
 * Classe représentant une fiche d'appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.FicheAppelSocialDTO
 */
export class FicheAppelSocialDTO extends ListeAvertissementDTO {

  public id: number;
  public codeReferenceTypeFiche: string;
  public nomReferenceTypeFiche: string;
  public accueil: string;
  public analyseSituation: string;
  public codeReferenceDangerSuicide: string;
  public nomReferenceDangerSuicide: string;
  public estimationSuicide: string;
  public codeReferenceRisqueHomicide: string;
  public nomReferenceRisqueHomicide: string;
  public estimationHomicide: string;
  public deba: string;
  public competenceRessource: string;
  public codeReferenceCategorieAppelant: string;
  public difficultePriorisee: string;
  public objectif: string;
  public intervention: string;

  public usager?: UsagerDTO;

  public codeRegion: string;
  public nomRegion: string;

  public idAppel: number;
  public dateDebutAppel?: Date;

  public dateDebut: Date;
  public dateFin: Date;
  public dateCreation: Date;
  public dateFinSaisieDifferee: Date;
  public saisieDifferee: boolean;

  public statut: StatutFicheAppelEnum = StatutFicheAppelEnum.OUVERT;
  public detailsValidation: string;
  public opinionProf: string;

  public aucuneSuite: boolean;
  public autorisationTransmission: boolean;
  public consentementenFicheEnregistreur: boolean;

  public servicesInterprete: number = 0;
  public servicesRelaisBell: number = 1;
  public detailsInterprete: string;
  public detailsRelaisBell: string;

  public referenceCentreActiviteCode: string;
  public referenceLangueAppelCode: string;

  public nomDocumentIdentifications: string[];

  public detailsDureeCorrigee: string;
  public dureeCorrigee: number;
  public dureeCumulee: number;

  public usernameCreation: string;
  public idOrganismeCreation: number;

  public moyensSocialDTOByDocName: Map<string, MoyenSocialDTO>;

  public validationsFinales: Map<string, string>;
  public avertissements: Map<string, string>;
  public erreursFinales: Map<string, string[]>;
  public referenceRaisonTypeInterventionCode: string;
  public referenceRaisonTypeInterventionNom: string;


  constructor() {
    super()
  }

}
