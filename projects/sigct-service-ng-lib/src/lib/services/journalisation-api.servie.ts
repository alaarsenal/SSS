import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RapportJournalisationDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/rapport-journalisation-dto';
import { Observable } from 'rxjs';
import { HttpErrorHandler } from '../http/http-error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class JournalisationApiService {

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
  ) {
    this.apiUrl = this.getUrlBasedOnModuleNom();
    httpErrorHandler.createHandleError('JournalisationApiService'); //Important pour instancier correctement le service
  }

  genererRapport(dto: RapportJournalisationDTO, baseApiUrl?: string): Observable<RapportJournalisationDTO> {
    const apiUrl: string = baseApiUrl ? baseApiUrl : this.apiUrl;
    return this.http.post<RapportJournalisationDTO>(apiUrl + '/rapports/journalisations', dto, httpOptions);
  }

  /**
   * Lance la production du rapport de journalisation complet d'une fiche d'appel.
   * @param dto RapportJournalisationDTO contenant l'ensemble des informations nécessaires à la production du rapport
   * @param baseApiUrl url de base du controler
   * @returns un RapportJournalisationDTO contenant le rapport produit et/ou des erreurs
   */
  genererRapportCompletFicheAppel(dto: RapportJournalisationDTO, baseApiUrl?: string): Observable<RapportJournalisationDTO> {
    const apiUrl: string = baseApiUrl ? baseApiUrl : this.apiUrl;
    return this.http.post<RapportJournalisationDTO>(apiUrl + '/rapports/journalisations-fiche-appel-complete', dto, httpOptions);
  }

  /**
   * Lance la production du rapport de journalisation des messages CTI.
   * @param dto RapportJournalisationDTO contenant l'ensemble des informations nécessaires à la production du rapport
   * @param baseApiUrl url de base du controler
   * @returns un RapportJournalisationDTO contenant le rapport produit et/ou des erreurs
   */
   genererRapportMessagesCti(dto: RapportJournalisationDTO, baseApiUrl?: string): Observable<RapportJournalisationDTO> {
    const apiUrl: string = baseApiUrl ? baseApiUrl : this.apiUrl;
    return this.http.post<RapportJournalisationDTO>(apiUrl + '/rapports/journalisations-messages-cti', dto, httpOptions);
  }

  /**
   * Lance la production du rapport de journalisation des actions d'un utilisateur.
   * @param dto RapportJournalisationDTO contenant l'ensemble des informations nécessaires à la production du rapport
   * @param baseApiUrl url de base du controller
   * @returns un RapportJournalisationDTO contenant le rapport produit et/ou des erreurs
   */
  genererRapportUtilisateurs(dto: RapportJournalisationDTO, baseApiUrl?: string): Observable<RapportJournalisationDTO> {
    const apiUrl: string = baseApiUrl ? baseApiUrl : this.apiUrl;
    return this.http.post<RapportJournalisationDTO>(apiUrl + '/rapports/journalisations-utilisateurs', dto, httpOptions);
  }

  genererExcel(rapport: RapportJournalisationDTO) {
    const data: any = rapport.contenu;
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], { type: 'application / vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = rapport.nomRapport;
    anchor.href = url;
    anchor.click();
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
}
