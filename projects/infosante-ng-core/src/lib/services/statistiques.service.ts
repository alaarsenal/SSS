import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
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
export class StatistiquesService {


  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxRaisonAppel: string = '/raisons-appel';
  ctxRoleAction: string = '/roles-action';

  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('StatistiquesService'); //Important pour instancier correctement le service
  }

  getRaisonAppel(idAppel: number, idRaisonAppel: number): Observable<RaisonAppelDTO> {
    return this.http.get<RaisonAppelDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel + '/' + idRaisonAppel, httpOptions);
  }

  supprimerRaisonAppel(idAppel: number, idRaisonAppel: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel + '/' + idRaisonAppel, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeRaisonAppel(idAppel: number): Observable<RaisonAppelDTO[]> {
    return this.http.get<RaisonAppelDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel + '/', httpOptions);
  }

  ajouterRaisonAppel(idAppel: number, dto: RaisonAppelDTO): Observable<RaisonAppelDTO> {
    return this.http.post<RaisonAppelDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel, dto, httpOptions);
  }

  getRoleAction(idAppel: number, idRoleAction: number): Observable<RoleActionDTO> {
    return this.http.get<RoleActionDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRoleAction + '/' + idRoleAction, httpOptions);
  }

  supprimerRoleAction(idAppel: number, idRoleAction: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRoleAction + '/' + idRoleAction, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeRoleAction(idAppel: number): Observable<RoleActionDTO[]> {
    return this.http.get<RoleActionDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRoleAction + '/', httpOptions);
  }

  ajouterRoleAction(idAppel: number, dto: RoleActionDTO): Observable<RoleActionDTO> {
    return this.http.post<RoleActionDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRoleAction, dto, httpOptions);
  }

}
