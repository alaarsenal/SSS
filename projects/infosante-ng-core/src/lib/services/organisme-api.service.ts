import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { OrganismeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/organisme-dto';
import { Observable } from 'rxjs';

const CTX_ORGANISMES: string = "/organismes";

@Injectable({
  providedIn: 'root'
})
export class OrganismeApiService {

  urlApiInfoSante: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
  ) {
    this.urlApiInfoSante = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('OrganismeApiService');
  }

  /**
   * Extraction de la liste des organismes actifs suivis des inactifs triés par nom.
   */
  public getListeOrganismeOrderByActifNom(): Observable<OrganismeDTO[]> {
    return this.http.get<OrganismeDTO[]>(this.urlApiInfoSante + CTX_ORGANISMES);
  }
}
