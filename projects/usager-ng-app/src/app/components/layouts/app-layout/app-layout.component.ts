import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { SigctModuleDTO } from 'projects/sigct-service-ng-lib/src/lib/models/sigct-module-dto';
import { AideEnLigneApiService } from 'projects/sigct-service-ng-lib/src/lib/services/aide-en-ligne/aide-en-ligne-api.service';
import { ConsultationContainerStateService } from 'projects/sigct-service-ng-lib/src/lib/services/consultation-container-state.service';
import { SigctModuleService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-module.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { VerificateurChangmentService } from 'projects/sigct-ui-ng-lib/src/lib/components/verificateur-de-changement/verificateur-changment.service';
import { forkJoin, ObservableInput, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getMenus } from "./menu";

export interface UrlAideObj {
  id?: number,
  url?: string,
  urlAfterRedirects?: string,
  aideUrlByDefault?: string
}

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayout implements OnInit, OnDestroy {
  topLeftMenuItems: MenuItem[] = getMenus(window["env"]).topLeftMenuItems;
  topRightMenuItems: MenuItem[] = getMenus(window["env"]).topRightMenuItems;

  private souscriptions = new Subscription();
  private intervalUserIsAuthenticated: any;

  private logoutUrls: string[] = [];
  private indexAideEnLigne: number;
  private aideEnLigneUrls: string[];
  private aideEnLigneByDefault: string;

  urlUsagerApi: string = window["env"].urlUsager + '/api';
  prefixeUrlAideEnLigne: string = window["env"].urlAideEnLigne;

  constructor(translate: TranslateService,
    private router: Router,
    private aideEnLigneApiService: AideEnLigneApiService,
    private consultationContainerStateService: ConsultationContainerStateService,
    private authenticationService: AuthenticationService,
    private verificateurService: VerificateurChangmentService,
    private sigctModuleService: SigctModuleService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('fr');
  }

  ngOnInit() {
    // Récupère les urls de déconnexion des modules SIGCT.
    this.getAllSystemLogoutUrls();

    const indexUserMenu = this.topRightMenuItems.findIndex((menu: MenuItem) => menu.isUserItem);

    if (indexUserMenu >= 0) {

      const checkIt = () => {

        // Ajuste la visibilité des menus selon les permissions de l'utilisateur.
        this.verifierPermissionsMenus(this.topLeftMenuItems);
        this.verifierPermissionsMenus(this.topRightMenuItems);

        if (this.authenticationService.getAuthenticatedUser()) {
          this.topRightMenuItems[indexUserMenu].title = this.authenticationService.getAuthenticatedUser().name;

          // Si l'utilisateur a un mot de passe qui va expirer dans les 10 prochains jours on affiche un icône et on change le message de l'infobulle
          if (this.authenticationService.getAuthenticatedUser().NbDaysToPwdExpire <= 10) {
            this.topRightMenuItems[indexUserMenu].addToolWarning = true;
            this.topRightMenuItems[indexUserMenu].infoBulle = "sigct.us.f_bandeau.expircpt";
          }

          // this.authenticationService.getAuthenticatedUser() n'est pas NULL on n'a pu effectuer le traitement donc on sort de l'intervalle
          clearInterval(this.intervalUserIsAuthenticated);
        }
      };

      // Nous avons utilisé un setInterval car dans la session storage l'objet contenant les informations sur l'utilisateur connecté n'est pas présent au moment de l'exécution
      // Donc this.authenticationService.getAuthenticatedUser() renvoyait NULL et on avait des undefined
      // La smeilleure solution aurait été de créer une méthode this.authenticationService.getAuthenticatedUserObservable() qui retournerait un observable
      // mais cela prend trop de temps à implémenter, une mantis va être soumise pour corriger ce problème
      this.intervalUserIsAuthenticated = setInterval(checkIt, 500);
    }

    // Ajout de l'action pour un menu logout
    const logoutMenuItem = this.topRightMenuItems.findIndex((menu: MenuItem) => menu.isLogoutLink);
    if (logoutMenuItem >= 0) {
      this.topRightMenuItems[logoutMenuItem].action = this.logout
    }

    // Au chargement de la page on va chercher l'URL d'aide en ligne correspondant.
    this.indexAideEnLigne = this.topRightMenuItems?.findIndex((menu: MenuItem) => menu?.isAideEnLigne);
    this.buildURLAidePageUsagerModule(this.getUrlAideFomatted(), this.indexAideEnLigne);

    // Si l'url de l'application change, l'url de l'aide en linge se calcule de nouveau.
    this.souscriptions.add(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          if (this.aideEnLigneUrls) {
            this.aideEnLigneFactory(this.getUrlAideFomatted(), this.aideEnLigneUrls, this.indexAideEnLigne);
          } else {
            this.souscriptions.add(
              this.aideEnLigneApiService.getAllAideUrls(this.urlUsagerApi).subscribe((result: string[]) => {
                if (result) {
                  this.aideEnLigneUrls = result;
                  this.aideEnLigneFactory(this.getUrlAideFomatted(), this.aideEnLigneUrls, this.indexAideEnLigne);
                }
              })
            );
          }
        }
      })
    );

    this.initAideEnLigne();

    this.listenSuffixUrlConsultationPourAideEnLigne();
  }

  private initAideEnLigne(): void {
    this.aideEnLigneApiService.getAllAideUrls(this.urlUsagerApi).subscribe((result: string[]) => {
      if (result) {
        this.aideEnLigneUrls = result;
        this.aideEnLigneFactory(this.getUrlAideFomatted(), this.aideEnLigneUrls, this.indexAideEnLigne);
      }
    });
  }

  private aideEnLigneFactory(currentUrl: string, urls: string[], indexAideEnLigne: any): void {
    let validUrl: boolean = this.checkIfUrlIsCorrectTobuildUrlAideEnLigne(this.getUrlAideFomatted(), urls);
    if (validUrl) {
      this.buildURLAidePageUsagerModule(this.getUrlAideFomatted(), indexAideEnLigne);
    } else {
      if (this.aideEnLigneByDefault) {
        let urlFinalAide = window["env"].urlAideEnLigne + '/' + this.aideEnLigneByDefault;
        this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
      } else {
        this.souscriptions.add(
          this.aideEnLigneApiService.getAideUrlByDefault(this.urlUsagerApi).subscribe((result: string) => {
            if (result) {
              let JsonStr: string = JSON.stringify(result);
              let urlAideObj: UrlAideObj = JSON.parse(JsonStr);
              this.aideEnLigneByDefault = urlAideObj.aideUrlByDefault;

              let urlFinalAide = window["env"].urlAideEnLigne + '/' + this.aideEnLigneByDefault;
              this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
            }
          })
        );
      }
    }
  }

  private checkIfUrlIsCorrectTobuildUrlAideEnLigne(currentUrl: string, urls: string[]): boolean {
    let validUrl: boolean = false;
    let i: number = 0;
    if (urls?.length) {
      do {
        let suffixUrl: string = urls[i];
        if (currentUrl.indexOf(suffixUrl) != -1 || (currentUrl + "/").indexOf(suffixUrl) != -1) {
          validUrl = true;
        }
        ++i;

      } while (i < urls.length)
    }

    return validUrl;
  }

  private getUrlAideFomatted(): string {
    let url: string = "application" + this.router?.url;
    let urlParts: string[] = url.split("/").filter((item: string) => !StringUtils.isDigits(item));
    return urlParts.join("/");
  }

  private buildURLAidePageUsagerModule(urlFormatted: string, indexAideEnLigne: number): void {
    this.souscriptions.add(
      this.aideEnLigneApiService.buildURLAidePage(this.urlUsagerApi, urlFormatted, window["env"].urlAideEnLigne)
        .subscribe((jsonUrl: any) => {
          let urlFinalAide = window["env"].urlAideEnLigne + '/' + jsonUrl.url;
          this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
        })
    );
  }

  private listenSuffixUrlConsultationPourAideEnLigne(): void {
    this.souscriptions.add(
      this.consultationContainerStateService.listenSuffixUrlConsultationSubject()
        .subscribe((result: string) => {
          const currentUrl: string = this.getUrlAideFomatted()?.concat(result);
          this.buildURLAidePageUsagerModule(currentUrl, this.indexAideEnLigne);
        })
    );
  }

  /**
   * Vérifier se l'utilisateur en cours a les permissions pour visualizer les items du menu 
   */
  private verifierPermissionsMenus(menus: MenuItem[]): void {
    menus?.forEach(menu => {
      if (!StringUtils.isBlank(menu.permission)) {
        menu.visible = AuthenticationUtils.hasAnyRole(menu.permission.split(","));
      }
      if (CollectionUtils.isNotBlank(menu.children)) {
        menu.children
          .filter(submenu => !StringUtils.isBlank(submenu.permission))
          .forEach(submenu => {
            submenu.visible = AuthenticationUtils.hasAnyRole(submenu.permission.split(","));
          });
      }
    });
  }

  ngOnDestroy() {

    if (this.souscriptions) {
      this.souscriptions.unsubscribe();
    }

  }

  logout = () => {
    sessionStorage.clear();

    if (this.verificateurService.isExisteChangements()) {
      window.location.href = window["env"].urlPortail + '/logout';
    } else {
      this.logoutAllSystems();
    }
  }

  /**
   * Récupère les urls de déconnexion des modules SIGCT.
   */
  private getAllSystemLogoutUrls(): void {
    this.souscriptions.add(
      this.sigctModuleService.getAllSigctModule().subscribe((sigctModules: SigctModuleDTO[]) => {
        if (CollectionUtils.isNotBlank(sigctModules)) {
          this.logoutUrls = sigctModules.map((module: SigctModuleDTO) => module.logoutUrl);
        }

      })
    );
  }

  /**
   * Se déconnecter à tous les systèmes afin d'éviter des sessions ouvertes après déconnexion dans Portail.
   */
  private logoutAllSystems(): void {
    if (CollectionUtils.isNotBlank(this.logoutUrls)) {
      // Transforme la liste d'url en liste d'observable
      const logoutObservables: ObservableInput<any>[] = this.logoutUrls.map((logoutUrl: string) =>
        this.authenticationService.logout(logoutUrl).pipe(catchError((err) => of(null)))
      );

      // Appelle tous les logout et retourne au Portail
      this.souscriptions.add(
        forkJoin(logoutObservables).subscribe(results => window.location.href = window["env"].urlPortail)
      );
    }
  }
}

