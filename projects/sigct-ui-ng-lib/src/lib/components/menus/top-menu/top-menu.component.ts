import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SigctModuleEnum } from 'projects/sigct-service-ng-lib/src/lib/enums/sigct-module.enum';
import { AideEnLigneApiService } from 'projects/sigct-service-ng-lib/src/lib/services/aide-en-ligne/aide-en-ligne-api.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { ModulesInactifsStore } from 'projects/sigct-service-ng-lib/src/lib/store/modules-inactifs-store';
import { Subscription } from 'rxjs';
import { MenuItem } from '../menu-interface';

const FICHES_APPEL_NON_TERMINEES_ID_BADGE: string = "doc-recent-counter";
const RELANCES_A_REALISER_ID_BADGE: string = "relances-a-realiser-counter";

@Component({
  selector: 'msss-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit, OnDestroy {

  @ViewChildren("leftRootList") leftRootList: QueryList<ElementRef>;

  @Input()
  public topMenuItemsLeft: MenuItem[];

  @Input()
  public set topMenuItemsRight(topMenuItemsRight: MenuItem[]) {

    if (topMenuItemsRight) {
      this.menuItemsRight = topMenuItemsRight;

      this.indexMenuAideEnLigne = topMenuItemsRight.findIndex((item: MenuItem) => item.isAideEnLigne);
    }
  }

  @Input()
  public titreSite: string;

  @Input()
  public urlApi: string;

  @Input()
  public prefixeUrlAideEnLigne: string;

  @Input()
  set totalRelancesARealiser(value: number) {
    this.updateInfosMenuItemRelance(value);
  }
  private nbRelancesARealiser: number;

  menuItemsRight: MenuItem[];
  nbFicheAppelnonTermine: string = "0";
  cssClasseCouleurCadre: string;
  msgModulesInsactifs: string = null;

  private indexMenuAideEnLigne: number = -1;
  private souscriptionURLAideEnLigne: Subscription;
  private souscriptionNbficheAppelOuverte: Subscription;
  private souscriptions = new Subscription();

  private numeroMenuSelectionne: string;
  private objTargetSelectionne: any;

  private boutonHeaderClick: boolean = true;

  constructor(
    private modulesInactifsStore: ModulesInactifsStore,
    private aideEnLigneApiService: AideEnLigneApiService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private translateService: TranslateService,
   ) { }

  ngOnInit() {
    // L'utilisation du composant n'affiche pas les messages dans Usager. 
    // Pour contourner le problème, on doit récupérer les messages à l'aide d'un get sur une clé bidon 
    // afin de s'assurer que tous les messages sont chargés avant de souscrire au changements du store.
    this.souscriptions.add(
      this.translateService.get("bidon").subscribe(() => {
        this.souscriptions.add(
          this.modulesInactifsStore.state$.subscribe((modulesInactifs: SigctModuleEnum[]) => {
            if (modulesInactifs?.length > 0) {
              // Certains services ne sont pas disponibles présentement. Vous pouvez continuer à utiliser 
              // l'application mais certaines informations seront manquantes. Modules concernés : {{0}}
              const nomModule: string = this.modulesInactifsStore.getNomsModulesInStore();
              this.msgModulesInsactifs = this.translateService.instant("ss-iu-e90001", { 0: nomModule });
            } else {
              this.msgModulesInsactifs = null;
            }
          })
        );
      })
    );

    switch (this.titreSite) {
      case "sigct.us.f_accueil.titre": { this.cssClasseCouleurCadre = "border-bottom-usager"; break; }
      case "sigct.sa.f_accueil.titre": { this.cssClasseCouleurCadre = "border-bottom-infosante"; break; }
      case "sigct.so.f_accueil.titre": { this.cssClasseCouleurCadre = "border-bottom-infosocial"; break; }
      default: { this.cssClasseCouleurCadre = "border-bottom-infosocial"; break; }
    }

    // Recherche dans le menu de droite si un item a un icone égal a fa-phone (il se peut que ce test change Bruno est en train de voir avec Steve Mantis 3377)
    const indexIconPhone = this.menuItemsRight.findIndex((menu: MenuItem) => menu.icon == "fa-phone");
    if (indexIconPhone >= 0) {
      //Abonnement afin de mettre a jour le nombre de fiche d'appel non termnine
      if (this.souscriptionNbficheAppelOuverte) { this.souscriptionNbficheAppelOuverte.unsubscribe(); }
      this.souscriptionNbficheAppelOuverte = this.ficheAppelNonTermineService.onChangerNbFicheOuverte().subscribe((nb: string) => {
        this.nbFicheAppelnonTermine = nb;
        //Selon le nombre l'infobulle est different
        if (nb == "0") {
          this.menuItemsRight[indexIconPhone].infoBulle = this.menuItemsRight[indexIconPhone].infoBulleAucuneFiche;
          this.menuItemsRight[indexIconPhone].disabled = true;
        } else {
          this.menuItemsRight[indexIconPhone].infoBulle = this.menuItemsRight[indexIconPhone].infoBulleFiche;
          this.menuItemsRight[indexIconPhone].disabled = false;
        }
      });
    }

    // On fait le rafraichissement que si on a un badge
    if (indexIconPhone >= 0) {

      let baseUrl: string;
      let appName: String = window["env"].appName;

      switch (appName) {
        case "infosante":
          baseUrl = window["env"].urlSante;
          break;
        case "infosocial":
          baseUrl = window["env"].urlInfoSocial;
          break;
        default:
          baseUrl = window["env"].urlInfoSocial;
          break;
      }
      this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(baseUrl + "/api/");
    }
  }


  ngOnDestroy() {
    if (this.souscriptionURLAideEnLigne) {
      this.souscriptionURLAideEnLigne.unsubscribe();
    }

    if (this.souscriptionNbficheAppelOuverte) {
      this.souscriptionNbficheAppelOuverte.unsubscribe();
    }

    if (this.souscriptions) {
      this.souscriptions.unsubscribe();
    }
  }

  /**
   * Mémorise le numéro de menu cliqué et l'objet sur lequel on a cliqué
   * @param numeroMenu
   * @param event Pour obtenir le menu sur lequel on a cliqué
   */
  memoriseMenu(numeroMenu: string, event: any) {
    this.numeroMenuSelectionne = numeroMenu;
    this.objTargetSelectionne = event.target;
  }

  /**
   * À chaque click sur la page si l'objet cliqué est différent du menu dont on a cliqué pour ouvrir le menu on intialise les variables
   * afin que le sous-menu ne s'affiche plus. Voir la méthode getDisplayMenu()
   * @param event Pour obtenir l'objet sur lequel on a cliqué
   */
  @HostListener('document:click', ['$event'])
  onClickHorsDuSousMenuActif(event: any) {
    if (event.target !== this.objTargetSelectionne) {
      this.numeroMenuSelectionne = '';
      this.objTargetSelectionne = null;
    }
  }

  /**
   * Retourne la valeur de la propriété display (CSS) afin d'afficher ou pas le sous-menu
   * Si le numéro de menu reçu en paramètre correspond au numéro de menu mémorisé cette méthode retourne la valeur "block"
   * Sinon "none"
   * @param numeroMenu
   */
  public getDisplayMenu(numeroMenu: string): string {

    let resultat: string = 'none';

    if (numeroMenu === this.numeroMenuSelectionne) {
      resultat = 'block';
    }

    return resultat;
  }

  /**
   * Mémorise si on a cliqué sur le bouton du top menu en mode responsive
   */
  onClickButtonHeader() {

    this.boutonHeaderClick = !this.boutonHeaderClick;
  }

  /**
   * Retourne la classe CSS pour afficher (block) ou pas (none) les menus de la top bar en mode responsive
   */
  getDisplayStyleTopnavBar(): string {
    if (this.boutonHeaderClick) {
      return "displayBlock";
    } else {
      return "displayNone";
    }
  }

  getBadgeNumber(idBadge: string,infoBulle: string): string {
    if (FICHES_APPEL_NON_TERMINEES_ID_BADGE == idBadge) {
      return this.nbFicheAppelnonTermine;
    } else if (RELANCES_A_REALISER_ID_BADGE == idBadge) {
      return this.nbRelancesARealiser.toString();
    }
  }

  private updateInfosMenuItemRelance(value: number): void {
    this.nbRelancesARealiser = 0;
    if (this.menuItemsRight) {
      const indexIconRelance = this.menuItemsRight.findIndex((menu: MenuItem) => RELANCES_A_REALISER_ID_BADGE == menu.idBadge);
      if (value) {
        this.nbRelancesARealiser = value;
        this.menuItemsRight[indexIconRelance].infoBulle = "sigct.ss.f_bandeau.listerelanceinfobulle";
      } else {
        this.menuItemsRight[indexIconRelance].infoBulle = "sigct.sa.f_bandeau.aucunerelanceinfobulle";
      }
    }
  }


  leftRootListClick(event: any) {
    let idCurrentElement = event.currentTarget.id;
    let isCurrentElementHasChildren: boolean = event.currentTarget.getAttribute('data-has-children') == "true";

    if (isCurrentElementHasChildren == false) {
      this.leftRootList.forEach(div => {
        div.nativeElement.classList.remove('active');
        if (div.nativeElement.id == idCurrentElement) {
          div.nativeElement.classList.add('active');
        }
      });
    }

  }

  onChildItemClick(event: any) {
    this.leftRootList.forEach(div => {
      div.nativeElement.classList.remove('active');

      let idCurrentClickeLeftRootList = div.nativeElement.id;
      let idSavedClickeLeftRootList = "rootList" + this.numeroMenuSelectionne;

      if (idCurrentClickeLeftRootList == idSavedClickeLeftRootList) {
        div.nativeElement.classList.add('active');
      }

    });

  }

}
