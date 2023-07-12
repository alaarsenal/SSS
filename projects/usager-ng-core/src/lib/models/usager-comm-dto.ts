import { ListeAvertissementDTO } from './liste-avertissement-dto';

export class UsagerCommDTO extends ListeAvertissementDTO {
  actif: boolean = true;
  coordonnees: string = "";
  numero: string = "";
  poste: string = "";
  courriel: string = "";
  detail: string = "";
  id: number;
  idTypeCoordComm: number;
  idTypeEquipComm: number;
  idUsagerIdentification: number;
  nomTypeCoordComm: string;
  nomTypeEquipComm: string;
  codeTypeEquipComm: string;
  codeTypeCoordComm: string;
  idIdentifLinkedUsager: number;

  public equals(obj: UsagerCommDTO): boolean {
    let equals: boolean = (obj != undefined && obj != null);
    equals = equals && (this.coordonnees ? obj.coordonnees && this.coordonnees == obj.coordonnees : !obj.coordonnees);
    equals = equals && (this.numero ? obj.numero && this.numero == obj.numero : !obj.numero);
    equals = equals && (this.poste ? obj.poste && this.poste == obj.poste : !obj.poste);
    equals = equals && (this.detail ? obj.detail && this.detail == obj.detail : !obj.detail);
    equals = equals && (this.id ? obj.id && this.id == obj.id : !obj.id);
    equals = equals && (this.idUsagerIdentification ? obj.idUsagerIdentification && this.idUsagerIdentification == obj.idUsagerIdentification : !obj.idUsagerIdentification);
    equals = equals && (this.courriel ? obj.courriel && this.courriel == obj.courriel : !obj.courriel);
    equals = equals && (this.codeTypeEquipComm ? obj.codeTypeEquipComm && this.codeTypeEquipComm == obj.codeTypeEquipComm : !obj.codeTypeEquipComm);
    equals = equals && (this.codeTypeCoordComm ? obj.codeTypeCoordComm && this.codeTypeCoordComm == obj.codeTypeCoordComm : !obj.codeTypeCoordComm);
    return equals;
  }
}