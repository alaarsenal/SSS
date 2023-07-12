import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferencesService {

  // Url de l'api REST des References
  urlApiReferences: string;

  //Contexte pour les services de références
  ctxTypesEquipements = '/types-equipements-communication';
  ctxTypesCoordonnees = '/types-coordonnees-communication';
  ctxTypesRegions = '/types-region';
  ctxTypesAdresses = '/types-adresse';
  ctxTypesPays = '/types-pays';
  ctxTypesImmeubles = '/types-immeuble';
  ctxTypesLanguesUsage = '/types-langues-usage';
  ctxTypesProvinces = '/types-province';
  ctxTypesSexes = '/types-sexe';
  ctxGroupesAge = '/groupes-age';
  ctxGroupesAgeByMois = '/groupes-age/mois/';
  ctxCategoriesAppelantInitial = '/categories-appelant';
  ctxLienRessourcePro = '/lien-ressource-pro';
  ctxProfil = '/profil';
  ctxMilieuVie = '/milieu-vie';
  ctxMesureSecurite = '/mesure-securite';
  ctxSoinsService = '/soins-service';
  ctxTypeFichier = '/type-fichier'
  private ctxUtilisateursOrganismeConnecte = '/utilisateurs-organisme-connecte';
  private ctxInforUtile = '/categories-infor-utile';

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.urlApiReferences = window["env"].urlUsagerApi + '/references';
    this.httpErrorHandler.createHandleError('ReferencesService'); //Important pour instancier correctement le service
  }

  //Extraction de la liste de valeur pour les type d'équipement
  public getListeTypeEquip(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesEquipements);
  }

  //Extraction de la liste de valeur pour les type de coordonnées
  public getListeCoord(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesCoordonnees);
  }

  //Extraction de la liste de valeur pour les type de adresses
  public getListeAdresse(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesAdresses);
  }

  //Extraction de la liste de valeur pour les type de pays
  public getListePays(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesPays);
  }

  /**
   * Extraction de la liste de valeur pour les type de regions.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeRegion(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxTypesRegions, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les types de catégorie d'immeubles
  public getListeImmeu(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesImmeubles);
  }

  /**
   * Extraction de la liste de valeur pour les types de langues.
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeLangue(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxTypesLanguesUsage, { params: qryParams });
  }

  //Extraction de la liste de valeur pour les types de province
  public getListeProvince(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypesProvinces);
  }

  /**
   * Extraction de la liste de valeur pour les types de sexes
   * @param inclureInactifs indique si on inclut les inactifs
   */
  public getListeSexe(inclureInactifs: boolean = false): Observable<ReferenceDTO[]> {
    let qryParams: HttpParams = new HttpParams()
      .set('inclureInactifs', String(inclureInactifs));
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxTypesSexes, { params: qryParams });
  }

  public getListeGroupeDAge(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxGroupesAge);
  }

  /**
   * Récupère le groupe d'âge dont le nombre de mois se situe entre son MIN et son MAX.
   * @param nbMois âge en nombre de mois
   * @returns un ReferenceDTO
   */
  public getGroupeDAgeByNbMois(nbMois: number): Observable<ReferenceDTO> {
    return this.http.get<ReferenceDTO>(this.urlApiReferences + this.ctxGroupesAgeByMois + nbMois);
  }

  public getListeCategoriesAppelant(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxCategoriesAppelantInitial);
  }

  // Extraction de la liste de valeur pour les liens de ressources professionelle
  public getListeLienRessourcePro(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxLienRessourcePro);
  }

  // Extraction de la liste de valeur pour les profils
  public getListeProfil(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxProfil);
  }

  // Extraction de la liste de valeur pour les milieux de vie
  public getListeMilieuVie(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxMilieuVie);
  }

  // Extraction de la liste de mesure de securite.
  public getListeMesureSecurite(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxMesureSecurite);
  }

  // Extraction de la liste de soins et service.
  public getListeSoinsService(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxSoinsService);
  }

  // Extraction de la liste de type de fichier.
  public getListeTypeFichier(): Observable<Object | any[]> {
    return this.http.get(this.urlApiReferences + this.ctxTypeFichier);
  }

  // Extraction de la liste des utilisateurs de l'organisme connecté
  public getListeUtilisateursOrganismeConnecte(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxUtilisateursOrganismeConnecte);
  }

  /**
   * Extraction de la liste des organismes.
   */
  public getListeCategorieInforUtile(): Observable<ReferenceDTO[]> {
    return this.http.get<ReferenceDTO[]>(this.urlApiReferences + this.ctxInforUtile);
  }

}
