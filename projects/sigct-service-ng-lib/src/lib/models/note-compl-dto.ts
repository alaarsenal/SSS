import { ListeAvertissementDTO } from './liste-avertissement-dto';

export class NoteComplementaireDTO extends ListeAvertissementDTO {
    id?: number;
    notecompl?: string;
    typeNoteCode?: string;
    langueAppelCode?: string;
    interlocuteurCode?: string;
    dureeCorrigee?: number; 
	dateDebut?: Date;
    dateFin?: Date;
    details?: string;
    idFicheAppel: number;
    usernameIntervenant?: string;
    signature?: string;
    langue?: string;
    typeNote?: string;
    interlocuteur: string;
    strDureeCalculee: string;
    strDureeCorrigee: string;
    testeCodeTypeNote?: string;
    strTypeNoteCode?: string;
    strLangueAppelCode?: string;
    strInterlocuteurCode?: string;
    listeVisible?: boolean;
    consentementenFicheEnregistreur: boolean = false;

}