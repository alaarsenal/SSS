import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { OrganismeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/organisme-dto';
import { Observable } from 'rxjs';
import { SigctUserDTO } from '../models/sigct-user-dto';

const CTX_ORGANISMES = '/organismes/';
const CTX_INTERVENANTS = '/intervenants/';

@Injectable({
  providedIn: 'root'
})
export class OrganismeService {
  // Url de l'api REST des organismes
  private urlApiUsager: string;

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlApiUsager = window["env"].urlUsagerApi;
    this.httpErrorHandler.createHandleError('OrganismesService'); //Important pour instancier correctement le service
  }

  /**
   * Extraction de la liste des intervenants d'un organisme possédant le rôle role.
   * @param idStOrganisme
   * @param role ex: US_RAPPORT_FUSION
   */
  public getListeIntervenantOrganismeWithRole(idStOrganisme: number, role: string): Observable<SigctUserDTO[]> {
    let qryParams: HttpParams = new HttpParams().set('hasRole', role);

    const id: number = idStOrganisme ? idStOrganisme : 0;
    return this.http.get<SigctUserDTO[]>(this.urlApiUsager + CTX_ORGANISMES + id + CTX_INTERVENANTS, { params: qryParams });
  }

  /**
   * Extraction de la liste des organismes actifs suivis des inactifs triés par nom.
   */
  getListeOrganismeOrderByActifNom(): Observable<OrganismeDTO[]> {
    return this.http.get<OrganismeDTO[]>(this.urlApiUsager + CTX_ORGANISMES);
  }
}
