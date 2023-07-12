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

  private urlBase: string = '';

  private ctxRaisonAppel: string = '/raisons-appel';
  private ctxRoleAction: string = '/roles-action';

  private ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('StatistiquesService'); //Important pour instancier correctement le service
  }

  getRaisonAppel(idAppel: number, idRaisonAppel: number): Observable<RaisonAppelDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel + '/' + idRaisonAppel;
    return this.http.get<RaisonAppelDTO>(url, httpOptions);
  }

  supprimerRaisonAppel(idAppel: number, idRaisonAppel: number): Observable<any> {
    const url = this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRaisonAppel + '/' + idRaisonAppel;
    return this.http.delete(url, httpOptions);
  }

  getListeRaisonAppel(idFicheAppel: number): Observable<RaisonAppelDTO[]> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxRaisonAppel + '/';
    return this.http.get<RaisonAppelDTO[]>(url, httpOptions);
  }

  ajouterRaisonAppel(idFicheAppel: number, dto: RaisonAppelDTO): Observable<RaisonAppelDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxRaisonAppel + '/';
    return this.http.post<RaisonAppelDTO>(url, dto, httpOptions);
  }

  getRoleAction(idAppel: number, idRoleAction: number): Observable<RoleActionDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idAppel + this.ctxRoleAction + '/' + idRoleAction;
    return this.http.get<RoleActionDTO>(url, httpOptions);
  }

  supprimerRoleAction(idFicheAppel: number, idRoleAction: number): Observable<any> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxRoleAction + '/' + idRoleAction;
    return this.http.delete(url, httpOptions);
  }

  getListeRoleAction(idFicheAppel: number): Observable<RoleActionDTO[]> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxRoleAction + '/';
    return this.http.get<RoleActionDTO[]>(url, httpOptions);
  }

  ajouterRoleAction(idFicheAppel: number, dto: RoleActionDTO): Observable<RoleActionDTO> {
    const url = this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxRoleAction + '/';
    return this.http.post<RoleActionDTO>(url, dto, httpOptions);
  }

}
