import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConsultationFicheContainerComponent } from 'projects/infosante-ng-core/src/lib/components/containers/consultation-fiche/consultation-fiche-container.component';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { Observable } from 'rxjs';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'consultation-page',
  templateUrl: './consultation-fiche-page.component.html',
  styleUrls: ['./consultation-fiche-page.component.css']
})
export class ConsultationFichePageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  @ViewChild('saConsultationFicheContainer', { static: true })
  saConsultationFicheContainer: ConsultationFicheContainerComponent;

  idFicheAppel: number = null;
  ficheAppelActive: FicheAppelDTO;
  suppressionFicheAppelData: any;
  messageConfirmSuppressionFicheAppel: string;

  constructor(
    private alertStore: AlertStore,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ficheAppelDataService: FicheAppelDataService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
    this.fetchSavedDataFicheAppel(this.idFicheAppel);
  }

  private fetchSavedDataFicheAppel(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.subscriptions.add(this.ficheAppelApiService.getFicheAppel(idFicheAppel).subscribe((resultDto: FicheAppelDTO) => {
        this.ficheAppelActive = resultDto;
      }));
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.alertStore.resetAlert();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Rien à sauvegarde
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    return this.saConsultationFicheContainer?.autoSaveBeforeRoute();
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    // Bouton Annuler non visible
  }

  /**
   * Lorsqu'un changement de fiche est effectué (changement d'onglet).
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.idFicheAppel = idFicheAppel;
    this.fetchSavedDataFicheAppel(this.idFicheAppel);
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    // Bouton Sauvegarder non visible.
  }

  confirmerSuppressionFicheAppel(deleteData: any): void {
    this.subscriptions.add(
      this.ficheAppelApiService.isFicheAppelSupprimableContexteCti(deleteData?.idFicheAppel).subscribe(
        (confirm: boolean) => {
          if (confirm) {
            this.suppressionFicheAppelData = deleteData;
            this.messageConfirmSuppressionFicheAppel = this.translateService.instant("ss-iu-i10025");
            this.openModal('confirm_popup_supp_fiche_appel', 'supp_fiche_appel_btn_oui');
          } else {
            const title = this.translateService.instant("sigct.ss.error.label");
            const message: string = this.translateService.instant("ss-iu-i70006");
            const alertModel: AlertModel = AlertModelUtils.createAlertModel([message], title, AlertType.ERROR);
            this.alertStore.addAlert(alertModel);
          }
        }
      )
    );
  }

  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  supprimerFicheAppel() {
    this.closeModal('confirm_popup_supp_fiche_appel');
    this.subscriptions.add(
      this.ficheAppelApiService.supprimerFicheAppel(this.suppressionFicheAppelData.idFicheAppel).subscribe(() => {
        //On supprime une fiche d'appel, on demande d'interroger le nombre de fiche d'appel non termine afin de mettre a jour le "badge" dans le menu du haut
        this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlSanteApi + '/');
        // On supprime une fiche d'appel, on demande de mettre à jour les onglets des fiches pour l'appel courant.
        this.subscriptions.add(this.ficheAppelApiService.getListeFicheNonTermineesByAppel(this.suppressionFicheAppelData.idAppel).subscribe((result: FicheAppelDTO[]) => {
          if (result?.length > 0) {
            let firstFicheAppelDTO: FicheAppelDTO = result[0];
            this.ficheAppelDataService.setListeFicheAppel(result);
            this.ficheAppelDataService.setIdFicheAppelActive(firstFicheAppelDTO.id);
            this.ficheAppelActive = this.ficheAppelDataService.getFicheAppelActive();

            let urlSuffixeOnglet: SectionFicheAppelEnum = this.fetchLastSectionAffichageFicheAppel(firstFicheAppelDTO);
            // Naviguer vers la derniere section d'un fiche d'appel
            this.router.navigate(["/" + "editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", firstFicheAppelDTO.id, urlSuffixeOnglet]);
          } else {
            // Naviguer vers 'Accueuil' si toutes les fichiers sont supprimées
            this.router.navigate(["/" + "accueil"]);
          }
        }));
      }));

  }

  private fetchLastSectionAffichageFicheAppel(ficheAppelDTO: FicheAppelDTO): SectionFicheAppelEnum {
    // Récupère la dernière section affichée dans cette fiche d'appel.
    let urlSuffixeOnglet: SectionFicheAppelEnum = this.ficheAppelDataService.getLastSectionAffFicheAppel(ficheAppelDTO?.id);

    // Si la fiche n'a jamais été affichée, on affichera la section "Demande et évaluation".
    if (!urlSuffixeOnglet) {
      urlSuffixeOnglet = SectionFicheAppelEnum.EVALUATION;
    } else if (ficheAppelDTO?.statut == StatutFicheAppelEnum.FERME && urlSuffixeOnglet != SectionFicheAppelEnum.CONSULTATION && urlSuffixeOnglet != SectionFicheAppelEnum.NOTES) {
      urlSuffixeOnglet = SectionFicheAppelEnum.CONSULTATION;
    }

    return urlSuffixeOnglet;
  }

}
