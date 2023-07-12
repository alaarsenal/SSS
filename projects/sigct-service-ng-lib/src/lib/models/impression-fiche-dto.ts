import { StatutFicheAppelEnum } from './statut-fiche-appel.enum';
import { SectionSignatureDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-signature-dto';
import { SectionIdentifiantDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-identifiant-dto';
import { SectionNoteComplementaireDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-note-complementaire-dto';
import { SectionIdentificationUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-identification-usager-dto';
import { SectionCommunicationUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-communication-usager-dto';
import { SectionAdresseUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-adresse-usager-dto';
import { SectionInformationSuppDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-information-supp-dto';
import { SectionAppelantInitialDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-appelant-initial-dto';
import { SectionFichiersDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-fichiers-dto';

export class ImpressionFicheDTO {

  idFicheAppel: number;
  idAppel: number;
  statutFicheAppel: StatutFicheAppelEnum;
  fileName?: string;
  fileContent?: any[];

  sectionIdentificationUsager: SectionIdentificationUsagerDTO;
  sectionCommunicationUsager: SectionCommunicationUsagerDTO;
  sectionInformationsSupp: SectionInformationSuppDTO;
  sectionAdresseUsager: SectionAdresseUsagerDTO;
  sectionAppelantInitial: SectionAppelantInitialDTO;
  sectionSignature: SectionSignatureDTO;
  sectionIdentifiant: SectionIdentifiantDTO;
  sectionNoteComplementaire: SectionNoteComplementaireDTO;
  sectionFichier: SectionFichiersDTO;

  constructor() {
    this.sectionIdentificationUsager = new SectionIdentificationUsagerDTO();
    this.sectionInformationsSupp = new SectionInformationSuppDTO();
    this.sectionCommunicationUsager = new SectionCommunicationUsagerDTO();
    this.sectionAdresseUsager = new SectionAdresseUsagerDTO();
    this.sectionAppelantInitial = new SectionAppelantInitialDTO();
    this.sectionSignature = new SectionSignatureDTO();
    this.sectionIdentifiant = new SectionIdentifiantDTO();
    this.sectionNoteComplementaire = new SectionNoteComplementaireDTO();
    this.sectionFichier = new SectionFichiersDTO();
  }
}
