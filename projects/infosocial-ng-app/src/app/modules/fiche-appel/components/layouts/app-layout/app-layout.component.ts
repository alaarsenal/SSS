import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { SigctModuleDTO } from 'projects/sigct-service-ng-lib/src/lib/models/sigct-module-dto';
import { AideEnLigneApiService } from 'projects/sigct-service-ng-lib/src/lib/services/aide-en-ligne/aide-en-ligne-api.service';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { ConsultationContainerStateService } from 'projects/sigct-service-ng-lib/src/lib/services/consultation-container-state.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { SigctModuleService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-module.service';
import { SigctSystemesExternesService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-systemes-externes/sigct-systemes-externes';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { RelanceService } from 'projects/sigct-ui-ng-lib/src/lib/components/relance/relance-api.service';
import { RrssParamsUrl } from 'projects/sigct-ui-ng-lib/src/lib/components/rrss/rrss-params-url';
import { forkJoin, ObservableInput, of, Subscription, timer } from 'rxjs';
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
  providers: [ConfirmationDialogService],
  styleUrls: ['./app-layout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppLayout implements OnInit, OnDestroy {
  private logoutUrls: string[] = [];

  urlInfoSocialApi: string = window["env"].urlInfoSocial + '/api';
  prefixeUrlAideEnLigne: string = window["env"].urlAideEnLigne;
  aideEnLigneUrls: string[];
  aideEnLigneByDefault: string;

  topLeftMenuItems: MenuItem[] = getMenus(window["env"]).topLeftMenuItems;
  topRightMenuItems: MenuItem[] = getMenus(window["env"]).topRightMenuItems;

  // private urlAideEnligneCalculated: string [] = [];

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer;

  liensSystemesExternes: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  rrssParamsUrl: RrssParamsUrl = new RrssParamsUrl();

  totalRelancesARealiser: number;

  private indexAideEnLigne: number;
  private souscriptions = new Subscription();

  constructor(translate: TranslateService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private aideEnLigneApiService: AideEnLigneApiService,
    private ficheAppelnonTermine: SigctFicheAppelNonTermineService,
    private appelAdmParameterService: AppelAdmParameterService,
    private systemesExternesService: SigctSystemesExternesService,
    private relanceService: RelanceService,
    private modalConfirmService: ConfirmationDialogService,
    private consultationContainerStateService: ConsultationContainerStateService,
    private sigctModuleService: SigctModuleService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('fr');
    //translate.translations['en'] = ['']
  }

  ngOnInit() {
    // Récupère les urls de déconnexion des modules SIGCT.
    this.getAllSystemLogoutUrls();

    // Ajuste la visibilité des menus selon les permissions de l'utilisateur.
    this.verifierPermissionsMenus(this.topLeftMenuItems);
    this.verifierPermissionsMenus(this.topRightMenuItems);

    // Au chargement de la page on va chercher l'URL d'aide en ligne correspondant.
    this.indexAideEnLigne = this.topRightMenuItems?.findIndex((menu: MenuItem) => menu?.isAideEnLigne);
    this.buildURLAidePageSocialModule(this.getUrlAideFomatted(this.router?.url), this.indexAideEnLigne);

    // Si l'url de l'application change, l'url de l'aide en linge se calcule de nouveau.
    this.souscriptions.add(this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.aideEnLigneUrls) {
          this.aideEnLigneFactory(this.getUrlAideFomatted(this.router?.url), this.aideEnLigneUrls, this.indexAideEnLigne);
        } else {
          this.souscriptions.add(this.aideEnLigneApiService.getAllAideUrls(this.urlInfoSocialApi).subscribe((result: string[]) => {
            if (result) {
              this.aideEnLigneUrls = result;
              this.aideEnLigneFactory(this.getUrlAideFomatted(this.router?.url), this.aideEnLigneUrls, this.indexAideEnLigne);
            }
          }));
        }
      }
    }));

    // Si l'utilisateur a un mot de passe qui va expirer dans les 10 prochains jours on affiche un icône et on change le message de l'infobulle
    const indexUserMenu = this.topRightMenuItems.findIndex((menu: MenuItem) => menu.isUserItem);
    if (indexUserMenu >= 0) {
      this.topRightMenuItems[indexUserMenu].title = this.authenticationService.getAuthenticatedUser().name

      if (this.authenticationService.getAuthenticatedUser().NbDaysToPwdExpire <= 10) {
        this.topRightMenuItems[indexUserMenu].addToolWarning = true;
        this.topRightMenuItems[indexUserMenu].infoBulle = "sigct.so.f_bandeau.expircpt";
      }
    }

    const lougoutMenuItem = this.topRightMenuItems.findIndex((menu: MenuItem) => menu.isLogoutLink);
    if (lougoutMenuItem >= 0) {
      this.topRightMenuItems[lougoutMenuItem].action = this.logout
    }

    const systemeConnexeMenuItem = this.topLeftMenuItems.findIndex((menu: MenuItem) => menu.isSystemeConnexe);
    if (systemeConnexeMenuItem >= 0) {

      this.souscriptions.add(this.appelAdmParameterService.getLiensSystemesExternes(window["env"].urlPortail).subscribe(
        (result) => {
          this.liensSystemesExternes = result;
          this.liensSystemesExternes.forEach(o => this.topLeftMenuItems[systemeConnexeMenuItem].children.push(this.createMenuItem(o)));

          const moduleGardeMenuItem = this.topLeftMenuItems[systemeConnexeMenuItem].children.findIndex((menu: MenuItem) => menu.title == "MG");
          if (moduleGardeMenuItem >= 0) {
            this.topLeftMenuItems[systemeConnexeMenuItem].children[moduleGardeMenuItem].action = () => { this.appelAdmParameterService.openModuleGarde(window["env"].urlPortail) };
          }

          const RRSSMenuItem = this.topLeftMenuItems[systemeConnexeMenuItem].children.findIndex((menu: MenuItem) => menu.title == "RRSS");
          if (RRSSMenuItem >= 0) {

            this.souscriptions.add(this.appelAdmParameterService.obtenirAdmParametersRRSS(window["env"].urlPortail).subscribe(
              (result) => {
                this.rrssParamsUrl.rrssApiWebUrl = result.rrss_urlui;
                this.rrssParamsUrl.rrssApiWebUsername = result.rrss_username;
                this.rrssParamsUrl.rrssApiWebPass = result.rrss_password;
                let url = this.rrssParamsUrl.rrssApiWebUrl + "?ut=" + this.rrssParamsUrl.rrssApiWebUsername
                  + "&mp=" + this.rrssParamsUrl.rrssApiWebPass;
                this.topLeftMenuItems[systemeConnexeMenuItem].children[RRSSMenuItem].action = () => { window.open(url, "_blank"); };
              })
            );
          }


          const AvisMenuItem = this.topLeftMenuItems[systemeConnexeMenuItem].children.findIndex((menu: MenuItem) => menu.title == "AV");
          if (AvisMenuItem >= 0) {
            this.topLeftMenuItems[systemeConnexeMenuItem].children[AvisMenuItem].action = () => { this.systemesExternesService.openAvisCommuniques(window["env"].urlPortail) };
          }

        })
      );
    }
    this.listenTotalRelancesARealiser();
    this.listenSuffixUrlConsultationPourAideEnLigne();
  }

  private aideEnLigneFactory(currentUrl: string, urls: string[], indexAideEnLigne: any): void {
    let validUrl: boolean = this.checkIfUrlIsCorrectTobuildUrlAideEnLigne(this.getUrlAideFomatted(currentUrl), urls);
    if (validUrl) {
      this.buildURLAidePageSocialModule(this.getUrlAideFomatted(currentUrl), indexAideEnLigne);
    } else {
      if (this.aideEnLigneByDefault) {
        let urlFinalAide = window["env"].urlAideEnLigne + '/' + this.aideEnLigneByDefault;
        this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
      } else {
        this.souscriptions.add(this.aideEnLigneApiService.getAideUrlByDefault(this.urlInfoSocialApi).subscribe((result: string) => {
          if (result) {
            let JsonStr: string = JSON.stringify(result);
            let urlAideObj: UrlAideObj = JSON.parse(JsonStr);
            this.aideEnLigneByDefault = urlAideObj.aideUrlByDefault;

            let urlFinalAide = window["env"].urlAideEnLigne + '/' + this.aideEnLigneByDefault;
            this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
          }
        }));
      }
    }
  }

  private checkIfUrlIsCorrectTobuildUrlAideEnLigne(currentUrl: string, urls: string[]): boolean {
    let validUrl: boolean = false;
    let i: number = 0;
    if (urls.length) {
      do {
        let suffixUrl: string = urls[i];
        if (~currentUrl.indexOf(suffixUrl) || ~(currentUrl + "/").indexOf(suffixUrl)) {
          validUrl = true;
        }
        ++i;

      } while (i < urls.length)
    }

    return validUrl;
  }

  /**Vérifier se l'utilisateur en cours a les permissions  pour visualizer les items du menu */
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

  private getUrlAideFomatted(rawUrl: string): string {
    let url: string = "infosocial" + this.router?.url;
    let urlParts: string[] = url.split("/").filter((item: string) => !this.isNumber(item));
    return urlParts.join("/");
  }

  private isNumber(nbStr: string): boolean { return /^-?[\d.]+(?:e-?\d+)?$/.test(nbStr); }

  private buildURLAidePageSocialModule(urlFormatted: string, indexAideEnLigne: number): void {
    this.aideEnLigneApiService.buildURLAidePage(this.urlInfoSocialApi, urlFormatted, window["env"].urlAideEnLigne).subscribe((jsonUrl: any) => {
      let urlFinalAide = window["env"].urlAideEnLigne + '/' + jsonUrl.url;
      this.topRightMenuItems[indexAideEnLigne].link = urlFinalAide;
    });
  }

  ngOnDestroy() {

    if (this.souscriptions) {
      this.souscriptions.unsubscribe();
    }

  }


  /**
   * Lors de la deconnexion on interroge le backend afin de savoir si l'utilisateur a des fiches d'appel non terminees
   * Si le retour du backend est different de zero alors on affiche un pop-up pour confirmer la deconnexion
   * Si le retour du backend est zero alors on se deconnecte
   */
  logout = () => {
    const sub = (this.ficheAppelnonTermine.getNbFicheAppelNonTermine(this.urlInfoSocialApi + "/").subscribe((objJson: any) => {
      let nb: string = objJson.nbFicheOuverte;
      sub.unsubscribe();
      if (nb && nb !== "0") {
        this.modalConfirmService.openAndFocus('confirm_popup_deconnexion_layout', 'ok_confirm_button');
      }
      else {
        this.logoutAllSystems();
      }
    }));
  }

  /**
   * L'utilisateur a des fiches d'appel non terminees, il a clique sur l'icone de deconnexion et a confirme qu'il voulait se deconnecter
   * ==> on n'affiche plus le popup et on deconnecte l'utilisateur
   */
  confirmDeconnexion() {
    this.modalConfirmService.close('confirm_popup_deconnexion_layout');
    this.logoutAllSystems();
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

  private createMenuItem(o: ReferenceDTO) {

    let menuItem = {
      title: o.code,
      infoBulle: o.description,
      action: () => { },
      isAction: true,
      visible: true,
    };
    return menuItem;
  }

  private listenTotalRelancesARealiser(): void {
    if (AuthenticationUtils.hasAnyRole(['ROLE_SO_APPEL_RELANCE', 'ROLE_SO_APPEL_RELANCE_TOUS'])) {
      //Rafraichire la pastille des relances chaque 120s
      this.souscriptions.add(
        this.relanceService.getIntervalleCalculeRelances().subscribe(
          (result: number) => {
            const triggerer = timer(0, result * 1000);
            this.souscriptions.add(
              triggerer.subscribe(_ => this.relanceService.updateTotalRelancesARealiser())
            );
          }
        )
      );
      //Observer la reponse du nombre des relances à réaliser
      this.souscriptions.add(
        this.relanceService.totalRelancesARealiserListener().subscribe(
          (result: number) => {
            this.totalRelancesARealiser = result;
          }
        )
      );
    }
  }

  private listenSuffixUrlConsultationPourAideEnLigne(): void {
    this.souscriptions.add(
      this.consultationContainerStateService.listenSuffixUrlConsultationSubject()
        .subscribe((result: string) => {
          const currentUrl: string = this.getUrlAideFomatted(null)?.concat(result);
          this.buildURLAidePageSocialModule(currentUrl, this.indexAideEnLigne);
        })
    );
  }

}

