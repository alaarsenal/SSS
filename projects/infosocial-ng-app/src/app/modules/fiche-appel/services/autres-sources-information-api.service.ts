import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { SourcesInformationDTO } from '../models/sources-information-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AutresSourcesInformationApiService {

  urlApiSante = window["env"].urlInfoSocial + '/api';

  ctxFichesAppels = '/fiches-appel';
  ctxAutresSourcesInformation = '/autres-sources-information';

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.httpErrorHandler.createHandleError('AutresSourcesInformationApiService');
  }

  /**
   * Obtenir toutes les autres Sources d'information actives pour une fiche d'appel
   * @param idFicheAppel 
   */
  getListeAutresSourcesInformation(idFicheAppel: number): Observable<SourcesInformationDTO[]> {
    return this.http.get<SourcesInformationDTO[]>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxAutresSourcesInformation);
  }

  /**
   * Ajout d'une autre source d'information pour une fiche d'appel
   * @param autreSourceInformation 
   * @param idFicheAppel 
   */
  ajoutAutreSourceInformation(autreSourceInformation: SourcesInformationDTO, idFicheAppel: number): Observable<SourcesInformationDTO> {
    return this.http.post<SourcesInformationDTO>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxAutresSourcesInformation
      , autreSourceInformation
      , httpOptions);
  }

  /**
   * Suppression d'une autre source d'information
   * @param idAutreSourceInformation 
   */
  supprimerAutreSourceInformation(idFicheAppel: number, idAutreSourceInformation: number): Observable<any> {
    return this.http.delete(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxAutresSourcesInformation + "/" + idAutreSourceInformation, httpOptions);
  }

}