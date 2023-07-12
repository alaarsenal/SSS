import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { MedicationSocialDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MedicationSocialService {

  private urlBase: string;

  private ctxMedication: string = '/medicationSocial';
  private ctxFicheAppel: string = '/fiches-appel/';

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('MedicationSocialService');
  }

  getMedication(idFicheAppel: number, idMedication: number): Observable<MedicationSocialDTO> {
    return this.http.get<MedicationSocialDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/' + idMedication);
  }

  supprimerMedication(idFicheAppel: number, idMedication: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/' + idMedication);
  }

  getListeMedication(idFicheAppel: number): Observable<MedicationSocialDTO[]> {
    return this.http.get<MedicationSocialDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/');
  }

  ajouterMedication(idFicheAppel: number, dto: MedicationSocialDTO): Observable<MedicationSocialDTO> {
    return this.http.post<MedicationSocialDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/', dto);
  }

  modifierMedication(idFicheAppel: number, dto: MedicationSocialDTO): Observable<MedicationSocialDTO> {
    return this.http.put<MedicationSocialDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/', dto);
  }

}
