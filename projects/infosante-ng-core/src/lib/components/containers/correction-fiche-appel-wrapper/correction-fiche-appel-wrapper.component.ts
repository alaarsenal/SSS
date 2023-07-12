import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { AppContextStoreStateKeyEnum } from 'projects/sigct-service-ng-lib/src/lib/models/app-context-store-state-key-enum';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { ConsultationFicheSectionUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
import { DureeFicheAppelComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/duree-fiche-appel/duree-fiche-appel/duree-fiche-appel.component';
import { EditionListeEntiteComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/edition-liste-entite/edition-liste-entite.component';
import { InputTextAreaComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-textarea/input-textarea.component';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { ItemSuitesIntervention, SuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/suites-intervention/suites-intervention.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { DialogueUsagerComponent } from 'projects/usager-ng-core/src/lib/components/uis';
import { AgeDTO } from 'projects/usager-ng-core/src/lib/models/age-dto';
import { BaseUsagerDTO } from 'projects/usager-ng-core/src/lib/models/base-usager-dto';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { UtilitaireService } from 'projects/usager-ng-core/src/lib/services/utilitaire.service';
import { Observable, of, Subscription } from 'rxjs';
import { CorrectionFicheAppelWrapperDTO } from '../../../models/correctoin-fiche-appel-wrapper-dto';
import { FicheAppelDTO } from '../../../models/fiche-appel-dto';
import { ProjetRechercheDTO } from '../../../models/projet-recherche-dto';
import { EnumTypeFicheAppel } from '../../../models/type-fiche-appel-enum';
import { UsagerDTO } from '../../../models/usager-dto';
import { UsagerIdentificationDTO } from '../../../models/usager-identification-dto';
import { CorrectionFicheAppelService } from '../../../services/correction-fiche-appel.service';
import { FicheAppelApiService } from '../../../services/fiche-appel-api.service';
import { FicheAppelDataService } from '../../../services/fiche-appel-data.service';
import { ProjetRechercheService } from '../../../services/projet-recherche.service';
import { ReferencesApiService } from '../../../services/references-api.service';
import { StatistiquesService } from '../../../services/statistiques.service';


@Component({
  selector: 'sa-correction-fiche-appel-wrapper',
  templateUrl: './correction-fiche-appel-wrapper.component.html',
  styleUrls: ['./correction-fiche-appel-wrapper.component.css']
})
export class CorrectionFicheAppelWrapperComponent implements OnInit, OnDestroy {

  @ViewChild('raisonCorrection', { static: true })
  raisonCorrection: InputTextAreaComponent;

  @ViewChild('orientation', { static: true })
  orientation: SuitesInterventionComponent;

  @ViewChild('reference', { static: true })
  reference: SuitesInterventionComponent;

  @ViewChild('projetRecherche', { static: false })
  projetRecherche: EditionListeEntiteComponent;

  @ViewChild('raisonIntervention', { static: true })
  raisonIntervention: EditionListeEntiteComponent;

  @ViewChild('roleAction', { static: true })
  roleAction: EditionListeEntiteComponent;

  @ViewChild('langueConsultation', { static: true })
  langueConsultation: EditionListeEntiteComponent;

  @ViewChild('centreActivite', { static: true })
  centreActivite: EditionListeEntiteComponent;

  @ViewChild('dureeFicheAppel', { static: false })
  dureeFicheAppel: DureeFicheAppelComponent;

  @Input()
  set idFicheAppel(value: number) {
    this.chargerDonnees(value);
  }

  @Output()
  returnEvent = new EventEmitter<boolean>();

  inputOptionAucuneSuite: InputOptionCollection = {
    name: "acunesuite",
    options: [{ label: 'sigct.ss.f_appel.corriger.suitesintervention.aucunesuite', value: 'false' }]
  };

  ficheAppel: FicheAppelDTO;
  ficheAppelInitial: FicheAppelDTO;
  ficheAppelCorrection = new FicheAppelCorrectionDTO();

  consultationFicheSectionUsagerDTO: ConsultationFicheSectionUsagerDTO;

  listeOrientations: OrientationSuitesInterventionDTO[];
  listeReferencesOrientation: ReferenceDTO[];

  listeReferences: ReferenceSuitesInterventionDTO[];
  listeReferencesReference: ReferenceDTO[];

  listeProjetRecherche: ReferenceDTO[];
  listeReferencesProjetRecherche: ReferenceDTO[];

  listeRaisonIntervention: ReferenceDTO[];
  listeReferencesRaisonIntervention: ReferenceDTO[];

  listeRoleAction: ReferenceDTO[];
  listeReferencesRoleAction: ReferenceDTO[];

  listeLangueConsultation: ReferenceDTO[];
  listeReferencesLangueConsultation: ReferenceDTO[];

  listeCentreActivite: ReferenceDTO[];
  listeReferencesCentreActivite: ReferenceDTO[];

  dureeFicheAppelDto: DureeFicheAppelDTO;

  btnModifierUsagerDisabled: boolean;
  aucuneSuiteDisabled: boolean;
  projetRechercheDisabled: boolean;
  raisonInterventionDisabled: boolean;
  roleActionDisabled: boolean;
  langueConsultationDisabled: boolean;
  centreActiviteDisabled: boolean;

  private subscriptions = new Subscription();
  private urlApi: string;
  private idUsagerIdent: number;
  private usagerInitial: UsagerDTO;
  private usagerALier: UsagerDTO;
  private existeSexeUsager: boolean;
  private dateNaissanceUsager: Date;
  private listeOrientationsLength: number;
  private listeReferencesLength: number;
  private currentIdUsagerIdent: number;

  constructor(
    private correctionFicheAppelService: CorrectionFicheAppelService,
    private ficheAppelService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private referenceService: ReferencesApiService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private statistiqueService: StatistiquesService,
    private projetRechercheService: ProjetRechercheService,
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService,
    private usagerService: UsagerService,
    private utilitaireService: UtilitaireService,
    private matDialog: MatDialog,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore,
  ) {
    this.urlApi = window["env"].urlSanteApi;
  }

  ngOnInit(): void {
    this.appContextStore.setvalue(AppContextStoreStateKeyEnum.IS_CONTEXT_CORRECTION_FICHE_APPEL, true);
    this.chargerListeReferencesOrientation();
    this.chargerListeReferencesReference();
    this.chargerListeReferencesProjetRecherche();
    this.chargerListeReferencesRaisonAppel();
    this.chargerListeReferencesRoleAction();
    this.chargerListeReferencesLangueConsultation();
    this.chargerListeReferencesCentreActivite();
    this.raisonCorrection.focus();
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
    this.subscriptions.unsubscribe();
    this.appContextStore.setvalue(AppContextStoreStateKeyEnum.IS_CONTEXT_CORRECTION_FICHE_APPEL, false);
  }

  canLeavePage(): boolean {
    return this.isFormVide();
  }

  /**Lorsque le bouton terminer correction fiche est actionné */
  onClickBtnTerminerCorrection(): void {
    //Effacer les messages alert s'il en a
    this.alertStore.resetAlert();
    //Encapsuler les données de la correction de la fiche d'appel dans un wrapper
    let correctionFicheAppelWrapper: CorrectionFicheAppelWrapperDTO = {
      ficheAppel: this.getFicheAppelActualisee(),
      ficheAppelCorrection: this.ficheAppelCorrection,
      existeSexeUsager: this.existeSexeUsager,
      dateNaissanceUsager: this.dateNaissanceUsager,
      orientations: this.getOrientationsSuiteIntervention(),
      references: this.getReferencesSuiteIntervention(),
      projetsRecherche: this.ficheAppel.saisieDifferee ? null : this.getProjetRecherche(),
      raisonsAppel: this.getRaisonsIntervention(),
      rolesAction: this.getRolesAction()
    };

    correctionFicheAppelWrapper.usagerIdentifRelierActif = true;
    if (this.consultationFicheSectionUsagerDTO==null||this.consultationFicheSectionUsagerDTO.idUsager == null) {
      this.onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper);
    } else {
      let idUsageridentif = correctionFicheAppelWrapper.ficheAppel.usager.usagerIdentification.id;
      if (this.consultationFicheSectionUsagerDTO.idUsager && correctionFicheAppelWrapper.ficheAppel.usager.usagerIdentification.id != this.consultationFicheSectionUsagerDTO.idUsager) {
        idUsageridentif = this.consultationFicheSectionUsagerDTO.idUsager;
      }
      this.subscriptions.add(this.usagerService.isUsagerActif(idUsageridentif).subscribe((result: Boolean) => {
        if (!result) {
          correctionFicheAppelWrapper.usagerIdentifRelierActif = false;
        }
        this.onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper);
      }));

    }
  }

  onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper: CorrectionFicheAppelWrapperDTO): void {
    //Valider les règles et exigences de l'interfaces de correction d'une intervention
    this.subscriptions.add(
      this.correctionFicheAppelService.validerCorrectionFicheAppel(correctionFicheAppelWrapper).subscribe(
        (result: CorrectionFicheAppelWrapperDTO) => {
          this.subscriptions.add(
            this.validerErreurs(result).subscribe(
              (isValid: boolean) => {
                if (isValid) {
                  //Si un nouvel usager a été rélié, historiser ce dernier
                  if (this.usagerALier) {
                    correctionFicheAppelWrapper.relierUsager = true;
                    this.subscriptions.add(
                      this.usagerService.creerHistoriqueUsagerIdent(this.usagerALier.usagerIdentification.id)
                        .subscribe((usagerIdentHistoDto: UsagerIdentHistoDTO) => {
                          correctionFicheAppelWrapper.ficheAppel.usager.idUsagerIdentHisto = usagerIdentHistoDto?.id;
                          //terminer la correction de la fiche d'appel
                          this.terminerCorrectionFicheAppel(correctionFicheAppelWrapper);
                        })
                    );
                  } else {
                    //Au cas contraire, terminer la correction de la fiche d'appel sans historiser de l'usager
                    this.terminerCorrectionFicheAppel(correctionFicheAppelWrapper);
                  }
                }
              }
            )
          );
        }
      )
    );
  }

  /**Lorsque le bouton modifier usager est actionné */
  onClickBtnModifierUsager(): void {
    this.alertStore.resetAlert();
    const dialogUsager = this.loadDialogUsager();
    this.onAfterOpenDialogUsager(dialogUsager);
    this.onAfterCloseDialogUsager(dialogUsager);
  }

  /**Lorsque le bouton anuller est actionné */
  onClickBtnCancel(): void {
    this.alertStore.resetAlert();
    if (!this.isFormVide()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.resetForm();
            }
          }
        )
      );
    }
  }

  /**Lorsque le bouton de retour à la consultation est actionné */
  onClickBtnReturn(): void {
    this.alertStore.resetAlert();
    this.returnEvent.emit(false);
  }

  onUpdateListeOrientationsEvent(length: number): void {
    this.listeOrientationsLength = length;
    this.updateAucuneSuiteDisabled();
  }

  onUpdateListeReferencesEvent(length: number): void {
    this.listeReferencesLength = length;
    this.updateAucuneSuiteDisabled();
  }

  private chargerDonnees(idFicheAppel: number): void {
    this.ficheAppel = new FicheAppelDTO();
    this.ficheAppelCorrection = new FicheAppelCorrectionDTO();
    this.idUsagerIdent = null;
    this.usagerInitial = null;
    this.usagerALier = null;
    this.listeOrientationsLength = 0;
    this.listeReferencesLength = 0;

    if (idFicheAppel) {
      this.subscriptions.add(
        this.ficheAppelService.getFicheAppel(idFicheAppel).subscribe(
          (result: FicheAppelDTO) => {
            this.ficheAppel = result;
            this.ficheAppelInitial = { ...result };
            this.usagerInitial = { ...this.ficheAppel.usager };
            const usagerHisto: boolean = this.ficheAppel.statut == StatutFicheAppelEnum.FERME;
            this.chargerSectionUsager(this.ficheAppel.usager, usagerHisto);
            this.chargerSectionSuitesIntervention();
            this.chargerSectionStatistiques();
            if (!this.ficheAppel.saisieDifferee) {
              this.chargerSectionValidationFinIntervention();
              this.chargerSectionDureeFiche();
            }
            this.griserLesElements();
          }
        )
      );
    }
  }

  private chargerSectionUsager(usager: UsagerDTO, usagerHisto?: boolean): void {
    this.consultationFicheSectionUsagerDTO = null;
    this.dateNaissanceUsager = usager?.usagerIdentification?.dtNaiss;
    if (usager) {
      this.consultationFicheSectionUsagerDTO = usager ? {
        idUsager: !usagerHisto ? usager.usagerIdentification?.id : null,
        idUsagerHisto: usagerHisto ? usager.idUsagerIdentHisto : null,
        ageAnnees: usager.ageAnnees,
        ageMois: usager.ageMois,
        ageJours: usager.ageJours
      } : null;
      this.idUsagerIdent = usager.usagerIdentification?.id;
    }
    if (this.idUsagerIdent) {
      this.subscriptions.add(
        this.usagerService.existsSexeUsager(this.idUsagerIdent).subscribe((exists: boolean) => {
          this.existeSexeUsager = exists;
        })
      );
    }
  }

  private chargerSectionSuitesIntervention(): void {
    this.listeOrientations = [];
    this.subscriptions.add(
      this.orientationSuitesInterventionService.getListOrientations(this.urlApi, this.ficheAppel.id).subscribe(
        (results: OrientationSuitesInterventionDTO[]) => {
          this.listeOrientations = results;
          this.onUpdateListeOrientationsEvent(results?.length);
        }
      )
    );
    this.listeReferences = [];
    this.subscriptions.add(
      this.referenceSuitesInterventionService.findAll(this.urlApi, this.ficheAppel.id).subscribe(
        (results: ReferenceSuitesInterventionDTO[]) => {
          this.listeReferences = results;
          this.onUpdateListeReferencesEvent(results?.length);
        }
      )
    );
  }

  private chargerSectionStatistiques(): void {
    this.chargerDonneesRaisonIntervention();
    this.chargerDonneesRoleAction();
    this.chargerDonneesLangueConsultation();
    this.chargerDonneesCentreActivite();
  }

  private chargerSectionDureeFiche(): void {
    this.dureeFicheAppelDto = {
      dateDebut: this.ficheAppel.dateDebut,
      dateFin: this.ficheAppel.dateFin,
      dureeCorrigee: this.ficheAppel.dureeCorrigee,
      detailsDureeCorrigee: this.ficheAppel.detailsDureeCorrigee
    }
  }

  private chargerSectionValidationFinIntervention(): void {
    //Charger donnees projet recherche
    this.listeProjetRecherche = [];
    this.subscriptions.add(
      this.projetRechercheService.getListeProjetRecherche(this.ficheAppel.id).subscribe(
        (results: ProjetRechercheDTO[]) => {
          if (CollectionUtils.isNotBlank(results)) {
            let aux: ReferenceDTO[] = [];
            results?.forEach(item => {
              let reference: ReferenceDTO = new ReferenceDTO();
              reference.id = item.id;
              reference.code = item.referenceProjetRechercheCode;
              reference.nom = item.referenceProjetRechercheNom;
              aux.push(reference);
            });
            this.listeProjetRecherche = aux;
          }
        }
      )
    );
  }

  private chargerDonneesRaisonIntervention(): void {
    this.listeRaisonIntervention = [];
    this.subscriptions.add(
      this.statistiqueService.getListeRaisonAppel(this.ficheAppel.id).subscribe(
        (results: RaisonAppelDTO[]) => {
          if (CollectionUtils.isNotBlank(results)) {
            let aux: ReferenceDTO[] = [];
            results?.forEach(item => {
              let reference: ReferenceDTO = new ReferenceDTO();
              reference.id = item.id;
              reference.code = item.referenceRaisonAppelCode;
              reference.codeCn = item.referenceRaisonAppelCodeCn;
              reference.nom = item.referenceRaisonAppelNom;
              aux.push(reference);
            });
            this.listeRaisonIntervention = aux;
          }
        }
      )
    );
  }

  private chargerDonneesRoleAction(): void {
    this.listeRoleAction = [];
    this.subscriptions.add(
      this.statistiqueService.getListeRoleAction(this.ficheAppel.id).subscribe(
        (results: RoleActionDTO[]) => {
          if (CollectionUtils.isNotBlank(results)) {
            let aux: ReferenceDTO[] = [];
            results?.forEach(item => {
              let reference: ReferenceDTO = new ReferenceDTO();
              reference.id = item.id;
              reference.code = item.referenceRoleActionCode;
              reference.codeCn = item.referenceRoleActionCodeCn;
              reference.nom = item.referenceRoleActionNom;
              aux.push(reference);
            });
            this.listeRoleAction = aux;
          }
        }
      )
    );
  }

  private chargerDonneesLangueConsultation(): void {
    const reference: ReferenceDTO = this.ficheAppel.referenceLangueAppelCode
      && CollectionUtils.isNotBlank(this.listeReferencesLangueConsultation)
      ? this.listeReferencesLangueConsultation.find(item => item.code == this.ficheAppel.referenceLangueAppelCode)
      : null;
    this.listeLangueConsultation = reference ? [{ ...reference }] : null;
  }

  private chargerDonneesCentreActivite(): void {
    const reference: ReferenceDTO = this.ficheAppel.referenceCentreActiviteCode
      && CollectionUtils.isNotBlank(this.listeReferencesCentreActivite)
      ? this.listeReferencesCentreActivite.find(item => item.code == this.ficheAppel.referenceCentreActiviteCode)
      : null;
    this.listeCentreActivite = reference ? [{ ...reference }] : null;
  }

  private chargerListeReferencesOrientation(): void {
    this.subscriptions.add(
      this.referenceService.getListeOrientation().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesOrientation = results;
        }
      )
    );
  }

  private chargerListeReferencesReference(): void {
    this.subscriptions.add(
      this.referenceService.getListeReference().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesReference = results;
        }
      )
    );
  }

  private chargerListeReferencesProjetRecherche(): void {
    this.subscriptions.add(
      this.referenceService.getListeProjetRecherche().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesProjetRecherche = results;
        }
      )
    );
  }

  private chargerListeReferencesRaisonAppel(): void {
    this.subscriptions.add(
      this.referenceService.getListeRaisonAppel().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesRaisonIntervention = results;
        }
      )
    );
  }

  private chargerListeReferencesRoleAction(): void {
    this.subscriptions.add(
      this.referenceService.getListeRoleAction().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesRoleAction = results;
        }
      )
    );
  }

  private chargerListeReferencesLangueConsultation(): void {
    this.subscriptions.add(
      this.referenceService.getListeLangueAppel().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesLangueConsultation = results;
        }
      )
    );
  }

  private chargerListeReferencesCentreActivite(): void {
    this.subscriptions.add(
      this.referenceService.getListeCentreActivite().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesCentreActivite = results;
        }
      )
    );
  }

  private griserLesElements(): void {
    this.btnModifierUsagerDisabled = false;
    this.langueConsultationDisabled = false;
    this.centreActiviteDisabled = false;
    this.projetRechercheDisabled = false;
    this.roleActionDisabled = false;
    this.raisonInterventionDisabled = false;

    if (EnumTypeFicheAppel.DEMRESS == this.ficheAppel.typeConsultation
      || EnumTypeFicheAppel.NONPERT == this.ficheAppel.typeConsultation) {
      this.projetRechercheDisabled = true;
    }
  }

  private loadDialogUsager(): MatDialogRef<DialogueUsagerComponent, any> {
    const matDialogConfig = new MatDialogConfig();

    matDialogConfig.disableClose = true;
    matDialogConfig.autoFocus = false;
    matDialogConfig.restoreFocus = true;
    matDialogConfig.width = "90vw";
    matDialogConfig.maxWidth = "90vw";
    matDialogConfig.height = "calc(100% - 120px)";
    matDialogConfig.data = {
      idUsager: this.idUsagerIdent,
      enContexteAppel: false
    };
    return this.matDialog.open(DialogueUsagerComponent, matDialogConfig);
  }

  private onAfterOpenDialogUsager(dialogUsager: MatDialogRef<DialogueUsagerComponent, any>): void {
    this.subscriptions.add(
      dialogUsager.afterOpened().subscribe(() => {
        // Indique l'ouverture du popup pour masquer les msg erreur.
        this.ficheAppelDataService.setDialogueUsagerOpened(true);
      })
    );
  }

  private onAfterCloseDialogUsager(dialogUsager: MatDialogRef<DialogueUsagerComponent, any>): void {
    this.currentIdUsagerIdent = this.idUsagerIdent;
    this.subscriptions.add(
      dialogUsager.afterClosed().subscribe((baseUsager: BaseUsagerDTO) => {
        // Indique la fermeture du popup pour afficher les msg erreur.
        this.ficheAppelDataService.setDialogueUsagerOpened(false);
        if (!baseUsager?.id) {
          return;
        }
        //Verifier si l'usager correspond à celui relié à cette fiche d'appel
        if (this.idUsagerIdent == baseUsager.id) {
          this.showAlertMessage("ss-iu-e50001");
        } else {
          //Se l'usager selectionné correspond à l'usager initial de la fiche d'appel remettre les données historsées
          if (this.usagerInitial?.usagerIdentification?.id == baseUsager.id) {
            this.usagerALier = null;
            this.chargerSectionUsager(this.usagerInitial, true);
          } else {
            //Verifier si l'usager est déjà relié à une autre fiche du même appel
            this.subscriptions.add(
              this.correctionFicheAppelService.isUsagerLieAutreFiche(baseUsager.id, this.ficheAppel).subscribe(
                (confirm: boolean) => {
                  if (confirm) {
                    this.showAlertMessage("sa-iu-e00010");
                  } else {
                    //Si la fiche n'a aucun usager rélié, rélier l'usager selectionné.
                    if (!this.idUsagerIdent) {
                      this.relierUsager(baseUsager);
                    } else {
                      // Informer q'un autre usager a déjà été relié à la fiche. Voulez-vous le remplacer par l'usager en cours?
                      this.subscriptions.add(
                        this.materialModalDialogService.popupConfirmer("us-iu-c00001").subscribe(
                          (confirm: boolean) => {
                            if (confirm) {
                              this.relierUsager(baseUsager);
                            }
                          }
                        )
                      );
                    }
                  }
                }
              )
            );
          }
        }
      })
    );
  }

  private relierUsager(baseUsager: BaseUsagerDTO) {
    const dtNaissance: string = (typeof baseUsager?.groupeAgeOptions?.dateNaissance == "string") ?
      baseUsager?.groupeAgeOptions?.dateNaissance :
      DateUtils.getDateToAAAAMMJJ(baseUsager?.groupeAgeOptions?.dateNaissance);
    const dateDebutAppel: Date = this.ficheAppel.dateDebutAppel ? this.ficheAppel.dateDebutAppel : this.ficheAppel.dateDebut;
    const dtRef: string = DateUtils.getDateToAAAAMMJJ(new Date(dateDebutAppel));
    this.subscriptions.add(
      this.utilitaireService.getAgeParDateNaissanceEtDateReference(dtNaissance, dtRef).subscribe(
        (age: AgeDTO) => {
          if (age) {
            if (!baseUsager.groupeAgeOptions) {
              baseUsager.groupeAgeOptions = new GroupeAgeOptions();
            }
            baseUsager.groupeAgeOptions.annees = age.years ? age.years + "" : null;
            baseUsager.groupeAgeOptions.mois = age.months ? age.months + "" : null;
            baseUsager.groupeAgeOptions.jours = age.days;
          }
          let usagerIdent: UsagerIdentificationDTO = new UsagerIdentificationDTO();
          usagerIdent.id = baseUsager.id;

          this.usagerALier = new UsagerDTO();
          this.usagerALier.id = this.ficheAppel.usager?.id;
          this.usagerALier.usagerAnonyme = false;
          this.usagerALier.usagerIdentification = usagerIdent;

          if (baseUsager.groupeAgeOptions) {
            if (baseUsager.groupeAgeOptions.groupeId) {
              let referenceGroupeAge: ReferenceDTO = new ReferenceDTO();
              referenceGroupeAge.id = baseUsager.groupeAgeOptions.groupeId;
              referenceGroupeAge.code = baseUsager.groupeAgeOptions.groupe;
              this.usagerALier.referenceGroupeAge = referenceGroupeAge;
            }
            this.usagerALier.ageAnnees = (baseUsager.groupeAgeOptions.annees ? +baseUsager.groupeAgeOptions.annees : null);
            this.usagerALier.ageMois = (baseUsager.groupeAgeOptions.mois ? +baseUsager.groupeAgeOptions.mois : null);
            this.usagerALier.ageJours = (baseUsager.groupeAgeOptions.jours ? +baseUsager.groupeAgeOptions.jours : null);
            this.usagerALier.usagerIdentification.dtNaiss = baseUsager.groupeAgeOptions.dateNaissance ? baseUsager.groupeAgeOptions.dateNaissance : null
          }
          let ficheAppelDto: FicheAppelDTO = new FicheAppelDTO();
          ficheAppelDto.id = this.ficheAppel.id;
          this.usagerALier.ficheAppel = ficheAppelDto;
          this.chargerSectionUsager(this.usagerALier);
        })
    );
  }

  private isFormVide(): boolean {
    return !this.ficheAppel ||
      (!this.ficheAppelCorrection?.raisonCorrection
        && !this.usagerALier
        && this.ficheAppelInitial
        && this.ficheAppelInitial.aucuneSuite == this.ficheAppel.aucuneSuite
        && this.orientation.isFormVide()
        && this.reference.isFormVide()
        && (this.ficheAppel.saisieDifferee || this.projetRecherche?.isFormVide())
        && this.raisonIntervention.isFormVide()
        && this.roleAction.isFormVide()
        && this.langueConsultation.isFormVide()
        && this.centreActivite.isFormVide()
        && (this.ficheAppel.saisieDifferee || this.dureeFicheAppel?.isFormVide(this.ficheAppelInitial.dureeCorrigee))
      );
  }

  private resetForm(): void {
    this.chargerDonnees(this.ficheAppel.id);
  }

  private updateAucuneSuiteDisabled(): void {
    this.aucuneSuiteDisabled = this.listeOrientationsLength > 0 || this.listeReferencesLength > 0;
    if (this.aucuneSuiteDisabled) {
      this.ficheAppel.aucuneSuite = false;
    }
  }

  private getFicheAppelActualisee(): FicheAppelDTO {
    this.ficheAppel.referenceLangueAppelCode = this.langueConsultation._references[0]?.code;
    this.ficheAppel.referenceCentreActiviteCode = this.centreActivite._references[0]?.code;
    if (!this.ficheAppel.saisieDifferee) {
      const dureeFicheAppelDto: DureeFicheAppelDTO = this.dureeFicheAppel.getDureeFicheAppelDTO();
      this.ficheAppel.dureeCorrigee = dureeFicheAppelDto?.dureeCorrigee;
    }
    if (this.usagerALier) {
      this.ficheAppel.usager = this.usagerALier;
    }
    return this.ficheAppel;
  }

  private getOrientationsSuiteIntervention(): OrientationSuitesInterventionDTO[] {
    if (!this.orientation.suitesInterventions) {
      return null;
    }
    let results: OrientationSuitesInterventionDTO[] = [];
    this.orientation.suitesInterventions.forEach(item => {
      results.push({
        id: item.id,
        idFicheAppel: item.idFicheAppel,
        codeCnReferenceOrientation: item.codeCnReferenceSuitesIntervention,
        codeReferenceOrientation: item.codeReferenceSuitesIntervention,
        nomReferenceOrientation: item.nomReferenceSuitesIntervention,
        programmeService: item.programmeService,
        details: item.details,
        rrssDTOs: item.rrssDTOs,
      });
    });
    return results;
  }

  private getReferencesSuiteIntervention(): ReferenceSuitesInterventionDTO[] {
    if (!this.reference.suitesInterventions) {
      return null;
    }
    let results: ReferenceSuitesInterventionDTO[] = [];
    this.reference.suitesInterventions.forEach(item => {
      results.push({
        id: item.id,
        idFicheAppel: item.idFicheAppel,
        codeCnReferenceReference: item.codeCnReferenceSuitesIntervention,
        codeReferenceReference: item.codeReferenceSuitesIntervention,
        nomReferenceReference: item.nomReferenceSuitesIntervention,
        programmeService: item.programmeService,
        details: item.details,
        rrssDTOs: item.rrssDTOs,
      });
    });
    return results;
  }

  private getProjetRecherche(): ProjetRechercheDTO[] {
    if (!this.projetRecherche._references) {
      return null;
    }
    let results: ProjetRechercheDTO[] = [];
    this.projetRecherche._references.forEach(item => {
      results.push({
        id: item.id,
        referenceProjetRechercheCode: item.code,
        referenceProjetRechercheNom: item.nom,
        idFicheAppel: this.ficheAppel.id,
      });
    });
    return results;
  }

  private getRaisonsIntervention(): RaisonAppelDTO[] {
    if (!this.raisonIntervention._references) {
      return null;
    }
    let results: RaisonAppelDTO[] = [];
    this.raisonIntervention._references.forEach(item => {
      results.push({
        id: item.id,
        referenceRaisonAppelCode: item.code,
        referenceRaisonAppelNom: item.nom,
        referenceRaisonAppelCodeCn: item.codeCn,
        idFicheAppel: this.ficheAppel.id,
      });
    });
    return results;
  }

  private getRolesAction(): RoleActionDTO[] {
    if (!this.roleAction._references) {
      return null;
    }
    let results: RoleActionDTO[] = [];
    this.roleAction._references.forEach(item => {
      results.push({
        id: item.id,
        referenceRoleActionCode: item.code,
        referenceRoleActionNom: item.nom,
        referenceRoleActionCodeCn: item.codeCn,
        idFicheAppel: this.ficheAppel.id,
      });
    });
    return results;
  }

  private validerErreurs(wrapper: CorrectionFicheAppelWrapperDTO): Observable<boolean> {
    let errors: string[] = [];
    if (wrapper.erreurs) {
      errors = Object.keys(wrapper.erreurs).map(key => (wrapper.erreurs[key]));
    }
    //Valider doublons orientaitons
    const doublonOrientations: ItemSuitesIntervention[] = this.orientation.getDoublons();
    if (doublonOrientations) {
      const title: string = this.translateService.instant(this.orientation.titreReferenceSuitesIntervention);
      doublonOrientations.forEach(item => {
        errors.push(this.translateService.instant("ss-iu-e30004", { 0: title, 1: item.nomReferenceSuitesIntervention }));
      });
    }
    //Valider doublons projets de recherche
    if (!this.ficheAppel.saisieDifferee) {
      const doublonProjetRecherche: ReferenceDTO[] = this.projetRecherche.getDoublons();
      if (doublonProjetRecherche) {
        doublonProjetRecherche.forEach(item => {
          errors.push(this.translateService.instant("sa-iu-e50004"));
        });
      }
    }
    //Valider doublons raison de l'intervention
    const doublonRaisonIntervention: ReferenceDTO[] = this.raisonIntervention.getDoublons();
    if (doublonRaisonIntervention) {
      const title: string = this.translateService.instant(this.raisonIntervention.titreReference);
      doublonRaisonIntervention.forEach(item => {
        errors.push(this.translateService.instant("ss-iu-e30004", { 0: title, 1: item.description }));
      });
    }
    //Valider doublons rôles-actions
    const doublonRolesAction: ReferenceDTO[] = this.roleAction.getDoublons();
    if (doublonRolesAction) {
      const title: string = this.translateService.instant(this.roleAction.titreReference);
      doublonRolesAction.forEach(item => {
        errors.push(this.translateService.instant("ss-iu-e30004", { 0: title, 1: item.description }));
      });
    }
    if (CollectionUtils.isNotBlank(errors)) {
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(errors, alertTitle);
      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertModel));
      } else {
        this.alertStore.setState([alertModel]);
      }
      return of(false);
    } else if (!this.ficheAppel.saisieDifferee && this.ficheAppel.dureeCorrigee > 3600) {
      // Confirmer la valeur de la durée corrigée de la fiche d'appel
      return this.materialModalDialogService.popupConfirmer('sa-iu-a30006');
    } else {
      return of(true);
    }
  }

  /**Terminer la correction de la fiche d'appel une fois validée */
  private terminerCorrectionFicheAppel(correctionFicheAppelWrapper: CorrectionFicheAppelWrapperDTO): void {
    this.subscriptions.add(
      this.correctionFicheAppelService.terminerCorrectionFicheAppel(correctionFicheAppelWrapper).subscribe(
        (idFicheAppel: number) => {
          if (correctionFicheAppelWrapper.ficheAppel?.usager?.usagerIdentification?.id || this.currentIdUsagerIdent) {
            this.subscriptions.add(this.usagerService.solrIndexUsagers([correctionFicheAppelWrapper.ficheAppel.usager.usagerIdentification.id, this.currentIdUsagerIdent]).subscribe(rs => {
              // Navigation vers la consultation
              this.returnEvent.emit(true);
            }));
          } else {
            this.chargerSectionSuitesIntervention();
            this.returnEvent.emit(true);
          }
        }
      )
    );
  }

  private showAlertMessage(messageKey: string, alertType?: AlertType) {
    const message = this.translateService.instant(messageKey);
    const title = this.translateService.instant("sigct.ss.error.label");
    if (!alertType) {
      alertType = AlertType.ERROR;
    }
    let alertModel: AlertModel = AlertModelUtils.createAlertModel([message], title, alertType);
    this.alertStore.addAlert(alertModel);
  }

}
