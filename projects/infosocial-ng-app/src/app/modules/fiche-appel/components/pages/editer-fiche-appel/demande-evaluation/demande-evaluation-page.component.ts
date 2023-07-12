import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConsultationAnterieureDTO, EnumUrlPageFicheAppelSocial, FicheAppelSocialDTO, MedicationSocialDTO, ReferenceDangerSuicideDTO, ReferenceDTO, ReferenceRisqueHomicideDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { EnumTypeFicheAppel } from 'projects/infosocial-ng-core/src/lib/models/type-fiche-appel-enum';
import { ConsultationAnterieureService, FicheAppelApiService, MedicationSocialService, ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { AppelApiService } from 'projects/infosocial-ng-core/src/lib/services/appel-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { boutonCouleurItem } from 'projects/sigct-ui-ng-lib/src/lib/components/bouton-radio-couleur/bouton-radio-couleur-interface';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { InputTextAreaComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-textarea/input-textarea.component';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { forkJoin, iif, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { FicheAppelDataService } from '../../../../../../../../../infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { ConsultationsAnterieuresComponent } from '../../../../components/ui/consultations-anterieures/consultations-anterieures.component';
import { ReferenceRessConsultDTO } from '../../../../models/reference-ress-consult-dto';
import { TypeFicheInterventionEnum } from '../../../layouts/editer-fiche-appel/editer-fiche-appel-layout.component';
import { MedicationActuelleComponent } from '../../../ui/medication-actuelle/medication-actuelle.component';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';
import { AfterViewChecked,ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'demande-evaluation-page',
  templateUrl: './demande-evaluation-page.component.html',
  styleUrls: ['./demande-evaluation-page.component.css'],
  providers: [DatePipe]
})
export class DemandeEvaluationPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  @ViewChild('PremierElem', { static: true }) private textareaAccueil: InputTextAreaComponent;

  //Variables et objets pour la liste des medications
  @ViewChild('consultationAnterieure', { static: true }) private appConsultationAnterieure: ConsultationsAnterieuresComponent;

  public listeConsultationAnterieure: Array<ConsultationAnterieureDTO> = new Array<ConsultationAnterieureDTO>();

  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppelSocial.DEMANDE_EVALUATION;

  ficheAppelSocialDto = new FicheAppelSocialDTO();

  dateDebutFicheAppel: Date = null;
  heureDebutFicheAppel: string = null;
  dateFinFicheAppel: Date = null;
  heureFinFicheAppel: string = null;

  demain: string;
  isSaisieDifferee: boolean = false;
  isTypeInterventionNonPertinente: boolean = false;
  mandatoryFields = ["analyseSituationContentZone", "label_dangerSuicide", "accueilDemandeAnalyse"];
  private abonnementTypeFicheIntervention: Subscription;
  private abonnementFiche: Subscription;
  private abonnementSaveUpdate: Subscription;
  private abonnementDangerSuicide: Subscription;
  private abonnementRisqueHomicide: Subscription;
  private abonnementListeMedication: Subscription;
  private abonnementMedication: Subscription;
  private abonnementRessConsult: Subscription;
  private abonnementConsultationAnterieure: Subscription;

  private labelSauvegardeReussi: string;
  private valeurLibelleSelectionnez: string;
  private labelErreur: string;

  public enabledControlMap = new Map();

  //Variables et objets pour la liste des medications
  @ViewChild('medication', { static: true }) private appMedication: MedicationActuelleComponent;

  public listeMedications: Array<MedicationSocialDTO> = new Array<MedicationSocialDTO>();

  public inputOptionConsentementFichesAnterieures: InputOptionCollection = {
    name: "consentementFichesAnterieures",
    options: []
  };
  consentementFichesAnterieuresClicked: boolean;

  private estimationSuicideDefault;
  private estimationHomicideDefault;

  consultationAnterieureSaisi = new ConsultationAnterieureDTO();

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private referencesService: ReferencesApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private medicationSocialService: MedicationSocialService,
    private consultationAnterieureService: ConsultationAnterieureService,
    private typeFicheSelectioneService: TypeficheSelectioneService,
    public appelApiService: AppelApiService,
    private cdr: ChangeDetectorRef) {
    super(ficheAppelDataService);
  }


  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();


 
    this.subscriptions.add(
      this.translateService.get(["ss-iu-c00002", "girpi.label.selectionnez", "girpi.error.label"]).subscribe((messages: string[]) => {
        this.labelSauvegardeReussi = messages["ss-iu-c00002"];
        this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];
        this.labelErreur = messages["girpi.error.label"];
      })
    );


    //on récupère les valeurs par défaut risque suicide et homicide.
    this.ficheAppelApiService.getValeurDefaultReisques().subscribe((data) => {
      this.estimationSuicideDefault = data.risqueSuicide;
      this.estimationHomicideDefault = data.risqueHomicide;
      this.saveDonnes(false);
    });

    this.demain = DateUtils.getDateToAAAAMMJJ(new Date());

    //Initialiser les domaines de valeurs
    this.initDomainesValeurs();

    this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
    this.initSectionsFlecheBleu();

  }

  ngOnDestroy() {
    super.ngOnDestroy();

    //Vider les alertes déjà présents
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    if (this.abonnementFiche) { this.abonnementFiche.unsubscribe(); }
    if (this.abonnementTypeFicheIntervention) { this.abonnementTypeFicheIntervention.unsubscribe(); }
    if (this.abonnementSaveUpdate) { this.abonnementSaveUpdate.unsubscribe(); }
    if (this.abonnementDangerSuicide) { this.abonnementDangerSuicide.unsubscribe(); }
    if (this.abonnementRisqueHomicide) { this.abonnementRisqueHomicide.unsubscribe(); }
    if (this.abonnementRessConsult) { this.abonnementRessConsult.unsubscribe(); }
    if (this.abonnementConsultationAnterieure) { this.abonnementConsultationAnterieure.unsubscribe(); }

  }
  /**
   * Lorsque le bouton Annuler est cliqué et que l'utilisateur a confirmer l'annulation
   */
  onAnnuler(): void {

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    let idFicheAppel: number = this.ficheAppelDataService.getIdFicheAppelActive();
    this.chargerDonnees(idFicheAppel);
    this.initSectionsFlecheBleu();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.OUVERT == this.ficheAppelSocialDto?.statut) {
      this.ficheAppelApiService.autoSaveFicheAppel(this.getFicheAppelDto(), this.pageApiUpdateEndPoint);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   *
   * Ne pas oublier d'ajouter ceci >canDeactivate: [AutoSaveGuardService]< dans fiche-appel-routing.module.ts pour que cette
   * méthode soit appelée
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    // Parce que la fiche peut avoir été fermé dans un autre onglet du navigateur, 
    // on récupère le statut de la fiche en BD.
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelSocialDto.id).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.saveDonnes(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelSocialDto.idAppel, "fiche", this.ficheAppelSocialDto.id, "consultation"])))
      )
    );
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    //Vider les alertes déjà présents
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }
    this.chargerDonnees(idFicheAppel);
    this.initSectionsFlecheBleu();

  }

  /**
   *  Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appMedication.resetChampsValides();
    this.appConsultationAnterieure.resetChampsValides();
    if (this.abonnementSaveUpdate) { this.abonnementSaveUpdate.unsubscribe(); }
    this.abonnementSaveUpdate = this.saveDonnes(true).subscribe();
  }

  onBlurHeureDebutFicheAppel(): void {
    if (this.heureDebutFicheAppel) {
      this.heureDebutFicheAppel = this.heureDebutFicheAppel.padStart(4, "0");

      if (!DateUtils.validerHHMM(this.heureDebutFicheAppel)) {
        this.heureDebutFicheAppel = "";
      }
    }
  }

  onBlurHeureFinFicheAppel(): void {
    if (this.heureFinFicheAppel) {
      this.heureFinFicheAppel = this.heureFinFicheAppel.padStart(4, "0");

      if (!DateUtils.validerHHMM(this.heureFinFicheAppel)) {
        this.heureFinFicheAppel = "";
      }
    }
  }

  //Méthode pour lire les données
  private chargerDonnees(id: number): void {
    this.subscriptions.add(
      forkJoin([
        this.referencesService.getListeTypeFicheIntervention(),
        this.ficheAppelApiService.getFicheAppel(id)
      ]).subscribe(results => {
        const refTypesFiche: ReferenceDTO[] = results[0] as ReferenceDTO[];
        this.inputOptionsTypeFicheIntervention.options = [];
        if (refTypesFiche) {
          refTypesFiche.forEach(item => {
            this.inputOptionsTypeFicheIntervention.options.push({ label: item.nom, value: item.code, description: item.description });
          })
        }
        console.log()
        const fiche: FicheAppelSocialDTO = results[1] as FicheAppelSocialDTO;
        if (fiche) {
          this.setFicheAppelDto(fiche);
          this.textareaAccueil.focus();

          if (!this.ficheAppelSocialDto.codeReferenceTypeFiche) {
            this.ficheAppelSocialDto.codeReferenceTypeFiche = TypeFicheInterventionEnum.DETAIL;
          }
          this.inputOptionConsentementFichesAnterieures.options = [{
            label: null,
            value: "" + fiche.usager?.consentementFichesAnterieures,
            labelBeforeLink: "sigct.so.f_appel.analyse.consentement_1",
            link: "sigct.so.f_appel.analyse.consentement_2",
            labelAfterLink: 'sigct.so.f_appel.analyse.consentement_3',
          }];
          this.majListeMedications(fiche.id);
          this.majListeConsultationsAnterieures(fiche.id);
        }
        if (this.ficheAppelSocialDto.codeReferenceTypeFiche === "DETAIL") {
          this.mandatoryFields = ["analyseSituationDemandeAnalyse","label_risqueHomicide", "label_dangerSuicide", "accueilDemandeAnalyse"];
        } else if (this.ficheAppelSocialDto.codeReferenceTypeFiche === "ABREG") {
          this.mandatoryFields = ["accueilDemandeAnalyse"];
        }else {
          this.mandatoryFields = []; // Reset the mandatoryFields if no matching value
        }
      })
    );
  }

  //Alimente la liste des médications au chargement.
  majListeMedications(idFicheAppel: number): void {

    if (this.abonnementListeMedication) { this.abonnementListeMedication.unsubscribe(); }
    this.abonnementListeMedication = this.medicationSocialService.getListeMedication(idFicheAppel).subscribe((medications: MedicationSocialDTO[]) => {
      this.listeMedications = medications;
    }

    );
  }

  majListeConsultationsAnterieures(idFicheAppel: number): void {

    if (this.abonnementConsultationAnterieure) { this.abonnementConsultationAnterieure.unsubscribe(); }
    this.abonnementConsultationAnterieure = this.consultationAnterieureService.getListeConsultationAnterieure(idFicheAppel).subscribe(
      (consultations: ConsultationAnterieureDTO[]) => {
        this.listeConsultationAnterieure = consultations;
      }

    );
  }

  public inputOptionsTypeFicheIntervention: InputOptionCollection = {
    name: "typeFicheIntervention",
    options: []
  };

  public inputOptionsRaisonTypeIntervention: InputOptionCollection = {
    name: "raisonTypeIntervention",
    options: []
  };

  public listeDangerSuicide: Array<boutonCouleurItem> = new Array<boutonCouleurItem>();

  public listeRisqueHomicide: Array<boutonCouleurItem> = new Array<boutonCouleurItem>();

  public listeRefRessConsult: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  //Charger les données de bases nécessaire à l'écran
  private initDomainesValeurs(): void {

    // Alimente la liste des raisons intervention non pertinente.
    this.inputOptionsRaisonTypeIntervention.options = [{ label: 'Sélectionnez...', value: "" }];
    this.subscriptions.add(
      this.referencesService.getListeRaisonTypeIntervention().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsRaisonTypeIntervention.options.push({ label: item.nom, value: item.code, description: item.description });
          })
        };
      })
    );





    // Alimente la liste des dangers suicide
    if (this.abonnementDangerSuicide == null) {
      this.abonnementDangerSuicide = this.referencesService.getListeDangerSuicide().subscribe((result: ReferenceDangerSuicideDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeDangerSuicide.push({ code: item.code, nom: item.nom, codeCouleur: item.codeCouleur, description: item.description });
          })
        };
      });
    }

    // Alimente la liste des risques homicide
    if (this.abonnementRisqueHomicide == null) {
      this.abonnementRisqueHomicide = this.referencesService.getListeRisqueHomicide().subscribe((result: ReferenceRisqueHomicideDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeRisqueHomicide.push({ code: item.code, nom: item.nom, codeCouleur: item.codeCouleur, description: item.description });
          })
        };
      });
    }


    //Charger les références de ressouce consulté pour consultation antérieure
    if (this.abonnementRessConsult) { this.abonnementRessConsult.unsubscribe(); }
    this.abonnementRessConsult = this.referencesService.getListeRessourceConsulte().subscribe(
      (refRessConsult: ReferenceRessConsultDTO[]) => {
        this.listeRefRessConsult = refRessConsult;
      }
    );

  }

  //Sauvegarder les données
  saveDonnes(avecAlerte: boolean): Observable<boolean> {

    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.FERME == this.ficheAppelSocialDto?.statut) {
      this.afficherErreur(this.translateService.instant("ss-sv-e00001"));
      return of(true);
    }
    //Vider les alertes déjà présents
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    if (avecAlerte) {
      this.validationFormulaireVide();
    }

    if (this.ficheAppelSocialDto.id != undefined) {
      return this.ficheAppelApiService.updateFicheAppel(this.getFicheAppelDto(), this.pageApiUpdateEndPoint).pipe(map((fiche: FicheAppelSocialDTO) => {

        //Il n'y a pas d'alert quand c'est auto-save
        if (avecAlerte) {
          if (fiche) {
            this.setFicheAppelDto(fiche);

            this.afficheMessageValidationFinales(fiche.validationsFinales);
            this.afficheMessageAvertissements(fiche.avertissements);
          }

          this.afficherMessageSauvegardeReussie();
        }

        return true;
      }));
    }

  }

  /**
   * Pour chaque formulaire présent dans la section on vérifie s'il est vide
   * Si ce n'est pas le cas on affiche un message d'avertissement
   */
  private validationFormulaireVide() {

    let medicationVide: boolean = this.appMedication.isChampVide();
    let consultationAnterieureVide: boolean = this.appConsultationAnterieure.isChampVide();

    let messages: string[] = [];

    if (!medicationVide) {
      const titre = this.translateService.instant("sigct.so.f_appel.analyse.medactuelle")
      const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
      messages.push(msg);
    }

    if (!consultationAnterieureVide) {
      const titre = this.translateService.instant("sigct.so.f_appel.analyse.consulant")
      const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
      messages.push(msg);
    }

    if (messages.length > 0) {
      this.afficherMessages(messages, "Avertissement", AlertType.WARNING);
    }

  }
  /**
   * Affiche le message de confirmation de sauvegarde
   */
  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("ss.msg.succes.confirmation");
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    alertM.messages = msg;

    this.alertStore.addAlert(alertM);
    this.bindingErrorsStore.setState({});
  }

  /**
   * Afficher les messages du backend a l'ecran
   * @param validationsFinales
   */
  private afficheMessageValidationFinales(validationsFinales: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelValidationFinales(validationsFinales, "Validation finale");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  /**
   * Afficher les messages du backend a l'ecran
   * @param avertissements
   */
  private afficheMessageAvertissements(avertissements: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelAvertissements(avertissements, "Avertissements");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  // Enregistre dans la BD la saisie de l'utilisateur
  public onConsultationAnterieureSave(consultationAnterieure: ConsultationAnterieureDTO): void {
    if (this.alertStore) {
      this.alertStore.resetAlert();
    }

    consultationAnterieure.idFicheAppel = this.ficheAppelSocialDto.id;
    if (consultationAnterieure.id == null) {

      if (this.abonnementConsultationAnterieure) { this.abonnementConsultationAnterieure.unsubscribe(); }
      this.abonnementConsultationAnterieure = this.consultationAnterieureService.ajouterConsultationAnterieure(consultationAnterieure.idFicheAppel, consultationAnterieure).subscribe(() => {
        this.majListeConsultationsAnterieures(consultationAnterieure.idFicheAppel);
        this.appConsultationAnterieure.reinitialiserChamp();
      }, (err) => {
      });
    } else {

      if (this.abonnementConsultationAnterieure) { this.abonnementConsultationAnterieure.unsubscribe(); }
      this.abonnementConsultationAnterieure = this.consultationAnterieureService.modifierConsultationAnterieure(consultationAnterieure.idFicheAppel, consultationAnterieure).subscribe(() => {
        this.majListeConsultationsAnterieures(consultationAnterieure.idFicheAppel);
        this.appConsultationAnterieure.reinitialiserChamp();
      }, (err) => {
      }
      );

    }

  }

  // Supprime dans la BD la saisie de l'utilisateur
  public onConsultationAnterieureDelete(consultationAnterieure: ConsultationAnterieureDTO): void {
    if (this.abonnementConsultationAnterieure) { this.abonnementConsultationAnterieure.unsubscribe(); }
    this.abonnementConsultationAnterieure = this.consultationAnterieureService.supprimerConsultationAnterieure(this.ficheAppelSocialDto.id, +consultationAnterieure.id).subscribe(res => {
      //Met à jour la liste dans la vue.
      this.majListeConsultationsAnterieures(this.ficheAppelSocialDto.id);
    }, (err) => {
      this.afficherErreur(err.toString());
    });
  }


  //Enregistre une médication dans la liste des médications
  onMedicationSave(medication: MedicationSocialDTO): void {
    if (this.alertStore) {
      this.alertStore.resetAlert();
    }

    medication.idFicheAppel = this.ficheAppelSocialDto.id;
    if (medication.id == null) {

      if (this.abonnementMedication) { this.abonnementMedication.unsubscribe(); }
      this.abonnementMedication = this.medicationSocialService.ajouterMedication(medication.idFicheAppel, medication).subscribe(() => {
        this.majListeMedications(medication.idFicheAppel);
        this.appMedication.reinitialiserChamp();
      }, (err) => {
        this.appMedication.setValideChampMedication(false);
      });
    } else {

      if (this.abonnementMedication) { this.abonnementMedication.unsubscribe(); }
      this.abonnementMedication = this.medicationSocialService.modifierMedication(medication.idFicheAppel, medication).subscribe(() => {
        this.majListeMedications(medication.idFicheAppel);
        this.appMedication.reinitialiserChamp();
      }, (err) => {
        this.appMedication.setValideChampMedication(false);
      }
      );

    }


  }

  //Supprime une médication de la liste.
  onMedicationDelete(medication: MedicationSocialDTO): void {

    if (this.abonnementMedication) { this.abonnementMedication.unsubscribe(); }
    this.abonnementMedication = this.medicationSocialService.supprimerMedication(this.ficheAppelSocialDto.id, +medication.id).subscribe(res => {
      //Met à jour la liste dans la vue.
      this.majListeMedications(this.ficheAppelSocialDto.id);
    }, (err) => {
      this.afficherErreur(err.toString());
    });


  }

  /**
 * Méthode pour afficher un message d'erreur du service.
 * @param err
 */
  private afficherErreur(err: any) {
    let messages: string[] = [];
    const msg = err;
    messages.push(msg);

    const alertM: AlertModel = new AlertModel();
    alertM.title = this.labelErreur;
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    this.alertStore.addAlert(alertM);
  }

  /**
   * Affiche
   * @param messages contient le(s) message(s) à afficher
   * @param titre Titre du bloc erreur
   * @param erreurType Type de message
   */
  private afficherMessages(messages: string[], titre: string, erreurType: AlertType) {

    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;

    this.alertStore.addAlert(alertM);
  }

  /**
   * Cette méthode permet d'initialiser tous les champs de tous les composants que l'on nomme "flèche bleu"
   */
  private initSectionsFlecheBleu(): void {
    this.appMedication.reinitialiserChamp();
    this.appConsultationAnterieure.reinitialiserChamp();
  }

  get displayConsentementFichesAnterieures(): boolean {
    const display: number = this.ficheAppelSocialDto?.usager?.id;
    return display != undefined && display != null;
  }

  onConsentementFicheAnterieuresClickEvent(_: InputOption): void {
    this.consentementFichesAnterieuresClicked = true;
  }

  onPopupConsentementFichesAnterieuresCloseEvent(): void {
    this.consentementFichesAnterieuresClicked = false;
  }

  /**
   * Retourne le FicheAppelDTO en traitement en prenant soin d'y insérer les dates debut/fin saisies.
   * @returns
   */
  private getFicheAppelDto(): FicheAppelSocialDTO {
    if (this.ficheAppelSocialDto) {
      this.ficheAppelSocialDto.dateDebut = DateUtils.updateDateTimeInString(this.dateDebutFicheAppel, this.heureDebutFicheAppel);
      this.ficheAppelSocialDto.dateFin = DateUtils.updateDateTimeInString(this.dateFinFicheAppel, this.heureFinFicheAppel);
    }
    return this.ficheAppelSocialDto;
  }

  /**
   * Détermine le FicheappelDTO en édition.
   * @param dto
   */
  private setFicheAppelDto(dto: FicheAppelSocialDTO): void {
    this.ficheAppelSocialDto = dto;

    this.isSaisieDifferee = dto.saisieDifferee;
    // Indique s'il s'agit d'une intervention de type Non pertinente. Permet d'activer/désactiver la raison.
    this.isTypeInterventionNonPertinente = dto?.codeReferenceTypeFiche == EnumTypeFicheAppel.NONPERT;

    if (this.ficheAppelSocialDto?.dateDebut) {
      const yyyy: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateDebut, 'yyyy');
      const mm: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateDebut, 'MM');
      const dd: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateDebut, 'dd');
      this.dateDebutFicheAppel = new Date(yyyy, mm - 1, dd);
      this.heureDebutFicheAppel = this.datePipe.transform(this.ficheAppelSocialDto.dateDebut, 'HHmm');
    } else {
      this.dateDebutFicheAppel = null;
      this.heureDebutFicheAppel = null;
    }

    if (this.ficheAppelSocialDto?.dateFin) {
      const yyyy: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateFin, 'yyyy');
      const mm: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateFin, 'MM');
      const dd: number = +this.datePipe.transform(this.ficheAppelSocialDto.dateFin, 'dd');
      this.dateFinFicheAppel = new Date(yyyy, mm - 1, dd);
      this.heureFinFicheAppel = this.datePipe.transform(this.ficheAppelSocialDto.dateFin, 'HHmm');
    } else {
      this.dateFinFicheAppel = null;
      this.heureFinFicheAppel = null;
    }

  }

  onTypeFicheSelected(inputOption: InputOption):void {
    this.typeFicheSelectioneService.byPassConfirmation = false;
    const selectedValue = inputOption.value;
      // Update the mandatoryFields based on the selected value
      if (selectedValue === "DETAIL") {
        this.mandatoryFields = ["analyseSituationDemandeAnalyse","label_risqueHomicide", "label_dangerSuicide", "accueilDemandeAnalyse"];
      } else if (selectedValue === "ABREG") {
        this.mandatoryFields = ["accueilDemandeAnalyse"];
      }else {
        this.mandatoryFields = []; // Reset the mandatoryFields if no matching value
      }
  }
  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  onChangmentTypeCencel(code: string) {
    this.ficheAppelSocialDto.codeReferenceTypeFiche = code;
  }

  onChangmentTypeConfirme(service: TypeficheSelectioneService) {
    this.ficheAppelSocialDto = this.getFicheAppelDto();

    if (service.isDetail()) {
      this.ficheAppelSocialDto.estimationSuicide = this.estimationSuicideDefault;
      this.ficheAppelSocialDto.estimationHomicide = this.estimationHomicideDefault;
    }

    if (this.ficheAppelSocialDto.id != undefined) {
      this.ficheAppelApiService
        .updateFicheAppel(this.ficheAppelSocialDto, null)
        .subscribe(fiche => {
          this.ficheAppelSocialDto = fiche
          if (service.isAbreg() || service.isNomPert()) {
            this.listeMedications = new Array();
            this.listeConsultationAnterieure = new Array();
            this.ficheAppelSocialDto.codeReferenceDangerSuicide = null;
            this.ficheAppelSocialDto.codeReferenceRisqueHomicide = null;
            this.ficheAppelSocialDto.codeReferenceCategorieAppelant = null;
          }
          if (service.isNomPert()) {
            this.ficheAppelSocialDto.aucuneSuite = true;
            this.ficheAppelSocialDto.usager = null;
            /**Rafraichir la liste des fiches d'appel afin d'actualiser l'affichage de l'usager */
            this.ficheAppelDataService.doRefreshListeFicheAppel();
          }
          if (service.isDetail) {
            this.ficheAppelSocialDto.codeReferenceCategorieAppelant = null;
          }
        });
    }

    if (this.ficheAppelSocialDto.codeReferenceTypeFiche == EnumTypeFicheAppel.NONPERT) {
      this.isTypeInterventionNonPertinente = true;
    }else {
      this.isTypeInterventionNonPertinente = false;
      this.ficheAppelSocialDto.referenceRaisonTypeInterventionCode = null;
      this.ficheAppelSocialDto.referenceRaisonTypeInterventionNom = null;
    }

  }

  get displayRaisonTypeIntervention(): boolean {
    if (this.ficheAppelSocialDto && this.ficheAppelSocialDto.codeReferenceTypeFiche == EnumTypeFicheAppel.NONPERT) {
      return true;
    }
    this.ficheAppelSocialDto.referenceRaisonTypeInterventionCode = null;
    this.ficheAppelSocialDto.referenceRaisonTypeInterventionNom = null;
    return false;
  }

}
