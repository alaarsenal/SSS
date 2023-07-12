import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConsultationAlertesCritereDTO } from 'projects/usager-ng-core/src/lib/models/consultation-alertes-critere-dto';
import { RechercheSuiviEnregistrementCritereDTO } from 'projects/usager-ng-core/src/lib/models/recherche-suivi-enregistrement-critere-dto';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import AuthenticationUtils from './authentication-utils';
import { User } from "./user";

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  /**Utilisé pour informer lorsque l'utilisateur est authentifié */
  private userSubject: Subject<User> = new Subject();

  constructor(private http: HttpClient,
   ) {
  }

  /**
   * Appel le service web pour récupérer les informations de l'utilisateur connecté.
   */
  private callUserMeApi(): Observable<string> {
    return this.http.get<string>(window["env"].urlUserMe);
  }

  /**
   * Supprime les informations stockées dans les storages.
   */
  private cleanStorages(): void {
    AuthenticationUtils.removeUser();
    localStorage.removeItem("rechercher");
    localStorage.removeItem(RechercheSuiviEnregistrementCritereDTO.CACHED_CRITERES_KEY);
    localStorage.removeItem(ConsultationAlertesCritereDTO.CACHED_CRITERES_KEY);
    sessionStorage.removeItem("version");
  }

  /**
   * Déconnecte l'utilisateur et retour au login.
   * @param url
   */
  logout(url: string): Observable<any> {
    this.triggerUserSubject(null);
    this.cleanStorages();
    return this.http.post<String>(url, httpOptions).pipe();
  }

  /**
   * Lance un appel au serveur Portail pour garder la session active.
   */
  setSessionActivePortail(): Observable<string> {
    return this.http.get<string>(window["env"].urlPortail + "keep-active-session");
  }

  /**
   * Retourne true si l'utilisateur est authentifié.
   */
  isAuthenticated(): Boolean {
    return AuthenticationUtils.isAuthenticated();
  }

  /**
   * Retourne true si l'utilisateur possède un de ces rôles.
   * @param roles liste de rôles
   */
  hasAnyRole(roles: Array<string>): boolean {
    return AuthenticationUtils.hasAnyRole(roles);
  }

  /**
   * Retourne true si l'utilisateur possède tous ces rôles.
   * @param roles liste de rôles
   */
  hasAllRoles(roles: Array<string>): boolean {
    return AuthenticationUtils.hasAllRoles(roles);
  }

  /**
   * Retourne l'utilisateur connecté.
   */
  getAuthenticatedUser(): User {
    return AuthenticationUtils.getUserFromStorage();
  }

  /**
   * Récupère les informations de l'utilisateur connecté sur le serveur.
   */
  retrieveUserFromApiUserMe(): Observable<User> {
    return this.callUserMeApi().pipe(map(
      res => {
        let resp = JSON.stringify(res);
        let respObj = JSON.parse(resp);

        let user: User = null;

        if (respObj.status == "NOT-AUTHORIZED") {
          window.location.href = window["env"].urlPortail;
        } else {

          let authorities = new Array<string>();
          respObj.principal.authorities.forEach(element => {
            authorities.push(element.authority);
          });

          user = {
            name: respObj.principal.name,
            authorities: authorities,
            prenom: respObj.PrenomUser,
            nomFamille: respObj.NomUser,
            idOrganismeCourant: respObj.IdOrganismeCourant,
            nomOrganismeCourant: respObj.NomOrganismeCourant,
            codeOrganismeCourant: respObj.CodeOrganismeCourant,
            codRegionOrganismeCourant: respObj.CodRegionOrganismeCourant,
            nomRegionOrganismeCourant: respObj.NomRegionOrganismeCourant,
            NbDaysToPwdExpire: respObj.NbDaysToPwdExpire
          };
          AuthenticationUtils.saveUser(user);
          //Informer l'authentification de l'utilisateur à qui le veut
          this.triggerUserSubject(user);
          return user;
        }
      },
      err => {
        console.error("ERR: AuthenticationService.getUserInfo() retourne HTTP:" + err.status);
        if (err.status == 401 || err.status == 403) {
          window.location.href = window["env"].urlPortail;
        }
        return null;
      }
    ));
  }

  /**
   * Informer l'authentification de l'utilisateur
   * @param user
   */
  triggerUserSubject(user: User): void {
    this.userSubject.next(user);
  }

  /**
   * Souscrire à l'authentification d'un utilisateur
   * @returns Observable<User>
   */
  listenUserSubject(): Observable<User> {
    return this.userSubject.asObservable();
  }
}
