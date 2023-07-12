import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { AppContextStoreStateKeyEnum } from 'projects/sigct-service-ng-lib/src/lib/models/app-context-store-state-key-enum';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { boutonCouleurItem } from 'projects/sigct-ui-ng-lib/src/lib/components/bouton-radio-couleur/bouton-radio-couleur-interface';
import { ConsultationFicheSectionUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
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
import { Subscription } from 'rxjs';
import { ReferenceDangerSuicideDTO, ReferenceRisqueHomicideDTO, UsagerDTO, UsagerIdentificationDTO } from '../../../models';
import { CorrectionFicheAppelWrapperDTO } from '../../../models/correction-fiche-appel-wrapper-dto';
import { FicheAppelSocialDTO } from '../../../models/fiche-appel-social-dto';
import { EnumTypeFicheAppel } from '../../../models/type-fiche-appel-enum';
import { StatistiquesService } from '../../../services';
import { CorrectionFicheAppelService } from '../../../services/correction-fiche-appel.service';
import { FicheAppelDataService } from '../../../services/fiche-appel-data.service';
import { ReferencesApiService } from '../../../services/references-api.service';

@Component({
  selector: 'so-correction-fiche-appel-wrapper',
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

  @ViewChild('resumeIntervention', { static: true })
  resumeIntervention: EditionListeEntiteComponent;

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

  ficheAppel: FicheAppelSocialDTO;
  ficheAppelInitial: FicheAppelSocialDTO;
  ficheAppelCorrection = new FicheAppelCorrectionDTO();
  consultationFicheSectionUsagerDTO: ConsultationFicheSectionUsagerDTO;

  listeDangerSuicide = new Array<boutonCouleurItem>();
  listeRisqueHomicide = new Array<boutonCouleurItem>();
  listeOrientations: OrientationSuitesInterventionDTO[];
  listeReferencesOrientation: ReferenceDTO[];
  listeReferences: ReferenceSuitesInterventionDTO[];
  listeReferencesReference: ReferenceDTO[];
  listeRaisonIntervention: ReferenceDTO[];
  listeReferencesRaisonIntervention: ReferenceDTO[];

  btnModifierUsagerDisabled: boolean;
  accueilDisabled: boolean;
  analyseSituationDisabled: boolean;
  estimationDangerSuicideDisabled: boolean;
  estimationRisqueHomicideDisabled: boolean;
  difficultePrioriseeDisabled: boolean;
  objectifDisabled: boolean;
  moyenModaliteDisabled: boolean;
  aucuneSuiteDisabled: boolean;
  opinionProfessionelleDisabled: boolean;
  raisonInterventionDisabled: boolean;

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
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService,
    private usagerService: UsagerService,
    private utilitaireService: UtilitaireService,
    private matDialog: MatDialog,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore) {
    this.urlApi = window["env"].urlInfoSocial + '/api';
  }

  ngOnInit(): void {
    this.appContextStore.setvalue(AppContextStoreStateKeyEnum.IS_CONTEXT_CORRECTION_FICHE_APPEL, true);
    this.chargerListeDangerSuicide();
    this.chargerListeHomicide();
    this.chargerListeReferencesOrientation();
    this.chargerListeReferencesReference();
    this.chargerListeReferencesRaisonIntervention();
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
      ficheAppel: this.ficheAppel,
      ficheAppelCorrection: this.ficheAppelCorrection,
      existeSexeUsager: this.existeSexeUsager,
      dateNaissanceUsager: this.dateNaissanceUsager,
      orientations: this.getOrientationsSuiteIntervention(),
      references: this.getReferencesSuiteIntervention(),
      raisonsAppel: this.getRaisonsIntervention()
    };
    let idUsageridentif;
    if(correctionFicheAppelWrapper?.ficheAppel?.usager?.usagerIdentification!=null){
      idUsageridentif= correctionFicheAppelWrapper.ficheAppel.usager.usagerIdentification.id;
   }
    let isUsagerChanged: boolean = false;
    if (this.consultationFicheSectionUsagerDTO?.idUsager!=null && this.consultationFicheSectionUsagerDTO.idUsager && correctionFicheAppelWrapper.ficheAppel.usager.usagerIdentification.id != this.consultationFicheSectionUsagerDTO.idUsager) {
      idUsageridentif = this.consultationFicheSectionUsagerDTO.idUsager;
      isUsagerChanged = true;
    }
    correctionFicheAppelWrapper.usagerIdentifRelierActif = true;
    if (isUsagerChanged) {
      this.subscriptions.add(this.usagerService.isUsagerActif(idUsageridentif).subscribe((result: Boolean) => {
        if (!result) {
          correctionFicheAppelWrapper.usagerIdentifRelierActif = false;
        }
        this.onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper);
      }));
    } else {
      this.onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper);
    }
  }

  onClickBtnTerminerCorrectionAction(correctionFicheAppelWrapper: CorrectionFicheAppelWrapperDTO): void {

    //Valider les règles et exigences de l'interfaces de correction d'une intervention
    this.subscriptions.add(
      this.correctionFicheAppelService.validerCorrectionFicheAppel(correctionFicheAppelWrapper).subscribe(
        (result: CorrectionFicheAppelWrapperDTO) => {
          if (this.validerErreurs(result)) {
            //Si un nouvel usager a été rélié, historiser ce dernier
            if (this.usagerALier) {
              correctionFicheAppelWrapper.ficheAppel.usager = this.usagerALier;
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
    this.ficheAppel = new FicheAppelSocialDTO();
    this.ficheAppelCorrection = new FicheAppelCorrectionDTO();
    this.idUsagerIdent = null;
    this.usagerInitial = null;
    this.usagerALier = null;
    this.listeOrientationsLength = 0;
    this.listeReferencesLength = 0;

    if (idFicheAppel) {
      this.subscriptions.add(
        this.ficheAppelService.getFicheAppel(idFicheAppel).subscribe(
          (result: FicheAppelSocialDTO) => {
            this.ficheAppel = result;
            this.ficheAppelInitial = { ...result };
            this.usagerInitial = { ...this.ficheAppel.usager };
            const usagerHisto: boolean = this.ficheAppel.statut == StatutFicheAppelEnum.FERME;
            this.chargerSectionUsager(this.ficheAppel.usager, usagerHisto);
            this.chargerSectionSuitesIntervention();
            this.chargerSectionResumeIntervention();
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

  private chargerSectionResumeIntervention(): void {
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

  private chargerListeDangerSuicide(): void {
    this.subscriptions.add(
      this.referenceService.getListeDangerSuicide().subscribe((result: ReferenceDangerSuicideDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeDangerSuicide.push({
              code: item.code,
              nom: item.nom,
              codeCouleur: item.codeCouleur,
              description: item.description
            });
          });
        };
      })
    );
  }

  private chargerListeHomicide(): void {
    this.subscriptions.add(
      this.referenceService.getListeRisqueHomicide().subscribe((result: ReferenceRisqueHomicideDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeRisqueHomicide.push({
              code: item.code,
              nom: item.nom,
              codeCouleur: item.codeCouleur,
              description: item.description
            });
          })
        };
      })
    );
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

  private chargerListeReferencesRaisonIntervention(): void {
    this.subscriptions.add(
      this.referenceService.getListeRaisonAppel().subscribe(
        (results: ReferenceDTO[]) => {
          this.listeReferencesRaisonIntervention = results;
        }
      )
    );
  }

  private griserLesElements(): void {
    this.btnModifierUsagerDisabled = false;
    this.accueilDisabled = false;
    this.analyseSituationDisabled = false;
    this.estimationDangerSuicideDisabled = false;
    this.estimationRisqueHomicideDisabled = false;
    this.difficultePrioriseeDisabled = false;
    this.objectifDisabled = false;
    this.moyenModaliteDisabled = false;
    this.opinionProfessionelleDisabled = false;
    this.raisonInterventionDisabled = false;

    if (EnumTypeFicheAppel.ABREG == this.ficheAppel.codeReferenceTypeFiche
      || EnumTypeFicheAppel.NONPERT == this.ficheAppel.codeReferenceTypeFiche) {
      this.estimationDangerSuicideDisabled = true;
      this.estimationRisqueHomicideDisabled = true;
      this.difficultePrioriseeDisabled = true;
      this.opinionProfessionelleDisabled = true;
    }
    if (EnumTypeFicheAppel.NONPERT == this.ficheAppel.codeReferenceTypeFiche) {
      this.btnModifierUsagerDisabled = true;
      this.accueilDisabled = true;
      this.analyseSituationDisabled = true;
      this.objectifDisabled = true;
      this.moyenModaliteDisabled = true;
      this.raisonInterventionDisabled = true;
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
                    this.showAlertMessage("so-iu-e00010");
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
          let ficheAppelSocialDto: FicheAppelSocialDTO = new FicheAppelSocialDTO();
          ficheAppelSocialDto.id = this.ficheAppel.id;
          this.usagerALier.ficheAppel = ficheAppelSocialDto;
          this.chargerSectionUsager(this.usagerALier);
        })
    );
  }

  private isFormVide(): boolean {
    return !this.ficheAppel ||
      (!this.ficheAppelCorrection?.raisonCorrection
        && !this.usagerALier
        && this.ficheAppelInitial
        && this.ficheAppelInitial.accueil == this.ficheAppel.accueil
        && this.ficheAppelInitial.analyseSituation == this.ficheAppel.analyseSituation
        && this.ficheAppelInitial.codeReferenceDangerSuicide == this.ficheAppel.codeReferenceDangerSuicide
        && this.ficheAppelInitial.codeReferenceRisqueHomicide == this.ficheAppel.codeReferenceRisqueHomicide
        && this.ficheAppelInitial.estimationSuicide == this.ficheAppel.estimationSuicide
        && this.ficheAppelInitial.estimationHomicide == this.ficheAppel.estimationHomicide
        && this.ficheAppelInitial.difficultePriorisee == this.ficheAppel.difficultePriorisee
        && this.ficheAppelInitial.objectif == this.ficheAppel.objectif
        && this.ficheAppelInitial.intervention == this.ficheAppel.intervention
        && this.ficheAppelInitial.aucuneSuite == this.ficheAppel.aucuneSuite
        && this.ficheAppelInitial.opinionProf == this.ficheAppel.opinionProf
        && this.orientation.isFormVide()
        && this.reference.isFormVide()
        && this.resumeIntervention.isFormVide()
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

  private getRaisonsIntervention(): RaisonAppelDTO[] {
    if (!this.resumeIntervention._references) {
      return null;
    }
    let results: RaisonAppelDTO[] = [];
    this.resumeIntervention._references.forEach(item => {
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

  private validerErreurs(wrapper: CorrectionFicheAppelWrapperDTO): boolean {
    let errors: string[] = [];
    if (wrapper.erreurs) {
      errors = Object.keys(wrapper.erreurs).map(key => (wrapper.erreurs[key]));
    }
    const doublonOrientations: ItemSuitesIntervention[] = this.orientation.getDoublons();
    if (doublonOrientations) {
      const title: string = this.translateService.instant(this.orientation.titreReferenceSuitesIntervention);
      doublonOrientations.forEach(item => {
        errors.push(this.translateService.instant("ss-iu-e30004", { 0: title, 1: item.nomReferenceSuitesIntervention }));
      });
    }
    const doublonRaisonIntervention: ReferenceDTO[] = this.resumeIntervention.getDoublons();
    if (doublonRaisonIntervention) {
      const title: string = this.translateService.instant(this.resumeIntervention.titreReference);
      doublonRaisonIntervention.forEach(item => {
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
      return false;
    }
    return true;
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

}
