import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { ConsultationIsiswDonneesNoteComplementaireDTO } from './consultation-isisw-donnees-note-complementaire-dto';

export class ConsultationIsiswNotesComplementaireDTO extends GenericSectionImpressionDTO {

  listeNoteComplementaires: ConsultationIsiswDonneesNoteComplementaireDTO[];
}
