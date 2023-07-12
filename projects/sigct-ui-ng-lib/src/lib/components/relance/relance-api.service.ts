import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { SigctModuleEnum } from 'projects/sigct-service-ng-lib/src/lib/enums/sigct-module.enum';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { Tuple } from 'projects/sigct-ui-ng-lib/src/lib/utils/tuple';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { RelanceDTO } from '../../model/relance-dto';


const CTX_FICHE_APPEL: string = "/fiches-appel";
const CTX_RELANCE: string = "/relance";
const CTX_REFERENCE: string = "/references";
const CTX_STATUTS_RELANCE = '/statuts-relance';
const CTX_ASSIGNATIONS_RELANCE = '/assignations-relance';


const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class RelanceService {

  private urlBase: string;
  private totalRelancesARealiserSubject: Subject<number> = new Subject();
  private totalRelancesARealiserSubscription: Subscription;

  private moduleInitialesMap = new Map();

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.httpErrorHandler.createHandleError('ConsultationService'); //Important pour instancier correctement le service
    this.urlBase = this.getUrlBasedOnModuleNom();

    this.moduleInitialesMap.set('infosante', 'SA');
    this.moduleInitialesMap.set('infosocial', 'SO');
  }

  save(dto: RelanceDTO, domaine?: string): Observable<RelanceDTO> {
    return dto.id ? this.update(dto, domaine) : this.create(dto, domaine);;
  }

  create(dto: RelanceDTO, domaine?: string): Observable<RelanceDTO> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.post<RelanceDTO>(urlBase + CTX_FICHE_APPEL + CTX_RELANCE, dto, HTTP_OPTIONS);
  }

  update(dto: RelanceDTO, domaine?: string): Observable<RelanceDTO> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.put<RelanceDTO>(urlBase + CTX_FICHE_APPEL + CTX_RELANCE, dto, HTTP_OPTIONS);
  }

  findAllByIdFicheAppel(idFicheAppel: number, domaine?: string): Observable<RelanceDTO[]> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<RelanceDTO[]>(urlBase + CTX_FICHE_APPEL + "/" + idFicheAppel + CTX_RELANCE);
  }

  findOne(idRelance: number): Observable<RelanceDTO> {
    return idRelance ? this.http.get<RelanceDTO>(this.urlBase + CTX_FICHE_APPEL + CTX_RELANCE + "/" + idRelance) : of(null);
  }

  getRelanceARealiser(idFicheAppel: number, domaine?: string): Observable<RelanceDTO> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<RelanceDTO>(urlBase + CTX_FICHE_APPEL + "/" + idFicheAppel + "/relance-a-realiser");
  }

  isAfficherActionRelance(idFicheAppel: number, domaine?: string): Observable<boolean> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<boolean>(urlBase + CTX_FICHE_APPEL + "/" + idFicheAppel + "/afficher-action-relance");
  }

  isActiverActionRelance(idFicheAppel: number, domaine?: string): Observable<boolean> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<boolean>(urlBase + CTX_FICHE_APPEL + "/" + idFicheAppel + "/activer-action-relance");
  }

  updateTotalRelancesARealiser(domaine?: string): void {
    if (this.totalRelancesARealiserSubscription) {
      this.totalRelancesARealiserSubscription.unsubscribe();
    }
    this.totalRelancesARealiserSubscription = this.getTotalRelancesARealiser(domaine).subscribe(
      (result: number) => {
        this.totalRelancesARealiserTriggerer(result);
      }
    );
  }

  getTotalRelancesARealiser(domaine?: string): Observable<number> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    const tout: boolean = AuthenticationUtils.hasRole('ROLE_' + this.moduleInitialesMap.get(this.getModule()) + '_APPEL_RELANCE_TOUS');
    return this.http.get<number>(urlBase + CTX_FICHE_APPEL + "/total-relances-a-realiser/" + tout);
  }

  totalRelancesARealiserTriggerer(value: number): void {
    this.totalRelancesARealiserSubject.next(value);
  }

  totalRelancesARealiserListener(): Observable<number> {
    return this.totalRelancesARealiserSubject.asObservable();
  }

  findRange(filters: Tuple[], domaine?: string): Observable<RelanceDTO[]> {
    if (CollectionUtils.isBlank(filters)) {
      return of(null);
    }
    let params = new HttpParams();
    filters.forEach(filter => {
      params = params.append(filter.key, filter.value);
    });
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<RelanceDTO[]>(urlBase + CTX_FICHE_APPEL + "/recherche-relances", { params: params });
  }

  // Extraction de la liste des assignations d'une relance.
  public getListeAssignationsRelance(domaine?: string): Observable<ReferenceDTO[]> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<ReferenceDTO[]>(urlBase + CTX_REFERENCE + CTX_ASSIGNATIONS_RELANCE);
  }

  //Extraction de la liste des statuts d'une relance
  public getListeStatusRelance(domaine?: string): Observable<Object | any[]> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get(urlBase + CTX_REFERENCE + CTX_STATUTS_RELANCE);
  }

  /**retourne l'intervalle de temps pour recalculer le nombre total des relances à réaliser */
  public getIntervalleCalculeRelances(domaine?: string): Observable<number> {
    const urlBase: string = this.getUrlBasedOnDomaine(domaine);
    return this.http.get<number>(urlBase + CTX_FICHE_APPEL + "/intervalle-calcule-relance");
  }

  private getUrlBasedOnModuleNom(): string {
    let appName: string = window["env"].appName;
    let urlBase: string;
    if (appName == "infosante") {
      urlBase = window["env"].urlSante + '/api';
    }
    if (appName == "infosocial") {
      urlBase = window["env"].urlInfoSocial + '/api';
    }
    return urlBase;
  }

  private getUrlBasedOnDomaine(domaine: string): string {
    let urlBase: string = this.urlBase;
    switch (domaine) {
      case "SA":
        urlBase = window["env"].urlSanteApi;
        break;
      case "SO":
        urlBase = window["env"].urlInfoSocial + '/api';
        break;
      case "US":
        urlBase = window["env"].urlUsagerApi;
        break;
    }
    return urlBase;
  }

  public getModule(domaine?: string): string {
    const sigctModule: SigctModuleEnum = SigctModuleEnum.getByAcronyme(domaine);
    if (sigctModule) {
      return sigctModule.getAppName();
    } else {
      return window["env"].appName;
    }
  }

}


