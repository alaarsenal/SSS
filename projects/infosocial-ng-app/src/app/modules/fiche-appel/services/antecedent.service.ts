import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { AntecedentDTO } from '../models/antecedent-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AntecedentService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxAntecedent: string = '/antecedents';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlSanteApi;

    this.httpErrorHandler.createHandleError('AntecedentService'); //Important pour instancier correctement le service
  }

  getAntecedent(idAppel: number, idAntecedent: number): Observable<AntecedentDTO> {
    return this.http.get<AntecedentDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent + '/' + idAntecedent, httpOptions);
  }

  supprimerAntecedent(idAppel: number, idAntecedent: number): Observable<any> {
    console.log(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent + '/' + idAntecedent);
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent + '/' + idAntecedent, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeAntecedent(idAppel: number): Observable<AntecedentDTO[]> {
    return this.http.get<AntecedentDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent + '/', httpOptions);
  }

  ajouterAntecedent(idAppel: number, dto: AntecedentDTO): Observable<AntecedentDTO> {
    return this.http.post<AntecedentDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent, dto, httpOptions);
  }

  modifierAntecedent(idAppel: number, dto: AntecedentDTO): Observable<AntecedentDTO> {
    return this.http.put<AntecedentDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxAntecedent, dto, httpOptions);
  }

}
