import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { AppelDTO } from 'projects/infosante-ng-core/src/lib/models/appel-dto';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelPageEnum } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-page-enum';
import { EnumTypeFicheAppel } from 'projects/infosante-ng-core/src/lib/models/type-fiche-appel-enum';
import { EnumUrlPageFicheAppel } from 'projects/infosante-ng-core/src/lib/models/url-page-fiche-appel-enum';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { StatistiquesService } from 'projects/infosante-ng-core/src/lib/services/statistiques.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { SigctOrientationSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-orientation-suites-intervention/sigct-orientation-suites-intervention.component';
import { SigctReferenceSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-reference-suites-intervention/sigct-reference-suites-intervention.component';
import { StatistiquesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/statistiques/statistiques.component';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { GenererAlerteFicheDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerAlerteFicheApiService } from 'projects/usager-ng-core/src/lib/services/usager-alerte-fiche-api.service';
import { UsagerInfoSanteService } from 'projects/usager-ng-core/src/lib/services/usager-info-sante.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { forkJoin, iif, Observable, of, Subject, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { UsagerApiService } from '../../../../services/usager-api.service';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'saisie-differee-fiche-appel-page',
  templateUrl: './saisie-differee-fiche-appel-page.component.html',
  styleUrls: ['./saisie-differee-fiche-appel-page.component.css'],
  providers: [DatePipe]
})
export class SaisieDiffereeFicheAppelPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy, AfterViewInit {

  private urlApi: string = window["env"].urlSanteApi;
  private subscription: Subscription = new Subscription();

  private referencesChargeesSubj: Subject<void> = new Subject();

  idAppel: number;
  idFicheAppel: number;

  appelDto = new AppelDTO();
  ficheAppelDto = new FicheAppelDTO();
  sexeUsagerInconnu: boolean = true;

  dateDebutFicheAppel: Date = null;
  heureDebutFicheAppel: string = null;
  dateFinFicheAppel: Date = null;
  heureFinFicheAppel: string = null;

  demain: string;

  isHeureDebutValide: boolean = true;
  isHeureFinValide: boolean = true;
  isLangueValide: boolean = true;
  isCentreActiviteValide: boolean = true;
  isTypeConsultationNonPertinente: boolean = false;

  listeOrientationSuitesIntervention: OrientationSuitesInterventionDTO[];
  listeReferenceSuitesIntervention: ReferenceSuitesInterventionDTO[];
  listeRaisonAppel: RaisonAppelDTO[] = [];
  listeRoleAction: RoleActionDTO[] = [];

  listeRefOrientationSuitesIntervention: ReferenceDTO[] = [];
  listeRefReferenceSuitesIntervention: ReferenceDTO[] = [];
  listeReferenceRaison: ReferenceDTO[] = [];
  listeReferenceRoleAction: ReferenceDTO[] = [];

  inputOptionsCentreActivite: InputOptionCollection;
  inputOptionsIntervenantOrganisme: InputOptionCollection;
  inputOptionsLangue: InputOptionCollection;
  inputOptionsTypeConsultation: InputOptionCollection;
  inputOptionsRaisonConsultationNonPertinente: InputOptionCollection;

  inputOptionAucuneSuite: InputOptionCollection = {
    name: "acunesuite",
    options: [{ label: 'sigct.sa.f_appel.intervention.aucunesuite', value: 'false' }]
  };

  inputOptionAutorisationTransmission: InputOptionCollection = {
    name: "autorisationtransmission",
    options: [{ label: 'sigct.sa.f_appel.intervention.usagerautorise', value: 'false' }]
  };

  inputOptionConsentementenFicheEnregistreur: InputOptionCollection = {
    name: "consentementenOrganismesEnregistreurs",
    options: [{ label: 'sigct.sa.f_appel.intervention.consentementenregistreurs', value: 'false' }]
  };

  aucuneSuiteDisabled: boolean;
  autorisationTransmissionDisabled: boolean;
  consentementenFicheEnregistreurDisabled: boolean;

  @ViewChild("chosenTypeConsultation", { static: true })
  private chosenTypeConsultation: SigctChosenComponent;

  @ViewChild("orientationSuitesIntervention", { static: true })
  private appOrientationSuitesIntervention: SigctOrientationSuitesInterventionComponent;

  @ViewChild("referenceSuitesIntervention", { static: true })
  private appReferenceSuitesIntervention: SigctReferenceSuitesInterventionComponent;

  @ViewChild('appStatistiques', { static: true })
  private appStatistiques: StatistiquesComponent;

  constructor(
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private referenceApiService: ReferencesApiService,
    private appelApiService: AppelApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private translateService: TranslateService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private statistiquesService: StatistiquesService,
    private usagerInfoSanteService: UsagerInfoSanteService,
    private usagerApiService: UsagerApiService,
    private usagerAlerteFicheApiService: UsagerAlerteFicheApiService,
    private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private materialModalDialogService: MaterialModalDialogService,
    private usagerService: UsagerService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    // this.alertStore.resetAlert();

    this.demain = DateUtils.getDateToAAAAMMJJ(new Date());

    this.idAppel = this.ficheAppelDataService.getIdAppel();
    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();

    this.subscription.add(
      this.chargerReferences().subscribe(_ => {
        // Notifie la fin du chargement des références.
        this.referencesChargeesSubj.next();

        // Maintenant que les références sont chargée, on charge l'appel, le fiche d'appel et ses enfants.
        this.chargerDonnees();
      })
    );
  }

  ngAfterViewInit() {
    // Donne le focus au chosen uniquement après que sa liste soit chargée pour éviter l'apparition d'erreurs js.
    this.subscription.add(
      this.referencesChargeesSubj.subscribe(() => {
        this.focusFirstElement();
      })
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.subscription.unsubscribe();

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    this.alertStore.resetAlert();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (this.ficheAppelDto.statut == StatutFicheAppelEnum.OUVERT) {
      this.appelApiService.autoSaveAppel(this.appelDto, EnumUrlPageFicheAppel.SAISIE_DIFFEREE);
      this.ficheAppelApiService.autoSaveFicheAppel(this.getFicheAppelDto(), EnumUrlPageFicheAppel.SAISIE_DIFFEREE);
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
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelDto.id).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.saveDonnes(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelDto.idAppel, "fiche", this.ficheAppelDto.id, "consultation"])))
      )
    );
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    this.alertStore.setState([]);
    //    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
    this.appOrientationSuitesIntervention.resetForm();
    this.appReferenceSuitesIntervention.resetForm();
    this.chargerDonnees();
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.idFicheAppel = idFicheAppel;
    this.appOrientationSuitesIntervention.resetForm();
    this.appReferenceSuitesIntervention.resetForm();
    this.chargerDonnees();
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appOrientationSuitesIntervention.resetChampsValides();
    this.appReferenceSuitesIntervention.resetChampsValides();
    this.subscription.add(
      this.saveDonnes(true).subscribe()
    );
  }

  /**
   * Permet de charger les références qui peuplent les liste déroulantes.
   */
  private chargerReferences(): Observable<void> {
    // Récupère l'id de l'organisme de l'utilsateur connecté.
    const idStOrganismeCourant: number = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;

    return forkJoin([
      this.referenceApiService.getListeOrientation(false),  // 0
      this.referenceApiService.getListeReference(),         // 1
      this.referenceApiService.getListeTypeConsultation(),  // 2
      this.referenceApiService.getListeIntervenantOrganismeWithRole(idStOrganismeCourant, "SA_APPEL_MODIF", false),
      this.referenceApiService.getListeRaisonAppel(false),  // 4
      this.referenceApiService.getListeRoleAction(false),   // 5
      this.referenceApiService.getListeLangueAppel(false),  // 6
      this.referenceApiService.getListeCentreActivite(),    // 7
      this.referenceApiService.getListeRaisonTypeFiche(),   // 8
    ]).pipe(
      map(results => {
        const selectMsg: string = this.translateService.instant("option.select.message");

        if (results[0]) {
          this.listeRefOrientationSuitesIntervention = results[0] as ReferenceDTO[];
        }

        if (results[1]) {
          this.listeRefReferenceSuitesIntervention = results[1] as ReferenceDTO[];
        }

        if (results[2]) {
          const listeTypeConsultation: ReferenceDTO[] = results[2] as ReferenceDTO[];
          this.inputOptionsTypeConsultation = {
            name: "type-consultation",
            options: []
          }

          // Transforme les ReferenceDTOs en InputOptions
          listeTypeConsultation?.forEach(item => {
            this.inputOptionsTypeConsultation.options.push({
              label: item.nom,
              value: item.code,
              description: item.description,
            });
          });
        }

        if (results[3]) {
          const listeIntervenant: ReferenceDTO[] = results[3] as ReferenceDTO[];
          this.inputOptionsIntervenantOrganisme = {
            name: "intervenant-organisme",
            options: []
          }

          // Ajoute option "Sélectionner..."
          this.inputOptionsIntervenantOrganisme.options.push({ label: selectMsg, value: null });

          // Transforme les ReferenceDTOs en InputOptions
          listeIntervenant?.forEach(item => {
            this.inputOptionsIntervenantOrganisme.options.push({
              label: item.nom,
              value: item.nom,
              description: item.description,
              actif: item.actif
            });
          });
        }

        if (results[4]) {
          this.listeReferenceRaison = results[4] as ReferenceDTO[];;
        }

        if (results[5]) {
          this.listeReferenceRoleAction = results[5] as ReferenceDTO[];;
        }

        if (results[6]) {
          const listeLangue: ReferenceDTO[] = results[6] as ReferenceDTO[];
          this.inputOptionsLangue = {
            name: "langue",
            options: []
          }

          // Ajoute option "Sélectionner..."
          this.inputOptionsLangue.options.push({ label: selectMsg, value: null });

          // Transforme les ReferenceDTOs en InputOptions
          listeLangue?.forEach(item => {
            this.inputOptionsLangue.options.push({
              label: item.nom,
              value: item.code,
              description: item.description,
            });
          });
        }

        if (results[7]) {
          const listeCentreActivite: ReferenceDTO[] = results[7] as ReferenceDTO[];
          this.inputOptionsCentreActivite = {
            name: "centre-activite",
            options: []
          }

          // Ajoute option "Sélectionner..."
          this.inputOptionsCentreActivite.options.push({ label: selectMsg, value: null });

          // Transforme les ReferenceDTOs en InputOptions
          listeCentreActivite?.forEach(item => {
            this.inputOptionsCentreActivite.options.push({
              label: item.nom,
              value: item.code,
              description: item.description,
            });
          });
        }

        if (results[8]) {
          const listeRaison: ReferenceDTO[] = results[8] as ReferenceDTO[];
          this.inputOptionsRaisonConsultationNonPertinente = {
            name: "raison-consultation-non-pertinente",
            options: []
          }

          // Ajoute option "Sélectionner..."
          this.inputOptionsRaisonConsultationNonPertinente.options.push({ label: selectMsg, value: null });

          listeRaison.forEach(item => {
            this.inputOptionsRaisonConsultationNonPertinente.options.push({
              label: item.nom,
              value: item.code,
              description: item.description,
            });
          });
        }

        return;
      })
    );
  }

  /**
   * Charge l'appel, la fiche d'appel et ses enfants.
   */
  private chargerDonnees(): void {
    this.subscription.add(
      forkJoin([
        this.appelApiService.obtenirAppel(this.idAppel),
        this.ficheAppelApiService.getFicheAppel(this.idFicheAppel)
      ]).subscribe(results => {
        if (results[0]) {
          this.appelDto = results[0] as AppelDTO;
        }

        if (results[1]) {
          this.setFicheAppelDto(results[1] as FicheAppelDTO);
        }

        if (this.ficheAppelDto?.usager?.usagerIdentification?.id) {
          this.subscription.add(
            this.usagerApiService.existsSexeUsager(this.ficheAppelDto.usager.usagerIdentification.id).subscribe((exists: boolean) => {
              this.sexeUsagerInconnu = !exists;
            })
          );
        }

        // Charge les orientations liées à la fiche d'appel.
        this.chargerOrientationSuitesIntervention();

        // Charge les références liées à la fiche d'appel.
        this.chargerReferenceSuitesIntervention();

        // Charge les raisons de l'appel liées à la fiche d'appel.
        this.chargerRaisonAppel();

        // Charge les rôles action liées à la fiche d'appel.
        this.chargerRoleAction();
      })
    );
  }

  /**
   * Charge les orientations liées à la fiche d'appel.
   */
  private chargerOrientationSuitesIntervention(): void {
    this.subscription.add(
      this.orientationSuitesInterventionService.getListOrientations(this.urlApi, this.idFicheAppel).subscribe((orientationsSuitesIntervention: OrientationSuitesInterventionDTO[]) => {
        this.listeOrientationSuitesIntervention = orientationsSuitesIntervention ? orientationsSuitesIntervention : [];
        this.checkAucuneSuite();
      })
    );
  }

  /**
   * Charge les références des suites d'intervention liées à la fiche d'appel.
   */
  private chargerReferenceSuitesIntervention(): void {
    this.subscription.add(
      this.referenceSuitesInterventionService.findAll(this.urlApi, this.idFicheAppel).subscribe((referencesSuitesIntervention: ReferenceSuitesInterventionDTO[]) => {
        this.listeReferenceSuitesIntervention = referencesSuitesIntervention ? referencesSuitesIntervention : [];
        this.checkAucuneSuite();
      })
    );
  }

  /**
   * Charge les raisons de l'appel liées à la fiche d'appel.
   */
  private chargerRaisonAppel(): void {
    this.subscription.add(
      this.statistiquesService.getListeRaisonAppel(this.idFicheAppel).subscribe((listeRaisonAppel: RaisonAppelDTO[]) => {
        this.listeRaisonAppel = listeRaisonAppel;
      })
    );
  }

  /**
   * Charge les rôles action liées à la fiche d'appel.
   */
  private chargerRoleAction(): void {
    this.subscription.add(
      this.statistiquesService.getListeRoleAction(this.idFicheAppel).subscribe((listeRoleAction: RoleActionDTO[]) => {
        this.listeRoleAction = listeRoleAction;
      })
    );
  }

  private checkAucuneSuite() {
    this.aucuneSuiteDisabled = (this.listeOrientationSuitesIntervention?.length > 0) || (this.listeReferenceSuitesIntervention?.length > 0);

    if (this.ficheAppelDto.aucuneSuite && this.aucuneSuiteDisabled) {
      this.ficheAppelDto.aucuneSuite = false;

      //TODO pourquoi on sauvegarde lors du chargement des données???
      this.subscription.add(
        this.saveDonnes(true).subscribe()
      );
    }
  }

  /**
   * Ajoute une orientation à la fiche d'appel (flèche bleu).
   * @param orientationSuitesIntervention
   */
  onAjouterOrientationSuitesIntervention(orientationSuitesIntervention: OrientationSuitesInterventionDTO) {
    this.subscription.add(
      this.orientationSuitesInterventionService.create(this.urlApi, orientationSuitesIntervention).subscribe(() => {
        this.chargerOrientationSuitesIntervention();
      })
    );
    this.appOrientationSuitesIntervention.resetForm();
  }

  /**
   * Ajoute une référence à la fiche d'appel (flèche bleu).
   * @param referenceSuitesIntervention
   */
  onAjouterReferenceSuitesIntervention(referenceSuitesIntervention: ReferenceSuitesInterventionDTO) {
    this.subscription.add(
      this.referenceSuitesInterventionService.create(this.urlApi, referenceSuitesIntervention).subscribe(() => {
        this.chargerReferenceSuitesIntervention();
      })
    );
    this.appReferenceSuitesIntervention.resetForm();
  }

  /**
  * Enregistre dans la BD une raison d'intervention.
  * @param raisonAppelDto raison d'intervention à sauvegarder
  */
  onAjouterRaisonAppel(raisonAppelDto: RaisonAppelDTO) {
    if (raisonAppelDto.valid) {
      raisonAppelDto.idFicheAppel = this.idFicheAppel;

      this.subscription.add(
        this.statistiquesService.ajouterRaisonAppel(this.idFicheAppel, raisonAppelDto).subscribe((dto: RaisonAppelDTO) => {
          this.chargerRaisonAppel();
          this.appStatistiques.reinitialiserRaisonAppel();

          this.afficherMessageAvertissements(dto.avertissements);
          this.afficherMessageValidationFinales(dto.validationsFinales);
        })
      );
    }
  }

  /**
   * Enregistre dans la BD un role-action
   * @param roleActionDto role action à sauvegarder
   */
  onAjouterRoleAction(roleActionDto: RoleActionDTO) {
    if (roleActionDto.valid) {
      if (roleActionDto.id == null) {
        roleActionDto.idFicheAppel = this.idFicheAppel;

        this.subscription.add(
          this.statistiquesService.ajouterRoleAction(this.idFicheAppel, roleActionDto).subscribe((dto: RoleActionDTO) => {
            this.chargerRoleAction();
            this.appStatistiques.reinitialiserRoleAction();

            this.afficherMessageAvertissements(dto.avertissements);
            this.afficherMessageValidationFinales(dto.validationsFinales);
          })
        );
      }
    }
  }

  /**
   * Suppression d'une orientation (poubelle).
   * @param orientation
   */
  onSupprimerOrientationSuitesIntervention(orientation: OrientationSuitesInterventionDTO) {
    this.subscription.add(
      this.orientationSuitesInterventionService.delete(this.urlApi, +orientation.id).subscribe(() => {
        this.chargerOrientationSuitesIntervention();
      })
    );
  }

  /**
   * Supprimer une raison d'intervention.
   * @param raisonAppelDto raison d'intervention à supprimer
   */
  onSupprimerRaisonAppel(raisonAppelDto: RaisonAppelDTO) {
    if (raisonAppelDto) {
      this.subscription.add(
        this.statistiquesService.supprimerRaisonAppel(this.idFicheAppel, +raisonAppelDto.id).subscribe(() => {
          // Met à jour la liste des raisons d'intervention
          this.chargerRaisonAppel();

          this.alertStore.resetAlert();
        })
      );

      this.appStatistiques.reinitialiserRaisonAppel();
    }
  }

  /**
   * Suppression d'une référence (poubelle).
   * @param idReference
   */
  onSupprimerReferenceSuitesIntervention(idReference: number) {
    this.subscription.add(
      this.referenceSuitesInterventionService.delete(this.urlApi, idReference).subscribe(() => {
        this.chargerReferenceSuitesIntervention();
      })
    );
  }

  /**
   * Supprime un rôle-action.
   * @param roleActionDto role action à supprimer
   */
  onSupprimerRoleAction(roleActionDto: RoleActionDTO) {
    this.subscription.add(
      this.statistiquesService.supprimerRoleAction(this.idFicheAppel, +roleActionDto.id).subscribe(() => {
        // Met à jour la liste des rôle-action
        this.chargerRoleAction();

        this.appStatistiques.reinitialiserRoleAction();

        this.alertStore.resetAlert();
      })
    );
  }

  onTypeConsultationSelected(inputOption: InputOption): void {
    if (inputOption?.value == EnumTypeFicheAppel.NONPERT) {
      this.isTypeConsultationNonPertinente = true;
    } else {
      this.ficheAppelDto.referenceRaisonTypeFicheCode = null;
      this.isTypeConsultationNonPertinente = false;
    }
  }

  private validerOrientation() {
    if (this.appOrientationSuitesIntervention) {
      if (!this.appOrientationSuitesIntervention.isEmptyForm()) {
        const titreAvertissement: string = this.translateService.instant("usager.msg.avertissement");
        const titre = this.translateService.instant("sigct.sa.f_appel.intervention.titre")
        const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });

        this.creerMessageAlert([msg], titreAvertissement, AlertType.WARNING);
      }
    }
  }

  private validerRaisonAppel() {
    if (this.appStatistiques) {
      if (!this.appStatistiques.isFormulaireRaisonInterventionVide()) {
        const titreAvertissement: string = this.translateService.instant("usager.msg.avertissement");
        const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.raisonintervention");
        // Les informations saisies dans la section {{0}} n'ont pas été ajoutées. Cliquez sur la flèche bleue si vous ...
        const msg = this.translateService.instant("ss-iu-a30000", { 0: champ });

        this.creerMessageAlert([msg], titreAvertissement, AlertType.WARNING);
      }
    }
  }

  private validerReference() {
    if (this.appReferenceSuitesIntervention) {
      if (!this.appReferenceSuitesIntervention.isEmptyForm()) {
        const titreAvertissement: string = this.translateService.instant("usager.msg.avertissement");
        const titre = this.translateService.instant("sigct.sa.f_appel.intervention.titre")
        const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });

        this.creerMessageAlert([msg], titreAvertissement, AlertType.WARNING);
      }
    }
  }

  private validerRoleAction() {
    if (this.appStatistiques) {
      if (!this.appStatistiques.isFormulaireRoleActionVide()) {
        const titreAvertissement: string = this.translateService.instant("usager.msg.avertissement");
        const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.roleaction");
        // Les informations saisies dans la section {{0}} n'ont pas été ajoutées. Cliquez sur la flèche bleue si vous ...
        const msg = this.translateService.instant("ss-iu-a30000", { 0: champ });

        this.creerMessageAlert([msg], titreAvertissement, AlertType.WARNING);
      }
    }
  }

  /**
   * Sauvegarder les données. Si avecAlerte est false, les validations ne sont pas effectuées et
   * aucun message n'est affiché (autoSave).
   * @param avecAlerte indique si les validations et les messages sont affichés.
   */
  saveDonnes(avecAlerte: boolean): Observable<boolean> {
    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    if (avecAlerte) {
      // Valider les flèches bleu non sauvegardées.
      this.validerOrientation();
      this.validerReference();
      this.validerRaisonAppel();
      this.validerRoleAction();
    }

    return forkJoin([
      this.appelApiService.updateAppel(this.appelDto, SectionFicheAppelEnum.SAISIE_DIFFEREE),
      this.ficheAppelApiService.updateFicheAppel(this.getFicheAppelDto(), EnumUrlPageFicheAppel.SAISIE_DIFFEREE)]).pipe(
        map((results) => {
          if (results[0]) {
            this.appelDto = results[0] as AppelDTO;
          }

          if (results[1]) {
            this.setFicheAppelDto(results[1] as FicheAppelDTO);
          }

          if (avecAlerte) {
            this.bindingErrorsStore.setState({});

            this.afficherMessageSauvegardeReussie();

            this.afficherMessageValidationFinales(this.appelDto.validationsFinales);
            this.afficherMessageValidationFinales(this.ficheAppelDto.validationsFinales);

            this.afficherMessageAvertissements(this.appelDto.avertissements);
            this.afficherMessageAvertissements(this.ficheAppelDto.avertissements);
          }

          return true;
        })
      );
  }

  private creerMessageAlert(messages: string[], titre: string, alertType: AlertType): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, titre, alertType);

    this.alertStore.addAlert(alertModel);
  }

  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    let title = this.translateService.instant("ss.msg.succes.confirmation");
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    let alertModel: AlertModel = AlertModelUtils.createAlertModel(msg, title, AlertType.SUCCESS);

    this.alertStore.addAlert(alertModel);
  }

  private afficherMessageValidationFinales(validationsFinales: Map<string, string>): void {
    const titre: string = this.translateService.instant("usager.msg.valfinale");
    const alertModel: AlertModel = AlertModelUtils.createAlertModelValidationFinales(validationsFinales, titre);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private afficherMessageAvertissements(avertissements: Map<string, string>): void {
    const titre: string = this.translateService.instant("usager.msg.avertissement");
    const alertModel: AlertModel = AlertModelUtils.createAlertModelAvertissements(avertissements, titre);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
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

  /**
   * Terminaison de la fiche d'appel lorsque l'utilisateur clique sur le bouton Terminer.
   * - sauvegarde les modifs en cours
   * - valide la fiche d'appel pour s'assurer que toutes les validations finales sont complétées
   * - Lance la terminaison de la fiche
   */
  onBtnTerminerClick() {
    this.subscription.add(
      // Sauvegarde les modifs en cours.
      this.saveDonnes(false).subscribe(() => {
        const idFicheAppel: number = this.ficheAppelDto.id;
        const dateNaissanceUsagerLie: Date = this.ficheAppelDto.usager?.usagerIdentification?.dtNaiss;

        this.subscription.add(
          // Valide la possibilité de terminer la fiche.
          this.ficheAppelApiService.validerFicheAppelPourTerminer(idFicheAppel, null, this.sexeUsagerInconnu, dateNaissanceUsagerLie).subscribe((dto: FicheAppelDTO) => {
            if (dto.erreursFinales) {
              // Elle reste des erreurs, on affiche les erreurs et on arrête le traitement.
              this.afficheMessageErreurTerminaison(dto.erreursFinales);
            } else {
              // sa-iu-a30005=La durée calculée est supérieure à 1 heures. Désirez-vous continuer?
              this.subscription.add(
                this.validerDureeFicheAppel(dto.dateDebut, dto.dateFin, 3600, 'sa-iu-a30005').subscribe((result: boolean) => {
                  if (result) {
                    this.terminerFicheAppel();
                  }
                })
              );
            }
          })
        );
      })
    );
  }

  onLangueChange(event): void {
    this.isLangueValide = (this.ficheAppelDto.referenceLangueAppelCode != null);
  }

  onCentreActiviteChange(event): void {
    this.isCentreActiviteValide = true;
  }

  private focusFirstElement(): void {
    this.chosenTypeConsultation.focus(false);
  }

  /**
   * Affiche les messages d'erreur obtenus lors de la terminaison.
   * @param erreursFinales
   */
  private afficheMessageErreurTerminaison(erreursFinales: Map<string, string[]>): void {
    this.alertStore.setState([]);
    if (erreursFinales) {
      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT])) {
        const titre = this.translateService.instant("sigct.ss.f_appel.us.btnusager"); //Usager
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_SAISIE_DIFFEREE])) {
        const titre = this.translateService.instant("sigct.sa.f_appel_rapide.menuvert.btnsaisierapideinfobulle"); // Saisie rapide
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_SAISIE_DIFFEREE], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }
    }
  }

  /**
   * Lance la création des alertes pour aviser les organismes enregistreurs qu'un fiche d'appel existe pour l'usager.
   * @param ficheAppelDto fiche d'appel à traiter
   */
  private genererAlertes(ficheAppelDto: FicheAppelDTO) {
    const genererAlertFicheDto: GenererAlerteFicheDTO = {
      dtAppel: ficheAppelDto.dateDebut,
      idUsagerIdent: ficheAppelDto.usager.usagerIdentification.id,
      idFicheAppelSante: ficheAppelDto.id,
      idFicheAppelSocial: null
    };

    // On lance la création (au besoin) des alertes pour aviser les organismes enregistreurs.
    this.usagerAlerteFicheApiService.genererAlertes(genererAlertFicheDto).subscribe((result: boolean) => {
    });
  }

  /**
   * Retourne le FicheAppelDTO en traitement en prenant soin d'y insérer les dates debut/fin saisies.
   * @returns
   */
  private getFicheAppelDto(): FicheAppelDTO {
    if (this.ficheAppelDto) {
      this.ficheAppelDto.dateDebut = DateUtils.updateDateTimeInString(this.dateDebutFicheAppel, this.heureDebutFicheAppel);
      this.ficheAppelDto.dateFin = DateUtils.updateDateTimeInString(this.dateFinFicheAppel, this.heureFinFicheAppel);
    }
    return this.ficheAppelDto;
  }

  /**
   * Détermine le FicheappelDTO en édition.
   * @param dto
   */
  private setFicheAppelDto(dto: FicheAppelDTO): void {
    this.ficheAppelDto = dto;

    // Indique s'il s'agit d'une consultation de type Non pertinente. Permet d'activer/désactiver la raison.
    this.isTypeConsultationNonPertinente = this.ficheAppelDto?.typeConsultation == EnumTypeFicheAppel.NONPERT;

    if (this.ficheAppelDto?.dateDebut) {
      const yyyy: number = +this.datePipe.transform(this.ficheAppelDto.dateDebut, 'yyyy');
      const mm: number = +this.datePipe.transform(this.ficheAppelDto.dateDebut, 'MM');
      const dd: number = +this.datePipe.transform(this.ficheAppelDto.dateDebut, 'dd');
      this.dateDebutFicheAppel = new Date(yyyy, mm - 1, dd);
      this.heureDebutFicheAppel = this.datePipe.transform(this.ficheAppelDto.dateDebut, 'HHmm');
    } else {
      this.dateDebutFicheAppel = null;
      this.heureDebutFicheAppel = null;
    }

    if (this.ficheAppelDto?.dateFin) {
      const yyyy: number = +this.datePipe.transform(this.ficheAppelDto.dateFin, 'yyyy');
      const mm: number = +this.datePipe.transform(this.ficheAppelDto.dateFin, 'MM');
      const dd: number = +this.datePipe.transform(this.ficheAppelDto.dateFin, 'dd');
      this.dateFinFicheAppel = new Date(yyyy, mm - 1, dd);
      this.heureFinFicheAppel = this.datePipe.transform(this.ficheAppelDto.dateFin, 'HHmm');
    } else {
      this.dateFinFicheAppel = null;
      this.heureFinFicheAppel = null;
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
    const idUsagerIdent: number = this.ficheAppelDto?.usager?.usagerIdentification?.id;

    // On commence par créer un historique de l'usager lié à la fiche.
    this.subscription.add(
      this.usagerInfoSanteService.creerHistoriqueUsagerIdent(idUsagerIdent).subscribe((usagerIdentHistoDto: UsagerIdentHistoDTO) => {
        // Inscrit l'id de l'historique dans l'usager pour le sauvegarder .
        if (usagerIdentHistoDto) {
          this.ficheAppelDto.usager.idUsagerIdentHisto = usagerIdentHistoDto?.id;
        }
        // On termine la fiche. Le serveur attribuera le statut "F" à la fiche.
        this.subscription.add(
          this.ficheAppelApiService.terminerFicheAppel(this.ficheAppelDto).subscribe((ficheAppelDto: FicheAppelDTO) => {
            this.setFicheAppelDto(ficheAppelDto);

            // On vient de fermer une fiche d'appel, on demande d'interroger le nombre de fiches d'appel non terminées
            // afin de mettre à jour le "badge" dans le menu du haut.
            this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlSanteApi);

            // On rafraichit la liste des fiches d'appel afin d'obtenir les bons statuts.
            this.ficheAppelDataService.doRefreshListeFicheAppel();

            // Si un usager est présent et qu'il a donné son consentement à aviser les organismes enregistreurs.
            if (idUsagerIdent && ficheAppelDto.consentementenFicheEnregistreur) {
              // Lance la création (au besoin) des alertes pour les organismes enregistreurs.
              this.genererAlertes(ficheAppelDto);
            }

            if (ficheAppelDto?.usager?.usagerIdentification?.id) {
              this.subscription.add(this.usagerService.solrIndexUsagers([ficheAppelDto.usager.usagerIdentification.id]).subscribe(rs => {
              }));
            }

            // Navigation vers la consultation de la fiche
            this.router.navigate(["../" + SectionFicheAppelEnum.CONSULTATION], { relativeTo: this.activatedRoute });
          })
        );
      })
    );
  }

  /**
   * Valide la durée de la fiche avant d'effectuer la terminaison.
   * Une confirmation de l'utilisateur peut être nécessaire.
   */
  private validerDureeFicheAppel(dateDebut: Date, dateFin: Date, dureeRecommander: number, msgDureeCalculee: string): Observable<boolean> {
    if (dateDebut && dateFin) {
      const dureeCalculee: number = DateUtils.calculerNbSecondesBetween(dateDebut, dateFin);
      if (dureeCalculee > dureeRecommander) {
        // Durée calculée : La durée calculée de la fiche est supérieure à 1 heure. Désirez-vous continuer ?
        return this.materialModalDialogService.popupConfirmer(msgDureeCalculee);
      }
    }

    return of(true);
  }
}
