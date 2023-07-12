import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import { TableFichierDTO } from './TableFichierDTO';

export class ConsultationNoteComplDTO {

   /******* Note Complémentaires *********/
  listeNoteCompl: NoteComplementaireDTO[];
  /**************************************/

   tableFichierDTOs?: TableFichierDTO[];
}