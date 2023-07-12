import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ImpressionAvisDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-avis-dto';
import { Observable } from 'rxjs';
import { AvisDTO } from '../models/avis-dto';

@Injectable({
  providedIn: 'root'
})
export class AvisService {

  urlBase: string;

  ctxAvis: string = '/avis';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('AvisService');
  }

  getListeAvis(idFicheAppel: number): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxAvis);
  }

  ajouterAvis(idFicheAppel: number, dto: AvisDTO): Observable<AvisDTO> {
    return this.http.post<AvisDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxAvis, dto);
  }

  supprimerAvis(idFicheAppel: number, idAvis: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxAvis + '/' + idAvis);
  }

  getAvis(idFicheAppel: number, idAvis: number): Observable<AvisDTO> {
    return this.http.get<AvisDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxAvis + '/' + idAvis);
  }

  genererPdfAvis(idFicheAppel: number, idAvis: number): Observable<ImpressionAvisDTO> {
    return this.http.get<ImpressionAvisDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxAvis + '/' + idAvis + '/pdf');
  }
}
