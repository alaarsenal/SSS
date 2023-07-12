import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ConsultationAppelantDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-appelant-dto';
import { MessageCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/message-cti-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { AppelantCommDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-communication/appelant-Comm-dto';
import { AppelantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-initial/appelant-dto';
import { Observable, of } from 'rxjs';
import { AppelDTO } from '../models/appel-dto';
import { FicheAppelDTO } from '../models/fiche-appel-dto';
import { SectionFicheAppelEnum } from '../models/section-fiche-appel-enum';
import { EnumUrlPageFicheAppel } from '../models/url-page-fiche-appel-enum';

const headers: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'my-auth-token');

const httpOptions = {
  headers
};

@Injectable({
  providedIn: 'root'
})
export class AppelApiService {
  private urlApiSante: string;

  /** /appels */
  private ctxAppels = '/appels';
  /** /fiches-appel */
  private ctxFichesAppels = "/fiches-appel"
  /** /moyens-communication */
  private ctxMoyensCommunications = "/moyens-communication";
  /** /appelant */
  private ctxAppelant = "/appelant";
  /** /message-cti */
  private ctxMessageCti = "/message-cti";

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlApiSante = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('FicheAppelService'); //Important pour instancier correctement le service
  }

  /**
   * Ajoute un nouvel appel dans la base de données.
   * @returns l'identifiant de l'appel dans un Observable
   */
  ajouterAppel(appelSaisieDifferee: boolean): Observable<number> {
    const saisieDifferee: string = appelSaisieDifferee ? "true" : "false";
    const params: HttpParams = new HttpParams().append("saisieDifferee", saisieDifferee);
    const postHttpOptions = {
      headers,
      params
    };
    return this.http.post<number>(this.urlApiSante + this.ctxAppels, null, postHttpOptions);
  }

  /**
   * Ajoute une nouvelle fiche d'appel dans la base de données.
   * @param idAppel identifiant de l'appel parent
   * @param typeConsultation type de consultation
   * @returns l'identifiant de la nouvelle fiche d'appel dans un Observable
   */
  ajouterFicheAppel(idAppel: number, typeConsultation: string): Observable<number> {
    const params: HttpParams = new HttpParams().append("typeConsultation", typeConsultation);
    const postHttpOptions = {
      headers,
      params
    };

    return this.http.post<number>(this.urlApiSante + this.ctxAppels + "/" + idAppel + this.ctxFichesAppels, null, postHttpOptions);
  }

  /**
   * Récupère les informations de base d'un appel (nom, prénom, âge de chaque usager de chaque fiche).
   * @param idAppel identifiant de l'appel
   */
  obtenirFicheAppels(idAppel: number): Observable<FicheAppelDTO[]> {
    return this.http.get<FicheAppelDTO[]>(this.urlApiSante + this.ctxAppels + "/" + idAppel + this.ctxFichesAppels, httpOptions);
  }

  isAppelantEmpty(appelantDTO: AppelantDTO): boolean {
    return !appelantDTO?.id
      && StringUtils.isBlank(appelantDTO?.nom)
      && StringUtils.isBlank(appelantDTO?.prenom)
      && StringUtils.isBlank(appelantDTO?.details)
      && !appelantDTO?.rrssDTO?.id
      && !appelantDTO?.rrssDTO?.rrssId;
  }

  addAppelant(appelant: AppelantDTO, ignoreEmptyAppelant?: boolean): Observable<AppelantDTO> {
    return this.saveAppelant(appelant, ignoreEmptyAppelant);
  }

  UpdateAppelant(appelant: AppelantDTO): Observable<AppelantDTO> {
    return this.saveAppelant(appelant);
  }

  saveAppelant(appelant: AppelantDTO, ignoreEmptyAppelant?: boolean): Observable<AppelantDTO> {
    if (!ignoreEmptyAppelant && this.isAppelantEmpty(appelant)) {
      return of(appelant);
    }
    return this.http.post<AppelantDTO>(this.urlApiSante + this.ctxAppelant, appelant, httpOptions);
  }

  autoSaveAppelant(appelant: AppelantDTO): void {
    if (this.isAppelantEmpty(appelant)) {
      return;
    }
    const jsonAppelant = JSON.stringify(appelant);
    const url: string = this.urlApiSante + this.ctxAppelant;

    // Création d'un blob pour permettre l'envoie de données json.
    const blob = new Blob([jsonAppelant], { type: 'application/json; charset=UTF-8' });

    // L'auto sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
    // la requête est annulée à la destruction de l'appelant.
    // ATTENTION, sendBeacon effectue un POST
    navigator.sendBeacon(url, blob);
  }

  addAppelantCommunication(appelantComm: AppelantCommDTO): Observable<AppelantCommDTO> {
    return this.http.post<AppelantCommDTO>(this.urlApiSante + this.ctxMoyensCommunications, appelantComm, httpOptions);
  }

  obtainAppelantCommunicationsByIdAppelant(idAppelant: number): Observable<AppelantCommDTO[]> {
    this.urlApiSante + "/" + idAppelant + this.ctxMoyensCommunications
    return this.http.get<AppelantCommDTO[]>(this.urlApiSante + "/" + idAppelant + this.ctxMoyensCommunications);
  }

  deleteAppelantCommunication(idAppelantComm: number): Observable<any> {
    return this.http.delete<void>(this.urlApiSante + this.ctxMoyensCommunications + "/" + idAppelantComm, httpOptions);
  }

  selectAppelantByIdAppel(idAppel: string): Observable<AppelantDTO> {
    const params: HttpParams = new HttpParams().append("idAppel", idAppel);
    const gettHttpOptions = {
      headers,
      params
    };

    return this.http.get<any>(this.urlApiSante + this.ctxAppelant, gettHttpOptions);
  }

  consulterAppelantByIdAppel(idAppel: string, idFicheAppel: string): Observable<ConsultationAppelantDTO> {

    return this.http.get<any>(this.urlApiSante + "/appel/" + idAppel + "/fiches-appel/" + idFicheAppel + "/consultation/appelant", httpOptions);
  }


  /**
   * Obtenir un objet de transfert d'un Appel
   * @returns un Observable contenant l'appel
   */
  obtenirAppel(idAppel: number): Observable<AppelDTO> {
    return this.http.get<AppelDTO>(this.urlApiSante + this.ctxAppels + '/' + idAppel, httpOptions);
  }

  /**
   * Obtenir le message CTI lié à l'appel idAppel
   * @param idAppel identifiant de l'appel
   * @returns un MessageCtiDTO
   */
  obtenirMessageCtiAppel(idAppel: number): Observable<MessageCtiDTO> {
    return this.http.get<MessageCtiDTO>(this.urlApiSante + this.ctxAppels + '/' + idAppel + this.ctxMessageCti, httpOptions);
  }

  /**
   * Sauvegarde un appel existant.
   * @param dto appel à sauvegarder
   * @param section sauvegarde à partir de quelle section
   * @returns l'appel sauvegardé dans un observable
   */
  updateAppel(dto: AppelDTO, section?: SectionFicheAppelEnum): Observable<AppelDTO> {
    const url: string = this.urlApiSante + this.ctxAppels + '/' + dto.id + (section ? "/" + section : "");
    return this.http.put<AppelDTO>(url, dto, httpOptions);
  }

  autoSaveAppel(dto: AppelDTO, urlPage?: EnumUrlPageFicheAppel): void {
    const jsonFicheAppel: string = JSON.stringify(dto);
    const url: string = this.urlApiSante + this.ctxAppels + '/' + dto.id + (urlPage ? "/" + urlPage : "");

    // Création d'un blob pour permettre l'envoie de données json.
    const blob = new Blob([jsonFicheAppel], { type: 'application/json; charset=UTF-8' });

    // L'auto sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
    // la requête est annulée à la destruction de l'appelant.
    // ATTENTION, sendBeacon effectue un POST
    navigator.sendBeacon(url, blob);
  }

  /**
   * Retourne le nombre de fiches d'appel ayant le statut Ouvert dans un appel.
   * @param idAppel 
   * @returns nombre de fiches d'appel ouvertes
   */
  obtenirNbFicheAppelStatutOuvert(idAppel: number): Observable<number> {
    return this.http.get<number>(this.urlApiSante + this.ctxAppels + '/' + idAppel + "/nb-fiches-appel-statut-ouvert");
  }
  
}
