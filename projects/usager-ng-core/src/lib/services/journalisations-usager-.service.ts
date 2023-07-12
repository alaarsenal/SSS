import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { RapportJournalisationDTO } from 'projects/usager-ng-core/src/lib/models/rapport-journalisation-dto';
import { Observable } from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable(
  { providedIn: 'root' }
)
export class JournalisationsUsagerService {
  /** Url de l'api REST Usager (.../api/usagers-ident)*/
  private urlApiUsager: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler
    ) {

    this.urlApiUsager = window["env"].urlUsagerApi;
    this.httpErrorHandler.createHandleError('JournalisationsUsagerService'); //Important pour instancier correctement le service

  }

  /**
   * Exécute et valide le rapport des accès aux usagers.
   * @param dto Un rapport avec ses paramètres
   */
  executerRapportAccessUsager(dto: RapportJournalisationDTO) : Observable<RapportJournalisationDTO> {
    return this.http.post<RapportJournalisationDTO>(this.urlApiUsager + '/rapports/journalisations', dto, httpOptions);
  }

  /**
   * Exécute le rapport sur la journalisation d'une fiche d'enregistrement.
   * @param idEnregistrement identifiant de la fiche d'enregistrement
   */
  genererRapportJournalisationEnregistrement(idEnregistrement:number) : Observable<RapportJournalisationDTO> {
    return this.http.get<RapportJournalisationDTO>(this.urlApiUsager + "/enregistrements/" + idEnregistrement + "/rapport-journalisation", httpOptions);
  }
}
