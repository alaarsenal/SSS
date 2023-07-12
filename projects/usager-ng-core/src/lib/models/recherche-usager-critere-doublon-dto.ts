import { CriteresUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';

/**
 * Classe contenant les critères de recherche d'usagers + la pagination en cours. Elle sert à garder en mémoire la dernière recherche.
 * Il s'agit d'une copie de la classe ca.qc.gouv.msss.sigct.usager.model.solr.SCritereRechercheUsagerDoublon
 */
export class RechercheUsagerCritereDoublonDTO  {
  // Critères de recherche à partir de la sélection d'un doublon
  public adresse?: string;
  public codePostal?: string;
  public communication?: string;
  public dateNaissance?: string;
  public langueCode?: string;
  public municipalite?: string;
  public nam?: string;
  public nom?: string;
  public nomMere?: string;
  public prenom?: string;
  public prenomMere?: string;
  public regionCode?: string;
  public sexeCode?: string;
}