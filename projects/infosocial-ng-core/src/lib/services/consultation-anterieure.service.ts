import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { ConsultationAnterieureDTO } from '../models/consultation-anterieure-dto';

@Injectable({
  providedIn: 'root'
})
export class ConsultationAnterieureService {

  urlBase: string;

  ctxConsultation: string = '/consultation-anterieure';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('ConsultationAnterieureService');
  }

  getConsultationAnterieure(idFicheAppel: number, idConsultationAnterieure: number): Observable<ConsultationAnterieureDTO> {
    return this.http.get<ConsultationAnterieureDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxConsultation + '/' + idConsultationAnterieure);
  }

  supprimerConsultationAnterieure(idFicheAppel: number, idConsultationAnterieure: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxConsultation + '/' + idConsultationAnterieure);
  }

  getListeConsultationAnterieure(idFicheAppel: number): Observable<ConsultationAnterieureDTO[]> {
    return this.http.get<ConsultationAnterieureDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxConsultation + '/');
  }

  ajouterConsultationAnterieure(idFicheAppel: number, dto: ConsultationAnterieureDTO): Observable<ConsultationAnterieureDTO> {
    return this.http.post<ConsultationAnterieureDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxConsultation + '/', dto);
  }

  modifierConsultationAnterieure(idFicheAppel: number, dto: ConsultationAnterieureDTO): Observable<ConsultationAnterieureDTO> {
    return this.http.put<ConsultationAnterieureDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxConsultation + '/', dto);
  }

}
