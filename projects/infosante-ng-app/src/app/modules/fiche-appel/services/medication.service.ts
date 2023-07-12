import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { MedicationDTO } from '../models/medication-dto';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxMedication: string = '/medications';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,) {
    this.urlBase = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('MedicationService'); //Important pour instancier correctement le service
  }

  getMedication(idFicheAppel: number, idMedication: number): Observable<MedicationDTO> {
    return this.http.get<MedicationDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/' + idMedication);
  }

  supprimerMedication(idFicheAppel: number, idMedication: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/' + idMedication);
  }

  //Le id est le numéro de l'appel courrant
  getListeMedication(idFicheAppel: number): Observable<MedicationDTO[]> {
    return this.http.get<MedicationDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication + '/');
  }

  ajouterMedication(idFicheAppel: number, dto: MedicationDTO): Observable<MedicationDTO> {
    return this.http.post<MedicationDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication, dto);
  }

  modifierMedication(idFicheAppel: number, dto: MedicationDTO): Observable<MedicationDTO> {
    return this.http.put<MedicationDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMedication, dto);
  }

}
