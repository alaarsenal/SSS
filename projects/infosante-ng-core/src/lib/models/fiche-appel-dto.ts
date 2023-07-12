import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { ListeAvertissementDTO } from './liste-avertissement-dto';
import { UsagerDTO } from './usager-dto';


/**
 * Classe représentant une fiche d'appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.FicheAppelSanteDTO
 */
export class FicheAppelDTO extends ListeAvertissementDTO {

  public id: number;
  public dateDebut: Date;
  public dateFin: Date;
  public demandeInitiale: string;
  public donneesPertinentes: string;
  public detailsDureeCorrigee: string;
  public dureeCorrigee: number;
  public dureeCumulee: number;
  public detailsSoutien: string;
  public constatEvaluation: string;
  public antecedent: number;
  public medication: number;
  public niveauUrgence: string;
  public codeReferenceCategorieAppelant: string;
  public typeConsultation: string;
  public reseauSoutien: string;
  public referenceCentreActiviteCode: string;
  public referenceLangueAppelCode: string;
  public intervention: string;
  public aucuneSuite: boolean;
  public autorisationTransmission: boolean;
  public consentementenFicheEnregistreur: boolean;
  public referenceRaisonCPInconnuCode: string
  public referenceCatgrAppelantConclusionCode: string
  public detailsValidation: string;
  public codePostalUsagerInconnu: boolean;
  public servicesInterprete: number = 0;
  public servicesRelaisBell: number = 1;
  public detailsInterprete: string;
  public detailsRelaisBell: string;
  public delaiAmelioration: string;
  public referenceRessourceSuiviCode: string;
  public referenceRessourceSuiviNom: string;
  public statut: StatutFicheAppelEnum;

  public idAppel: number;
  public dateDebutAppel?: Date;

  public referenceRaisonTypeFicheCode: string;

  public dateCreation: Date;
  public dateFinSaisieDifferee: Date;
  public saisieDifferee: boolean;

  public usager?: UsagerDTO;

  public usernameCreation: string;
  public idOrganismeCreation: number;

  public validationsFinales: Map<string, string>;
  public avertissements: Map<string, string>;
  public erreursFinales: Map<string, string[]>;

  constructor() {
    super()
  }
}
