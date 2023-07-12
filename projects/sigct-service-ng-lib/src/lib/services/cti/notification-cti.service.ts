import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription } from "rxjs";
import AuthenticationUtils from "../../auth/authentication-utils";
import { SigctModuleEnum } from "../../enums/sigct-module.enum";
import { HttpErrorHandler } from "../../http/http-error-handler.service";
import { MaterialModalDialogService } from "../../material-modal-dialog/material-modal-dialogl.service";
import { NotificationCtiDTO } from "../../models/notification-cti-dto";
import { SigctFicheAppelNonTermineService } from "../sigct-fiche-appel-non-termine";
import { Router } from "@angular/router";
import { AppelApiService } from "projects/infosante-ng-core/src/lib/services/appel-api.service";
import { FicheAppelDTO } from "projects/infosante-ng-core/src/lib/models/fiche-appel-dto";
import { FicheAppelDataService } from "projects/infosante-ng-core/src/lib/services/fiche-appel-data.service";
import { AppelApiService as AppelApiSocialService } from "projects/infosocial-ng-core/src/lib/services/appel-api.service";
import { FicheAppelSocialDTO } from "projects/infosocial-ng-core/src/lib/models/fiche-appel-social-dto";
import { FicheAppelDataService as FicheAppelSocialDataService } from "projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service";
import { FicheAppelChronoService } from "../fiche-appel-chrono.service";

@Injectable({
  providedIn: "root"
})
export class NotificationCtiService {

  private apiUrl: string;
  private messageSubject: Subject<NotificationCtiDTO> = new Subject();

  private subsciption: Subscription = new Subscription();;

  constructor(
    private httpErrorHandler: HttpErrorHandler,
    private materialModalDialogService: MaterialModalDialogService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private router: Router,
    private appelApiService: AppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private ficheAppelChronoService: FicheAppelChronoService,
    private appelApiSocialService: AppelApiSocialService,
    private ficheAppelSocialDataService: FicheAppelSocialDataService) {
    this.httpErrorHandler.createHandleError('NotificationCtiService');
    this.apiUrl = this.getUrlBasedOnModuleNom();
  }

  /**
   * Souscrire aux notifications CTI du serveur à l'authentification
   * d'un utilisateur et afficher le popup de confirmation pour l'ouverture
   * de la fiche d'appel lors de la réception d'une notification CTI.
   */
  loadNotificationCTI(module: SigctModuleEnum, apiUrl?: string): void {
    const moduleAcronyme: string = module.getAcronyme();
    //On ne souscrit pas aux notifications CTI si on n'a pas la permission pour modifier un appel.
    if (!AuthenticationUtils.hasAnyRole(['ROLE_' + moduleAcronyme + '_APPEL_MODIF'])) {
      return;
    }
    if (!apiUrl) {
      apiUrl = this.apiUrl;
    }
    //Souscrire aux notifications de la CTI au serveur
    const url: string = apiUrl + "/cti/subscription/" + moduleAcronyme;
    const eventSource = new EventSource(url, { "withCredentials": true });
    eventSource.onopen = (event) => console.log("SSE onopen: ", new Date());
    eventSource.onerror = function (event) {
      const target: EventSource = event.target as EventSource;
      if (target.readyState == EventSource.CLOSED) {
        console.log('SSE CLOSED', new Date(), event);
        //this.close();
      } else if (target.readyState == EventSource.CONNECTING) {
        console.log("SSE CONNECTING", new Date(), event);
        // if (retry < 3) {
        //   console.log("SSE onerror: retry", retry + 1);
        //   // Tente une nouvelle souscription après 1 seconde.
        //   setTimeout(() => this.loadNotificationCTI(module, apiUrl, ++retry), 1000);
        // }
        //        console.log("eventSource.close()");
        //        eventSource.close();
      } else {
        console.log("SSE ERROR: readyState=" + target.readyState, new Date(), event);
      }
    };
    //Lors de la réception d'une notification de la CTI provenant du serveur
    eventSource.addEventListener("message", (event: MessageEvent) => {
      const notificationCti: NotificationCtiDTO = JSON.parse(event.data);
      //Rafraichir la pastille du nombre des fiches d'appel non terminées
      this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(apiUrl);
      //Afficher le popup de confirmation si l'onglet de l'application SIGCT est actif au navigateur
      if (!document.hidden) {
        this.subsciption.add(
          this.materialModalDialogService.popupConfirmer("ss-iu-c40029").subscribe(
            (confirm: boolean) => {
              if (confirm) {
                let appName: string = window["env"].appName;
                if (appName == "infosante" || appName == "infosocial") {
                  let url = notificationCti.lienFicheAppel;
                  let indexAppel = url.indexOf("/editer");
                  let pathName = url.substring(indexAppel);
                  this.initializeFicheAppelList(notificationCti.idAppel, notificationCti.idFicheAppel, appName);
                  // S'assure qu'aucun popup n'est ouvert ex: popup du bouton Pause
                  this.materialModalDialogService.closeOpenedOkPopup();
                  this.router.navigate([pathName]);
                } else {
                  window.location.href = notificationCti.lienFicheAppel;
                }
              }
            }
          )
        );
      }
    });
  }

  // unsubscribeNotificationCTI(module: SigctModuleEnum): void {
  //   navigator.sendBeacon(this.apiUrl + "/cti/unsubscription/" + module.getAcronyme());
  // }

  triggerMessageSubject(message: NotificationCtiDTO): void {
    this.messageSubject.next(message);
  }

  listenMessageSubject(): Observable<NotificationCtiDTO> {
    return this.messageSubject.asObservable();
  }

  unsubscribe(): void {
    this.subsciption.unsubscribe();
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

  private initializeFicheAppelList(idAppel: number, idFicheAppel: number, appName: string) {
    if (appName == "infosante") {
      this.appelApiService.obtenirFicheAppels(idAppel).subscribe((result: FicheAppelDTO[]) => {
        if (result?.length > 0) {
          this.ficheAppelDataService.setListeFicheAppel(result);
          this.ficheAppelDataService.setIdFicheAppelActive(idFicheAppel);
          this.ficheAppelChronoService.startChrono(idFicheAppel);
        }
      })
    }

    if (appName == "infosocial") {
      this.appelApiSocialService.obtenirFicheAppels(idAppel).subscribe((result: FicheAppelSocialDTO[]) => {
        if (result?.length > 0) {
          this.ficheAppelSocialDataService.setListeFicheAppel(result);
          this.ficheAppelSocialDataService.setFicheAppelActive(idFicheAppel);
          this.ficheAppelChronoService.startChrono(idFicheAppel);
        }
      })
    }
  }
}
