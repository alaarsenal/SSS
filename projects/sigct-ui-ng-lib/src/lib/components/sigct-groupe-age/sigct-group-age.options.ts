export class GroupeAgeOptions {
  annees?: string = null;
  mois?: string = null;
  jours?: number = null;
  groupeId?: number = null;
  groupe?: string = "";
  dateNaissance?: Date = null;

  /**Ceci a été ajouté afin de eviter de convertir inutillement
   * les données ci-dessous vu que ce sont des number dans FicheAppelDTO et dans la BD  */
  anneesNumber?: number;
  moisNumber?: number;
  joursNumber?: number;
}
