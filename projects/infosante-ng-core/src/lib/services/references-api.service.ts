import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { ReferenceDTO } from '../models/reference-dto';
import { ReferenceSourceInformationDTO } from '../models/reference-source-information-dto';

@Injectable({
  providedIn: 'root'
})
export class ReferencesApiService {

  //Changer selon l'environnement pour l'instant
  private urlApiReferences: string;

  //Contexte pour les services de références
  private ctxAntecedent = '/antecedents';
  private ctxCategorieAppelant = '/categories-appelant';
  private ctxCentreActivite = '/centres-activite';
  private ctxLangueAppel = '/langues-appel';
  private ctxLigneCommunication = '/lignes-communication';
  private ctxMedication = '/medications';
  private ctxManifestation = '/manifestations';
  private ctxNiveauUrgence = '/niveaux-urgence';
  private ctxOrientation = '/orientations';
  private ctxProgrammeService = '/programmes-service';
  private ctxRaisonAppel = '/raisons-appel';
  private ctxRaisonCpInconnu = '/raisons-cp-inconnu';
  private ctxRaisonTypeFiche = '/raisons-type-fiche';
  private ctxReseauSoutien = '/reseaux-soutien';
  private ctxReferences = '/references';
  private ctxRessourceConsulte = '/ressources-consulte';
  private ctxRessourceSuivi = '/ressources-suivi';
  private ctxResultatObtenu = '/resultats-obtenu';
  private ctxRoleAction = '/roles-action';
  private ctxSourceInformation = '/sources-information';
  private ctxSysteme = '/systemes';
  private ctxTemperatureVoie = '/temperatures-voie';
  private ctxTypeCommunication = '/types-communication';
  private ctxTypeConsultation = '/types-consultation';
  private ctxTypeNote = '/types-note';
  private ctxValidation = '/validations';
  private ctxProjetRecherche = '/projet-recherche';

  private ctxIntervenants = '/intervenants';
  private ctxIntervenantsRech = '/intervenants-recherche';
  private ctxOrganismes = '/organismes';
  private ctxInforUtile = '/categories-infor-utile';

  private ctxTypeFichier = '/type-fichier';
  private ctxUtilisateursOrganismeISA = '/utilisateurs-organisme-isa';
  private ctxUtilisateursOrganismeConnecte = '/utilisateurs-organisme-connecte';

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
  ) {

    httpErrorHandler.createHandleError('ReferencesService'); //Important pour instancier correctement le service

    this.urlApiReferences = window["env"].urlSanteApi + '/references';
  }

  // Extraction de la liste de valeur pour les antecedents
  public getListeAntecedent(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxAntecedent);
  }

  // Extraction de la liste de valeur pour les antecedents par Systeme
  public getListeAntecedentParSysteme(idSysteme: number): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxSysteme + "/" + idSysteme + this.ctxAntecedent);
  }
  /**
   * Extraction de la liste des catégories d'appelant actives.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeCategorieAppelant(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxCategorieAppelant, { params: qryParams });
  }

  /**
   * Extraction de la liste des langues d'appel actives.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeLangueAppel(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxLangueAppel, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les lignes de communication
  public getListeLigneCommunication(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxLigneCommunication);
  }

  //Extraction de la liste de valeur pour les centres d'activités
  public getListeCentreActivite(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxCentreActivite);
  }

  //Extraction de la liste de valeur pour les manifestations
  public getListeManifestation(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxManifestation);
  }

  // //Extraction de la liste de valeur pour les manifestations par Systeme
  public getListeManifestationParSysteme(idSysteme: number): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxSysteme + "/" + idSysteme + this.ctxManifestation);
  }



  /**
   * Extraction de la liste des niveaux d'urgence actifs.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeNiveauUrgence(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxNiveauUrgence, { params: qryParams });
  }

  /**
   * Extraction de la liste des orientations actives.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeOrientation(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxOrientation, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les programmes.
  public getListeProgrammeService(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxProgrammeService);
  }

  /**
   * Extraction de la liste des raisons d'un appel
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeRaisonAppel(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxRaisonAppel, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les raisons d'un code postal inconnu de l'usager
  public getListeRaisonCpInconnu(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxRaisonCpInconnu);
  }

  //Extraction de la liste de valeur pour les raisons d'une fiche d'appel non pertinente
  public getListeRaisonTypeFiche(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxRaisonTypeFiche);
  }


  /**
   * Extraction de la liste des références.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeReference(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxReferences, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les réseaux de soutien
  public getListeReseauSoutien(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxReseauSoutien);
  }

  //Extraction de la liste de valeur pour les ressources consultées
  public getListeRessourceConsulte(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxRessourceConsulte);
  }

  //Extraction de la liste de valeur pour les ressources suivies
  public getListeRessourceSuivi(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxRessourceSuivi);
  }

  //Extraction de la liste de valeur pour les résultats obtenus
  public getListeResultatObtenu(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxResultatObtenu);
  }

  /**
   * Extraction de la liste de valeur pour les rôles et actions actifs.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeRoleAction(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxRoleAction, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les sources d'information
  public getListeSourceInformation(): Observable<ReferenceSourceInformationDTO[]> {
    return this.http.get<ReferenceSourceInformationDTO[]>(this.urlApiReferences + this.ctxSourceInformation);
  }

  //Extraction de la liste de valeur pour les systèmes
  public getListeSysteme(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxSysteme);
  }

  //Extraction de la liste de valeur pour les systèmes
  public getListeSystemeAvecAntecedents(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxSysteme + '/avec-antecedents');
  }

  //Extraction de la liste de valeur pour les systèmes
  public getListeSystemeAvecManifestation(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxSysteme + '/avec-manifestations');
  }

  //Extraction de la liste de valeur pour les voies de température
  public getListeTemperatureVoie(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTemperatureVoie);
  }

  //Extraction de la liste de valeur pour les types de communications
  public getListeTypeCommunication(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypeCommunication);
  }

  //Extraction de la liste de valeur pour les types de consultations
  public getListeTypeConsultation(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypeConsultation);
  }

  /**
   * Extraction de la liste de valeur pour les  types de notes actifs.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeTypeNote(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxTypeNote, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les validations
  public getListeValidation(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxValidation);
  }

  //Extraction de la liste de valeur pour les ressources consultées
  public getListeProjetRecherche(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxProjetRecherche);
  }

  /**
   * Extraction de la liste des intervenants d'un organisme.
   * @param idStOrganisme identifiant de l'organisme auquel les intervenant doivent appartenir
   * @param role rôle que les intervenants doivent posséder
   * @param isPourCritereRech indique si on récupère les intervenants pour alimenter des critères de recherche
   */
  public getListeIntervenantOrganismeWithRole(idStOrganisme: number, role: string, isPourCritereRech: boolean): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams().set('hasRole', role);

    const id: number = idStOrganisme ? idStOrganisme : 0;
    const typeIntervenant: string = isPourCritereRech == true ? this.ctxIntervenantsRech : this.ctxIntervenants;
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxOrganismes + "/" + id + typeIntervenant, { params: qryParams });
  }

  /**
   * Extraction de la liste des organismes.
   */
  public getListeOrganisme(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxOrganismes);
  }
  /**
     * Extraction de la liste des organismes.
     */
  public getListeCategorieInforUtile(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxInforUtile);
  }

  // Extraction de la liste de type de fichier.
  public getListeTypeFichier(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypeFichier);
  }

  // Extraction de la liste des utilisateurs de l'organisme connecté
  public getListeUtilisateursOrganismeConnecte(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxUtilisateursOrganismeConnecte);
  }

  // Extraction de la liste des utilisateurs des organismes ISA
  public getListeUtilisateursOrganismeISA(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxUtilisateursOrganismeISA);
  }
}
