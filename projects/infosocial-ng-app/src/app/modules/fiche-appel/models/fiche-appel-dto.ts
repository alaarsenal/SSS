import { ListeAvertissementDTO, UsagerDTO } from 'projects/infosocial-ng-core/src/lib/models';

/**
 * Classe représentant une fiche d'appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.FicheAppelDTO
 */
export class FicheAppelDTO extends ListeAvertissementDTO {

  public id: number;
  public dateDebut: Date;
  public demandeInitiale: string;
  public detailsDureeCorrigee: string;
  public donneesPertinentes: string;
  public dureeCorrigee: number;
  public detailsSoutien: string;
  public constatEvaluation: string;
  public antecedent: number;
  public medication: number;
  public niveauUrgence: string;
  public codeReferenceCategorieAppelant: string;
  public typeConsultation: string;
  public reseauSoutien: string;
  public centreActivite: string;
  public langueAppel: string;
  public intervention: string;
  public aucuneSuite: boolean;
  public autorisationTransmission: boolean;
  public referenceRaisonCPInconnuCode: string
  public referenceCatgrAppelantConclusionCode: string
  public detailsValidation: string;
  public codePostalUsagerInconnu: boolean;
  public referenceCentreActiviteCode: string;
  public referenceLangueAppelCode: string;

  public usager?: UsagerDTO;

  public validationsFinales: Map<string, string>;
  public avertissements: Map<string, string>;

  constructor() {
    super()
  }
}
