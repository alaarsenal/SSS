import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { ReferenceDTO } from 'projects/infosante-ng-core/src/lib/models/reference-dto';
import { EnumTypeFicheAppel } from 'projects/infosante-ng-core/src/lib/models/type-fiche-appel-enum';
import { EnumUrlPageFicheAppel } from 'projects/infosante-ng-core/src/lib/models/url-page-fiche-appel-enum';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';
import { EnumCkEditorConfigOption } from 'projects/sigct-ui-ng-lib/src/lib/model/ckeditor-config-option-enum';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Observable, Subscription, forkJoin, from, iif, of } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { AntecedentDTO } from '../../../../models/antecedent-dto';
import { ChampsDatesCommunesDTO } from '../../../../models/commun-dto';
import { DemarcheAnterieuresDTO } from '../../../../models/demarche-anterieures-dto';
import { DemarcheTraitementDTO } from '../../../../models/demarche-traitement-dto';
import { ManifestationDTO } from '../../../../models/manifestation-dto';
import { MedicationDTO } from '../../../../models/medication-dto';
import { SigneDTO } from '../../../../models/signe-dto';
import { AntecedentService } from '../../../../services/antecedent.service';
import { DemarcheAutosoinService } from '../../../../services/demarche-autosoin.service';
import { DemarcheTraitementService } from '../../../../services/demarche-traitement.service';
import { ManifesationService } from '../../../../services/manifesation.service';
import { MedicationService } from '../../../../services/medication.service';
import { SigneService } from '../../../../services/signe-api.service';
import { DemarcheTraitementComponent } from '../../../ui/demarche-traitement/demarche-traitement.component';
import { DemarchesAnterieuresComponent } from '../../../ui/demarches-anterieures/demarches-anterieures.component';
import { SignesVitauxComponent } from '../../../ui/signes-vitaux/signes-vitaux.component';
import { AntecedentsPertinentsComponent, ManifestationsComponent, MedicationActuelleComponent } from '../../../uis';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'demande-evaluation-page',
  templateUrl: './demande-evaluation-page.component.html',
  styleUrls: ['./demande-evaluation-page.component.css']
})
export class DemandeEvaluationPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {
  ficheAppel = new FicheAppelDTO();
  private abonnementFiche: Subscription;
  private abonnementNiveau: Subscription;
  private abonnementTypeConsul: Subscription;
  private abonnementReseau: Subscription;
  private abonnementSave: Subscription;

  //Variables et objets pour la liste des antécédents
  public listeAntecedents: Array<AntecedentDTO> = new Array<AntecedentDTO>();
  @ViewChild('antecedent', { static: true }) private appAntecedent: AntecedentsPertinentsComponent;

  //Fin des variables d'antécédents

  //Variables et Objets pour la liste des manifestations
  public listeManifestations: Array<ManifestationDTO> = new Array<ManifestationDTO>();
  abonnementManifestations: Subscription;

  @ViewChild('manifestation', { static: true }) private appManifestation: ManifestationsComponent;
  abonnementListeManifestations: Subscription;
  //Fin des vriables pour Manifestation

  //Objets commun
  subscription: Subscription = new Subscription();
  heureValidee: boolean = false; //Tant que l'heure n'a pas 4 chiffres
  champsCommun: ChampsDatesCommunesDTO = new ChampsDatesCommunesDTO();
  isDateHeureValide: boolean = true;

  //Variables et objets pour la liste des medications
  @ViewChild('medication', { static: true }) private appMedication: MedicationActuelleComponent;
  public listeMedications: Array<MedicationDTO> = new Array<MedicationDTO>();

  public listeLabelPertinenceMedication: Array<string> = new Array<string>();

  //Fin des variables de médications

  //Variables et objets pour Demarche Antérieur : traitement

  @ViewChild('demarchetraitement', { static: true }) private appDemarcheTraitement: DemarcheTraitementComponent;
  public listeDemarcheTraitements: Array<DemarcheTraitementDTO> = new Array<DemarcheTraitementDTO>();

  //Fin des variables et objets pour Demarche Antérieur : Traitement

  //Variables et objets pour Signes vitaux
  @ViewChild('signesVitaux', { static: true }) private appSignesVitaux: SignesVitauxComponent;
  public listeSignesVitaux: Array<SigneDTO> = new Array<SigneDTO>();
  //Fin des variables et objets pourSignes vitaux

  //Variables et objets pour Demarche Antérieur : traitement

  @ViewChild('demarcheanterieures', { static: true }) private appDemarcheAnterieures: DemarchesAnterieuresComponent;
  public listeDemarcheAnterieures: Array<DemarcheAnterieuresDTO> = new Array<DemarcheAnterieuresDTO>();

  //Fin des variables et objets pour Demarche Antérieur : Traitement

  @ViewChild('PremierElem', { read: ElementRef, static: true }) private radioUrgence: ElementRef;
  @ViewChild('hrcom', { static: false }) private heureElem: InputTextComponent;
  @ViewChild('dtcom', { static: false }) private dateElem: SigctDatepickerComponent;

  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppel.DEMANDE_EVALUATION;

  consentementFichesAnterieuresClicked: boolean;

  ckEditorConfigOptions: EnumCkEditorConfigOption[] = [
    EnumCkEditorConfigOption.BOLD,
    EnumCkEditorConfigOption.ITALIC,
    EnumCkEditorConfigOption.UNDERLINE,
    EnumCkEditorConfigOption.FONT_COLOR,
  ];

  heightChampDonneePertinente: string = "89";

  mandatoryFields = ["antecedents-pertinents", "medication-actuelle", "accueilDemandeAnalyse"];
  constructor(
    private router: Router,
    private referencesService: ReferencesApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private antecedentService: AntecedentService,
    private manifestationService: ManifesationService,
    private medicationService: MedicationService,
    private demarcheTraitementService: DemarcheTraitementService,
    private signeService: SigneService,
    private demarcheAnterieuresService: DemarcheAutosoinService,
    private translateService: TranslateService,
    private typeFicheSelectioneService: TypeficheSelectioneService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();
    //Initialiser les domaines de valeurs
    this.initDomainesValeurs();
    this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //    console.log("autoSaveBeforeUnload");
    const ficheAppelToSave = this.getFicheAppelToSave();
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (ficheAppelToSave.statut == StatutFicheAppelEnum.OUVERT) {
      this.ficheAppelApiService.autoSaveFicheAppel(ficheAppelToSave, this.pageApiUpdateEndPoint);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    //    console.log("autoSaveBeforeRoute");
    this.alertStore.resetAlert();

    // Parce que la fiche peut avoir été fermé dans un autre onglet du navigateur,
    // on récupère le statut de la fiche en BD.
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive()).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.saveDonnes(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", this.ficheAppelDataService.getIdFicheAppelActive(), "consultation"])))
      )
    );
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    this.alertStore.setState([]);
    let idFicheAppel: number = this.ficheAppelDataService.getIdFicheAppelActive();
    this.chargerDonnees(idFicheAppel);
    this.champsCommun = new ChampsDatesCommunesDTO();
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.chargerDonnees(idFicheAppel);

    // Vides les champs communs Date, Heure, Détails
    this.viderChampCommun();
  }

  private updateMandatoryFields(typeFiche: string):void {
    if (typeFiche=== "DETAIL") {
      this.mandatoryFields = ["radioNiveauUrgence","antecedents-pertinents","medication-actuelle", "constat-evaluation", "accueilDemandeAnalyse"];
    } else if (typeFiche=== "ABREG") {
      this.mandatoryFields = ["radioNiveauUrgence",];
    }
    else if (typeFiche=== "NONPERT") {
      this.mandatoryFields = [];
    }
    else if (typeFiche=== "DEMRESS") {
      this.mandatoryFields = ["radioNiveauUrgence",];
    }
    else if (typeFiche=== "MTCP") {
      this.mandatoryFields = ["constat-evaluation","radioNiveauUrgence"];
    }else {
      this.mandatoryFields = []; // Reset the mandatoryFields if no matching value
    }
  }

  /**
   *  Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appAntecedent.resetChampsValides();
    this.appMedication.resetChampsValides();
    this.appManifestation.resetChampsValides();
    this.appSignesVitaux.resetChampsValides();
    this.appDemarcheTraitement.resetChampsValides();
    this.appDemarcheAnterieures.resetChampsValides();
    this.saveDonnes(true).subscribe();
  }

  //Méthode pour lire les données
  private chargerDonnees(idFicheAppel: number): void {
    this.subscriptions.add(
      forkJoin([
        this.referencesService.getListeTypeConsultation(),
        this.ficheAppelApiService.getFicheAppel(idFicheAppel)
      ]).subscribe(results => {
        const refTypesFiche: ReferenceDTO[] = results[0] as ReferenceDTO[];
        this.inputOptionsTypeFicheAppel.options = [];
        if (refTypesFiche) {
          refTypesFiche.forEach(item => {
            this.inputOptionsTypeFicheAppel.options.push({ label: item.nom, value: item.code });
          })
        }
        const fiche: FicheAppelDTO = results[1] as FicheAppelDTO;
        if (fiche) {
          this.ficheAppel = fiche;
          this.inputOptionConsentementFichesAnterieures.options = [
            {
              label: null,
              value: "" + fiche.usager?.consentementFichesAnterieures,
              labelBeforeLink: "sigct.sa.f_appel.evaluation.consentement_1",
              link: "sigct.sa.f_appel.evaluation.consentement_2",
              labelAfterLink: 'sigct.sa.f_appel.evaluation.consentement_3',
            }
          ]
          this.radioUrgence.nativeElement.lastChild.firstElementChild.focus();
          //Extrait la liste des antécédents pour la fiche d'appel courante
          this.majListeAntecedents(idFicheAppel);
          //Extrait la liste des manisfestations pour la fiche d'appel courante
          this.majListeManifestations(idFicheAppel);
          //Extrait la liste des médications pour la fiche d'appel courante
          this.majListeMedications(idFicheAppel);
          //Extrait la liste des démarches antérieurs de traitement
          this.majListeDemarcheTraitements(idFicheAppel);
          //Extrait la liste des signes vitaux
          this.majListeSignesVitaux(idFicheAppel);
          //Extrait la liste des démarches antérieurs de traitement Autosoins
          this.majListeDemarcheAnterieures(idFicheAppel);
          this.updateMandatoryFields(this.ficheAppel.typeConsultation);

        }
      })
    );
    this.champsCommun.endDate = new Date();
  }



  //Conteneur pour la liste de valeurs
  public inputOptionsNiveauxUrgence: InputOptionCollection = {
    name: "niveauxUrgence",
    options: []
  };
  public inputOptionsTypeFicheAppel: InputOptionCollection = {
    name: "typeFicheAppel",
    options: []
  };
  public inputOptionsRaisonTypeFiche: InputOptionCollection = {
    name: "raisonTypeFiche",
    options: []
  };
  public inputOptionsReseauSoutien: InputOptionCollection = {
    name: "reseauSoutien",
    options: []
  };
  public inputOptionConsentementFichesAnterieures: InputOptionCollection = {
    name: "consentementFichesAnterieures",
    options: []
  };

  afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("ss.msg.succes.confirmation");
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    alertM.messages = msg;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }

    this.bindingErrorsStore.setState({});
  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  creerErreur(err: any) {
    let messages: string[] = [];
    const msg = err;
    messages.push(msg);

    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("girpi.error.label");
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }
  }


  //Charger les données de bases nécessaire à l'écran
  initDomainesValeurs(): void {
    // Alimente la liste des raisons fiche non pertinente.
    this.inputOptionsRaisonTypeFiche.options = [{ label: 'Sélectionnez...', value: "" }];
    this.subscriptions.add(
      this.referencesService.getListeRaisonTypeFiche().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsRaisonTypeFiche.options.push({ label: item.nom, value: item.code, description: item.description });
          })
        };
      })
    );
    // Alimente la liste des niveaux d'urgence.
    if (this.abonnementNiveau == null) {
      this.abonnementNiveau = this.referencesService.getListeNiveauUrgence().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            let infoBulleText = item.nom;
            if (item.description) {
              infoBulleText = item.description;
            }
            this.inputOptionsNiveauxUrgence.options.push({ label: item.nom, value: item.code, description: infoBulleText });
          })
        };
      });
    }
    // Alimente la liste des réseaux de soutien
    if (this.abonnementReseau == null) {
      this.abonnementReseau = this.referencesService.getListeReseauSoutien().subscribe((result: ReferenceDTO[]) => {
        this.inputOptionsReseauSoutien.options.push({ label: 'Sélectionnez...', value: "" });
        if (result) {
          result.forEach(item => {
            this.inputOptionsReseauSoutien.options.push({ label: item.nom, value: item.code });
          })
        };
      });
    }

  }

  /**
   * Sauvegarder les données. Si avecAlerte est false, les validations ne sont pas effectuées et
   * aucun message n'est affiché (autoSave).
   * @param avecAlerte indique si les validations et les messages sont affichés.
   */
  saveDonnes(avecAlerte: boolean): Observable<boolean> {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    if (avecAlerte) {
      //Vérifier si les formulaire des sections sont vides.
      let antecedentNonVide: boolean = this.appAntecedent.isAntecedentNonVide();
      let manifestationNonVide: boolean = !this.appManifestation.isManifestationVide();
      let medicationNonVide: boolean = this.appMedication.isMedicationNonVide();
      let demarcheTraitementNonVide: boolean = !this.appDemarcheTraitement.isDemarcheTraitementVide();
      let demarcheAutosoinsNonVide: boolean = !this.appDemarcheAnterieures.isDemarcheAnterieuresVide();
      const signesVitauxNonVide: boolean = !this.appSignesVitaux.isFormulaireVide(null);

      let messages: string[] = [];

      if (antecedentNonVide
        || manifestationNonVide
        || medicationNonVide
        || demarcheTraitementNonVide
        || demarcheAutosoinsNonVide
        || signesVitauxNonVide) {

        if (antecedentNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.anteperti");
          const msg: string = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        if (medicationNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.mediactl")
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        if (manifestationNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.titremanifestations");
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        if (demarcheTraitementNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.dmrchtrait");
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        if (demarcheAutosoinsNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.dmrchantautosoins");
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        if (signesVitauxNonVide) {
          const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.titresection");
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
        }

        this.creerErreurs(messages, "Avertissement", AlertType.WARNING);

        messages = []; //vider les messages

      }

      /**
       * Quand toutes les boutons radios sont désactivés, cela signifie qu'il y a au moins
       * un objet avec présence.  Avec un 'ou' on détermine la section à ajouter
       * au message d'avertissement.
       */
      // if (!this.appAntecedent.getValidationFinale() || !this.appMedication.getValidationFinale()) {

      //   //Cette section est utilisée pour ajouter les messages de validation finales.  Elles
      //   //sont toutes rassemblé au même endroit pour ne faire qu'un seul message.
      //   //Le premier if sert à entrer dans la méthode pour généré un message et
      //   //le deuxième sert à afficher le message comme tel.
      //   if (!this.appAntecedent.getValidationFinale()) {
      //     const msg: string = this.translateService.instant("sa-iu-e50000");
      //     messages.push(msg);
      //   }

      //   if (!this.appMedication.getValidationFinale()) {
      //     const msg: string = this.translateService.instant("sa-iu-e30002");
      //     messages.push(msg);
      //   }

      //   this.creerErreurs(messages, "Validation finale", AlertType.WARNING);

      //   messages = []; //vider les messages

      // }
    }

    const ficheAppelToSave = this.getFicheAppelToSave();

    return this.ficheAppelApiService.updateFicheAppel(ficheAppelToSave, this.pageApiUpdateEndPoint).pipe(map((fiche) => {
      if (avecAlerte) {
        this.afficherMessageSauvegardeReussie();
        if (fiche) {
          this.afficheMessageValidationFinales(fiche.validationsFinales);
          this.afficheMessageAvertissements(fiche.avertissements);
        }
      }
      return true;
    }));
  }

  private afficheMessageValidationFinales(validationsFinales: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelValidationFinales(validationsFinales, "Validation finale");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private afficheMessageAvertissements(avertissements: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelAvertissements(avertissements, "Avertissements");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private getFicheAppelToSave(): FicheAppelDTO {
    //Obtiens la pertinence dans le composant antécédent
    this.ficheAppel.antecedent = this.appAntecedent.getPertinence();

    //Obtient la pertinence dans le composant médication
    this.ficheAppel.medication = this.appMedication.getPertinence();

    return this.ficheAppel;
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (this.abonnementFiche) { this.abonnementFiche.unsubscribe(); }
    if (this.abonnementNiveau) { this.abonnementNiveau.unsubscribe(); }
    if (this.abonnementTypeConsul) { this.abonnementTypeConsul.unsubscribe(); }
    if (this.abonnementReseau) { this.abonnementReseau.unsubscribe(); }
    if (this.abonnementSave) { this.abonnementSave.unsubscribe(); }


    //Pour manifestation
    if (this.abonnementManifestations) { this.abonnementManifestations.unsubscribe(); }
    if (this.abonnementListeManifestations) { this.abonnementListeManifestations.unsubscribe(); }
    if (this.subscription) { this.subscription.unsubscribe(); }

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

  }


  //Enregistre un antécédent dans la liste des antécédents
  onAntecedentSave(antecedent: AntecedentDTO): void {
    antecedent.idFicheAppel = this.ficheAppel.id;

    if (antecedent.id == null) {

      this.abonnementSave = this.antecedentService.ajouterAntecedent(antecedent.idFicheAppel, antecedent).subscribe(() => {
        this.majListeAntecedents(antecedent.idFicheAppel);
      }, (err) => {
        let messages: string[];
        messages.push(JSON.stringify(err));
        this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
      });
    } else {

      this.abonnementSave = this.antecedentService.modifierAntecedent(antecedent.idFicheAppel, antecedent).subscribe(() => {
        this.majListeAntecedents(antecedent.idFicheAppel);
      }, (err) => {
        this.creerErreur(err.toString());
      }
      );

    }

  }

  //Supprime un antécédent de la liste.
  onAntecedentDelete(antecedent: AntecedentDTO): void {

    this.abonnementSave = this.antecedentService.supprimerAntecedent(this.ficheAppel.id, +antecedent.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeAntecedents(this.ficheAppel.id);
    }, (err) => {
      this.creerErreur(err.toString());
    });


  }


  //Alimente la liste des manifestations
  majListeManifestations(idFicheAppel: number) {

    this.subscription.add(
      this.manifestationService.getListeManifestation(idFicheAppel).subscribe((manifestations: ManifestationDTO[]) => {
        this.listeManifestations = manifestations;
      })
    );


  }


  //Alimente la liste des médications au chargement.
  majListeAntecedents(idFicheAppel: number): void {

    this.subscription.add(
      this.antecedentService.getListeAntecedent(idFicheAppel).subscribe((antecedents: AntecedentDTO[]) => {
        this.listeAntecedents = antecedents;
      })

    );
  }

  //Alimente la liste des démarches antérieures : traitement au chargement.
  majListeDemarcheTraitements(idFicheAppel: number): void {

    this.subscription.add(
      this.demarcheTraitementService.getListeDemarcheTraitement(idFicheAppel).subscribe((demarcheTraitements: DemarcheTraitementDTO[]) => {
        this.listeDemarcheTraitements = demarcheTraitements;
      })

    );
  }

  //Alimente la liste des signes vitaux : traitement au chargement.
  majListeSignesVitaux(idFicheAppel: number): void {
    this.subscription.add(
      this.signeService.getListeSigne(idFicheAppel).subscribe((signes: SigneDTO[]) => {
        this.listeSignesVitaux = signes;
      })
    );
  }

  //Alimente la liste des démarches antérieures : Autosoins au chargement.
  majListeDemarcheAnterieures(idFicheAppel: number): void {

    this.subscription.add(
      this.demarcheAnterieuresService.getListeDemarcheAnterieures(idFicheAppel).subscribe((demarcheTraitements: DemarcheAnterieuresDTO[]) => {
        this.listeDemarcheAnterieures = demarcheTraitements;
      })

    );
  }

  //Alimente la liste des médications au chargement.
  majListeMedications(idFicheAppel: number): void {

    this.subscription.add(
      this.medicationService.getListeMedication(idFicheAppel).subscribe((medications: MedicationDTO[]) => {
        this.listeMedications = medications;
      })

    );
  }

  //Enregistre une médication dans la liste des médications
  onMedicationSave(medication: MedicationDTO): void {
    medication.idFicheAppel = this.ficheAppel.id;
    if (medication.id == null) {

      this.abonnementSave = this.medicationService.ajouterMedication(medication.idFicheAppel, medication).subscribe(() => {
        this.majListeMedications(medication.idFicheAppel);
      }, (err) => {
        let messages: string[];
        messages.push(JSON.stringify(err));
        this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
      });
    } else {

      this.abonnementSave = this.medicationService.modifierMedication(medication.idFicheAppel, medication).subscribe(() => {
        this.majListeMedications(medication.idFicheAppel);
      }, (err) => {
        this.creerErreur(err.toString());
      }
      );

    }

  }

  isEmpty(str) {
    return (!str || 0 === str.length);
  }

  /**
   * Sauvegarde une manifestation.
   * @param manifestation
   */
  onManifestationSave(manifestation: ManifestationDTO): void {
    this.subscription.add(
      this.saveManifestation(manifestation).subscribe()
    );
  }

  /**
   * Sauvegarde une liste de manifestations.
   * @param manifestations
   */
  onListeManifestationSave(manifestations: ManifestationDTO[]): void {
    if (CollectionUtils.isNotBlank(manifestations)) {
      this.subscription.add(
        from(manifestations).pipe(concatMap((manifestation: ManifestationDTO) =>
          this.saveManifestation(manifestation)
        )).subscribe()
      );
    }
  }

  private saveManifestation(manifestation: ManifestationDTO): Observable<void> {
    this.alertStore.resetAlert();

    manifestation.idFicheAppel = this.ficheAppel.id;

    manifestation.detailDemandeEvaluation = this.champsCommun.detailsCommun;

    if (manifestation.valid && !this.isEmpty(this.champsCommun.dateCommune)) {

      if (this.heureValidee || this.isEmpty(this.champsCommun.heureCommune)) {

        let dtHeure = this.getDateHeureCommune();
        if (dtHeure != undefined && dtHeure != null) {
          manifestation.dateDemandeEvaluation = '' + dtHeure.getTime();
          manifestation.heures = this.champsCommun.heureCommune;
        } else {
          manifestation.valid = false;
          this.appManifestation.manifestation.valid = false;
          this.isValide();
        }


      } else {
        this.champsCommun.heureCommune = null;
        manifestation.heures = null;
      }


    } else {
      //Formlaire invalide;
      //Comme le formulaire enfant ne sait pas si la date ou l'heure sont valide
      //Il faut le détecter pour mettre le champ heure en erreur.

      if (!this.isHeureValide()) {
        this.isDateHeureValide = false;
        manifestation.heures = null;
        this.isValide();
      } else {

        manifestation.heures = null;

      }

      if (this.isEmpty(this.champsCommun.dateCommune) && (!this.isEmpty(this.champsCommun.heureCommune))) {
        const msg = this.translateService.instant("sa-iu-e00016");
        this.creerErreurs([msg], this.translateService.instant("girpi.error.label"), AlertType.ERROR);

        manifestation.valid = false;
        this.appManifestation.manifestation.valid = false;
        this.isValide();
      }

    }

    if (manifestation.valid) {

      if (manifestation.id == null) {

        return this.manifestationService.ajouterManifestation(this.ficheAppel.id, manifestation).pipe(
          map(() => {
            this.majListeManifestations(manifestation.idFicheAppel);
            this.appManifestation.reinitialiserManifestation();
            this.appManifestation.manifestation.valid = true;
            this.appManifestation.manifestation.id = null;
            this.heureElem.valide = true;
            return;
          }, (err) => {
            let messages: string[];
            messages.push(JSON.stringify(err));
            this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);
          })
        );

      } else {

        return this.manifestationService.modifierManifestation(this.ficheAppel.id, manifestation).pipe(
          map(() => {
            this.majListeManifestations(manifestation.idFicheAppel);
            this.appManifestation.reinitialiserManifestation();
            this.appManifestation.manifestation.valid = true;
            this.appManifestation.manifestation.id = null;
            this.heureElem.valide = true;
            return;
          }, (err) => {
            let messages: string[];
            messages.push(JSON.stringify(err));
            this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);
          })
        );
      }
    }
    return of(void 0);
  }

  //Supprime un Manifestation de la liste.
  onManifestationDelete(manifestation: ManifestationDTO): void {

    this.abonnementSave = this.manifestationService.supprimerManifestation(this.ficheAppel.id, +manifestation.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeManifestations(this.ficheAppel.id);
    }, (err) => {
      let messages: string[];
      messages.push(JSON.stringify(err));
      this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
    });

    this.appManifestation.reinitialiserManifestation();

  }

  onSigneSave(signeDto: SigneDTO): void {
    this.heureElem.valide = true;
    this.onChangeChampCommun();
    if (signeDto) {
      signeDto.ficheAppelId = this.ficheAppel.id;
      this.subscription.add(
        this.signeService.save(signeDto).subscribe(() => {
          this.majListeSignesVitaux(this.ficheAppel.id);
        })
      );
    } else if (this.champsCommun && this.champsCommun.heureCommune && !this.champsCommun.dateCommune) {
      this.heureElem.valide = false;
    }
  }

  /**
   * Supprime un signe vital de la liste.
   * @param idSigne identifiant du signe à supprimer
   */
  onSigneDelete(idSigne: number): void {
    this.subscription.add(
      this.signeService.supprimerSigne(this.ficheAppel.id, idSigne).subscribe(() => {
        // Met à jour la liste dans la vue.
        this.majListeSignesVitaux(this.ficheAppel.id);
      }, (err) => {
        let messages: string[];
        messages.push(JSON.stringify(err));
        this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
      })
    );
  }


  /**
   * Met à jour la date, l'heure et le détail d'une restauration de
   */
  onModifierManifestationDateHeuresDetail(manifestation: ManifestationDTO) {

    if (manifestation.execution === 'manif' || manifestation.execution === 'valid') {

      if (manifestation.execution === 'manif') {
        this.majHeures(manifestation.dateDemandeEvaluation,
          manifestation.heures, manifestation.detailDemandeEvaluation);
      }
      if (manifestation.execution === 'valid') { this.isValide(); }


      this.appManifestation.manifestation.execution = null;

    } else {

      let egaleDate: boolean = false;
      if (this.isEmpty(this.champsCommun.dateCommune) == false) {
        let dt = this.champsCommun.dateCommune.getTime().toString();
        try {
          egaleDate = dt == manifestation.dateDemandeEvaluation.toString();
        } catch (e) {
          egaleDate = false;
        }


      }

      if (!this.appManifestation.isIdentique(manifestation) || this.isDifferentHoraDateDetail(egaleDate, manifestation)) {
        let isIdentiqueManif = this.appManifestation.isIdentique(manifestation);
        let titre: string;
        if (!isIdentiqueManif) {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.titremanifestations');
        } else {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.horadate');
        }
        let messageConfirmerManifestations = this.translateService.instant('ss-iu-a30004', { 0: titre });
        this.appManifestation.openModalWithCustomisedMsgbyId("confirm_popup_modif_man", messageConfirmerManifestations, "ok_confirm_button_man");
      } else {
        this.appManifestation.remplacerManifestation();
      }

    }
  }

  private isDifferentHoraDateDetail(egaleDate: boolean, manifestation: ManifestationDTO): boolean {
    return (this.isEmpty(this.champsCommun.dateCommune) == false && !egaleDate) ||
      (this.isEmpty(this.champsCommun.heureCommune) == false && this.champsCommun.heureCommune != manifestation.heures) ||
      (this.isEmpty(this.champsCommun.detailsCommun) == false && this.champsCommun.detailsCommun != manifestation.detailDemandeEvaluation);
  }

  onModifierSigneDateHeuresDetail(champsDatesCommunesDto: ChampsDatesCommunesDTO) {
    this.champsCommun.dateCommune = champsDatesCommunesDto?.dateCommune;
    this.champsCommun.heureCommune = champsDatesCommunesDto?.heureCommune;
    this.champsCommun.detailsCommun = champsDatesCommunesDto?.detailsCommun;
  }

  onErreurDateHeuresDetail() {
    this.isValide();
  }

  majHeures(dateDemandeEvaluation: string, heures: string, detailDemandeEvaluation: string) {

    if (dateDemandeEvaluation != undefined) {

      let dtCommune = new Date(Number(dateDemandeEvaluation));

      this.champsCommun.dateCommune = dtCommune;
      this.champsCommun.endDate = new Date();

      // let hr: number = dtCommune.getHours();
      // let mi: number = dtCommune.getMinutes();

      // //Pour éviter les problèmes de transformation on recontruit l'heure
      // //sinon il peut y avoir des différences du aux timezones.
      // let hh: string = '';
      // if (hr < 10) {
      //   hh += '0' + hr.toString();
      // } else {
      //   hh += hr.toString();
      // }
      // hh += ':';
      // if (mi < 10) {
      //   hh += '0' + mi;
      // } else {
      //   hh += mi;
      // }

      this.champsCommun.heureCommune = heures;

      this.champsCommun.dateCommune = dtCommune;



    } else {
      this.champsCommun.dateCommune = undefined;
      this.champsCommun.heureCommune = undefined;
    }

    this.champsCommun.detailsCommun = detailDemandeEvaluation;

    this.isValide();

  }



  /**
   *  Valide si la date et l'heure sont valide sur un changement d'heure ou de date.
   */
  onDateCommuneChange() {

    let dateETHeureValides: boolean = true;
    if (!this.isDateCommuneValide()) {
      this.champsCommun.dateCommune = null;
      dateETHeureValides = false;
    }

    //Pour notifier isValide que l'heure et la date sont valide
    if (dateETHeureValides) {
      this.isDateHeureValide = true;
    }
    this.onChangeChampCommun();
  }

  onHeureCommuneChange() {

    let dateETHeureValides: boolean = true;
    if (!this.isDateCommuneValide()) {
      this.champsCommun.dateCommune = null;
      dateETHeureValides = false;
    }

    if (!this.isHeureValide() && this.heureValidee) {
      this.champsCommun.heureCommune = null;
      dateETHeureValides = false;
    } else {
      let dtHeure = this.getDateHeureCommune();
      if (dtHeure) {
        this.champsCommun.dateCommune = dtHeure;
      }

    }

    //Pour notifier isValide que l'heure et la date sont valide
    if (dateETHeureValides) {
      this.isDateHeureValide = true;
    }
  }


  /**
   * Valide si la date est plus grande que la date du jour, on l'annule.
   */
  isDateCommuneValide(): boolean {

    if (this.champsCommun.dateCommune != undefined && this.champsCommun.dateCommune != null) {

      const aujourdhui: Date = new Date();

      if (aujourdhui <= this.champsCommun.dateCommune) {
        return false;
      }

    }

    return true;

  }

  /**
   * Valide si l'heure ne dépasse pas les limites normales
   */
  isHeureValide(): boolean {

    if (this.champsCommun.heureCommune != undefined) {

      this.heureValidee = true;
      if (this.champsCommun.heureCommune.length >= 2) {

        let heure: number = Number(this.champsCommun.heureCommune.substr(0, 2));
        if (heure < 0 || heure > 23) {
          return false;
        }


      }

      if (this.champsCommun.heureCommune.length == 3) {

        let minute: number = Number(this.champsCommun.heureCommune.substr(2, 1)) * 10;
        if (minute < 0 || minute > 59) {
          return false;
        }

      }

      if (this.champsCommun.heureCommune.length == 4) {

        let minute: number = Number(this.champsCommun.heureCommune.substr(2, 2));
        if (minute < 0 || minute > 59) {
          return false;
        }


      }

    }

    return true;
  }

  /**
   * Quand l'usager quitte le champ avec seulement 3 caractères, on ajoute un zéro pour compléter une heure valide.
   */
  onBlur() {
    if (this.champsCommun.heureCommune.length == 3) {

      let minute: number = Number(this.champsCommun.heureCommune.substr(2, 1)) * 10;
      if (minute >= 0 || minute <= 59) {
        this.champsCommun.heureCommune += '0';
      }

    }

    if (this.champsCommun.heureCommune.length == 2) {

      let minute: number = Number(this.champsCommun.heureCommune.substr(1, 1));
      if (minute >= 0 || minute <= 12) {
        this.champsCommun.heureCommune += '00';
      }

    }

    if (this.champsCommun.heureCommune.length == 1) {

      let minute: number = Number(this.champsCommun.heureCommune.substr(0, 1));
      if (minute >= 0 || minute <= 9) {
        this.champsCommun.heureCommune = '0' + this.champsCommun.heureCommune + '00';
      } else {
        this.champsCommun.heureCommune = null;
        setTimeout(() => { this.heureElem.focus(); }, 500);
      }

    }
    this.onChangeChampCommun();
  }

  onChangeChampCommun(): void {
    this.appSignesVitaux.onChangeChampCommun(this.champsCommun);
  }

  /**
   * Obtient la date réelle avec l'heure du formulaire.
   */
  getDateHeureCommune(): any {
    let dtHeure: Date = null;
    if (this.champsCommun.dateCommune != undefined) {
      if (this.champsCommun.heureCommune !== undefined
        && this.champsCommun.heureCommune !== null
        && this.champsCommun.heureCommune !== "") {

        if (this.champsCommun.heureCommune.length == 4) {


          dtHeure = new Date(this.champsCommun.dateCommune.getFullYear(),
            this.champsCommun.dateCommune.getMonth(),
            this.champsCommun.dateCommune.getDate(),
            Number(this.champsCommun.heureCommune.substr(0, 2)),
            Number(this.champsCommun.heureCommune.substr(2, 2)));

        }

      } else {
        dtHeure = new Date(this.champsCommun.dateCommune.getFullYear(),
          this.champsCommun.dateCommune.getMonth(),
          this.champsCommun.dateCommune.getDate());

      }

    }

    return dtHeure;
  }

  isValide() {

    if (this.isEmpty(this.champsCommun.dateCommune) && !this.isEmpty(this.champsCommun.heureCommune)) {

      this.heureElem.valide = false;

    } else {
      this.heureElem.valide = true;
      this.dateElem.valide = true;
    }
  }


  //Messages d'erreurs de validation
  creerErreurs(messages: string[], titre: string, erreurType: AlertType) {

    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }
  }

  //Supprime une médication de la liste.
  onMedicationDelete(medication: MedicationDTO): void {

    this.abonnementSave = this.medicationService.supprimerMedication(this.ficheAppel.id, +medication.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeMedications(this.ficheAppel.id);
    }, (err) => {
      this.creerErreur(err.toString());
    });


  }

  /**
   *  Met à jour la valeur de la pertinence d'antécédent.
   * @param idPertinence Identifiant de la pertinence
   */
  onPertinenceAntecedentSave(idPertinence: number) {

    this.ficheAppel.antecedent = idPertinence;

    this.abonnementSave = this.ficheAppelApiService.updateFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint).subscribe(() => {
    });
  }

  /**
   *  Met à jour la valeur de la pertinence de la médication.
   * @param idPertinence Identifiant de la pertinence
   */
  onPertinenceMedicationSave(idPertinence: number) {

    this.ficheAppel.medication = idPertinence;

    this.abonnementSave = this.ficheAppelApiService.updateFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint).subscribe(() => {
    });
  }

  /**
   * Permet de se déplacer dans la page sans faire de soumission en cas d'erreur ou de succès.
   * @param anchor
   */
  // private naviguerSection(anchor: string): void {
  //   const element = document.querySelector("#" + anchor);
  //   if (element) { element.scrollIntoView(true); }
  // }


  /**
   * Enregistre dans la BD une démarche antérieure de transfert.
   * @param dem Objet de transfert d'une démarche antérieures de traitement
   */
  onDemarcheTraitementSave(dem: DemarcheTraitementDTO) {

    let message: string[] = [];

    dem.idFicheAppel = this.ficheAppel.id;

    dem.detailDemandeEvaluation = this.champsCommun.detailsCommun;

    if (dem.valid && !this.isEmpty(this.champsCommun.dateCommune)) {

      if (this.heureValidee || this.isEmpty(this.champsCommun.heureCommune)) {

        let dtHeure = this.getDateHeureCommune();
        if (dtHeure != undefined && dtHeure != null) {
          dem.dateDemandeEvaluation = new Date(dtHeure.getTime());
          dem.heures = this.champsCommun.heureCommune;
        } else {
          this.appDemarcheTraitement.demarcheTraitement.valid = false;
          this.isValide();
        }


      } else {
        this.champsCommun.heureCommune = null;
        dem.heures = null;
      }


    } else {
      //Formlaire invalide;
      //Comme le formulaire enfant ne sait pas si la date ou l'heure sont valide
      //Il faut le détecter pour mettre le champ heure en erreur.

      if (!this.isHeureValide()) {
        this.isDateHeureValide = false;
        dem.heures = null;
        this.isValide();
      } else {

        dem.heures = null;

      }

      if (this.isEmpty(this.champsCommun.dateCommune) && (!this.isEmpty(this.champsCommun.heureCommune))) {
        const msg = this.translateService.instant("sa-iu-e00016");
        message.push(msg);
        this.creerErreurs(message, this.translateService.instant("girpi.error.label"), AlertType.ERROR);

        this.appDemarcheTraitement.demarcheTraitement.valid = false;
        this.isValide();
      }

    }

    if (this.appDemarcheTraitement.demarcheTraitement.valid) {

      if (this.appDemarcheTraitement.demarcheTraitement.id == null) {

        this.abonnementSave = this.demarcheTraitementService.ajouterDemarcheTraitement(this.ficheAppel.id, dem).subscribe(() => {
          this.majListeDemarcheTraitements(dem.idFicheAppel);
          this.appDemarcheTraitement.reinitialiserDemarcheTraitement();
          this.appDemarcheTraitement.demarcheTraitement.valid = true;
          this.appDemarcheTraitement.demarcheTraitement.id = null;
          this.heureElem.valide = true;
        }, (err) => {

          let messages: string[];
          messages.push(JSON.stringify(err));
          this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);

        });

      } else {

        this.abonnementSave = this.demarcheTraitementService.modifierDemarcheTraitement(this.ficheAppel.id, dem).subscribe(() => {
          this.majListeDemarcheTraitements(dem.idFicheAppel);
          this.appDemarcheTraitement.reinitialiserDemarcheTraitement();
          this.appDemarcheTraitement.demarcheTraitement.valid = true;
          this.appDemarcheTraitement.demarcheTraitement.id = null;
          this.heureElem.valide = true;
        }, (err) => {

          let messages: string[];

          messages.push(JSON.stringify(err));
          this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);
        }
        );


      }


    }


  }


  /**
   * Exécute l'événement de suppression d'une demarche antérieure de traitement
   * @param dem object de transfert d'un Demarche antérieure de traitement
   */
  onDemarcheTraitementDelete(dem: DemarcheTraitementDTO) {

    this.abonnementSave = this.demarcheTraitementService.supprimerDemarcheTraitement(this.ficheAppel.id, +dem.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeDemarcheTraitements(this.ficheAppel.id);

    }, (err) => {
      let messages: string[];
      messages.push(JSON.stringify(err));
      this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
    });

    this.appDemarcheTraitement.reinitialiserDemarcheTraitement();

  }

  /**
   * Met à jour les dates heures deétail pour DemarcheTraitement
   * @param dem Objet de Transfert de type DemarcheTraitementDTO
   */
  onModifierDemarcheTraitementDateHeuresDetail(dem: DemarcheTraitementDTO) {

    if (dem.execution === 'demarcheTraitement' || dem.execution === 'valid') {

      if (dem.execution === 'demarcheTraitement') {

        let dateDem: string = null;
        if (dem.dateDemandeEvaluation) {
          dateDem = dem.dateDemandeEvaluation.toString();
        }
        this.majHeures(dateDem,
          dem.heures, dem.detailDemandeEvaluation);
      }
      if (dem.execution === 'valid') { this.isValide(); }


      this.appDemarcheTraitement.demarcheTraitement.execution = null;

    } else {

      let egaleDate: boolean = false;
      if (this.isEmpty(this.champsCommun.dateCommune) == false && this.isEmpty(dem.dateDemandeEvaluation) == false) {
        let dt = this.champsCommun.dateCommune.getTime().toString();
        try {
          egaleDate = dt.toString() == dem.dateDemandeEvaluation.toString();
        } catch (e) {
          egaleDate = false;
        }
      }
      if (!this.appDemarcheTraitement.isIdentique(dem) || this.isDifferentHoraDateDetailForDemarcheTrait(egaleDate, dem)) {
        let isIdentiqueDemarcheTrait = this.appDemarcheTraitement.isIdentique(dem);
        let titre: string;
        if (!isIdentiqueDemarcheTrait) {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.dmrchtrait');
        } else {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.horadate');
        }
        let messageConfirmerDemarcheTraitements: string = this.translateService.instant('ss-iu-a30004', { 0: titre });
        this.appDemarcheTraitement.openModalWithCustomisedMsgbyId("confirm_popup_modif_dem_trait", messageConfirmerDemarcheTraitements, "ok_confirm_button_dem_trait")
      } else {
        this.appDemarcheTraitement.remplacerDemarcheTraitement();
      }
    }

  }

  private isDifferentHoraDateDetailForDemarcheTrait(egaleDate: boolean, dem: DemarcheTraitementDTO): boolean {
    return (this.isEmpty(this.champsCommun.dateCommune) == false && !egaleDate) ||
      (this.isEmpty(this.champsCommun.heureCommune) == false && this.champsCommun.heureCommune != dem.heures) ||
      (this.isEmpty(this.champsCommun.detailsCommun) == false && this.champsCommun.detailsCommun != dem.detailDemandeEvaluation);
  }

  /**
  * Enregistre dans la BD une démarche antérieure de transfert.
  * @param dem Objet de transfert d'une démarche antérieures de traitement
  */
  onDemarcheAnterieuresSave(dem: DemarcheAnterieuresDTO) {

    let message: string[] = [];

    dem.idFicheAppel = this.ficheAppel.id;

    dem.detailDemandeEvaluation = this.champsCommun.detailsCommun;

    if (dem.valid && !this.isEmpty(this.champsCommun.dateCommune)) {

      if (this.heureValidee || this.isEmpty(this.champsCommun.heureCommune)) {

        let dtHeure = this.getDateHeureCommune();
        if (dtHeure != undefined && dtHeure != null) {
          dem.dateDemandeEvaluation = new Date(dtHeure.getTime());
          dem.heures = this.champsCommun.heureCommune;
        } else {
          this.appDemarcheAnterieures.demarcheAnterieures.valid = false;
          this.isValide();
        }


      } else {
        this.champsCommun.heureCommune = null;
        dem.heures = null;
      }


    } else {
      //Formlaire invalide;
      //Comme le formulaire enfant ne sait pas si la date ou l'heure sont valide
      //Il faut le détecter pour mettre le champ heure en erreur.

      if (!this.isHeureValide()) {
        this.isDateHeureValide = false;
        dem.heures = null;
        this.isValide();
      } else {

        dem.heures = null;

      }

      if (this.isEmpty(this.champsCommun.dateCommune) && (!this.isEmpty(this.champsCommun.heureCommune))) {
        const msg = this.translateService.instant("sa-iu-e00016");
        message.push(msg);
        this.creerErreurs(message, this.translateService.instant("girpi.error.label"), AlertType.ERROR);

        this.appDemarcheAnterieures.demarcheAnterieures.valid = false;
        this.isValide();
      }

    }

    if (this.appDemarcheAnterieures.demarcheAnterieures.valid) {

      if (this.appDemarcheAnterieures.demarcheAnterieures.id == null) {

        this.abonnementSave = this.demarcheAnterieuresService.ajouterDemarcheAnterieures(this.ficheAppel.id, dem).subscribe((dto: DemarcheAnterieuresDTO) => {
          this.majListeDemarcheAnterieures(dem.idFicheAppel);
          this.appDemarcheAnterieures.reinitialiserDemarcheAnterieures();
          this.appDemarcheAnterieures.demarcheAnterieures.valid = true;
          this.appDemarcheAnterieures.demarcheAnterieures.id = null;
          this.heureElem.valide = true;

        }, (err) => {

          let messages: string[];
          messages.push(JSON.stringify(err));
          this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);

        });

      } else {

        this.abonnementSave = this.demarcheAnterieuresService.modifierDemarcheAnterieures(this.ficheAppel.id, dem).subscribe((dto: DemarcheAnterieuresDTO) => {
          this.majListeDemarcheAnterieures(dem.idFicheAppel);
          this.appDemarcheAnterieures.reinitialiserDemarcheAnterieures();
          this.appDemarcheAnterieures.demarcheAnterieures.valid = true;
          this.appDemarcheAnterieures.demarcheAnterieures.id = null;
          this.heureElem.valide = true;

        }, (err) => {

          let messages: string[];

          messages.push(JSON.stringify(err));
          this.creerErreurs(messages, "Erreur d'enregistrement", AlertType.ERROR);
        }
        );


      }


    }


  }


  /**
   * Exécute l'événement de suppression d'une demarche antérieure de Anterieures
   * @param dem object de transfert d'un Demarche antérieure de Anterieures
   */
  onDemarcheAnterieuresDelete(dem: DemarcheAnterieuresDTO) {

    this.abonnementSave = this.demarcheAnterieuresService.supprimerDemarcheAnterieures(this.ficheAppel.id, +dem.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeDemarcheAnterieures(this.ficheAppel.id);

    }, (err) => {
      let messages: string[];
      messages.push(JSON.stringify(err));
      this.creerErreurs(messages, "Erreur de suppression", AlertType.ERROR);
    });

    this.appDemarcheAnterieures.reinitialiserDemarcheAnterieures();

  }

  /**
   * Met à jour les dates heures deétail pour DemarcheAnterieures
   * @param dem Objet de Transfert de type DemarcheAnterieuresDTO
   */
  onModifierDemarcheAnterieuresDateHeuresDetail(dem: DemarcheAnterieuresDTO) {

    if (dem.execution === 'demarcheanterieures' || dem.execution === 'valid') {

      if (dem.execution === 'demarcheanterieures') {

        let dateDem: string = null;
        if (dem.dateDemandeEvaluation) {
          dateDem = dem.dateDemandeEvaluation.toString();
        }
        this.majHeures(dateDem,
          dem.heures, dem.detailDemandeEvaluation);
      }
      if (dem.execution === 'valid') { this.isValide(); }


      this.appDemarcheAnterieures.demarcheAnterieures.execution = null;

    } else {

      let egaleDate: boolean = false;
      if (this.isEmpty(this.champsCommun.dateCommune) == false) {
        let dt = this.champsCommun.dateCommune.getTime().toString();
        try {
          egaleDate = dt == dem.dateDemandeEvaluation.toString();
        } catch (e) {
          egaleDate = false;
        }


      }
      if (!this.appDemarcheAnterieures.isIdentique(dem) || this.isDifferentHoraDateDetailForDemarcheAutosoins(egaleDate, dem)) {
        let isIdentiqueDemarcheAutosoins = this.appDemarcheAnterieures.isIdentique(dem);
        let titre: string;
        if (!isIdentiqueDemarcheAutosoins) {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.dmrchantautosoins');
        } else {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.horadate');
        }
        let messageConfirmerDemarcheAnterieures: string = this.translateService.instant('ss-iu-a30004', { 0: titre });
        this.appDemarcheAnterieures.openModalWithCustomisedMsgbyId("confirm_popup_modif_dem_auto", messageConfirmerDemarcheAnterieures, "ok_confirm_button_dem_auto");
      } else {
        this.appDemarcheAnterieures.remplacerDemarcheAnterieures();
      }
    }
  }

  private isDifferentHoraDateDetailForDemarcheAutosoins(egaleDate: boolean, dem: DemarcheAnterieuresDTO): boolean {
    return (this.isEmpty(this.champsCommun.dateCommune) == false && !egaleDate) ||
      (this.isEmpty(this.champsCommun.heureCommune) == false && this.champsCommun.heureCommune != dem.heures) ||
      (this.isEmpty(this.champsCommun.detailsCommun) == false && this.champsCommun.detailsCommun != dem.detailDemandeEvaluation);
  }

  private afficherErreursDTO(dto: any): boolean {
    if (!dto.listeErreur) return true;
    if (dto.listeErreur.length > 0) {
      let messages: string[] = [];
      for (let i = 0; i < dto.listeErreur.length; i++) {
        const msg = this.translateService.instant(dto.listeErreur[i]);
        messages.push(msg);
        if (dto.listeErreur[i] === "sa-iu-e00016") {
          this.appDemarcheAnterieures.demarcheAnterieures.valid = false;
          this.isValide();
        }
      }


      this.creerErreurs(messages, this.translateService.instant("girpi.error.label"), AlertType.ERROR);

      return false;

    }

    return true;
  }

  private afficherAvertissements(dto: any): boolean {
    if (!dto.avertissements) return true;
    if (dto.avertissements.length > 0) {
      let messages: string[] = [];
      for (let i = 0; i < dto.avertissements.length; i++) {
        const msg = this.translateService.instant(dto.avertissements[i]);
        messages.push(msg);
      }

      this.creerErreurs(messages, 'Avertissement', AlertType.WARNING);

      return false;
    }

    return true;
  }

  get displayRaisonTypeFiche(): boolean {
    if (this.ficheAppel && this.ficheAppel.typeConsultation == EnumTypeFicheAppel.NONPERT) {
      return true;
    }
    this.ficheAppel.referenceRaisonTypeFicheCode = null;
    return false;
  }

  get displayConsentementFichesAnterieures(): boolean {
    const display: number = this.ficheAppel?.usager?.id;
    if (display != undefined && display != null) {
      this.heightChampDonneePertinente = "113";
      return true;
    }
    this.heightChampDonneePertinente = "89";
    return false;
  }

  onConsentementFicheAnterieuresClickEvent(_: InputOption): void {
    this.consentementFichesAnterieuresClicked = true;
  }

  onPopupConsentementFichesAnterieuresCloseEvent(): void {
    this.consentementFichesAnterieuresClicked = false;
  }

  onViderChampCommunClick(): void {
    this.viderChampCommun();

    this.dateElem.focus();
  }

  /**
   * Vides les champs communs Date, Heure et Détails
   */
  private viderChampCommun(): void {
    this.champsCommun.dateCommune = undefined;
    this.champsCommun.heureCommune = undefined;
    this.champsCommun.detailsCommun = undefined;
  }


  onTypeFicheSelected(inputOption: InputOption) {
    this.typeFicheSelectioneService.byPassConfirmation = false;
    this.updateMandatoryFields(inputOption.value);

  }

  onChangmentTypeCencel(code: string) {
    this.ficheAppel.typeConsultation = code;
  }

  onChangmentTypeConfirme(service: TypeficheSelectioneService) {

    var obj = window.document.getElementsByName('typeFicheAppel')[1];
    obj.focus();

    if (this.ficheAppel.id != undefined) {
      this.ficheAppelApiService
        .updateFicheAppel(this.ficheAppel, null)
        .subscribe(fiche => {
          this.ficheAppel = fiche

          if (service.isNomPert() || service.isDemress()) {
            this.listeAntecedents = [];
            this.listeDemarcheAnterieures = [];
            this.listeDemarcheTraitements = [];
            this.listeManifestations = [];
            this.listeMedications = [];
            this.listeSignesVitaux = [];
            this.onViderChampCommunClick();
          }

        });
    }

  }
}

