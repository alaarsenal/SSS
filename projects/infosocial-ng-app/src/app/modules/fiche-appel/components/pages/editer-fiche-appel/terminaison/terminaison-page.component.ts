import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EnumUrlPageFicheAppelSocial, FicheAppelSocialDTO, ReferenceDTO, ValidationFinInterventionDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { FicheAppelApiService, ReferencesApiService, StatistiquesService, ValidationService } from 'projects/infosocial-ng-core/src/lib/services';
import { AppelApiService } from 'projects/infosocial-ng-core/src/lib/services/appel-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { FicheAppelChronoDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-chrono-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { FicheAppelChronoService } from 'projects/sigct-service-ng-lib/src/lib/services/fiche-appel-chrono.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { DureeFicheAppelComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/duree-fiche-appel/duree-fiche-appel/duree-fiche-appel.component';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { ServicesUtilisesDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/services-utilises/services-utilises-dto';
import { ServicesUtilisesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/services-utilises/services-utilises.component';
import { StatistiquesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/statistiques/statistiques.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { GenererAlerteFicheDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerAlerteFicheApiService } from 'projects/usager-ng-core/src/lib/services/usager-alerte-fiche-api.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { EMPTY, Observable, Subscription, forkJoin, iif, of } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { FicheAppelDataService, SectionFicheAppelEnum } from '../../../../../../../../../infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { AppelDTO } from '../../../../models';
import { ValidationFinInterventionComponent } from '../../../ui/validation-fin-intervention/validation-fin-intervention.component';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

// Correspond à la classe java ca.qc.gouv.msss.sigct.infosocial.enums.FicheAppelPage
export enum FicheAppelPageEnum {
  PAGE_DEMANDE_ANALYSE = "PAGE_DEMANDE_ANALYSE",
  PAGE_PLAN_ACTION = "PAGE_PLAN_ACTION",
  PAGE_TERMINAISON = "PAGE_TERMINAISON",
  PAGE_USAGER_APPELANT = "PAGE_USAGER_APPELANT"
}

@Component({
  selector: 'terminaison-page',
  templateUrl: './terminaison-page.component.html',
  styleUrls: ['./terminaison-page.component.css']
})
export class TerminaisonPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  @ViewChild('appValidationFinIntervention', { static: true })
  appValidationFinIntervention: ValidationFinInterventionComponent;

  @ViewChild('appServicesUtilises', { static: true })
  appServicesUtilises: ServicesUtilisesComponent;

  @ViewChild('appStatistiques', { static: true })
  private appStatistiques: StatistiquesComponent;

  @ViewChild('appDureeFicheAppel', { static: true })
  appDureeFicheAppel: DureeFicheAppelComponent;

  public inputOptionsLangue: InputOptionCollection = {
    name: "langues",
    options: []
  };

  public inputOptionsCentreActivite: InputOptionCollection = {
    name: "centres",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionsRaisonAppel: InputOptionCollection = {
    name: "raisons appel",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionsRoleAction: InputOptionCollection = {
    name: "roles action",
    options: []
  };
  mandatoryFields = ["difficultePriorisee", "objectifAatteindre"];
  public isLangueValide: boolean = true;
  public isCentreActiviteValide: boolean = true;

  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppelSocial.TERMINAISON;
  public listeRaisonAppel: Array<RaisonAppelDTO> = new Array<RaisonAppelDTO>();
  public listeRoleAction: Array<RoleActionDTO> = new Array<RoleActionDTO>();


  appelDTO: AppelDTO = new AppelDTO();
  ficheAppel = new FicheAppelSocialDTO();
  referencesValidations: ReferenceDTO[];
  servicesUtilisesDTO: ServicesUtilisesDTO;
  validationFinInterventionDTO = new ValidationFinInterventionDTO();
  valeurLibelleSelectionnez: string;

  dureeFicheAppelDto: DureeFicheAppelDTO = new DureeFicheAppelDTO();
  msgConfirmerDureePopup: string = ""; // Message affiché dans le popup de confirmation

  private existsSexeUsagerLie: boolean = false;

  private subscription: Subscription = new Subscription();
  private abonnementLangue: Subscription;
  private abonnementCentreActivite: Subscription;
  private abonnementRaison: Subscription;
  private abonnementRole: Subscription;

  typeFiche: TypeficheSelectioneService;

  listeReferenceRaison: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  listeReferenceRole: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  constructor(private ficheAppelDataService: FicheAppelDataService,
    private appelApiService: AppelApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelChronoService: FicheAppelChronoService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private usagerService: UsagerService,
    private usagerAlerteFicheApiService: UsagerAlerteFicheApiService,
    private alertStore: AlertStore,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private referenceApiService: ReferencesApiService,
    private validationService: ValidationService,
    private statistiquesService: StatistiquesService,
    private typeFicheService: TypeficheSelectioneService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {

    this.typeFicheService.initAvecFicheActive();
    this.ficheAppel.codeReferenceTypeFiche = this.typeFicheService.codeType;
    this.typeFiche = this.typeFicheService;

    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    // On souscrit au démarrage du chrono.
    this.subscriptions.add(
      this.ficheAppelChronoService.onStartChrono().subscribe((ficheAppelChronoDto: FicheAppelChronoDTO) => {
        // Maj l'affichage du chrono au retour du pause
        this.chargerDureeFicheAppel(ficheAppelChronoDto.idFicheAppel);
      })
    );

    this.subscription.add(
      this.translateService.get(["girpi.label.selectionnez"]).subscribe((messages: string[]) => {
        this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];
      })
    );
    if (this.abonnementRaison == null) {
      this.abonnementRaison = this.referenceApiService.getListeRaisonAppel().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          this.listeReferenceRaison = result;
        };
      });
    }
    if (this.abonnementRole == null) {
      this.abonnementRole = this.referenceApiService.getListeRoleAction().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          this.listeReferenceRole = result;
        };
      });
    }
    this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
  }

  private chargerDonnees(idFicheAppel: number): void {
    this.subscription.add(
      forkJoin([
        this.referenceApiService.getListeLangueAppel(),
        this.referenceApiService.getListeCentreActivite(),
        this.ficheAppelApiService.getFicheAppel(idFicheAppel)
      ]).subscribe(results => {
        if (results[0]) {
          const refLangues: ReferenceDTO[] = results[0] as ReferenceDTO[];
          this.inputOptionsLangue.options = [{ label: this.valeurLibelleSelectionnez, value: null }];
          refLangues.forEach(item => {
            this.inputOptionsLangue.options.push({ label: item.nom, value: item.code, description: item.description });
          });
        }
        if (results[1]) {
          const refCentreAct: ReferenceDTO[] = results[1] as ReferenceDTO[];
          this.inputOptionsCentreActivite.options = [{ label: this.valeurLibelleSelectionnez, value: null }];
          refCentreAct.forEach(item => {
            this.inputOptionsCentreActivite.options.push({ label: item.nom, value: item.code, description: item.description });
          });
        }
        const ficheAppel: FicheAppelSocialDTO = results[2];
        if (ficheAppel) {
          this.ficheAppel = ficheAppel;
          this.typeFicheService.codeType = ficheAppel.codeReferenceTypeFiche;
          this.chargerDonneesValidationFinIntervention(true);
          this.chargerServicesUtilises();
          this.chargerDureeFicheAppel(ficheAppel.id);

          if (ficheAppel.usager?.usagerIdentification?.id) {
            this.subscription.add(
              this.usagerService.existsSexeUsager(ficheAppel.usager.usagerIdentification.id).subscribe((exists: boolean) => {
                this.existsSexeUsagerLie = exists;
              })
            );
          }
        }
      })
    );

    this.majListeRaisonAppel(idFicheAppel);
    this.majListeRoleAction(idFicheAppel)

    this.chargerAppel(this.ficheAppelDataService.getIdAppel());
  }

  private chargerAppel(idAppel: number): void {
    this.subscription.add(
      this.appelApiService.obtenirAppel(idAppel).subscribe(appel => {
        if (appel) {
          this.appelDTO = appel;
        }
      })
    );
  }

  private chargerDonneesValidationFinIntervention(init: boolean): void {
    if (init) {
      forkJoin([
        this.referenceApiService.getListeValidation(),
        this.validationService.findAllByIdFicheAppel(this.ficheAppel.id)
      ]).subscribe(results => {
        this.referencesValidations = results[0] as ReferenceDTO[];
        this.validationFinInterventionDTO = this.createValidationFinIntervention(results[1]);
      })
    } else {
      this.validationService.findAllByIdFicheAppel(this.ficheAppel.id)
        .subscribe(results => {
          this.validationFinInterventionDTO = this.createValidationFinIntervention(results);
        })
    }
  }

  private chargerServicesUtilises(): void {
    this.servicesUtilisesDTO = {
      servicesInterprete: this.ficheAppel.servicesInterprete ? this.ficheAppel.servicesInterprete.toString() : "0",
      servicesRelaisBell: this.ficheAppel.servicesRelaisBell ? this.ficheAppel.servicesRelaisBell.toString() : "0",
      detailsInterprete: this.ficheAppel.detailsInterprete,
      detailsRelaisBell: this.ficheAppel.detailsRelaisBell
    }
  }

  /**
   * Alimente le DTO lié au composant DureeFicheAppelComponent. 
   * Récupère la somme des durées chronométrées de la fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  private chargerDureeFicheAppel(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.subscriptions.add(
        this.ficheAppelApiService.getSommeDureesFichesAppel(idFicheAppel).subscribe((sommeDurees: number) => {
          this.dureeFicheAppelDto = new DureeFicheAppelDTO();
          this.dureeFicheAppelDto.dateDebut = this.ficheAppel.dateDebut;
          this.dureeFicheAppelDto.dateFin = this.ficheAppel.dateFin;
          this.dureeFicheAppelDto.dureeCorrigee = this.ficheAppel.dureeCorrigee;
          // La présence d'une dureeCumulee détermine qu'il s'agit d'une durée chronométrée. 
          // Il est possible d'accéder à la Terminaison sans qu'aucune durée ne soit encore sauvegardée. 
          // Si aucune durée et si on est pas dans une saisie différée (non chronométrée), on inscrit 1 sec 
          // afin que le composant traite correctement la durée chronométrée (libellé + calculs).
          this.dureeFicheAppelDto.dureeCumulee = !sommeDurees && !this.ficheAppelDataService.isAppelSaisieDifferee() ? 1 : sommeDurees;
          this.dureeFicheAppelDto.detailsDureeCorrigee = this.ficheAppel.detailsDureeCorrigee;
        })
      );
    }
  }

  private createValidationFinIntervention(validationList: ValidationDTO[]): ValidationFinInterventionDTO {
    return {
      validations: validationList,
      details: this.ficheAppel.detailsValidation,
      opinionProf: this.ficheAppel.opinionProf
    };
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    let idFicheAppel: number = this.ficheAppelDataService.getIdFicheAppelActive();
    this.chargerDonnees(idFicheAppel);
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (this.ficheAppel.statut == StatutFicheAppelEnum.OUVERT) {
      //On mémorise les données de services utilisées dans ficheAppel
      this.doSaveAppServicesUtilises();

      //On mémorise les données de validations de fin d'intervention dans ficheAppel
      this.ficheAppel.detailsValidation = this.appValidationFinIntervention.validationFinIntervention.details;
      this.ficheAppel.opinionProf = this.appValidationFinIntervention.validationFinIntervention.opinionProf;

      //On sauvegarde la liste des validations
      this.subscriptions.add(this.validationService.saveAll(this.appValidationFinIntervention.validationFinIntervention.validations, this.ficheAppel?.codeReferenceTypeFiche).subscribe());

      this.ficheAppelApiService.autoSaveFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    // Parce que la fiche peut avoir été fermé dans un autre onglet du navigateur, 
    // on récupère le statut de la fiche en BD.
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive()).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.doSave(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", this.ficheAppelDataService.getIdFicheAppelActive(), "consultation"])))
      )
    );
  }

  /**
   * Lorsqu'un changement de fiche est effectué (changement d'onglet).
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.chargerDonnees(idFicheAppel);
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appStatistiques.resetChampsValides();
    this.subscriptions.add(
      this.doSave(true).subscribe()
    );
  }

  private doSave(avecAlerte: boolean): Observable<boolean> {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.FERME == this.ficheAppel?.statut) {
      if (avecAlerte) {
        this.afficherErreur(this.translateService.instant("ss-sv-e00001"));
      }
      return of(true);
    } else if (!this.ficheAppel?.id) {
      return of(false);
    }
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
      this.validerRaisonAppel();
      this.validerRoleAction();
    }
    // Transfert dans la fiche d'appel les données de la section Validation de fin d'intervention.
    this.transfererDonneesValidationFinIntervention();

    // Transfert dans la fiche d'appel les données de la section Services utilisés.
    this.transfererDonneesServicesUtilises();

    // Transfert dans la fiche d'appel les données de la section Durée de la fiche.
    this.transfererDonneesDureeFicheAppel();

    return forkJoin([this.doSaveAppValidationFinIntervention(),
    /* Code désactiver pour cacher la section des communications*/
    //this.sauvegarderAppel(),
    this.ficheAppelApiService.updateFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint)]).pipe(
      map((resultats) => {
        if (resultats[0] && avecAlerte) {
          const aux = CollectionUtils.sortByKey(resultats[0], "idReferenceValidation");
          aux.forEach(validation => {
            this.afficheMessageValidationFinales(validation.validationsFinales);
            this.afficheMessageAvertissements(validation.avertissements);
          });
        }
        if (resultats[1]) {
          const ficheAppelDto: FicheAppelSocialDTO = resultats[1];
          this.ficheAppel = ficheAppelDto;
          if (avecAlerte) {
            this.afficherMessageSauvegardeReussie();
            this.afficheMessageValidationFinales(ficheAppelDto.validationsFinales);
            this.afficheMessageAvertissements(ficheAppelDto.avertissements);
          }
        }
        this.chargerDonneesValidationFinIntervention(false);
        return true;
      }, (err: any) => {
        console.error(err);
        return false;
      })
    );
  }

  /**
   * Transfert dans la fiche d'appel les données de la section Validation de fin d'intervention.
   */
  private transfererDonneesValidationFinIntervention(): void {
    const validationFinIntervention: ValidationFinInterventionDTO = this.appValidationFinIntervention.validationFinIntervention;
    if (validationFinIntervention) {
      this.ficheAppel.detailsValidation = validationFinIntervention.details;
      this.ficheAppel.opinionProf = validationFinIntervention.opinionProf;
    }
  }

  /**
   * Transfert dans la fiche d'appel les données de la section Services utilisés.
   */
  private transfererDonneesServicesUtilises(): void {
    if (this.appServicesUtilises && this.appServicesUtilises.servicesUtilisesDTO) {
      this.ficheAppel.servicesInterprete = +this.appServicesUtilises.servicesUtilisesDTO.servicesInterprete;
      this.ficheAppel.detailsInterprete = this.appServicesUtilises.servicesUtilisesDTO.detailsInterprete;
      this.ficheAppel.servicesRelaisBell = +this.appServicesUtilises.servicesUtilisesDTO.servicesRelaisBell;
      this.ficheAppel.detailsRelaisBell = this.appServicesUtilises.servicesUtilisesDTO.detailsRelaisBell;
    }
  }

  /**
   * Transfère les données présentes dans le composant DureeFicheAppelComponent vers la fiche d'appel.
   */
  private transfererDonneesDureeFicheAppel(): void {
    const dureeFicheAppelDto: DureeFicheAppelDTO = this.appDureeFicheAppel.getDureeFicheAppelDTO();
    if (dureeFicheAppelDto) {
      this.ficheAppel.dureeCorrigee = dureeFicheAppelDto?.dureeCorrigee;
      this.ficheAppel.dureeCumulee = dureeFicheAppelDto.dureeCumulee;
      this.ficheAppel.detailsDureeCorrigee = dureeFicheAppelDto?.detailsDureeCorrigee;
    } else {
      this.ficheAppel.dureeCorrigee = null;
      this.ficheAppel.dureeCumulee = null;
      this.ficheAppel.detailsDureeCorrigee = null;
    }
  }

  private validerRoleAction() {
    if (this.appStatistiques) {
      if (!this.appStatistiques.isFormulaireRoleActionVide()) {
        const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.roleaction");
        // Les informations saisies dans la section {{0}} n'ont pas été ajoutées. Cliquez sur la flèche bleue si vous ...
        const msg = this.translateService.instant("ss-iu-a30000", { 0: champ });

        this.afficheMessageAvertissementsFromArray([msg]);
      }
    }
  }

  private validerRaisonAppel() {
    if (this.appStatistiques) {
      if (!this.appStatistiques.isFormulaireRaisonInterventionVide()) {
        const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.raisonintervention");
        // Les informations saisies dans la section {{0}} n'ont pas été ajoutées. Cliquez sur la flèche bleue si vous ...
        const msg = this.translateService.instant("ss-iu-a30000", { 0: champ });

        this.afficheMessageAvertissementsFromArray([msg]);
      }
    }
  }

  private afficheMessageAvertissementsFromArray(avertissements: string[]): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModel(avertissements, "Avertissements", AlertType.WARNING);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private doSaveAppValidationFinIntervention(): Observable<ValidationDTO[]> {
    const validationFinIntervention: ValidationFinInterventionDTO = this.appValidationFinIntervention.validationFinIntervention;
    return this.validationService.saveAll(validationFinIntervention?.validations, this.ficheAppel?.codeReferenceTypeFiche);
  }

  private doSaveAppServicesUtilises(): void {
    if (this.appServicesUtilises && this.appServicesUtilises.servicesUtilisesDTO) {
      this.ficheAppel.servicesInterprete = +this.appServicesUtilises.servicesUtilisesDTO.servicesInterprete;
      this.ficheAppel.detailsInterprete = this.appServicesUtilises.servicesUtilisesDTO.detailsInterprete;
      this.ficheAppel.servicesRelaisBell = +this.appServicesUtilises.servicesUtilisesDTO.servicesRelaisBell;
      this.ficheAppel.detailsRelaisBell = this.appServicesUtilises.servicesUtilisesDTO.detailsRelaisBell;
    }
  }

  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("ss.msg.succes.confirmation");
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    alertM.messages = msg;
    if (alertM) {
      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertM));
      } else {
        this.alertStore.setState([alertM]);
      }
    }
  }

  private afficheMessageValidationFinales(validationsFinales: Map<string, string>, newAlert?: boolean): void {
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

  onLangueChange($event) {
    this.isLangueValide = true;
  }

  onCentreActiviteChange($event) {
    this.isCentreActiviteValide = true;
  }

  /**
   * Permet de se déplacer dans la page sans faire de soumission en cas d'erreur ou de succès.
   * @param anchor
   */
  private naviguerSection(anchor: string): void {
    const element = document.querySelector("#" + anchor);
    if (element) { element.scrollIntoView(true); }
  }

  //Alimente la liste des raisons d'intervention
  majListeRaisonAppel(idFicheAppel: number): void {
    this.statistiquesService.getListeRaisonAppel(idFicheAppel).subscribe((raisonAppel: RaisonAppelDTO[]) => {
      this.listeRaisonAppel = raisonAppel;
    })
  }

  /**
  * Enregistre dans la BD une raison d'intervention.
  * @param raisonAppelDto Objet de transfert d'une raison d'intervention
  */
  onRaisonAppelSave(raisonAppelDto: RaisonAppelDTO) {

    if (raisonAppelDto.valid) {

      if (!raisonAppelDto.id) {

        raisonAppelDto.idFicheAppel = this.ficheAppel.id;

        this.subscription.add(
          this.statistiquesService.ajouterRaisonAppel(this.ficheAppel.id, raisonAppelDto).subscribe((dto: RaisonAppelDTO) => {
            this.majListeRaisonAppel(this.ficheAppel.id);
            this.appStatistiques.reinitialiserRaisonAppel();

            this.afficheMessageAvertissements(dto.avertissements);
            this.afficheMessageValidationFinales(dto.validationsFinales);

            if (this.alertStore.state && this.alertStore.state.length == 0) {
              this.naviguerSection('statistiques');
            }
          }, (error: HttpErrorResponse) => {
            console.log(error.message);
          })
        );
      }
    }
  }

  /**
     * Exécute l'événement de suppression d'une raison d'intervention
     * @param raisonAppelDto object de transfert d'une raison d'intervention
     */
  onRaisonAppelDelete(raisonAppelDto: RaisonAppelDTO) {
    this.subscription.add(
      this.statistiquesService.supprimerRaisonAppel(this.ficheAppel.id, +raisonAppelDto.id)
        .subscribe(() => {
          //Met à jour la liste dans la vue.
          this.majListeRaisonAppel(this.ficheAppel.id);
          this.naviguerSection('statistiques');

          this.alertStore.resetAlert();
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
        })
    );
    this.appStatistiques.reinitialiserRaisonAppel();
  }

  majListeRoleAction(idFicheAppel: number): void {
    this.subscription.add(
      this.statistiquesService.getListeRoleAction(idFicheAppel).subscribe((roleAction: RoleActionDTO[]) => {
        this.listeRoleAction = roleAction;
      })
    );
  }

  /**
  * Enregistre dans la BD un role-action
  * @param roleActionDto Objet de transfert d'un role action
  */
  onRoleActionSave(roleActionDto: RoleActionDTO) {
    if (roleActionDto.valid) {
      if (roleActionDto.id == null) {
        roleActionDto.idFicheAppel = this.ficheAppel.id;
        this.subscription.add(
          this.statistiquesService.ajouterRoleAction(this.ficheAppel.id, roleActionDto)
            .subscribe((dto: RoleActionDTO) => {
              this.majListeRoleAction(this.ficheAppel.id);
              this.appStatistiques.reinitialiserRoleAction();
              this.afficheMessageAvertissements(dto.avertissements);
              this.afficheMessageValidationFinales(dto.validationsFinales);
              if (this.alertStore.state && this.alertStore.state.length == 0) {
                this.naviguerSection('statistiques');
              }
            }, (error: HttpErrorResponse) => {
              console.log(error.message);
            })
        );
      }
    }
  }


  /**
   * Exécute l'événement de suppression d'un role action
   * @param roleActionDto object de transfert d'un role action
   */
  onRoleActionDelete(roleActionDto: RoleActionDTO) {

    this.subscription.add(
      this.statistiquesService.supprimerRoleAction(this.ficheAppel.id, +roleActionDto.id)
        .subscribe(() => {
          //Met à jour la liste dans la vue.
          this.majListeRoleAction(this.ficheAppel.id);
          this.naviguerSection('statistiques');
          this.alertStore.resetAlert();
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
        })
    );
    this.appStatistiques.reinitialiserRoleAction();
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Terminer.
   * - sauvegarde les modifs en cours
   * - valide la fiche d'appel pour s'assurer que toutes les validations finales sont complétées
   * - Lance la terminaison de la fiche
   */
  onBtnTerminerClick() {
    this.subscription.add(
      // Sauvegarde les modifs en cours.
      this.doSave(false).pipe(
        concatMap(() => {
          // Sauvegarde le chrono car sa durée est utilisée dans les validations au backend.
          return this.ficheAppelChronoService.stopAndSaveChrono$();
        }),
        concatMap(() => {
          const idFicheAppel: number = this.ficheAppel.id;
          const sexeUsagerLieInconnu: boolean = !this.existsSexeUsagerLie;
          const dateNaissanceUsagerLie: Date = this.ficheAppel?.usager?.usagerIdentification?.dtNaiss;

          // Valide la possibilité de terminer la fiche.
          return this.ficheAppelApiService.validerFicheAppelPourTerminer(idFicheAppel, sexeUsagerLieInconnu, dateNaissanceUsagerLie);
        }),
        concatMap((dto: FicheAppelSocialDTO) => {
          if (dto.erreursFinales) {
            // Il reste des erreurs, on affiche les erreurs et on arrête le traitement.
            this.afficheMessageErreurTerminer(dto.erreursFinales);

            // Redémarre le chrono
            this.startChrono();
          } else {
            // Affiche message de validation de la durée. Confirmation retournée dans onBtnConfirmerDureeClick().
            // so-iu-a30005=La durée calculée est supérieure à 2 heures. Désirez-vous continuer?
            // so-iu-a30006=La durée corrigée est supérieure à 2 heures. Désirez-vous continuer?
            // so-iu-a30007=La durée chronométrée est supérieure à 2 heures. Désirez-vous continuer?
            if (this.appDureeFicheAppel.validerDureeFicheAppelBeforeTerminer(7200, 'so-iu-a30006', 'so-iu-a30005', 'so-iu-a30007')) {
              // C'est valide on termine
              this.terminerFicheAppel();
            } else {
              // Voir confirmation retournée dans onBtnConfirmerDureeClick().
            }
          }
          return EMPTY;
        })
      ).subscribe()
    );
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Oui/Non de la fenêtre de confirmation confirmer-duree-popup.
   */
  onBtnConfirmerDureeClick(confirmation: boolean) {
    if (confirmation === true) {
      this.terminerFicheAppel();
    } else {
      // Redémarre le chrono
      this.startChrono();
    }
  }

  /**
   * Termine/ferme la fiche d'appel:
   * - crée un historique pour l'usager lié à la fiche
   * - termine la fiche en lui mettant le statut F (Fermé)
   * - maj le compteur des fiches non terminées
   * - redirige vers la consultation de la fiche
   */
  private terminerFicheAppel(): void {
    const idUsagerIdent: number = this.ficheAppel?.usager?.usagerIdentification?.id;

    // Aucune erreur, on peut terminer la fiche.
    // On commence par créer un historique de l'usager lié à la fiche.
    this.subscription.add(
      this.usagerService.creerHistoriqueUsagerIdent(idUsagerIdent)
        .subscribe((usagerIdentHistoDto: UsagerIdentHistoDTO) => {
          // Inscrit l'id de l'historique dans l'usager pour le sauvegarder .
          if (usagerIdentHistoDto) {
            this.ficheAppel.usager.idUsagerIdentHisto = usagerIdentHistoDto?.id;
          }

          // Indique si on ferme la dernière fiche ouverte de l'appel
          const isFermerDerniereFiche: boolean = this.ficheAppelDataService.getNbFicheAppelOuverte() == 1 && this.ficheAppel.statut == StatutFicheAppelEnum.OUVERT;

          // On termine la fiche. Le serveur attribuera une date de fin et le statut "F" à la fiche.
          this.subscription.add(
            this.ficheAppelApiService.terminerFicheAppel(this.ficheAppel).subscribe((ficheAppelDto: FicheAppelSocialDTO) => {
              this.ficheAppel = ficheAppelDto;

              // On vient de fermer une fiche d'appel, on demande d'interroger le nombre de fiches d'appel non terminées
              // afin de mettre à jour le "badge" dans le menu du haut.
              this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlInfoSocial + '/api/');

              // On rafraichit la liste des fiches d'appel afin d'obtenir les bons statuts.
              this.ficheAppelDataService.doRefreshListeFicheAppel();

              // Si un usager est présent et qu'il a donné son consentement à aviser les organismes enregistreurs.
              if (idUsagerIdent && ficheAppelDto.consentementenFicheEnregistreur) {
                this.genererAlertes(ficheAppelDto);
              }

              if (ficheAppelDto?.usager?.usagerIdentification?.id) {
                this.subscription.add(this.usagerService.solrIndexUsagers([ficheAppelDto.usager.usagerIdentification.id]).subscribe(rs => {
                }));
              }

              if (!isFermerDerniereFiche) {
                this.startChrono();
              }

              // Navigation vers la consultation
              this.router.navigate(["../" + SectionFicheAppelEnum.CONSULTATION], { relativeTo: this.activatedRoute });
            })
          );
        })
    );
  }

  private afficheMessageErreurTerminer(erreursFinales: Map<string, string[]>): void {
    this.alertStore.setState([]);
    if (erreursFinales) {
      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_DEMANDE_ANALYSE])) {
        const titre = this.translateService.instant("sigct.so.f_appel.menuver.demanalyse"); //Demande et analyse
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_DEMANDE_ANALYSE], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT])) {
        const titre = this.translateService.instant("sigct.so.f_appel.menuver.usager"); //Usager
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_PLAN_ACTION])) {
        const titre = this.translateService.instant("sigct.so.f_appel.menuver.planaction"); //Intervention
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_PLAN_ACTION], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_TERMINAISON])) {
        const titre = this.translateService.instant("sigct.so.f_appel.menuver.terminaison"); //Terminaison
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_TERMINAISON], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }
    }
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
    alertM.title = this.translateService.instant("girpi.error.label");
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    this.alertStore.addAlert(alertM);
  }

  /**
   * Lance la création des alertes pour aviser les organismes enregistreurs qu'un fiche d'appel existe pour l'usager.
   * @param ficheAppelDto fiche d'appel à traiter
   */
  private genererAlertes(ficheAppelDto: FicheAppelSocialDTO) {
    const genererAlertFicheDto: GenererAlerteFicheDTO = {
      dtAppel: ficheAppelDto.dateDebut,
      idUsagerIdent: ficheAppelDto.usager.usagerIdentification.id,
      idFicheAppelSante: null,
      idFicheAppelSocial: ficheAppelDto.id
    };

    // On lance la création (au besoin) des alertes pour aviser les organismes enregistreurs.
    this.usagerAlerteFicheApiService.genererAlertes(genererAlertFicheDto).subscribe((result: boolean) => {
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }
    if (this.abonnementLangue) {
      this.abonnementLangue.unsubscribe();
    }
    if (this.abonnementCentreActivite) {
      this.abonnementCentreActivite.unsubscribe();
    }
  }

  /**
   * Démarre le chrono si la fiche n'est pas en saisie rapide.
   */
  private startChrono(): void {
    if (!this.ficheAppelDataService.isAppelSaisieDifferee()) {
      this.ficheAppelChronoService.startChrono(this.ficheAppelDataService.getIdFicheAppelActive());
    }
  }
}
