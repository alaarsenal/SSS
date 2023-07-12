import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { IndicateursMesuresSecuriteDTO } from './indicateurs-mesures-securite';
import { MedicationDTO } from './medication-dto';
import { OrganismeDTO } from './organisme-dto';
import { RessourceProfessionelleSocialeDTO } from './ressource-pro-dto';
import { SoinServiceDTO } from './soin-service-dto';

export class EnregistrementsUsagerResultatDTO{

    public id:number;
    public idUsager:number;
    public idReferenceProfil:number;
    public idRegion:number;
    public codRegion:string;
    public nomRegion:string;
	  public diagnostic:string;
    public conduite:string;
    public idReferenceMilieuVie:number;
    public allergie:string;
    public precaution:string;
    public commentaire:string;
	  public actif:boolean;
    public dateModifie:Date;
    public dateFermuture:Date;
    public dateCreation:Date;
    public dateRevision:Date;
    public dateAReviser:Date;

    public creeUsername:string;
    public creeFullName:string;
    public creeFullDisplayName:string;
    public creeParOrganisme:string;

    public modifieUsername:string;
    public modifieFullName:string;
    public modifieFullDisplayName:string;
    public modifieParOrganisme:string;

    public revisionUsername:string;
    public revisionFullName:string;
    public revisionFullDisplayName:string;
    public revisionParOrganisme:string;

    public therapieIntraveneuse:string;
    public autreInformation:string;
    public organismeEnregistreurCodeRRSS:string;
    public organismeEnregistreurCodeMG:string;
    public organismeEnregistreurIdOrganisme:number;

    public indicateursMesureSecurite: IndicateursMesuresSecuriteDTO[];
    public soinsEtServices: SoinServiceDTO[];
    public medications: MedicationDTO[];
    public ressourcesProfessionnelles: RessourceProfessionelleSocialeDTO[];
    public organismes: OrganismeDTO[];

    public fichiers: UsagerSanterSocialFichierDTO[];

    public consultable: boolean;

    public modifiable: boolean;

    public copiable: boolean;


    constructor(){
    }
}
