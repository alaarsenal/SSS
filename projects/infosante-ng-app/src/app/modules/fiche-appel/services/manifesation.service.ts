import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { ManifestationDTO } from '../models/manifestation-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ManifesationService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxManifestation: string = '/manifestations';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('ManifestationService'); //Important pour instancier correctement le service
  }

  getManifestation(idAppel: number, idManifestation: number): Observable<ManifestationDTO> {
    return this.http.get<ManifestationDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxManifestation + '/' + idManifestation, httpOptions);
  }

  supprimerManifestation(idAppel: number, idManifestation: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxManifestation + '/' + idManifestation, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeManifestation(idAppel: number): Observable<ManifestationDTO[]> {
    return this.http.get<ManifestationDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxManifestation + '/', httpOptions);
  }

  ajouterManifestation(idAppel: number, dto: ManifestationDTO): Observable<ManifestationDTO> {
    return this.http.post<ManifestationDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxManifestation, dto, httpOptions);
  }

  modifierManifestation(idAppel: number, dto: ManifestationDTO): Observable<ManifestationDTO> {
    return this.http.put<ManifestationDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxManifestation, dto, httpOptions);
  }
}
