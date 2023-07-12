import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { IficheAppelApiService } from 'projects/sigct-service-ng-lib/src/lib/interface/ifiche-appel-api-service';
import { FicheAppelChronoDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-chrono-dto';
import { FicheAppelNonTermineeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-non-terminee-dto';
import { ImpressionFicheDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-fiche-dto';
import { RechercheFicheAppelCriteresDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { SignatureDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-signature/signature-dto';
import { AppelAnterieurDTO } from 'projects/usager-ng-core/src/lib/models';
import { ExportationExcelDTO } from 'projects/usager-ng-core/src/lib/models/exportation-excel-dto';
import { Observable } from 'rxjs';
import { FicheAppelDTO } from '../models/fiche-appel-dto';
import { ImpressionFicheSanteDTO } from '../models/impression-fiche-sante-dto';
import { EnumUrlPageFicheAppel } from '../models/url-page-fiche-appel-enum';
import { ProtocoleDTO } from '../models/protocole-dto';

const CTX_VALIDER_TERMINER: string = '/valider-terminer/';
const CTX_TERMINER: string = '/terminer/';
const CTX_SOUS_SECTIONS: string = "/sous-sections/";
/** /statut */
const CTX_STATUT: string = '/statut';
/** /duree */
const CTX_DUREES: string = "/durees";

@Injectable({
  providedIn: 'root'
})
export class FicheAppelApiService implements IficheAppelApiService {

  private urlBase: string;
  private urlSanteApi: string;
  private ctxRechercherAppelAnterieur: string = '/rechercher-appels-anterieur';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlSanteApi + '/fiches-appel/';
    this.urlSanteApi = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('FicheAppelApiService');
  }

  getFicheAppel(id: number): Observable<FicheAppelDTO> {
    return this.http.get<FicheAppelDTO>(this.urlBase + id);
  }

  /**Retourne null si la fiche n'existe pas, au lieu d'une exception */
  getFicheAppelIfExist(id: number): Observable<FicheAppelDTO> {
    return this.http.get<FicheAppelDTO>(this.urlBase + "if-exists/" + id);
  }

  validerFicheAppelPourTerminer(idFicheAppel: number, codePostalUsagerInconnu: boolean, sexeUsagerInconnu: boolean, dateNaissanceUsagerLie: Date | string): Observable<FicheAppelDTO> {
    const dateNaiss: string = typeof dateNaissanceUsagerLie === "string" ? dateNaissanceUsagerLie : DateUtils.getDateToAAAAMMJJ(dateNaissanceUsagerLie as Date);

    let qryParams: HttpParams = new HttpParams()
      .set('codePostalUsagerLieInconnu', String(codePostalUsagerInconnu))
      .set('sexeUsagerLieInconnu', String(sexeUsagerInconnu))
      .set('dateNaissanceUsagerLie', dateNaiss);
    return this.http.get<FicheAppelDTO>(this.urlBase + idFicheAppel + CTX_VALIDER_TERMINER, { params: qryParams });
  }

  terminerFicheAppel(ficheAppelDto: FicheAppelDTO): Observable<FicheAppelDTO> {
    return this.http.put<FicheAppelDTO>(this.urlBase + ficheAppelDto.id + CTX_TERMINER, ficheAppelDto, {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
    });
  }

  updateFicheAppel(ficheAppel: FicheAppelDTO, urlPage?: EnumUrlPageFicheAppel): Observable<FicheAppelDTO> {
    const url: string = this.generateApiUrl(urlPage, ficheAppel);
    return this.http.put<FicheAppelDTO>(url, JSON.stringify(ficheAppel), {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
    });
  }

  autoSaveFicheAppel(ficheAppel: FicheAppelDTO, urlPage?: EnumUrlPageFicheAppel): void {
    const jsonFicheAppel = JSON.stringify(ficheAppel);
    const url: string = this.generateApiUrl(urlPage, ficheAppel);

    // Création d'un blob pour permettre l'envoie de données json.
    const blob = new Blob([jsonFicheAppel], { type: 'application/json; charset=UTF-8' });

    // L'auto sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
    // la requête est annulée à la destruction de l'appelant.
    // ATTENTION, sendBeacon effectue un POST
    navigator.sendBeacon(url, blob);
  }

  getFichesAppelNonTerminees(): Observable<FicheAppelNonTermineeDTO[]> {
    return this.http.get<FicheAppelNonTermineeDTO[]>(this.urlSanteApi + "/fiches-appel-non-terminer");
  }

  getListeFicheNonTermineesByAppel(idAppel: number): Observable<FicheAppelDTO[]> {
    return this.http.get<FicheAppelDTO[]>(this.urlSanteApi + "/fiches-appel-non-terminer/" + idAppel);
  }

  supprimerFicheAppel(idFicheAppel: number, urlPage?: EnumUrlPageFicheAppel): Observable<any> {
    const url: string = this.generateApiUrlByIdFicheAppel(urlPage, idFicheAppel);

    return this.http.delete(url);
  }

  getSignatureData(idFicheAppel: number): Observable<SignatureDTO[]> {
    return this.http.get<SignatureDTO[]>(this.urlBase + idFicheAppel + "/signature");
  }

  /**
   * Retourne le statut d'une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @returns un StatutFicheAppelEnum ou null si la fiche n'existe pas
   */
  getStatutFicheAppel(idFicheAppel: number): Observable<StatutFicheAppelEnum> {
    return this.http.get<StatutFicheAppelEnum>(this.urlBase + idFicheAppel + CTX_STATUT);
  }

  /**
   * Vérifie si une fiche d'appel peut être accédée par l'utilisateur connecté.
   * @param idFicheAppel identifiant de la fiche d'appel à valider
   */
  isFicheAppelAccessible(idFicheAppel: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlBase + idFicheAppel + "/accessible");
  }

  /**
   * Vérifie si une fiche d'appel peut être modifiée par l'utilisateur connecté.
   * @param idFicheAppel identifiant de la fiche d'appel à valider
   */
  isFicheAppelModifiable(idFicheAppel: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlBase + idFicheAppel + "/modifiable");
  }

  private generateApiUrl(urlPage: EnumUrlPageFicheAppel, ficheAppel: FicheAppelDTO): string {
    return (urlPage ? this.urlSanteApi + urlPage : this.urlBase) + ficheAppel.id;
  }

  private generateApiUrlByIdFicheAppel(urlPage: EnumUrlPageFicheAppel, idFicheAppel: number): string {
    return (urlPage ? this.urlSanteApi + urlPage : this.urlBase) + idFicheAppel;
  }

  genererPdf(dto: ImpressionFicheSanteDTO): Observable<ImpressionFicheDTO> {
    return this.http.post<ImpressionFicheDTO>(this.urlBase + dto.idFicheAppel + "/pdf", dto);
  }

  /**Méthode responsable de l'ajout de l'action de consultation d'une fiche d'appel
   * dans la table FICHE_APPEL_ACTION_AUD
   */
  auditConsultation(idFicheAppel: number): Observable<void> {
    return this.http.get<void>(this.urlBase + idFicheAppel + "/audit-consultation");
  }

  /**
   * Recherche les appels antérieurs selon des critères.
   * @param criteresRecherche critères de recherche des appels antérieurs
   */
  rechercherAppelAnterieur(criteresRecherche: RechercheFicheAppelCriteresDTO): Observable<AppelAnterieurDTO[]> {
    const apiUrl: string = this.urlSanteApi + this.ctxRechercherAppelAnterieur;
    return this.http.post<AppelAnterieurDTO[]>(apiUrl, criteresRecherche);
  }

  /**
   * Générer le fichier excel des appels antérieurs selon des critères.
   * @param criteresRecherche critères de recherche des appels antérieurs
   */
  genererExcelAppelAnterieur(criteresRecherche: RechercheFicheAppelCriteresDTO): Observable<ExportationExcelDTO> {
    const apiUrl: string = this.urlSanteApi + this.ctxRechercherAppelAnterieur + "/download";
    return this.http.post<ExportationExcelDTO>(apiUrl, criteresRecherche);
  }

  convertByteDataToExcelAndMakeDownload(fileContent: any, fileName: string) {
    if (fileContent) {
      const a = document.createElement('a');
      document.body.appendChild(a);

      const data: any = fileContent;
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      let blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileURL = window.URL.createObjectURL(blob);
      a.href = fileURL;
      a.download = fileName;
      a.click();
    }
  }

  isFicheAppelSupprimableContexteCti(idFicheAppel: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlBase + idFicheAppel + "/supprimable-contexte-cti");
  }

  /**
   * Retourne la somme des durées d'une fiche d'appel.
   * @param idFicheAppel 
   * @returns 
   */
  getSommeDureesFichesAppel(idFicheAppel: number): Observable<number> {
    return this.http.get<number>(this.urlBase + idFicheAppel + CTX_DUREES + "/somme");
  }

}
