import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { ListeAvertissementDTO } from './liste-avertissement-dto';
import { BaseUsagerDTO } from './base-usager-dto';

export class UsagerDTO extends ListeAvertissementDTO implements BaseUsagerDTO {

  public nam: string;
  public actif: boolean = true;
  public anneeExpr: any = null;
  public detail: string;
  public dtNaiss: Date;
  public doublonPotentiel: boolean;
  public id: number;
  public langueCode: string;
  public langueNom: string;
  public malentendant: boolean = false;
  public moisExpr: any = null;
  public nom: string;
  public nomMere: string;
  public nomPere: string;
  public prenom: string;
  public prenomMere: string;
  public prenomPere: string;
  public sexeId: number;
  public sexeCode: string;
  public sexeNom: string;
  public niveauIdent: string;
  public communication: string;
  public region:string; 
  public codePostal:string;
  public actions:string = null;
  public dtModifie:Date;
  public groupeAgeOptions: GroupeAgeOptions = new GroupeAgeOptions();
  public statusEnregistrement:string;

  constructor() {
    super()
  }
}