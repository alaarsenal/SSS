import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { concatMap, retryWhen } from 'rxjs/operators';

/** "/keep-alive" */
const CTX_KEEP_ALIVE: string = "/keep-alive";
const NB_MAX_RETRY: number = 2;
const REQUEST_OPTIONS = { withCredentials: true };

@Injectable({
  providedIn: 'root'
})
export class KeepAliveService {
  private httpSansInterceptor: HttpClient;

  private urlApiIsiswHisto: string;
  private urlApiSante: string;
  private urlApiSanteGuide: string;
  private urlApiSocial: string;
  private urlApiSocialGuide: string;
  private urlApiUsager: string;

  constructor(
    private handler: HttpBackend) {
    this.urlApiIsiswHisto = window["env"].urlIsiswHisto + "/api";
    this.urlApiSante = window["env"].urlSanteApi;
    this.urlApiSanteGuide = window["env"].urlRpi + "/api";
    this.urlApiSocial = window["env"].urlInfoSocial + "/api";
    this.urlApiSocialGuide = window["env"].urlGippApi;
    this.urlApiUsager = window["env"].urlUsagerApi;


    // L'utilisation de HttpBackend permet de by-passer l'interceptor.
    this.httpSansInterceptor = new HttpClient(this.handler);
  }

  /**
   * Lance un appel au backend pour garder la session active dans Usager ou pour s'assurer que Usager possède une session.
   */
  public keepAliveIsiswHisto(): void {
    this.keepAliveIsiswHisto$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans Usager ou pour s'assurer que Usager possède une session.
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveIsiswHisto$(): Observable<string> {
    return this.keepAlive$(this.urlApiIsiswHisto + CTX_KEEP_ALIVE);
  }

  /**
   * Lance un appel au backend pour garder la session active dans Usager ou pour s'assurer que Usager possède une session.
   */
  public keepAliveUsager(): void {
    this.keepAliveUsager$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans Usager ou pour s'assurer que Usager possède une session.
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveUsager$(): Observable<string> {
    return this.keepAlive$(this.urlApiUsager + CTX_KEEP_ALIVE);
  }

  /**
   * Lance un appel au backend pour garder la session active dans info-santé.
   */
  public keepAliveSante(): void {
    this.keepAliveSante$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans info-santé.
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveSante$(): Observable<string> {
    return this.keepAlive$(this.urlApiSante + CTX_KEEP_ALIVE);
  }

  /**
   * Lance un appel au backend pour garder la session active dans les guides santé (GIEA).
   */
  public keepAliveSanteGuide(): void {
    this.keepAliveSanteGuide$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans les guides santé (GIEA).
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveSanteGuide$(): Observable<string> {
    return this.keepAlive$(this.urlApiSanteGuide + CTX_KEEP_ALIVE);
  }

  /**
   * Lance un appel au backend pour garder la session active dans info-social.
   */
  public keepAliveSocial(): void {
    this.keepAliveSocial$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans info-social.
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveSocial$(): Observable<string> {
    return this.keepAlive$(this.urlApiSocial + CTX_KEEP_ALIVE);
  }

  /**
   * Lance un appel au backend pour garder la session active dans les guides social (GIPP).
   */
  public keepAliveSocialGuide(): void {
    this.keepAliveSocialGuide$().subscribe();
  }

  /**
   * Lance un appel au backend pour garder la session active dans les guides social (GIPP).
   * @returns un Observable retournant la réponse serveur
   */
  public keepAliveSocialGuide$(): Observable<string> {
    return this.keepAlive$(this.urlApiSocialGuide + CTX_KEEP_ALIVE);
  }

  /**
   * @param urlKeepAlive 
   * @returns 
   */
  private keepAlive$(urlKeepAlive: string): Observable<string> {
    // Appel le keep-alive présent dans url. Pour contourner un problème de désynchonisation du login, on ré-essaie quelques
    // fois, tant que le statut 200 n'est pas reçu.
    //
    // Dans le déroulement normal de la vérification de l'authentification, une série de redirections se produit jusqu'à
    // .../portail/login qui retourne un contenu HTML avec un statut 200. Le statut 200 indique que tout est OK, mais
    // Angular s'attend à recevoir du JSON et soulève une erreur de parsing (SyntaxError: Unexpected token < in JSON at
    // position xx at JSON.parse). Donc le code suivant fait un retry uniquement si le statut est différent de 200 faisant
    // fi de l'erreur de parsing.
    return this.httpSansInterceptor.get<string>(urlKeepAlive, REQUEST_OPTIONS).pipe(
      retryWhen(errors => errors.pipe(
        concatMap((error, count) => {
          // Retry uniquement si le nombre max de retry n'est pas atteint et que le statut est différent de 200 (OK)
          if (count < NB_MAX_RETRY && error.status != 200) {
            return of(error.status);
          }

          return EMPTY;
        })
      ))
    );
  }
}
