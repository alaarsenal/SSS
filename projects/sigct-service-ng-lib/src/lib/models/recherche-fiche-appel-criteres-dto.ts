/** Nombre d'items maximum. Au delà de ce nombre, les résultats ne sont pas affichés. */
export const NB_ITEM_MAX: number = 1000;
/** Nombre d'items par page = 50 */
export const NB_ITEM_PAR_PAGE: number = 50;
/** Nombre de caractères saisis minimums pour une recherche = 2 */
export const NB_CAR_MIN_CRITERES: number = 2;

export class RechercheFicheAppelCriteresDTO {
  public domaine: string; // SA ou SO

  public criteresAppel: CriteresAppelDTO = new CriteresAppelDTO();
  public criteresUsager: CriteresUsagerDTO = new CriteresUsagerDTO();
  public criteresAppelant: CriteresAppelantDTO = new CriteresAppelantDTO();
  public criteresNoteComplementaire: CriteresNoteComplementaireDTO = new CriteresNoteComplementaireDTO();

  public nbResultatMax: number = NB_ITEM_MAX;

  public champTri: string = "dtDebutFicheAppel";
  public ordreTri: string = "desc";

  public pageIndex: number = 0; // Index de la page
  public pageSize: number = NB_ITEM_PAR_PAGE;  // Nombre d'items par page

  constructor() {
  }
}

export class CriteresAppelDTO {
  public idFicheAppel: number;
  public dateDebutFicheAppelMin: Date;
  public heureDebutFicheAppelMin: string;
  public dateDebutFicheAppelMax: Date;
  public heureDebutFicheAppelMax: string;
  public idRfRoleAction: number;
  public idRfRaisonAppels: number[];
  public idRfLangueAppel: number;
  public usernameIntervenant: string;
  public idStOrganismes: number;
  public dureeFicheAppelMin: number;
  public dureeFicheAppelMax: number;
  public idRfNivUrgence: number;
  public aucuneSuite: number;
  public idRfReference: number;
  public idRfOrientation: number;
  public idRfCentreActivite: number;

  public roleActionText?: string;
  public raisonAppelTexts?: string[];
  public langueAppelText?: string;
  public referenceText?: string;
  public intervenantText?: string;
  public orientationText?: string;
  public organismeText?: string;
  public nivUrgenceText?: string;
  public centreActiviteText?: string;

  public idInteraction?: string;
  public aucuneInteraction?: boolean;
}

/**
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.solr.SCritereRechercheUsager
 */
export class CriteresUsagerDTO {
  public idUsagerIdent: number;
  public nom: string;
  public prenom: string;
  public dateNaissance: Date;
  public telephone: string;
  public phonetique: Boolean;
  public langueCode: string;
  public nam: string;
  public sexeCode: string;
  public autreMoyenCommunication: string;
  public malentendant: boolean;
  public doublonPotentiel: boolean;
  public codePostal: string;
  public municipalite: string;
  public regionCode: string;
  public adresse: string;
  public colonneTri: string;
  public tri: string;
  public idRfGroupeAge: number;

  public rechercheAvancee: boolean = false;

  public nomMere?: string;
  public prenomMere?: string;
  public communication?: string;
  public listeChampDoublon?: string[] = [];

  public langueUsagerText?: string;
  public sexeUsagerText?: string;
  public regionUsagerText?: string;
  public groupeAgeText?: string;
}

export class CriteresAppelantDTO {
  public nomAppelant: string;
  public prenomAppelant: string;
  public telephoneAppelant: string;
  public nomRrssAppelant: string;
  public idRfCatgrAppelant: number;

  public catgrAppelantText?: string
}

export class CriteresNoteComplementaireDTO {
  public usernameIntervenantNote: string;
  public idOrganismeNote: number;
  public idRfTypeNote: number;
  public dateDebutNoteMin: Date;
  public heureDebutNoteMin: string;
  public dateDebutNoteMax: Date;
  public heureDebutNoteMax: string;
  public dureeNoteMin: number;
  public dureeNoteMax: number;

  public intervenantNoteText?: string;
  public typeNoteTexte?: string;
}

export enum SolrChampTriEnum {
  DATE_DEBUT_FICHE_APPEL,
  SERVICE,
  NOM,
  PRENOM,
  SEXE,
  TELEPHONE,
  REGION,
  CODE_POSTAL,
}

export enum SolrOdreTriEnum {
  asc,
  desc,
}