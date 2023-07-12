import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { GenererAlerteFicheDTO } from '../models/generer-alerte-fiche-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

const CTX_ALERTES_FICHE: string = '/alertes-fiche/';

@Injectable(
  { providedIn: 'root' }
)
export class UsagerAlerteFicheApiService {
  /** Url de base de l'api (.../api)*/
  private urlApiUsager: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlApiUsager = window["env"].urlUsagerApi;

    this.httpErrorHandler.createHandleError('UsagerService'); //Important pour instancier correctement le service
  }

  genererAlertes(genererAlertFicheDto: GenererAlerteFicheDTO): Observable<boolean> {
    return this.http.post<boolean>(this.urlApiUsager + CTX_ALERTES_FICHE, genererAlertFicheDto);
  }
}
