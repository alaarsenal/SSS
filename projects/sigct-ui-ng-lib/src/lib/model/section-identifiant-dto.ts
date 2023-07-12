import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';

export class SectionIdentifiantDTO extends GenericSectionImpressionDTO {
  labelIdentifiantUsager: string;
  labelIdentifiantFicheAppel: string;
  labelIdentifiantAutresFichesAppel: string;
  idFicheAppel: number;
  idUsagerIdent: number;
  autresFichesReliees: string;
  dureeCompleteAppel: string;
}
