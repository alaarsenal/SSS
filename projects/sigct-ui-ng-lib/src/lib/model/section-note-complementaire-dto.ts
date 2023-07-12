import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';
import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import { TableFichierDTO } from '../../../../sigct-service-ng-lib/src/lib/models/TableFichierDTO';

export class SectionNoteComplementaireDTO extends GenericSectionImpressionDTO {

  notes: NoteComplementaireDTO[];
  tableFichierDTOs?: TableFichierDTO[];
}
