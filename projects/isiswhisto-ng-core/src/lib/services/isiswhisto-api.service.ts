import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable, of } from 'rxjs';
import { CritereRechercheDTO, ResultatRechercheDTO } from '../models';
import { ClientDTO } from '../models/client-dto';
import { ConsultationIsiswWrapperDTO } from '../models/consultation-isisw-wrapper-dto';
import { GenderDTO } from '../models/gender-dto';
import { RegionDTO } from '../models/region-dto';
import { UserDTO } from '../models/user-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

//TODO à supprimer
export interface versionGlobal {
  msg: string,
  user: string
}

/** /rechercher */
const CTX_RECHERCHER = '/appels-isisw-histo/rechercher';
/** /rechercher-nb-appels */
const CTX_RECHERCHER_NB_APPELS = '/appels-isisw-histo/rechercher-nb-appels';
const CTX_CLIENTS = "/clients";
const CTX_GENDERS = "/genders";
const CTX_REGIONS = "/regions";
const CTX_USERS = "/users";
const CTX_CONSULTATION = "/consultation/";
const CTX_PDF = "/pdf";

@Injectable(
  { providedIn: 'root' }
)
export class IsiswApiService {
  /** Url de base de l'api (.../api)*/
  private baseUrlApi: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.baseUrlApi = window["env"].urlIsiswHisto + "/api";
    this.httpErrorHandler.createHandleError('IsiswService'); //Important pour instancier correctement le service
  }

  /**
   * Lance un appel au service pour garder la session active.
   */
  public keepAlive(): Observable<string> {
    return this.http.get<string>(this.baseUrlApi + "/keep-alive");
  }

  public getAllClient(): Observable<ClientDTO[]> {
    return this.http.get<ClientDTO[]>(this.baseUrlApi + CTX_CLIENTS);
  }

  public getAllClientByRegionId(regionId: number): Observable<ClientDTO[]> {
    if (regionId) {
      let qryParams: HttpParams = new HttpParams().set('regionId', "" + regionId);
      return this.http.get<ClientDTO[]>(this.baseUrlApi + CTX_CLIENTS, { params: qryParams });
    } else {
      return this.http.get<ClientDTO[]>(this.baseUrlApi + CTX_CLIENTS);
    }
  }

  public getAllGender(): Observable<GenderDTO[]> {
    return this.http.get<GenderDTO[]>(this.baseUrlApi + CTX_GENDERS);
  }

  public getAllRegion(): Observable<RegionDTO[]> {
    return this.http.get<RegionDTO[]>(this.baseUrlApi + CTX_REGIONS);
  }

  public getAllUserByClientId(clientId: number): Observable<UserDTO[]> {
    if (clientId) {
      let qryParams: HttpParams = new HttpParams().set('clientId', "" + clientId);
      return this.http.get<UserDTO[]>(this.baseUrlApi + CTX_USERS, { params: qryParams });
    } else {
      //return this.http.get<UserDTO[]>(this.baseUrlApi + CTX_USERS);
      return of([]);
    }
  }

  /**
   * Recherche les appels ISISW qui respectent un ensemble de critères de recherche.
   * @param criteresRecherche critères de recherche
   * @returns le résultat de la recherche
   */
  public rechercherAppels(criteresRecherche: CritereRechercheDTO): Observable<ResultatRechercheDTO> {
    return this.http.post<ResultatRechercheDTO>(this.baseUrlApi + CTX_RECHERCHER, criteresRecherche);
  }

  public loadConsultationIsiswWrapper(callId: number): Observable<ConsultationIsiswWrapperDTO> {
    if (!callId) {
      return of(null);
    }
    const url = this.baseUrlApi + CTX_CONSULTATION + callId;
    return this.http.get<ConsultationIsiswWrapperDTO>(url);
  }

  public genererPdf(dto: ConsultationIsiswWrapperDTO): Observable<ConsultationIsiswWrapperDTO> {
    return this.http.post<ConsultationIsiswWrapperDTO>(this.baseUrlApi + CTX_PDF, dto);
  }

}
