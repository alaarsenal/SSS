import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DocumentGippDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { MoyenSocialDTO } from 'projects/infosocial-ng-core/src/lib/models/moyen-social-dto';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { FicheAppelDataService } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { GippApiService } from 'projects/infosocial-ng-core/src/lib/services/gipp-api.service';
import { MoyenSocialService } from 'projects/infosocial-ng-core/src/lib/services/moyen-social-service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { Observable, Subscription } from 'rxjs';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'protocoles-page',
  templateUrl: './protocoles-page.component.html',
  styleUrls: ['./protocoles-page.component.css'],
})
export class ProtocolesPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  /** Url GIPP affiché dans le iframe. */
  gippUrl: SafeUrl;
  subscriptions: Subscription = new Subscription();
  windoPostMessageListner: any;

  constructor(
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private moyenSocialService: MoyenSocialService,
    private appContextStore: AppContextStore,
    private sanitizer: DomSanitizer,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private gippApiService: GippApiService,
    private renderer: Renderer2,
    private typeficheSelectioneService: TypeficheSelectioneService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    let idFicheAppelActif: number = this.ficheAppelDataService.getIdFicheAppelActive();
    this.buildGippUrlContextAppel(idFicheAppelActif);
    this.addWindowListner();
  }

  private buildAcceuilGippRechercheUrlContextAppel(): string {
    let idFicheAppelActif: number = this.ficheAppelDataService.getIdFicheAppelActive();
    let idAppel: number = this.ficheAppelDataService.getIdAppel();
    let ctx: string = "appel";
    let src: string = "infosocial"
    let params: string = "?ctx=" + ctx + "&idAppel=" + idAppel + "&idFiche=" + idFicheAppelActif + "&src=" + src

    return window["env"].urlGippRecherche + params;
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
        let targetUrlSentByIframe = window["env"].urlGippBase + message.data.targetHref
        let idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
        this.setLastUrlGippToStore(idFicheAppel, targetUrlSentByIframe);
      }
      // l'entrée pour le traitement des informations pour relier un/des référentiel(s)
      if (message.data.className && message.data.className == "relierReferentielAction") {
        this.ajouterMoyen(idFicheAppelActif, message);
      }
      // l'entrée pour le traitement des informations pour copier une/des information(s) d'une/des rubrique(s)
      if (message.data.idName && message.data.idName == "copierVersFicheBtn") {
        this.copierRubriqueInfoResumee(idFicheAppelActif, message);
      }
    }
  }

  private ajouterMoyen(idFicheAppelActif: number, message: any): void {
    let moyenSocialDTO: MoyenSocialDTO = new MoyenSocialDTO();
    moyenSocialDTO.idDocumentIdentificationSocial = message.data.documentIdOrigine;
    moyenSocialDTO.nomDocumentIdentificationSocial = message.data.documentNomOrigine;
    moyenSocialDTO.idFicheAppel = idFicheAppelActif;
    if (idFicheAppelActif && moyenSocialDTO) {
      this.viderPileMessages();
      this.subscriptions.add(
        this.moyenSocialService.ajouterMoyen(idFicheAppelActif, moyenSocialDTO)
          .subscribe(moyenSocialDTOresult => {
            this.afficherMessageRlierReferentielReussie(message.data.documentNomOrigine);
          })
      );
    }
  }

  private copierRubriqueInfoResumee(idFicheAppelActif: number, message: any): void {
    if (idFicheAppelActif && message?.data?.documentIdOrigine) {
      let documentGippDto: DocumentGippDTO = new DocumentGippDTO();
      documentGippDto.idDocIdent = message.data.documentIdOrigine;
      documentGippDto.nomDocIdent = message.data.documentNomOrigine;

      this.subscriptions.add(
        // Récupère les résumés des rubriques du document sélectionné
        this.gippApiService.getListeResumeRubriques(message.data.idsRubriquesSelected).subscribe((listeResume: string[]) => {
          documentGippDto.listeResumeRubrique = listeResume;

          // Relie le document à la fiche et ajoute les résumés des rubriques à l'intervention.
          this.subscriptions.add(
            this.ficheAppelApiService.copierRubriqueInfoResumee(idFicheAppelActif, documentGippDto).subscribe(ficheAppelSocialDTOResult => {
              this.afficherMessageCopierRubriqueInfoResumeeReussie();
            })
          );
        })
      );
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

  private afficherMessageRlierReferentielReussie(nomReferentiel: string): void {
    let messageConfirmermation = this.translateService.instant('so-iu-c30000', { 0: nomReferentiel });
    const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess("Confirmation");
    alertModel.messages = [messageConfirmermation];
    this.alertStore.addAlert(alertModel);
  }

  private afficherMessageCopierRubriqueInfoResumeeReussie(): void {
    let messageConfirmermation = this.translateService.instant('so-iu-c30001');
    const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess("Confirmation");
    alertModel.messages = [messageConfirmermation];
    this.alertStore.addAlert(alertModel);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.viderPileMessages();
    this.subscriptions.unsubscribe();
    // Détacher tous les listners avant que quitter l'interface
    this.windoPostMessageListner();
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
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
   * Lorsqu'un changement de fiche est effectué (changement d'onglet).
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.buildGippUrlContextAppel(idFicheAppel);
    this.viderPileMessages();
  }

  /**
   * Construire l'url consultation  GIPP venant de l'interface plan action
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  private buildeGippUrlConsultationContextAppel(idFicheAppel: number): string {
    if (this.appContextStore.state.contextConsultationReferentiel) {
      // Réinitialiser l'état de consultation
      this.appContextStore.setvalue("contextConsultationReferentiel", false);
      // Build url params
      let consultData = this.appContextStore.state.consultData;
      let documentIdOrigine: number = consultData.idDocumentIdentificationSocial;
      let documentTypeOrigine: number = consultData.codeTypeReferentiel;
      let voirAdmOrigine = false;
      let sourceRecherche = true;
      let idAppel: number = this.ficheAppelDataService.getIdAppel();
      let ctx: string = "appel";
      let src: string = "infosocial";
      let typeParam: string = "?documentTypeOrigine=" + documentTypeOrigine;
      let idParam: string = "&documentIdOrigine=" + documentIdOrigine;
      let voirParam: string = "&voirAdmOrigine=" + voirAdmOrigine;
      let sourceParam: string = "&sourceRecherche=" + sourceRecherche;
      let contextAppelParam: string = "&ctx=" + ctx + "&idAppel=" + idAppel + "&idFiche=" + idFicheAppel + "&src=" + src + "#PI";
      let params: string = typeParam + idParam + voirParam + sourceParam + contextAppelParam;

      return window["env"].urlGippConsultation + "/" + documentTypeOrigine +
        "/" + documentIdOrigine + "/identification/consulter" + params;
    }
  }

  /**
   * Construire l'url GIPP tout en détectant s'il s'agit un premier chargement
   * du fichier d'appel ou il avait déja une entrée dans l'historique des url.
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  private buildGippUrlContextAppel(idFicheAppel: number): void {
    if (this.appContextStore.state.contextConsultationReferentiel) {
      let urlConsultation = this.buildeGippUrlConsultationContextAppel(idFicheAppel);
      this.gippUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlConsultation);
      this.setLastUrlGippToStore(this.ficheAppelDataService.getIdFicheAppelActive(), urlConsultation)
    } else {
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsGipp;
      if (urlMap?.has(idFicheAppel)) {
        this.gippUrl = this.getLastUrlGippFromStore(idFicheAppel);
      } else {
        const urlAccueilGippStr = this.buildAcceuilGippRechercheUrlContextAppel();
        this.gippUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlAccueilGippStr);
        this.setLastUrlGippToStore(this.ficheAppelDataService.getIdFicheAppelActive(), urlAccueilGippStr)
      }
    }
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    // Bouton sauvegarde non visible
  }

  /**
   * À chaque fois que l'url Gipp change dans le iframe, on le garde en mémoire.
   * @param event événement provenant du iframe
   */
  onFrameLoad(event: any) {
  }

  /**
  * Récupère du store le dernier url affiché dans la fiche idFicheAppel.
  * @param idFicheAppel identifiant de la fiche d'appel
  */
  private getLastUrlGippFromStore(idFicheAppel: number): SafeUrl {
    let lastUrlGipp = this.sanitizer.bypassSecurityTrustResourceUrl(this.buildAcceuilGippRechercheUrlContextAppel());
    //= this.urlAccueilGipp;
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsGipp;
      if (urlMap?.has(idFicheAppel)) {
        const urlGipp: string = urlMap.get(idFicheAppel);
        lastUrlGipp = this.sanitizer.bypassSecurityTrustResourceUrl(urlGipp);
      }
    }
    return lastUrlGipp;
  }

  /**
   * Dépose dans le store le dernier url Gipp consulté pour la fiche idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param urlGipp url de Gipp
   */
  private setLastUrlGippToStore(idFicheAppel: number, urlGipp: string): void {
    if (idFicheAppel) {
      // Récupère du store le Map contenant le dernier url affiché pour chaque fiche d'appel.
      let urlMap: Map<number, string> = this.appContextStore.state.mapUrlsGipp;
      if (!urlMap) {
        urlMap = new Map();
      }

      urlMap.set(idFicheAppel, urlGipp);
      this.appContextStore.setvalue("mapUrlsGipp", urlMap);
    }
  }
}

