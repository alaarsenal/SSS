import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';

export class AppelantCommDTO {
    id: number = null;
    idTypeEquip: number = null;
    codeTypeEquip?: string;
    nomTypeEquip?: string;
    idCombinedToCodeTypeEquip: string;
    idTypeCoord: number = null;
    codeTypeCoord: string;
    nomTypeCoord?: string;
    idCombinedToCodeTypeCoord: string;
    numero?: string;
    poste?: string;
    courriel?: string ;
    detail?: string;
    coordonnees?: string;
    idAppelant: number = null;
    actif: boolean = true;
    separator: string = "#";
    
    constructor() { }

    public isDirty(): boolean {
      let isidCombinedToCodeTypeEquip: boolean = this.idCombinedToCodeTypeEquip != null && this.idCombinedToCodeTypeEquip != undefined;
      let isidCombinedToCodeTypeCoord: boolean = this.idCombinedToCodeTypeCoord != null && this.idCombinedToCodeTypeCoord != undefined;

      let isCommValid: boolean = (this.numero != null && this.numero != undefined && this.numero !== " " && this.numero.length !=0 && this.poste!= null && this.poste != undefined && this.poste !== " " && this.poste.length !=0)
      || (this.numero != null && this.numero != undefined && this.numero !== " " && this.numero.length !=0)
      || (this.courriel!= null && this.courriel != undefined && this.courriel !== " " && this.courriel.length !=0)
      || (this.detail!= null && this.detail != undefined && this.detail !== " " && this.detail.length !=0)

      return isidCombinedToCodeTypeEquip && isidCombinedToCodeTypeCoord && isCommValid;
    }

  public static  fetchMissedPropertiesFromReferencesDto(typeEquipRefs: ReferenceDTO[], typeCoordRefs: ReferenceDTO[], appelantCommDTO: AppelantCommDTO): AppelantCommDTO {
    let typeEquipRef = typeEquipRefs.find(ref => ref.id == appelantCommDTO.idTypeEquip);
    let typeCoordRef = typeCoordRefs.find(ref => ref.id == appelantCommDTO.idTypeCoord);

    appelantCommDTO.nomTypeEquip = typeEquipRef.nom;
    appelantCommDTO.codeTypeEquip = typeEquipRef.code;
    appelantCommDTO.idCombinedToCodeTypeEquip = typeEquipRef.id + "#" + typeEquipRef.code;

    appelantCommDTO.nomTypeCoord = typeCoordRef.nom;
    appelantCommDTO.codeTypeCoord = typeCoordRef.code;
    appelantCommDTO.idCombinedToCodeTypeCoord = typeCoordRef.id + "#" + typeCoordRef.code;
  
    return appelantCommDTO;
  }

  public burstCombinedIdAndCode() {
    if(this.idCombinedToCodeTypeEquip != null) {
    let partsTypeEquip = this.idCombinedToCodeTypeEquip.split(this.separator);
    this.idTypeEquip = +partsTypeEquip[0];
    this.codeTypeEquip = partsTypeEquip[1];
    }

    if(this.idCombinedToCodeTypeCoord != null) {
    let partsTypeCoord = this.idCombinedToCodeTypeCoord.split(this.separator);
    this.idTypeCoord = +partsTypeCoord[0];
    this.codeTypeCoord = partsTypeCoord[1];
    }
    return this;
  }
}
