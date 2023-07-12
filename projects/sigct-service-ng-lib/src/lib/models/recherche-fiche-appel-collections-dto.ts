import { InputOptionCollection } from "../../../../sigct-ui-ng-lib/src/lib/utils/input-option";

export class RechercheFicheAppelCollectionsDTO {
  // Fiche appel
  public listeRoleAction: InputOptionCollection;
  public listeRaisonAppel: InputOptionCollection;
  public listeLangueAppel: InputOptionCollection;
  public listeIntervenant: InputOptionCollection;
  public listeOrganisme: InputOptionCollection;
  public listeNiveauUrgence: InputOptionCollection;
  public listeReference: InputOptionCollection;
  public listeOrientation: InputOptionCollection;
  public listeAucuneSuite: InputOptionCollection;
  public listeAucuneInteraction: InputOptionCollection;
  public listeCentreActivite: InputOptionCollection;

  // Usager
  public listeLangueUsage: InputOptionCollection;
  public listeMalentendant: InputOptionCollection;
  public listeRegion: InputOptionCollection;
  public listeSexe: InputOptionCollection;
  public listeGroupeAge: InputOptionCollection;

  // Appelant
  public listeCategorieAppelant: InputOptionCollection;

  // Note complémentaire
  public listeTypeNote: InputOptionCollection;
  public listeIntervenantNote: InputOptionCollection;

  constructor() {
  }
}
