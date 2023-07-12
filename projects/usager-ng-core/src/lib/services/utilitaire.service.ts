import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable, of } from 'rxjs';
import { AgeDTO } from '../models/age-dto';
import { UsagerCommDTO } from '../models/usager-comm-dto';
import { UsagerLieuResidenceDTO } from '../models/usager-lieu-residence-dto';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};







@Injectable({
  providedIn: 'root'
})
export class UtilitaireService implements OnInit {

  //Changer selon l'environnement pour l'instant
  urlApiUsagerComm: string;
  urlApiUsagerLieuResidence: string;
  urlApiUsager: string;
  urlMsgProperties: string;

  /** '/usagers-ident/' */
  ctxUsagerIdent = '/usagers-ident/';
  /** '/lieux-residence/' */
  ctxLieuxResidence = '/lieux-residence/';
  /** '/lieux-residence-actif/' */
  ctxLieuxResidenceActif = '/lieux-residence-actif/';
  /** '/lieu-residence-principal/' */
  ctxLieuResidencePrincipal = '/lieu-residence-principal/';
  /** '/moyens-communication/' */
  ctxMoyensCommunication = '/moyens-communication/';
  /** '/moyens-communication-actif/' */
  ctxMoyensCommunicationActif = '/moyens-communication-actif/';
  /** '/date-naissance/age/obtenir' */
  ctxAgeParDateNaissance = '/date-naissance/age/obtenir';
  /** '/date-naissance-compose/age/obtenir' */
  ctxAgeParDateNaissanceCompose = '/date-naissance-compose/age/obtenir';


  public messages: JSON = null;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlApiUsagerComm = window["env"].urlUsagerApi + this.ctxMoyensCommunication;
    this.urlApiUsagerLieuResidence = window["env"].urlUsagerApi + this.ctxLieuxResidence;
    this.urlApiUsager = window["env"].urlUsagerApi + this.ctxUsagerIdent;
    this.urlMsgProperties = window["env"].urlUsager + '/js/msgbundles_fr.js';

    // Initialise les libellés en les récupérant de la BD.
    this.initLabels();

    this.httpErrorHandler.createHandleError('UtilitairesService'); //Important pour instancier correctement le service
  }

  ngOnInit(): void {

  }

  addUsagerCommunication(usagerComm: UsagerCommDTO): Observable<UsagerCommDTO> {
    return this.http.post<UsagerCommDTO>(this.urlApiUsagerComm, usagerComm, httpOptions);
  }

  addUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO): Observable<UsagerLieuResidenceDTO> {
    return this.http.post<UsagerLieuResidenceDTO>(this.urlApiUsagerLieuResidence, usagerLieuResidence, httpOptions);
  }

  getAllUsagerLieuResidences(idUsagerIdentification: number): Observable<UsagerLieuResidenceDTO[]> {
    return this.http.get<UsagerLieuResidenceDTO[]>(this.urlApiUsager + idUsagerIdentification + this.ctxLieuxResidence);
  }

  getAllUsagerLieuResidencesActifs(idUsagerIdentification: number, actif: boolean): Observable<UsagerLieuResidenceDTO[]> {
    const url: string = this.urlApiUsager + idUsagerIdentification + this.ctxLieuxResidenceActif + actif;
    return this.http.get<UsagerLieuResidenceDTO[]>(url);
  }

  getUsagerLieuResidencePrincipal(idUsagerIdentification: number): Observable<UsagerLieuResidenceDTO> {
    return this.http.get<UsagerLieuResidenceDTO>(this.urlApiUsager + idUsagerIdentification + this.ctxLieuResidencePrincipal);
  }

  getAgeParDateNaissance(dateNaissance: string): Observable<AgeDTO> {
    return this.http.get<AgeDTO>(this.urlApiUsager + dateNaissance + this.ctxAgeParDateNaissance);
  }

  getAgeParDateNaissanceEtDateReference(dateNaissance: string, dateReference: string): Observable<AgeDTO> {
    if (!dateNaissance) {
      return of(null);
    }
    return this.http.get<AgeDTO>(this.urlApiUsager + dateNaissance + '/date-naissance/' + dateReference
      + '/date-reference/age/obtenir');
  }

  getAgeParDateNaissanceCompose(annees: Number, mois: Number, jours: Number): Observable<AgeDTO> {
    return this.http.get<AgeDTO>(this.urlApiUsager + annees + '/' + mois + '/' + jours + this.ctxAgeParDateNaissanceCompose);
  }

  listUsagerCommunications(idUsagerIdentification: number): Observable<UsagerCommDTO[]> {
    return this.http.get<UsagerCommDTO[]>(this.urlApiUsager + idUsagerIdentification + this.ctxMoyensCommunication);
  }

  listUsagerCommunicationsActifs(idUsagerIdentification: number, actif: boolean): Observable<UsagerCommDTO[]> {
    const url: string = this.urlApiUsager + idUsagerIdentification + this.ctxMoyensCommunicationActif + actif;
    return this.http.get<UsagerCommDTO[]>(url);
  }

  updateUsagerCommunication(usagerComm: UsagerCommDTO): Observable<UsagerCommDTO> {
    return this.http.put<UsagerCommDTO>(this.urlApiUsagerComm + usagerComm.id, usagerComm, httpOptions);
  }

  updateUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO): Observable<UsagerLieuResidenceDTO> {
    return this.http.put<UsagerLieuResidenceDTO>(this.urlApiUsagerLieuResidence + usagerLieuResidence.id, usagerLieuResidence, httpOptions);
  }

  archiverUsagerLieuResidence(idUsagerLieuResidence: number): Observable<UsagerLieuResidenceDTO> {
    return this.http.patch<UsagerLieuResidenceDTO>(this.urlApiUsagerLieuResidence + idUsagerLieuResidence, httpOptions);
  }

  initLabels() {
    this.http.get<JSON>(this.urlMsgProperties).subscribe(resultat => { this.messages = resultat; });
  }
}
