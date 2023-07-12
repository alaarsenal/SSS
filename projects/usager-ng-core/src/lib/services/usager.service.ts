import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { Observable, of } from 'rxjs';
import { AppelAnterieurDTO } from '../models/appel-anterieur-dto';
import { AutresInfosDTO } from '../models/autres-infos-dto';
import { ConsultationAlertesCritereDTO } from '../models/consultation-alertes-critere-dto';
import { ConsultationAlertesDTO } from '../models/consultation-alertes-dto';
import { ConsultationBandeauDTO } from '../models/consultation-bandeau-dto';
import { ConsultationRessourcesProfessionellesDTO } from '../models/consultation-ressources-professionnelles-dto';
import { DatesDTO } from '../models/dates-dto';
import { EnregistrementsUsagerResultatDTO } from '../models/enregistrements-usager-resultat-dto';
import { ExportationExcelDTO } from '../models/exportation-excel-dto';
import { IndicateursMesuresSecuriteDTO } from '../models/indicateurs-mesures-securite';
import { InformationsGeneralesDTO } from '../models/informations-generales-dto';
import { MedicationDTO } from '../models/medication-dto';
import { OrganismeDTO } from '../models/organisme-dto';
import { RechercheListEnregistrementCritereDTO } from '../models/recherche-liste-enregistrement-critere-dto';
import { RechercheSuiviEnregistramentResultatDTO } from '../models/recherche-suivi-enregistrament-resultat-dto ';
import { RechercheSuiviEnregistrementCritereDTO } from '../models/recherche-suivi-enregistrement-critere-dto';
import { RechercheUsagerCritereDTO } from '../models/recherche-usager-critere-dto';
import { ResultatRechercheUsagerDTO } from '../models/resultat-recherche-usager-dto';
import { SigctOrganismeDTO } from '../models/sigct-organisme-dto';
import { SigctSiteDTO } from '../models/sigct-site-dto';
import { SigctUserDTO } from '../models/sigct-user-dto';
import { SoinServiceDTO } from '../models/soin-service-dto';
import { TherapieDTO } from '../models/therapie-dto';
import { UsagerDTO } from '../models/usager-dto';
import { UsagerIdentHistoDTO } from '../models/usager-ident-histo-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

/** /historiques/ */
const CTX_HISTORIQUES: string = '/historiques/';
/** /exists-sexe/ */
const CTX_SEXE_EXISTS: string = '/exists-sexe/';
/** /appels-anterieur/ */
const CTX_APPELS_ANTERIEURS: string = '/appels-anterieur/';
/** /date-derniere-modif/ */
const CTX_DATE_DERN_MODIF: string = '/date-derniere-modif/';

@Injectable(
  { providedIn: 'root' }
)
export class UsagerService {
  /** Url de base de l'api (.../api)*/
  private baseUrlApiUsager: string;
  /** Url de l'api REST Usager (.../api/usagers-ident)*/
  private urlApiUsager: string;
  private urlApiHisto: string;


  private lastCritereRechercheUsager: RechercheUsagerCritereDTO;

  /** "/validations" */
  private ctxAvertissements = '/validations';
  /** "/rechercher" */
  private ctxRechercher = '/rechercher';
  /** "/rechercher-appels-anterieur" */
  // private ctxRechercherAppelAnterieur = '/rechercher-appels-anterieur';

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
  ) {

    this.baseUrlApiUsager = window["env"].urlUsagerApi;
    this.urlApiUsager = window["env"].urlUsagerApi + "/usagers-ident";
    this.urlApiHisto = window["env"].urlUsagerApi;

    httpErrorHandler.createHandleError('UsagerService'); //Important pour instancier correctement le service

  }

  /**
   * Lance un appel au service pour garder la session active.
   */
  public keepAlive(): Observable<string> {
    return this.http.get<string>(this.baseUrlApiUsager + "/keep-alive");
  }

  /**
   * Création d'un nouvel usager dans la BD avec les valeurs par défaut suivantes :
   * - actif
   * - anonyme
   * - non malentendant
   * @returns l'usager créé
   */
  creerUsager(): Observable<UsagerDTO> {
    let usager: UsagerDTO = new UsagerDTO();
    usager.actif = true;
    usager.malentendant = false;
    usager.niveauIdent = "ANONYME";

    return this.sauvegarderUsager(usager);
  }

  sauvegarderUsager(usagerDTO: UsagerDTO): Observable<UsagerDTO> {
    if (usagerDTO?.id) {
      return this.http.put<UsagerDTO>(this.urlApiUsager + "/" + usagerDTO.id, usagerDTO, httpOptions);
    } else {
      return this.http.post<UsagerDTO>(this.urlApiUsager, usagerDTO, httpOptions);
    }
  }

  /**Sauvegarder les données avant une navigation externe */
  autoSaveUsager(usagerDTO: UsagerDTO): void {
    const dtoJson = JSON.stringify(usagerDTO);

    // Création d'un blob pour permettre l'envoie de données json.
    const blob = new Blob([dtoJson], { type: 'application/json; charset=UTF-8' });

    // L'auto sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
    // la requête est annulée à la destruction de l'appelant.
    // ATTENTION, sendBeacon effectue un POST
    navigator.sendBeacon(this.urlApiUsager, blob);
  }

  obtenirAvertissements(id: number): Observable<Map<object, string>[]> {
    return this.http.get<Map<object, string>[]>(this.urlApiUsager + "/" + id + this.ctxAvertissements);
  }

  getUsager(id: number): Observable<UsagerDTO> {
    return this.http.get<UsagerDTO>(this.urlApiUsager + '/' + id);
  }

  getUsagerHisto(id: number): Observable<UsagerIdentHistoDTO> {
    return this.http.get<UsagerIdentHistoDTO>(this.urlApiHisto + '/historiques/' + id);
  }

  getUsagerExiste(id: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlApiUsager + '/' + id + '/existe');
  }

  creerHistoriqueUsagerIdent(idUsagerIdent: number): Observable<UsagerIdentHistoDTO> {
    if (!idUsagerIdent) {
      return of(null);
    }
    const url: string = this.urlApiUsager + '/' + idUsagerIdent + CTX_HISTORIQUES;
    return this.http.post<UsagerIdentHistoDTO>(url, null);
  }

  rechercherUsager(critereRecherche: RechercheUsagerCritereDTO): Observable<ResultatRechercheUsagerDTO> {
    return this.http.post<ResultatRechercheUsagerDTO>(this.urlApiUsager + this.ctxRechercher, critereRecherche, httpOptions);
  }

  rechercherNbUsagers(critereRecherche: RechercheUsagerCritereDTO): Observable<number> {
    return this.http.post<number>(this.urlApiUsager + "/rechercher-nb-usagers", critereRecherche, httpOptions);
  }

  sauvegarderCritereRecherche(critereRecherche: RechercheUsagerCritereDTO) {
    this.lastCritereRechercheUsager = critereRecherche;
  }

  getCritereRecherhce(): RechercheUsagerCritereDTO | null {
    return this.lastCritereRechercheUsager;
  }

  /**
   * Recherche les appels antérieurs selon des critères.
   * @param criteresRecherche critères de recherche des appels antérieurs
   */
  // rechercherAppelAnterieur(criteresRecherche: RechercheFicheAppelCriteresDTO): Observable<AppelAnterieurDTO[]> {
  //   return this.http.post<AppelAnterieurDTO[]>(this.urlApiUsager + this.ctxRechercherAppelAnterieur, criteresRecherche, httpOptions);
  // }

  getEnregistrementsUsager(usagerId: number): Observable<EnregistrementsUsagerResultatDTO[]> {
    return this.http.get<EnregistrementsUsagerResultatDTO[]>(this.urlApiUsager + "/" + usagerId + "/enregistrements", httpOptions);
  }

  getSuiviEnregistrementsUsager(critere: RechercheSuiviEnregistrementCritereDTO): Observable<RechercheSuiviEnregistramentResultatDTO[]> {
    return this.http.post<RechercheSuiviEnregistramentResultatDTO[]>(this.urlApiUsager + "/suivi-enregistrements", critere);
  }

  getListeEnregistrementsUsager(critere: RechercheListEnregistrementCritereDTO): Observable<RechercheSuiviEnregistramentResultatDTO[]> {
    return this.http.post<RechercheSuiviEnregistramentResultatDTO[]>(this.urlApiUsager + "/list-enregistrements", critere);
  }

  getConsultationAlertesUsager(critere: ConsultationAlertesCritereDTO): Observable<ConsultationAlertesDTO[]> {
    return this.http.post<ConsultationAlertesDTO[]>(this.urlApiUsager + "/consultation-alertes", critere);
  }

  getGestionnairesUtilisateurAuthentifie(): Observable<SigctUserDTO[]> {
    return this.http.get<SigctUserDTO[]>(this.urlApiUsager + "/consultation-alertes/gestionnaires", httpOptions);
  }

  getAllSitesOrgUtilisateurAuthentifie(): Observable<SigctSiteDTO[]> {
    return this.http.get<SigctSiteDTO[]>(this.urlApiUsager + "/consultation-alertes/sites", httpOptions);
  }

  sauvegarderConsultationsAlertes(consultationAlertes: ConsultationAlertesDTO[]): Observable<ConsultationAlertesDTO[]> {
    return this.http.post<ConsultationAlertesDTO[]>(this.urlApiUsager + "/consultation-alertes/sauvegarder", consultationAlertes);
  }


  isFicheEnregistementAjoutableSelonEntentes(usagerId: number, idStOrganisme: number, idStRegion: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlApiUsager + "/" + usagerId + "/enregistrement/sigctorganisme/" + idStOrganisme + "/region/" + idStRegion);
  }


  genererNouvelEnregistrementUsager(usagerId: number): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.get<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/generer");
  }

  reviserEnregistrementUsager(usagerId: number, usagerEnregistrementDTO: EnregistrementsUsagerResultatDTO): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.post<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/reviser", usagerEnregistrementDTO);
  }

  ajouterEnregistrementUsager(usagerId: number, usagerEnregistrementDTO: EnregistrementsUsagerResultatDTO): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.post<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement", usagerEnregistrementDTO);
  }

  consulterEnregistrementUsager(usagerId: number, enregistrementId: number): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.get<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/" + enregistrementId + "/consulter");
  }

  editerEnregistrementUsager(usagerId: number, enregistrementId: number): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.get<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/" + enregistrementId + "/editer");
  }

  copierEnregistrementUsager(usagerId: number, enregistrementId: number): Observable<EnregistrementsUsagerResultatDTO> {
    return this.http.post<EnregistrementsUsagerResultatDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/" + enregistrementId + "/copier", null);
  }

  getEnregistrementOrganismes(usagerId: number): Observable<SigctOrganismeDTO[]> {
    return this.http.get<SigctOrganismeDTO[]>(this.urlApiUsager + "/" + usagerId + "/enregistrement/organismes", httpOptions);
  }

  getEnregistrementSites(usagerId: number, organismeId: number): Observable<SigctSiteDTO[]> {
    return this.http.get<SigctSiteDTO[]>(this.urlApiUsager + "/" + usagerId + "/enregistrement/organisme/" + organismeId + "/sites", httpOptions);
  }

  getOrganiemesEnregistrementsByRegionAuthentifie(): Observable<SigctOrganismeDTO[]> {
    return this.http.get<SigctOrganismeDTO[]>(this.urlApiUsager + "/enregistrement/organismes-enregistrement-region", httpOptions);
  }

  getEnregistrementSitesUtilisateurAuthentifie(): Observable<SigctSiteDTO[]> {
    return this.http.get<SigctSiteDTO[]>(this.urlApiUsager + "/enregistrement/organisme/sites", httpOptions);
  }

  getEnregistrementGestionnaires(usagerId: number, organismeId: number): Observable<SigctUserDTO[]> {
    return this.http.get<SigctUserDTO[]>(this.urlApiUsager + "/" + usagerId + "/enregistrement/organisme/" + organismeId + "/gestionnaires", httpOptions);
  }

  getEnregistrementGestionnairesIncludInactif(usagerId: number, organismeId: number): Observable<SigctUserDTO[]> {
    return this.http.get<SigctUserDTO[]>(this.urlApiUsager + "/" + usagerId + "/enregistrement/organisme/" + organismeId + "/gestionnaires/all", httpOptions);
  }

  getEnregistrementGestionnairesUtilisateurAuthentifie(): Observable<SigctUserDTO[]> {
    return this.http.get<SigctUserDTO[]>(this.urlApiUsager + "/enregistrement/organisme/gestionnaires", httpOptions);
  }

  getEnregistrementOrganismeById(usagerId: number, organismeId: number): Observable<SigctOrganismeDTO> {
    return this.http.get<SigctOrganismeDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/organisme/" + organismeId, httpOptions);
  }

  getEnregistrementSiteById(usagerId: number, siteId: number): Observable<SigctSiteDTO> {
    return this.http.get<SigctSiteDTO>(this.urlApiUsager + "/" + usagerId + "/enregistrement/site/" + siteId, httpOptions);
  }

  consulterDates(enregistrementId: number): Observable<DatesDTO> {
    return this.http.get<DatesDTO>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/dates");
  }

  consulterOrganismesEnregistreurs(enregistrementId: number): Observable<OrganismeDTO[]> {
    return this.http.get<OrganismeDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/organismes");
  }

  consulterInformationsGenerales(enregistrementId: number): Observable<InformationsGeneralesDTO> {
    return this.http.get<InformationsGeneralesDTO>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/informations-generales");
  }

  consulterRessourcesProfessionnelles(enregistrementId: number): Observable<ConsultationRessourcesProfessionellesDTO[]> {
    return this.http.get<ConsultationRessourcesProfessionellesDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/ressources-professionnelles");
  }

  /**
   * Vérifie l'existence du sexe pour un usager.
   * @param idUsagerIdent identifiant de l'usager
   */
  existsSexeUsager(idUsagerIdent: number): Observable<boolean> {
    const url: string = this.urlApiUsager + "/" + idUsagerIdent + CTX_SEXE_EXISTS;
    return this.http.get<boolean>(url, httpOptions);
  }
  consulterSoinsServices(enregistrementId: number): Observable<SoinServiceDTO[]> {
    return this.http.get<SoinServiceDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/soins-services");
  }

  consulterMesuresSecurite(enregistrementId: number): Observable<IndicateursMesuresSecuriteDTO[]> {
    return this.http.get<IndicateursMesuresSecuriteDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/mesures-securite");
  }

  getAppelsAnterieursUsager(idUsagerIdent: number): Observable<AppelAnterieurDTO[]> {
    return this.http.get<AppelAnterieurDTO[]>(this.urlApiUsager + "/" + idUsagerIdent + CTX_APPELS_ANTERIEURS);
  }
  consulterMedications(enregistrementId: number): Observable<MedicationDTO[]> {
    return this.http.get<MedicationDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/medications");
  }

  consulterTherapieIntraveineuse(enregistrementId: number): Observable<TherapieDTO> {
    return this.http.get<TherapieDTO>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/therapie");
  }

  consulterFichiers(enregistrementId: number, codeTypeFichier: string): Observable<UsagerSanterSocialFichierDTO[]> {
    return this.http.get<UsagerSanterSocialFichierDTO[]>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/fichiers/" + codeTypeFichier);
  }

  consulterAutresInformations(enregistrementId: number): Observable<AutresInfosDTO> {
    return this.http.get<AutresInfosDTO>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/autres-infos");
  }

  consulterBandeau(enregistrementId: number): Observable<ConsultationBandeauDTO> {
    return this.http.get<ConsultationBandeauDTO>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter/bandeau");
  }

  getBaseApiUrlUsager(): string {
    return this.baseUrlApiUsager;
  }

  /**
   * Journalise la consultation d'un enregistrement.
   * @param enregistrementId identifiant de l'enregistrement consulté
   */
  journaliserConsultationEnregistrement(enregistrementId: number): Observable<void> {
    return this.http.get<void>(this.baseUrlApiUsager + "/enregistrement/" + enregistrementId + "/consulter");
  }

  getAllAlertesEnregistrements(enregistrementId: number): Observable<ConsultationAlertesDTO[]> {
    return this.http.get<ConsultationAlertesDTO[]>(this.urlApiUsager + "/enregistrement/" + enregistrementId + "/alertes");
  }
  /**
 * Journalise la consultation d'un usager.
 * @param idUsager identifiant de l'usager consulté
 */
  journaliserConsultationUsager(idUsager: number): Observable<void> {
    return this.http.get<void>(this.urlApiUsager + "/" + idUsager + "/audit-consultation");
  }

  // genererExcelAppelAnterieur(criteresRecherche: RechercheFicheAppelCriteresDTO): Observable<ExportationExcelDTO> {
  //   const url: string = this.urlApiUsager + this.ctxRechercherAppelAnterieur;
  //   return this.http.post<ExportationExcelDTO>(url + "/download", criteresRecherche);
  // }

  genererExcelListeEnregistrementsUsager(criteresRecherche: RechercheListEnregistrementCritereDTO): Observable<ExportationExcelDTO> {
    return this.http.post<ExportationExcelDTO>(this.urlApiUsager + "/list-enregistrements/download", criteresRecherche);
  }

  genererExcelSuiviEnregistrementsUsager(criteresRecherche: RechercheSuiviEnregistrementCritereDTO): Observable<ExportationExcelDTO> {
    return this.http.post<ExportationExcelDTO>(this.urlApiUsager + "/suivi-enregistrements/download", criteresRecherche);
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

  public solrIndexUsagers(idUsagerIdents: number[]): Observable<UsagerDTO[]> {
    const url: string = this.baseUrlApiUsager + "/usagers-sorlindex"
    return this.http.post<UsagerDTO[]>(url, idUsagerIdents, httpOptions);
  }

  isUsagerActif(id: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlApiUsager + '/' + id + '/active');
  }

  getDateDerniereModifUsager(idUsagerIdent: number): Observable<Date> {
    return this.http.get<Date>(this.urlApiUsager + '/' + idUsagerIdent + CTX_DATE_DERN_MODIF);
  }
}
