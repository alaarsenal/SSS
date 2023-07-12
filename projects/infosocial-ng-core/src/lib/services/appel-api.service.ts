import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppelDTO } from 'projects/infosocial-ng-app/src/app/modules/fiche-appel/models';
import { FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models/fiche-appel-social-dto';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ConsultationAppelantDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-appelant-dto';
import { MessageCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/message-cti-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { AppelantCommDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-communication/appelant-Comm-dto';
import { AppelantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-initial/appelant-dto';
import { ConsultationInteractionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-interaction-dto';
import { Observable, of } from 'rxjs';

const headers: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'my-auth-token');

const httpOptions = {
  headers
};

@Injectable({
  providedIn: 'root'
})
export class AppelApiService {
  private urlApiSocial: string;

  /** /appels */
  private ctxAppels = '/appels';
  /** /fiches-appel */
  private ctxFichesAppels = "/fiches-appel";
  /** /moyens-communication */
  private ctxMoyensCommunications = "/moyens-communication";
  /** /appelant */
  private ctxAppelant = "/appelant";
  /** /message-cti */
  private ctxMessageCti = "/message-cti";

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlApiSocial = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('AppelApiService');
  }

  /**
   * Ajoute un nouvel appel dans la base de données.
   * @param appelSaisieDifferee indique s'il s'agit d'un appel en saisie différée
   * @returns l'identifiant de l'appel dans un Observable
   */
  ajouterAppel(appelSaisieDifferee: boolean): Observable<number> {
    const saisieDifferee: string = appelSaisieDifferee ? "true" : "false";
    const params: HttpParams = new HttpParams().append("saisieDifferee", saisieDifferee);
    const postHttpOptions = {
      headers,
      params
    };
    return this.http.post<number>(this.urlApiSocial + this.ctxAppels, null, postHttpOptions);
  }

  /**
   * Ajoute une nouvelle fiche d'appel dans la base de données.
   * @param idAppel identifiant de l'appel parent
   * @param typeFiche type fiche d'intervention
   * @returns l'identifiant de la nouvelle fiche d'appel dans un Observable
   */
  ajouterFicheAppel(idAppel: number, typeFiche: string): Observable<number> {
    const params: HttpParams = new HttpParams().append("typeFicheIntervention", typeFiche);
    const postHttpOptions = {
      headers,
      params
    };

    return this.http.post<number>(this.urlApiSocial + this.ctxAppels + "/" + idAppel + this.ctxFichesAppels, null, postHttpOptions);
  }

  editerFicheAppel(ficheAppelSocialDTO: FicheAppelSocialDTO, valider?: boolean): Observable<FicheAppelSocialDTO> {
    if (valider) {
      return this.http.post<FicheAppelSocialDTO>(this.urlApiSocial + this.ctxAppels, ficheAppelSocialDTO, httpOptions);
    } else {
      return this.http.post<FicheAppelSocialDTO>(this.urlApiSocial + this.ctxAppels, ficheAppelSocialDTO, httpOptions);
    }
  }

  /**
   * Récupère les informations de base d'un appel (nom, prénom, âge de chaque usager de chaque fiche).
   * @param idAppel identifiant de l'appel
   */
  obtenirFicheAppels(idAppel: number): Observable<FicheAppelSocialDTO[]> {
    return this.http.get<FicheAppelSocialDTO[]>(this.urlApiSocial + this.ctxAppels + "/" + idAppel + this.ctxFichesAppels, httpOptions);
  }

  /**
   * Obtenir le message CTI lié à l'appel idAppel
   * @param idAppel identifiant de l'appel
   * @returns un MessageCtiDTO
   */
  obtenirMessageCtiAppel(idAppel: number): Observable<MessageCtiDTO> {
    return this.http.get<MessageCtiDTO>(this.urlApiSocial + this.ctxAppels + '/' + idAppel + this.ctxMessageCti, httpOptions);
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
    if (!ignoreEmptyAppelant && this.isAppelantEmpty(appelant)) {
      return of(appelant);
    }
    return this.http.post<AppelantDTO>(this.urlApiSocial + this.ctxAppelant, appelant, httpOptions);
  }

  UpdateAppelant(appelant: AppelantDTO): Observable<AppelantDTO> {
    return this.http.put<AppelantDTO>(this.urlApiSocial + this.ctxAppelant + "/" + appelant.id, appelant, httpOptions);
  }

  deleteAppelantByAppel(idApell: number) {
    return this.http.delete<AppelantDTO>(this.urlApiSocial + this.ctxAppelant + "/delete-by-appel/" + idApell);
  }


  autoSaveAppelant(appelant: AppelantDTO): void {
    if (this.isAppelantEmpty(appelant)) {
      return;
    }
    const jsonAppelant = JSON.stringify(appelant);
    const url: string = this.urlApiSocial + this.ctxAppelant;

    // Création d'un blob pour permettre l'envoie de données json.
    const blob = new Blob([jsonAppelant], { type: 'application/json; charset=UTF-8' });

    // L'auto sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
    // la requête est annulée à la destruction de l'appelant.
    // ATTENTION, sendBeacon effectue un POST
    navigator.sendBeacon(url, blob);
  }

  addAppelantCommunication(appelantComm: AppelantCommDTO): Observable<AppelantCommDTO> {
    return this.http.post<AppelantCommDTO>(this.urlApiSocial + this.ctxMoyensCommunications, appelantComm, httpOptions);
  }

  obtainAppelantCommunicationsByIdAppelant(idAppelant: number): Observable<AppelantCommDTO[]> {
    return this.http.get<AppelantCommDTO[]>(this.urlApiSocial + "/" + idAppelant + this.ctxMoyensCommunications);
  }

  deleteAppelantCommunication(idAppelantComm: number): Observable<any> {
    return this.http.delete<void>(this.urlApiSocial + this.ctxMoyensCommunications + "/" + idAppelantComm, httpOptions);
  }

  selectAppelantByIdAppel(idAppel: string): Observable<AppelantDTO> {
    const params: HttpParams = new HttpParams().append("idAppel", idAppel);
    const gettHttpOptions = {
      headers,
      params
    };

    return this.http.get<any>(this.urlApiSocial + this.ctxAppelant, gettHttpOptions);
  }

  consulterAppelantByIdAppel(idAppel: string, idFicheAppel: string): Observable<ConsultationAppelantDTO> {

    return this.http.get<any>(this.urlApiSocial + "/appel/" + idAppel + "/fiches-appel/" + idFicheAppel + "/consultation/appelant", httpOptions);
  }

  /**
   * Obtenir un appel.
   * @returns  l'appel dans un Observable
   */
  obtenirAppel(idAppel: number): Observable<AppelDTO> {
    return this.http.get<AppelDTO>(this.urlApiSocial + this.ctxAppels + '/' + idAppel, httpOptions);
  }

  getConsultationInteraction(idAppel: number): Observable<ConsultationInteractionDTO> {
    return this.http.get<ConsultationInteractionDTO>(this.urlApiSocial + "/appels/" + idAppel + "/consultation/interaction");
  }

  /**
   * Retourne le nombre de fiches d'appel ayant le statut Ouvert dans un appel.
   * @param idAppel 
   * @returns nombre de fiches d'appel ouvertes
   */
  obtenirNbFicheAppelStatutOuvert(idAppel: number): Observable<number> {
    return this.http.get<number>(this.urlApiSocial + this.ctxAppels + '/' + idAppel + "/nb-fiches-appel-statut-ouvert");
  }
}
