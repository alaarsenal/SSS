/**
 * Classe contenant les critères de recherche pour suivir les enregistrements.
 */
export class RechercheSuiviEnregistrementCritereDTO {

  public static CACHED_CRITERES_KEY = "rechercherSuiviEnregistrementsCritere"
  public static FERMER_AVANT = 'fermer_avant_le';
  public static REVISER_AVANT = 'reviser_avant_le';
  public static TOUS = 'tous';
  public static INPUT_OPTIONS_TYPES =[ {
    label: "Sélectionnez...",
    value: ""
  },
  {
    label: "Tous",
    value: RechercheSuiviEnregistrementCritereDTO.TOUS
  },
  {
    label: "À fermer avant le",
    value: RechercheSuiviEnregistrementCritereDTO.FERMER_AVANT
  },
  {
    label: "À réviser avant le",
    value: RechercheSuiviEnregistrementCritereDTO.REVISER_AVANT
  }];

  public date: Date = new Date();

  public typeAlert: string;

  public idSite: number;

  public idGestionaire: string;

}
