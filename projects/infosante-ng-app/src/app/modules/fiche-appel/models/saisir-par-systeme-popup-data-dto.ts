import { InputOptionCollection } from "projects/sigct-ui-ng-lib/src/lib/utils/input-option";
import { ReferenceSaisibleEnPopupDTO } from "./reference-saisible-en-popup-dto";

export class SaisirParSystemePopupDataDTO {

  public titreLabel: string;
  public ajouterLabel: string;
  public anulerLabel: string;
  public fermerLabel: string;
  public systemeLabel: string;
  public nomLabel: string;
  public presenceLabel: string;
  public absenceLabel: string;
  public detailsLabel: string;
  public msgSaisirObligatoire: string;
  public msgPresenceObligatoire: string;

  public inputOptionsSystemes: InputOptionCollection = {
                                                          name: 'type',
                                                          options: []
                                                        };;

  public allReferencesPossibles = new Array<ReferenceSaisibleEnPopupDTO>();

  public doitGarderOrdreDeSaisie: boolean = false;

  onAjouterCallBack: Function;

  onInitListeSystemesCallBack: Function;

  onInitListeAllReferencesPossiblesCallBack: Function;



}
