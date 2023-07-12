/**
 * Classe contenant les critères de recherche pour suivir les enregistrements.
 */
export class RechercheListEnregistrementCritereDTO {

  public static CACHED_CRITERES_KEY = "rechercherListEnregistrementsCritere"

  public idOrganisme: number;

  public idSite: number;

  public idGestionnaire: string;

}
