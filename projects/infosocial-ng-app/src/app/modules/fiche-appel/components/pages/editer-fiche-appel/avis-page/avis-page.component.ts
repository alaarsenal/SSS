import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDataService, SectionFicheAppelEnum } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { Observable } from 'rxjs';
import { AvisDTO } from '../../../../models/avis-dto';
import { AvisService } from '../../../../services/avis.service';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'app-avis-page',
  templateUrl: './avis-page.component.html',
  styleUrls: ['./avis-page.component.css']
})
export class AvisPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {
  /** Url Avis affiché dans le iframe. */
  urlAvis: SafeUrl;

  /** Url Accueil Avis dans le iframe. */
  urlAvisAccueil: SafeUrl;

  idFicheAppelActif: number;

  idAvis: number;

  listenerReceiveMessage: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheAppelDataService: FicheAppelDataService,
    private avisService: AvisService,
    private appContextStore: AppContextStore,
    private sanitizer: DomSanitizer,
    private alertStore: AlertStore,
    private translateService: TranslateService) {
    super(ficheAppelDataService);

    this.subscriptions.add(this.route.queryParams.subscribe((params: Params) => {
      this.idAvis = params["idAvis"];
      this.urlAvisAccueil = this.sanitizer.bypassSecurityTrustResourceUrl(window["env"].urlPortail + "sigct/systemesexternes/avis?contexte=appel");
    }));

  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent.
    super.ngOnInit();

    this.idFicheAppelActif = this.ficheAppelDataService.getIdFicheAppelActive();

    if (this.idAvis) {
      this.urlAvis = this.sanitizer.bypassSecurityTrustResourceUrl(window["env"].urlInfoSocial + '/api/fiches-appel/' + this.idFicheAppelActif + '/avis/' + this.idAvis + '/consulter');
    }

    this.urlAvisAccueil = this.getLastUrlAvisFromStore(this.idFicheAppelActif);
    this.addWindowListner();
  }

  ngOnDestroy(): void {
    // Appel subscriptions.unsubscribe();
    super.ngOnDestroy();

    this.viderPileMessages();

    if (this.listenerReceiveMessage) {
      window.removeEventListener('message', this.listenerReceiveMessage, false);
    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Rien à sauvegarder
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    // Rien à sauvegarder
    return true;
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    // Rien
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet), on affiche le dernier url affiché dans cette fiche d'appel.
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.idFicheAppelActif = idFicheAppel;
      this.urlAvisAccueil = this.getLastUrlAvisFromStore(this.idFicheAppelActif);
      this.viderPileMessages();
    }
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   * Dans l'action d'enrégistrement, on cumule tous les messages d'erreurs. Une fois tout est vérifié
   * l'action enrégistrer n'est plus déclencher que si la liste de messages d'erreurs est vide.
   * À la fin quelque soit l'état d'enrégistrement, l'affichage de messages (erreur, avertissement ou succé)
   * est autonome. Par exemple le message de succé n'est plus accessible en présence d'au moins un message d'erreur.
   */
  onSauvegarder(): void {
    // Rien
  }

  /**
   * À chaque fois que l'url Avis change dans le iframe, on le garde en mémoire.
   * @param event événement provenant du iframe
   */
  onFrameLoad(event: any) {
    try {
      const urlFrameAvis: string = event.target?.contentWindow?.location?.href;

      // Vérifie s'il s'agit d'un url valide, car Chrome peut retourner "about:blank" à l'instanciation du iframe.
      if (urlFrameAvis?.startsWith("http")) {
        // Associe l'url à la fiche et le garde en mémoire.
        this.setLastUrlAvisToStore(this.ficheAppelDataService.getIdFicheAppelActive(), urlFrameAvis);
      }
    } catch (e) {
      if (e.message.includes("origin") && e.message.includes("localhost")) {
        // Sur le poste d'un développeur, lorsqu'on accède à event.target?.contentWindow?.location?.href, on obtient 
        // l'erreur : "Blocked a frame with origin "http://localhost:4200" from accessing a cross-origin frame." à cause du port 4200.
        // Ce problème ne survient pas dans les paliers supérieurs, car les serveurs sont sur le même domaine.
        console.error("Cette erreur ne doit survenir que sur le poste du développeur à cause du port 4200 :" + e.message);
      } else {
        console.error(e.message);
      }
    }
  }

  onRechercherAvis() {
    this.router.navigate(["../" + SectionFicheAppelEnum.AVIS], { relativeTo: this.route });
  }

  /**
   * Le point d'entrée pour toutes les informations venont du iframe.
   * Les infomations postées sont ceux pour la consultation, relier réfrentiel et ajouter les informations associées d'une/des rubrique(s)
   *
   * @param message un conteneur des informations postées.
   */
  receiveMessage(message: any) {
    this.viderPileMessages();
    if (message && message.data) {
      let avisDTO: AvisDTO = new AvisDTO();

      avisDTO.idAvisExt = message.data.id;
      avisDTO.titre = message.data.titre;
      avisDTO.contenu = message.data.contenu;

      if (message.data.organisme) {
        avisDTO.organisme = message.data.organisme;
      }

      if (message.data.date) {
        avisDTO.dateCreationExt = new Date(message.data.date);
      }

      if (message.data.lastUpdate) {
        avisDTO.dateModifieExt = new Date(message.data.lastUpdate);
      }

      if (message.data.niveau1) {
        avisDTO.niveau1 = message.data.niveau1;
      }

      if (message.data.niveau2) {
        avisDTO.niveau2 = message.data.niveau2;
      }

      if (message.data.niveau3) {
        avisDTO.niveau3 = message.data.niveau3;
      }

      if (message.data.niveau4) {
        avisDTO.niveau4 = message.data.niveau4;
      }

      avisDTO.idFicheAppel = this.idFicheAppelActif;

      if (this.idFicheAppelActif) {
        this.subscriptions.add(
          this.avisService.ajouterAvis(this.idFicheAppelActif, avisDTO)
            .subscribe(result => {
              this.afficherMessagerAvisReussie(result.titre);
            })
        )
      }

    }

  }

  /**
   * Récupère du store le dernier url affiché dans la fiche idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  private getLastUrlAvisFromStore(idFicheAppel: number): SafeUrl {
    let lastUrlAvis = this.urlAvisAccueil;
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsAvis;
      if (urlMap?.has(idFicheAppel)) {
        const urlAvis: string = urlMap.get(idFicheAppel);
        lastUrlAvis = this.sanitizer.bypassSecurityTrustResourceUrl(urlAvis);
      }
    }
    return lastUrlAvis;
  }

  /**
   * Dépose dans le store le dernier url Avis consulté pour la fiche idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param urlAvis url de Avis
   */
  private setLastUrlAvisToStore(idFicheAppel: number, urlAvis: string): void {
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsAvis;
      if (!urlMap) {
        urlMap = new Map();
      }

      urlMap.set(idFicheAppel, urlAvis);

      this.appContextStore.setvalue("mapUrlsAvis", urlMap);
    }
  }

  private addWindowListner() {
    if (!this.listenerReceiveMessage) {
      this.listenerReceiveMessage = this.receiveMessage.bind(this);
    }
    window.addEventListener("message", this.listenerReceiveMessage, false);
  }

  private viderPileMessages(): void {
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }
  }

  private afficherMessagerAvisReussie(nomAvis: string): void {
    let messageConfirmermation = this.translateService.instant('ss-sv-c40006', { 0: nomAvis });
    const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess("Confirmation");
    alertModel.messages = [messageConfirmermation];
    this.alertStore.addAlert(alertModel);
  }
}

