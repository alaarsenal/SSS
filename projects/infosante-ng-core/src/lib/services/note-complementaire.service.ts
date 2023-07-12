import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ConsultationNoteComplDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-note-compl-dto';
import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { ValidFile } from 'projects/sigct-service-ng-lib/src/lib/models/valid-file';
import { DetailsFile } from 'projects/sigct-ui-ng-lib/src/lib/model/details-file';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class NoteComplementaireService {


  private urlBase: string = '';

  private ctxFicheAppel: string = '/fiches-appel/';

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
  ) {


    this.urlBase = window["env"].urlSanteApi;

    httpErrorHandler.createHandleError('NoteComplService'); //Important pour instancier correctement le service
  }



  getListeNoteCompl(idFicheAppel: number): Observable<NoteComplementaireDTO[]> {
    return this.http.get<NoteComplementaireDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + '/notes-complementaires', httpOptions);
  }


  ajouterNoteCompl(idFicheAppel: number, dto: NoteComplementaireDTO): Observable<NoteComplementaireDTO> {
    return this.http.post<NoteComplementaireDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires", dto, httpOptions);
  }

  /**
   * When we load note complementry for edition UI, we need to get out the files's set for this note.
   * 
   * @param idFicheAppel 
   * @param idNote 
   * @returns files
   */
  getAttachedFilesToNote(idFicheAppel: number, idNote: number): Observable<TableFichierDTO[]> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires/" + idNote + "fichiers";
    return this.http.get<TableFichierDTO[]>(url);
  }

  /**
   * For UI consultation we fetch notes complementaries and their files set
   * 
   * @param idFicheAppel 
   * @returns Wrapper for notes complementaries and their files set
   */
  obtainNotesAndTheirAttachedFiles(idFicheAppel: number): Observable<ConsultationNoteComplDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires/fichiers";
    return this.http.get<ConsultationNoteComplDTO>(url);
  }

  validateFile(idFicheAppel: number, file: File): Observable<ValidFile> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires/fichiers/valider";
    const data: FormData = new FormData();
    data.append('file', file);

    return this.http.post<ValidFile>(url, data);
  }

  getLinktelechargement(idFicheAppel: number, fileId: number) {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires/fichiers/" + fileId + "/telechargelink";
    return url;
  }

  saveNoteAndboundFiles(note: NoteComplementaireDTO, fileObjects: File[], detailsDataFiles: DetailsFile[], idFicheAppel: number, idFilesToDelete: number[]): Observable<NoteComplementaireDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + "/notes-complementaires/fichiers";

    const data: FormData = new FormData();
    for (var file of fileObjects) {
      data.append('files', file);
    }

    data.append('noteComplDTO', encodeURIComponent(JSON.stringify(note)));
    data.append('detailsFilesJson', encodeURIComponent(JSON.stringify(detailsDataFiles)));
    data.append('idFilesToDelete', JSON.stringify(idFilesToDelete));

    return this.http.post<NoteComplementaireDTO>(url, data);
  }

}
