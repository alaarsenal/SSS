import { Component, HostListener, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProtocoleDTO } from 'projects/infosante-ng-core/src/lib/models/protocole-dto';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ProtocoleApiService } from 'projects/infosante-ng-core/src/lib/services/protocole-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';

import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { Observable } from 'rxjs';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

const CTX_PROTOCOLES: string = "/protocoles";

/** Structure d'un protocole provenant de RPI Drupal */
export interface ProtocoleRpiDrupal {
  doc_id: string,
  doc_version: string,
  libelle: string,
  titre: string,
}

@Component({
  selector: 'protocoles-page',
  templateUrl: './protocoles-page.component.html',
  styleUrls: ['./protocoles-page.component.css']
})
export class ProtocolesPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {
  private protocolesRpi: ProtocoleRpiDrupal[] = [];

  /** Url de la page d'accueil de RPI. */
  private urlAccueilRpi: string = window["env"].urlRpi + CTX_PROTOCOLES + "?ctx=" + window["env"].appName;

  /** Url de la page de recherche de GIEA. */
  private urlAccueilGIEA: string = window["env"].urlGieaRecherche + "?ctx=" + window["env"].appName;

  /** SafeUrl RPI affiché dans le iframe. */
  urlIframe: SafeUrl = null;
  /** SafeUrl GIEA affiché dans le iframe. */
  urlGieaIframe: SafeUrl = null;

  windoPostMessageListner: any;
  
  isVersionGuideSanteRpiDrupal: boolean =  window["env"].isVersionGuideSanteRpiDrupal;

  @HostListener('window:message', ['$event']) onPostMessage(event) {
    if (window["env"].urlRpi.startsWith(event.origin)) {
      if (typeof event.data == "string" && event.data.startsWith("protocole:")) {
        // Formate les données reçues de RPI en du json valide.
        let json: string = event.data.substr("protocole:".length).replaceAll("=", ":");
        json = StringUtils.unescape(json);
        const protocoleRpi: ProtocoleRpiDrupal = JSON.parse(json);
        this.protocolesRpi.push(protocoleRpi);
      }
    }
  }

  constructor(
    private ficheAppelDataService: FicheAppelDataService,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore,
    private materialModalDialogService: MaterialModalDialogService,
    private protocoleApiService: ProtocoleApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private renderer: Renderer2
  ) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent.
    super.ngOnInit();
    if (this.isVersionGuideSanteRpiDrupal) {

      this.subscriptions.add(
        this.route.queryParams.subscribe((params: Params) => {
          const idProtocole: string = params["idProtocole"];
          const version: string = params["version"];
          if (idProtocole) {
            let url: string = this.urlAccueilRpi;
            if (version) {
              url += "&idProtocole=" + idProtocole + "&version=" + version;
            } else {
              url += "&idProtocole=" + idProtocole;
            }

            this.urlIframe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.setLastUrlRpiToStore(this.ficheAppelDataService.getIdFicheAppelActive(), url);
          }
      }));
    } else {
      this.buildGieaUrlContextAppel(this.ficheAppelDataService.getIdFicheAppelActive());
      this.addWindowListner();
    }
       
    if (!this.urlIframe) {
      this.urlIframe = this.getLastUrlRpiFromStore(this.ficheAppelDataService.getIdFicheAppelActive());
    } 
  }

  private buildAcceuilGieaRechercheUrlContextAppel(): string {
    let idFicheAppelActif: number = this.ficheAppelDataService.getIdFicheAppelActive();
    let idAppel: number = this.ficheAppelDataService.getIdAppel();
    let ctx: string = "appel";
    let src: string = "infosante"
    let params: string = "?ctx=" + ctx + "&idAppel=" + idAppel + "&idFiche=" + idFicheAppelActif + "&src=" + src

    return window["env"].urlGieaRecherche + params;
  }


  /**
   * Le point d'entrée pour toutes les informations venont du iframe.
   * Les infomations postées sont ceux pour la consultation, relier réfrentiel et ajouter les informations associées d'une/des rubrique(s)
   *
   * @param message un conteneur des informations postées.
   */
  receiveMessage(message: any) {
    this.viderPileMessages();
    if (message?.data != "loaded") {
      let idFicheAppelActif: number = this.ficheAppelDataService.getIdFicheAppelActive();
      // l'entrée pour le traitement des informations de la consultation
      if (message.data.targetHref) {
        let targetUrlSentByIframe = window["env"].urlRpiBase + message.data.targetHref;
        let idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
        this.setLastUrlRpiToStore(idFicheAppel, targetUrlSentByIframe);
      } 
      // l'entrée pour le traitement des informations pour copier les informations du document
      if (message.data.idName && (message.data.idName == "copierVersFicheBtn" || message.data.idName == "relierVersFicheBtn")) {
        this.copierDocumentEtInfos(idFicheAppelActif, message);
      }
    }
  }

  /**
   * Relie le document et copie les informations sélectionnées telles que les sous sections 
   * et le texte qui se trouve dans les case à cocher + vers la fiche.
   * @param idFicheAppelActif 
   * @param message 
   */
  private copierDocumentEtInfos(idFicheAppelActif: number, message: any): void {

    if (idFicheAppelActif && message?.data?.documentIdOrigine) {
      
      let listeDocumentsGieaDto: ProtocoleDTO[] = [];
      let dto: ProtocoleDTO = new ProtocoleDTO();
      
      dto.idDocIdent = message.data.documentIdOrigine;
      dto.titre = message.data.documentNomOrigine;
      dto.typeDocument = message.data.typeDocument;
      dto.libelle = message.data.libelle;
      dto.checkedPuceOrSousSection = message.data.checkedPuceOrSousSection;
      listeDocumentsGieaDto.push(dto);
      if (message?.data?.typeDocument &&  message?.data?.typeDocument === "PROTOCOLE") {
        if (dto.checkedPuceOrSousSection) {
          this.subscriptions.add(
            // Récupère et copie les sous sections et les informations séléctionnées du document
            this.protocoleApiService.copierDocumentEtInfos(idFicheAppelActif, dto).subscribe(ficheAppelSanteDTOResult => {
                this.afficherMessageCopierVersLaFicheReussie();
            })        
          );
        } else {
          const message = this.translateService.instant("sa-iu-e31017");
          const title = this.translateService.instant("sigct.sa.error.label");
          let erreur: AlertModel = AlertModelUtils.createAlertModel([message], title, AlertType.ERROR);
          this.alertStore.addAlert(erreur);
        }
      } else {
        this.subscriptions.add(
          // Relie le complement à la fiche
          this.protocoleApiService.copierDocumentEtInfos(idFicheAppelActif, dto).subscribe(ficheAppelSanteDTOResult => {
              this.afficherMessageCopierVersLaFicheReussie();
          })        
        );
      }
     
      
    }
  }
  
  private viderPileMessages(): void {
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }
  }

  private addWindowListner() {
    this.windoPostMessageListner = this.renderer.listen('window', 'message', this.receiveMessage.bind(this));
  }

  /**
   * Afficher le message de confirmation si la copie d'un document vers la fiche réussie.
   */
  private afficherMessageCopierVersLaFicheReussie(): void {
    let messageConfirmation = this.translateService.instant('sa-iu-a00016');
    const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess("Confirmation");
    alertModel.messages = [messageConfirmation];
    this.alertStore.addAlert(alertModel);
  }

  ngOnDestroy(): void {
    // Appel subscriptions.unsubscribe();
    super.ngOnDestroy();

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    this.alertStore.resetAlert();
    this.viderPileMessages();
    this.subscriptions.unsubscribe();
    // Détacher tous les listners avant que quitter l'interface
    if (!this.isVersionGuideSanteRpiDrupal) {
      this.windoPostMessageListner();
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
    this.urlIframe = this.getLastUrlRpiFromStore(idFicheAppel);
    if (!this.isVersionGuideSanteRpiDrupal) {
      this.buildGieaUrlContextAppel(idFicheAppel);
    }
    this.viderPileMessages();
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
   * Récupère du store le dernier url affiché dans la fiche idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  private getLastUrlRpiFromStore(idFicheAppel: number): SafeUrl {
    let lastUrlRpi: SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlAccueilRpi);
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsRpi;
      if (urlMap?.has(idFicheAppel)) {
        const urlRpi: string = urlMap.get(idFicheAppel);
        lastUrlRpi = this.sanitizer.bypassSecurityTrustResourceUrl(urlRpi);
      }
    }
    return lastUrlRpi;
  }


  /**
   * Dépose dans le store le dernier url RPI consulté pour la fiche idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param urlRpi url de RPI
   */
  private setLastUrlRpiToStore(idFicheAppel: number, urlRpi: string): void {
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsRpi;
      if (!urlMap) {
        urlMap = new Map();
      }

      urlMap.set(idFicheAppel, urlRpi);
      this.appContextStore.setvalue("mapUrlsRpi", urlMap);
    }
  }

  /**
   * Lorsqu'on relie à la fiche d'appel les protocoles sélectionnés avec les +.
   */
  onRelierProtocoles(): void {
    this.alertStore.resetAlert();

    if (this.validerRelierProtocoles(this.protocolesRpi)) {
      let listeProtocoleDto: ProtocoleDTO[] = [];

      // Transforme la liste de protocoles provenant de RPI en une liste de protocoles SIGCT
      this.protocolesRpi?.forEach((protocoleRpi: ProtocoleRpiDrupal) => {
        const protocoleDto: ProtocoleDTO = {
          idFicheAppel: this.ficheAppelDataService.getIdFicheAppelActive(),
          libelle: protocoleRpi.libelle,
          refDocumentDrupal: +protocoleRpi.doc_id,
          titre: protocoleRpi.titre,
          versionDoc: +protocoleRpi.doc_version,
        };

        listeProtocoleDto.push(protocoleDto);
      });

      // Ajoute la liste de protocoles à la fiche d'appel
      this.subscriptions.add(
        this.protocoleApiService.ajouterListeProtocole(this.ficheAppelDataService.getIdFicheAppelActive(), listeProtocoleDto).subscribe((listeProtocole: ProtocoleDTO[]) => {
          this.protocolesRpi = [];

          const confirmation: string = this.translateService.instant('ss.msg.succes.confirmation');
          const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess(confirmation);
          // sa-iu-a00016=Les informations ont été copiées vers la fiche avec succès!
          alertModel.messages = [this.translateService.instant("sa-iu-a00016")];

          this.alertStore.addAlert(alertModel);
        })
      );
    }
  }

  /**
   * Valide la liste des protocoles à relier. Affiche un message d'erreur si non valide.
   * @param protocoles liste de protocoles à valider
   * @returns true si la liste est valide
   */
  private validerRelierProtocoles(protocoles: ProtocoleRpiDrupal[]): boolean {
    let isValide = true;
    if (CollectionUtils.isBlank(protocoles)) {
      // sa-iu-a00017=Attention - Aucun protocole n'a été relié à l'appel en cours ! Pour relier ce protocole, 
      // veuillez le rechercher à nouveau et sélectionner au moins un énoncé de son contenu avec le [+], 
      // puis appuyez sur le bouton "{{0}}".
      const libelleBtn: string = this.translateService.instant("sigct.sa.f_appel.referentiels.btncopier");
      const msgAvertissement: string = this.translateService.instant("sa-iu-a00017", { 0: libelleBtn });

      this.subscriptions.add(
        this.materialModalDialogService.popupAvertissement(msgAvertissement).subscribe()
      );

      isValide = false;
    }
    return isValide;
  }

   /**
   * Construire l'url GIEA tout en détectant s'il s'agit un premier chargement
   * du fichier d'appel ou il avait déja une entrée dans l'historique des url.
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
   private buildGieaUrlContextAppel(idFicheAppel: number): void {
    if (this.appContextStore.state.contextConsultationReferentiel) {
      let urlConsultation = this.buildGieaUrlConsultationContextAppel(idFicheAppel);
      this.urlIframe = this.sanitizer.bypassSecurityTrustResourceUrl(urlConsultation);
      this.setLastUrlRpiToStore(this.ficheAppelDataService.getIdFicheAppelActive(), urlConsultation)
    } else {
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsRpi;
      if (urlMap?.has(idFicheAppel)) {
        this.urlIframe = this.getLastUrlRpiFromStore(idFicheAppel);
      } else {
        const urlAccueilGieaStr = this.buildAcceuilGieaRechercheUrlContextAppel();
        this.urlIframe = this.sanitizer.bypassSecurityTrustResourceUrl(urlAccueilGieaStr);
        this.setLastUrlRpiToStore(this.ficheAppelDataService.getIdFicheAppelActive(), urlAccueilGieaStr);
      }
    }
  }

  /**
   * Construire l'url consultation  GIEA venant de l'interface plan action
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  private buildGieaUrlConsultationContextAppel(idFicheAppel: number): string {
    if (this.appContextStore.state.contextConsultationReferentiel) {
      // Réinitialiser l'état de consultation
      this.appContextStore.setvalue("contextConsultationReferentiel", false);
      // Build url params
      let consultData = this.appContextStore.state.consultData;
      let documentIdOrigine: number = consultData.idDocumentIdentification;
      let documentTypeOrigine: string = consultData.typeDocument;
      let voirAdmOrigine = false;
      let sourceRecherche = true;
      let sourceAccueil = false;
      let idAppel: number = this.ficheAppelDataService.getIdAppel();
      let ctx: string = "appel";
      let src: string = "infosante";
      let typeParam: string = "?documentTypeOrigine=" + documentTypeOrigine;
      let idParam: string = "&documentIdOrigine=" + documentIdOrigine;
      let voirParam: string = "&voirAdmOrigine=" + voirAdmOrigine;
      let sourceParam: string = "&sourceRecherche=" + sourceRecherche;
      let sourceAccueilParam: string = "&sourceAccueil=" + sourceAccueil;
      let contextAppelParam: string = "&ctx=" + ctx + "&idAppel=" + idAppel + "&idFiche=" + idFicheAppel + "&src=" + src + "#PI";
      let params: string = typeParam + idParam + voirParam + sourceParam + sourceAccueilParam + contextAppelParam;
      
      return window["env"].urlGieaConsultation + documentTypeOrigine +
        "/" + documentIdOrigine + "/identification/consulter" + params;
    }
  }

}
