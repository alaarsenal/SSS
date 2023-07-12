import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { AppelDTO } from 'projects/infosante-ng-core/src/lib/models/appel-dto';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelPageEnum } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-page-enum';
import { ProjetRechercheDTO } from 'projects/infosante-ng-core/src/lib/models/projet-recherche-dto';
import { EnumUrlPageFicheAppel } from 'projects/infosante-ng-core/src/lib/models/url-page-fiche-appel-enum';
import { ValidationFinInterventionDTO } from 'projects/infosante-ng-core/src/lib/models/validation-fin-intervention-dto';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ProjetRechercheService } from 'projects/infosante-ng-core/src/lib/services/projet-recherche.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { StatistiquesService } from 'projects/infosante-ng-core/src/lib/services/statistiques.service';
import { ValidationService } from 'projects/infosante-ng-core/src/lib/services/validation.service';
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
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { ServicesUtilisesDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/services-utilises/services-utilises-dto';
import { ServicesUtilisesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/services-utilises/services-utilises.component';
import { StatistiquesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/statistiques/statistiques.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { GenererAlerteFicheDTO, ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerAlerteFicheApiService } from 'projects/usager-ng-core/src/lib/services/usager-alerte-fiche-api.service';
import { UsagerInfoSanteService } from 'projects/usager-ng-core/src/lib/services/usager-info-sante.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { EMPTY, Observable, Subscription, forkJoin, iif, of } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { UsagerApiService } from '../../../../services/usager-api.service';
import { ValidationFinInterventionComponent } from '../../../ui/validation-fin-intervention/validation-fin-intervention.component';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';


@Component({
  selector: 'terminaison-page',
  templateUrl: './terminaison-page.component.html',
  styleUrls: ['./terminaison-page.component.css']
})
export class TerminaisonPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  ficheAppel = new FicheAppelDTO();
  appelDTO = new AppelDTO();

  idAppel: number;

  private existsSexeUsagerLie: boolean = false;

  @ViewChild('appDureeFicheAppel', { static: true })
  appDureeFicheAppel: DureeFicheAppelComponent;

  @ViewChild('appValidationFinIntervention', { static: true })
  appValidationFinIntervention: ValidationFinInterventionComponent;

  @ViewChild('appServicesUtilises', { static: true })
  appServicesUtilises: ServicesUtilisesComponent;

  referencesValidations: ReferenceDTO[];
  referencesRaisonCpInconnus: ReferenceDTO[];
  referencesCategoriesAppelant: ReferenceDTO[];

  validationFinInterventionDTO = new ValidationFinInterventionDTO();
  servicesUtilisesDTO: ServicesUtilisesDTO;

  dureeFicheAppelDto: DureeFicheAppelDTO = new DureeFicheAppelDTO();
  msgConfirmerDureePopup: string = ""; // Message affiché dans le popup de confirmation

  private subscription: Subscription = new Subscription();

  listeReferenceRaison: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  listeReferenceRole: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  private abonnementSave: Subscription;
  private abonnementLangue: Subscription;
  private abonnementCentreActivite: Subscription;

  public isLangueValide: boolean = true;
  public isCentreActiviteValide: boolean = true;

  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppel.TERMINAISON;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private ficheAppelDataService: FicheAppelDataService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelChronoService: FicheAppelChronoService,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private usagerApiService: UsagerApiService,
    private usagerInfoSanteService: UsagerInfoSanteService,
    private usagerAlerteFicheApiService: UsagerAlerteFicheApiService,
    private referenceApiService: ReferencesApiService,
    private projetRechercheService: ProjetRechercheService,
    private statistiquesService: StatistiquesService,
    private validationService: ValidationService,
    private appelService: AppelApiService,
    private usagerService: UsagerService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    // On souscrit au démarrage du chrono.
    this.subscriptions.add(
      this.ficheAppelChronoService.onStartChrono().subscribe((ficheAppelChronoDto: FicheAppelChronoDTO) => {
        // Maj l'affichage du chrono
        this.chargerDureeFicheAppel(ficheAppelChronoDto.idFicheAppel);
      })
    );

    this.subscription.add(
      forkJoin([
        this.translateService.get("option.select.message"),
        this.referenceApiService.getListeRaisonAppel(false),
        this.referenceApiService.getListeRoleAction(false)
      ]).subscribe(results => {
        let valeurLibelleSelectionnez: string = "option.select.message";
        if (results[0]) {
          valeurLibelleSelectionnez = results[0] as string;
        }
        if (results[1]) {
          this.listeReferenceRaison = results[1] as ReferenceDTO[];;
        }
        if (results[2]) {
          this.listeReferenceRole = results[2] as ReferenceDTO[];;
        }
        this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
      })
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }
    if (this.abonnementSave) {
      this.abonnementSave.unsubscribe();
    }
    if (this.abonnementLangue) {
      this.abonnementLangue.unsubscribe();
    }
    if (this.abonnementCentreActivite) {
      this.abonnementCentreActivite.unsubscribe();
    }
  }

  //Conteneur pour la liste de valeurs
  public inputOptionsLangue: InputOptionCollection = {
    name: "langues",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionsCentreActivite: InputOptionCollection = {
    name: "centres",
    options: []
  };


  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (this.ficheAppel.statut == StatutFicheAppelEnum.OUVERT) {
      this.ficheAppelApiService.autoSaveFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    this.appValidationFinIntervention.setFocusOnRouting();

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
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    this.alertStore.setState([]);
    let idFicheAppel: number = this.ficheAppelDataService.getIdFicheAppelActive();
    this.chargerDonnees(idFicheAppel);
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
    this.appValidationFinIntervention.resetChampsValides();
    this.appStatistiques.resetChampsValides();
    this.subscription.add(
      this.doSave(true).subscribe()
    );
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
          const codePostalUsagerInconnu: boolean = this.appValidationFinIntervention?.validationFinIntervention?.codePostalUsagerInconnu;
          const sexeUsagerLieInconnu: boolean = !this.existsSexeUsagerLie;
          const dateNaissanceUsagerLie: Date = this.ficheAppel.usager?.usagerIdentification?.dtNaiss;

          // Valide la possibilité de terminer la fiche.
          return this.ficheAppelApiService.validerFicheAppelPourTerminer(idFicheAppel, codePostalUsagerInconnu, sexeUsagerLieInconnu, dateNaissanceUsagerLie);
        }),
        concatMap((dto: FicheAppelDTO) => {
          if (dto.erreursFinales) {
            // Il reste des erreurs, on affiche les erreurs et on arrête le traitement.
            this.afficheMessageErreurTerminer(dto.erreursFinales);

            // Redémarre le chrono
            this.startChrono();
          } else {
            // Affiche message de validation de la durée.
            // sa-iu-a30005=La durée calculée est supérieure à 1 heures. Désirez-vous continuer?
            // sa-iu-a30006=La durée corrigée est supérieure à 1 heures. Désirez-vous continuer?
            // sa-iu-a30007=La durée chronométrée est supérieure à 1 heures. Désirez-vous continuer?
            if (this.appDureeFicheAppel.validerDureeFicheAppelBeforeTerminer(3600, 'sa-iu-a30006', 'sa-iu-a30005', 'sa-iu-a30007')) {
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
      this.usagerInfoSanteService.creerHistoriqueUsagerIdent(idUsagerIdent).subscribe((usagerIdentHistoDto: UsagerIdentHistoDTO) => {
        // Inscrit l'id de l'historique dans l'usager pour le sauvegarder .
        if (usagerIdentHistoDto) {
          this.ficheAppel.usager.idUsagerIdentHisto = usagerIdentHistoDto?.id;
        }

        // Indique si on ferme la dernière fiche ouverte de l'appel
        const isFermerDerniereFiche: boolean = this.ficheAppelDataService.getNbFicheAppelOuverte() == 1 && this.ficheAppel.statut == StatutFicheAppelEnum.OUVERT;

        // On termine la fiche. Le serveur attribuera une date de fin et le statut "F" à la fiche.
        this.subscription.add(
          this.ficheAppelApiService.terminerFicheAppel(this.ficheAppel).subscribe((ficheAppelDto: FicheAppelDTO) => {
            this.ficheAppel = ficheAppelDto;

            // On vient de fermer une fiche d'appel, on demande d'interroger le nombre de fiches d'appel non terminées
            // afin de mettre à jour le "badge" dans le menu du haut.
            this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlSanteApi);

            // On rafraichit la liste des fiches d'appel afin d'obtenir les bons statuts.
            this.ficheAppelDataService.doRefreshListeFicheAppel();

            // Si l'usager a donné son consentement à aviser les organismes enregistreurs.
            if (idUsagerIdent && ficheAppelDto.consentementenFicheEnregistreur) {
              // Lance la création (au besoin) des alertes pour les organismes enregistreurs.
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

  private chargerDonnees(idFicheAppel: number): void {
    this.subscription.add(
      forkJoin([
        this.referenceApiService.getListeLangueAppel(),
        this.referenceApiService.getListeCentreActivite(),
        this.ficheAppelApiService.getFicheAppel(idFicheAppel)
      ]).subscribe(results => {
        let valeurLibelleSelectionnez: string = this.translateService.instant("option.select.message");
        if (results[0]) {
          const refLangues: ReferenceDTO[] = results[0] as ReferenceDTO[];
          this.inputOptionsLangue.options = [{ label: valeurLibelleSelectionnez, value: null }];
          refLangues.forEach(item => {
            this.inputOptionsLangue.options.push({ label: item.nom, value: item.code, description: item.description });
          });
        }
        if (results[1]) {
          const refCentreAct: ReferenceDTO[] = results[1] as ReferenceDTO[];
          this.inputOptionsCentreActivite.options = [{ label: valeurLibelleSelectionnez, value: null }];
          refCentreAct.forEach(item => {
            let labelStr: string = item.nom;
            if (item.codeCn) {
              labelStr = item.codeCn + ' - ' + labelStr;
            }
            this.inputOptionsCentreActivite.options.push({ label: labelStr, value: item.code, description: item.description });
          });
        }
        const ficheAppel: FicheAppelDTO = results[2];
        if (ficheAppel) {
          this.ficheAppel = ficheAppel;
          this.chargerValidationFinIntervention(true);
          this.chargerServicesUtilises();
          this.chargerDureeFicheAppel(ficheAppel.id);

          if (ficheAppel.usager?.usagerIdentification?.id) {
            this.subscription.add(
              this.usagerApiService.existsSexeUsager(ficheAppel.usager.usagerIdentification.id).subscribe((exists: boolean) => {
                this.existsSexeUsagerLie = exists;
              })
            );
          }
        }
      })
    );
    /******************************************************************************************************* */
    /* Projet Recherhe                                                                                       */
    /******************************************************************************************************* */
    this.majListeProjetRecherche(idFicheAppel);
    /******************************************************************************************************* */
    /* Fin projet recherche                                                                                  */
    /******************************************************************************************************* */

    /******************************************************************************************************* */
    /* Raison Intervention                                                                                   */
    /******************************************************************************************************* */
    this.majListeRaisonAppel(idFicheAppel);
    /******************************************************************************************************* */
    /* Fin Raison Intervention                                                                               */
    /******************************************************************************************************* */

    /******************************************************************************************************* */
    /* Role Action                                                                                           */
    /******************************************************************************************************* */
    this.majListeRoleAction(idFicheAppel);
    /******************************************************************************************************* */
    /* Fin Role Action                                                                                       */
    /******************************************************************************************************* */

    this.chargerAppel(this.ficheAppelDataService.getIdAppel());


  }

  private chargerAppel(idAppel: number): void {
    this.subscription.add(
      this.appelService.obtenirAppel(idAppel).subscribe(appel => {
        if (appel) {
          this.appelDTO = appel;
          this.idAppel = idAppel;
        }
      })
    );
  }

  private chargerServicesUtilises(): void {
    this.servicesUtilisesDTO = {
      servicesInterprete: this.ficheAppel.servicesInterprete ? this.ficheAppel.servicesInterprete.toString() : "0",
      servicesRelaisBell: this.ficheAppel.servicesRelaisBell ? this.ficheAppel.servicesRelaisBell.toString() : "0",
      detailsInterprete: this.ficheAppel.detailsInterprete,
      detailsRelaisBell: this.ficheAppel.detailsRelaisBell
    }
  }

  private chargerValidationFinIntervention(init: boolean): void {

    if (this.ficheAppel.usager
      && this.ficheAppel.usager.usagerIdentification
      && this.ficheAppel.usager.usagerIdentification.id) {
      this.subscription.add(
        this.usagerInfoSanteService.existsCodePostalUsager(this.ficheAppel.usager.usagerIdentification.id)
          .subscribe(result => {
            this.ficheAppel.codePostalUsagerInconnu = !result;
            this.chargerDonneesValidationFinIntervention(init);
          })
      );
    } else {
      this.ficheAppel.codePostalUsagerInconnu = false;
      this.chargerDonneesValidationFinIntervention(init);
    }
  }

  private chargerDonneesValidationFinIntervention(init: boolean): void {
    if (init) {
      this.subscription.add(
        forkJoin([
          this.referenceApiService.getListeValidation(),
          this.referenceApiService.getListeRaisonCpInconnu(),
          this.referenceApiService.getListeCategorieAppelant(),
          this.validationService.findAllByIdFicheAppel(this.ficheAppel.id)
        ]).subscribe(results => {
          this.referencesValidations = results[0] as ReferenceDTO[];
          this.referencesRaisonCpInconnus = results[1] as ReferenceDTO[];
          this.referencesCategoriesAppelant = results[2] as ReferenceDTO[];
          this.validationFinInterventionDTO = this.createValidationFinIntervention(results[3]);
        })
      );
    } else {
      this.subscription.add(
        this.validationService.findAllByIdFicheAppel(this.ficheAppel.id).subscribe(results => {
          this.validationFinInterventionDTO = this.createValidationFinIntervention(results);
        })
      );
    }
  }

  private createValidationFinIntervention(validationList: ValidationDTO[]): ValidationFinInterventionDTO {
    return {
      validations: validationList,
      codeRefRaisonCpInconnu: this.ficheAppel.referenceRaisonCPInconnuCode,
      codeRefCategorieAppelant: this.ficheAppel.referenceCatgrAppelantConclusionCode,
      details: this.ficheAppel.detailsValidation,
      codePostalUsagerInconnu: this.ficheAppel.codePostalUsagerInconnu,
      opinionProf: '',
      labelServicesInterprete: '',
      labelServicesRelaisBell: '',
      labelDateDebutFiche: '',
      dateDebutFiche: new Date(),
      labelDateFinFiche: '',
      labelDureeCorrigee: '',
      detailsDureeCorrigee: '',
      dateFinFiche: new Date()
    };
  }

  private doSave(avecAlerte: boolean): Observable<true> {
    //Vider les alertes déjà présentes
    this.alertStore.setState([]);

    if (avecAlerte) {
      this.validerProjetRecherche();
      this.validerRaisonAppel();
      this.validerRoleAction();
    }

    // Transfert dans la fiche d'appel les données de la section Validation de fin d'intervention.
    this.transfererDonneesValidationFinIntervention();

    // Transfert dans la fiche d'appel les données de la section Durée de la fiche.
    this.transfererDonneesDureeFicheAppel();

    // Transfert dans la fiche d'appel les données de la section Services utilisés.
    this.transfererDonneesServicesUtilises();

    return forkJoin([
      this.doSaveAppValidationFinIntervention(),
      this.ficheAppelApiService.updateFicheAppel(this.ficheAppel, this.pageApiUpdateEndPoint)]).pipe(
        map((resultats) => {
          if (resultats[0]) {
            if (avecAlerte) {
              const aux = CollectionUtils.sortByKey(resultats[0], "idReferenceValidation");
              aux.forEach(validation => {
                this.afficheMessageValidationFinales(validation.validationsFinales);
                this.afficheMessageAvertissements(validation.avertissements);
              });
            }
          }

          if (resultats[1]) {
            const ficheAppelDto: FicheAppelDTO = resultats[1];

            this.ficheAppel = ficheAppelDto;

            if (avecAlerte) {
              this.afficherMessageSauvegardeReussie();
              this.afficheMessageValidationFinales(ficheAppelDto.validationsFinales);
              this.afficheMessageAvertissements(ficheAppelDto.avertissements);
            }
          }

          this.chargerValidationFinIntervention(false);

          return true;
        },
          (err: any) => {
            console.error(err);
            return false;
          })
      );
  }

  private doSaveAppValidationFinIntervention(): Observable<ValidationDTO[]> {
    const validationFinIntervention: ValidationFinInterventionDTO = this.appValidationFinIntervention.validationFinIntervention;
    return this.validationService.saveAll(validationFinIntervention?.validations, this.ficheAppel?.typeConsultation);
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
   * Transfert dans la fiche d'appel les données de la section Validation de fin d'intervention.
   */
  private transfererDonneesValidationFinIntervention(): void {
    const validationFinIntervention: ValidationFinInterventionDTO = this.appValidationFinIntervention.validationFinIntervention;
    if (validationFinIntervention) {
      this.ficheAppel.referenceRaisonCPInconnuCode = validationFinIntervention.codeRefRaisonCpInconnu;
      this.ficheAppel.referenceCatgrAppelantConclusionCode = validationFinIntervention.codeRefCategorieAppelant;
      this.ficheAppel.detailsValidation = validationFinIntervention.details;
    }
  }

  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    let title = this.translateService.instant("ss.msg.succes.confirmation");
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    let alertModel: AlertModel = AlertModelUtils.createAlertModel(msg, title, AlertType.SUCCESS);
    if (alertModel) {
      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertModel));
      } else {
        this.alertStore.setState([alertModel]);
      }
    }
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

  private afficheMessageAvertissementsFromArray(avertissements: string[]): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModel(avertissements, "Avertissements", AlertType.WARNING);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private afficheMessageErreursFromArray(erreurs: string[]): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreurs, "Message d'erreur :", AlertType.ERROR);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private afficheMessageErreurTerminer(erreursFinales: Map<string, string[]>): void {
    this.alertStore.setState([]);
    if (erreursFinales) {
      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_DEMANDE_EVALUATION])) {
        const titre = this.translateService.instant("sigct.ss.f_appel.sa.btndemeval"); //Demande et évaluation
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_DEMANDE_EVALUATION], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT])) {
        const titre = this.translateService.instant("sigct.ss.f_appel.us.btnusager"); //Usager
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_USAGER_APPELANT], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_INTERVENTION])) {
        const titre = this.translateService.instant("sigct.ss.f_appel.sa.btnintrvtn"); //Intervention
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_INTERVENTION], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }

      if (CollectionUtils.isNotBlank(erreursFinales[FicheAppelPageEnum.PAGE_TERMINAISON])) {
        const titre = this.translateService.instant("sigct.ss.f_appel.sa.btnterminaison"); //Terminaison
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(erreursFinales[FicheAppelPageEnum.PAGE_TERMINAISON], titre, AlertType.ERROR);
        if (alertModel) {
          this.alertStore.setState(this.alertStore.state.concat(alertModel));
        }
      }
    }
  }

  /***************************************************************************************************************************/
  /* Le code suivant devra être déplacer dans la page de Terminaison                                                         */
  /***************************************************************************************************************************/

  //@ViewChild('projetrecherche', { static: true }) private appProjetRecherche: ProjetRechercheComponent;
  public listeProjetRecherche: Array<ProjetRechercheDTO> = new Array<ProjetRechercheDTO>();


  //Alimente la liste des démarches antérieures : Autosoins au chargement.
  majListeProjetRecherche(idFicheAppel: number): void {

    this.subscription.add(
      this.projetRechercheService.getListeProjetRecherche(idFicheAppel).subscribe((projetRecherches: ProjetRechercheDTO[]) => {
        this.listeProjetRecherche = projetRecherches;
      })

    );
  }

  /**
  * Enregistre dans la BD une démarche antérieure de transfert.
  * @param prj Objet de transfert d'un projet de recherche
  */
  onProjetRechercheSave(prj: ProjetRechercheDTO) {



    if (prj.valid) {

      if (prj.id == null) {

        prj.idFicheAppel = this.ficheAppel.id;

        this.subscription.add(this.projetRechercheService.ajouterProjetRecherche(this.ficheAppel.id, prj).subscribe(() => {
          this.majListeProjetRecherche(this.ficheAppel.id);
          this.appValidationFinIntervention.getProjetRechercheComponent().reinitialiserProjetRecherche();
          this.appValidationFinIntervention.getProjetRechercheComponent().projetRecherche.valid = true;
          this.appValidationFinIntervention.getProjetRechercheComponent().projetRecherche.id = null;

          if (CollectionUtils.isBlank(this.alertStore.state)) {
            this.naviguerSection('validationFinInterventione');
          }


        }, () => {


        }));

      }


    }


  }


  /**
   * Exécute l'événement de suppression d'un projet de recherche
   * @param prj object de transfert d'un projet de recherche
   */
  onProjetRechercheDelete(prj: ProjetRechercheDTO) {

    this.subscription.add(this.projetRechercheService.supprimerProjetRecherche(this.ficheAppel.id, +prj.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeProjetRecherche(this.ficheAppel.id);
      this.naviguerSection('validationFinIntervention');

      this.alertStore.resetAlert();


    }, () => {

    }));

    this.appValidationFinIntervention.getProjetRechercheComponent().reinitialiserProjetRecherche();

  }

  /**
   * Permet de se déplacer dans la page sans faire de soumission en cas d'erreur ou de succès.
   * @param anchor
   */
  private naviguerSection(anchor: string): void {
    const element = document.querySelector("#" + anchor);
    if (element) { element.scrollIntoView(true); }
  }


  /***************************************************************************************************************************/
  /* Fin code pour Terminaison                                                                                               */
  /***************************************************************************************************************************/

  private validerProjetRecherche() {
    if (this.appValidationFinIntervention.getProjetRechercheComponent()) {

      this.subscription.add(
        this.projetRechercheService.validerProjetRecherche(this.ficheAppel.id, this.appValidationFinIntervention.getProjetRechercheComponent().projetRecherche).subscribe(dto => {

          if (dto) {
            this.afficheMessageAvertissements(dto.validationsFinales);
          }
          // this.chargerValidationFinIntervention(false);
        })
      );

    }
  }


  /*************************************** Commun à la région Statistiques****************************************************/
  @ViewChild('appStatistiques', { static: true }) private appStatistiques: StatistiquesComponent;


  /***************************************************************************************************************************/
  /* Section Raison Appel                                                                                                    */
  /***************************************************************************************************************************/

  public listeRaisonAppel: Array<RaisonAppelDTO> = new Array<RaisonAppelDTO>();


  //Alimente la liste des raisons d'intervention
  majListeRaisonAppel(idFicheAppel: number): void {

    this.subscription.add(
      this.statistiquesService.getListeRaisonAppel(idFicheAppel).subscribe((raisonAppel: RaisonAppelDTO[]) => {
        this.listeRaisonAppel = raisonAppel;
      })

    );
  }

  /**
  * Enregistre dans la BD une raison d'intervention.
  * @param raisonAppelDto Objet de transfert d'une raison d'intervention
  */
  onRaisonAppelSave(raisonAppelDto: RaisonAppelDTO) {

    if (raisonAppelDto.valid) {

      if (raisonAppelDto.id == null) {

        raisonAppelDto.idFicheAppel = this.ficheAppel.id;

        this.subscription.add(this.statistiquesService.ajouterRaisonAppel(this.ficheAppel.id, raisonAppelDto).subscribe((dto: RaisonAppelDTO) => {
          this.majListeRaisonAppel(this.ficheAppel.id);
          this.appStatistiques.reinitialiserRaisonAppel();

          this.afficheMessageAvertissements(dto.avertissements);
          this.afficheMessageValidationFinales(dto.validationsFinales);

          if (CollectionUtils.isBlank(this.alertStore.state)) {
            this.naviguerSection('statistiques');
          }
        }, () => {

        }));
      }
    }
  }


  /**
   * Exécute l'événement de suppression d'une raison d'intervention
   * @param raisonAppelDto object de transfert d'une raison d'intervention
   */
  onRaisonAppelDelete(raisonAppelDto: RaisonAppelDTO) {

    this.subscription.add(this.statistiquesService.supprimerRaisonAppel(this.ficheAppel.id, +raisonAppelDto.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeRaisonAppel(this.ficheAppel.id);
      this.naviguerSection('statistiques');

      this.alertStore.resetAlert();
    }, () => {

    }));

    this.appStatistiques.reinitialiserRaisonAppel();

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



  /***************************************************************************************************************************/
  /* Fin code pour Raison Appel                                                                                              */
  /***************************************************************************************************************************/

  /***************************************************************************************************************************/
  /* Section Role Action                                                                                                   */
  /***************************************************************************************************************************/

  public listeRoleAction: Array<RoleActionDTO> = new Array<RoleActionDTO>();


  //Alimente la liste des roles-action
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

        this.subscription.add(this.statistiquesService.ajouterRoleAction(this.ficheAppel.id, roleActionDto).subscribe((dto: RoleActionDTO) => {
          this.majListeRoleAction(this.ficheAppel.id);
          this.appStatistiques.reinitialiserRoleAction();

          this.afficheMessageAvertissements(dto.avertissements);
          this.afficheMessageValidationFinales(dto.validationsFinales);

          if (CollectionUtils.isBlank(this.alertStore.state)) {
            this.naviguerSection('statistiques');
          }
        }, () => {


        }));
      }
    }
  }


  /**
   * Exécute l'événement de suppression d'un role action
   * @param roleActionDto object de transfert d'un role action
   */
  onRoleActionDelete(roleActionDto: RoleActionDTO) {

    this.subscription.add(this.statistiquesService.supprimerRoleAction(this.ficheAppel.id, +roleActionDto.id).subscribe(() => {
      //Met à jour la liste dans la vue.
      this.majListeRoleAction(this.ficheAppel.id);
      this.naviguerSection('statistiques');

      this.alertStore.resetAlert();
    }, () => {

    }));

    this.appStatistiques.reinitialiserRoleAction();

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



  /***************************************************************************************************************************/
  /* Fin code pour Role Action                                                                                               */
  /***************************************************************************************************************************/

  onLangueChange($event) {
    this.isLangueValide = true;
  }

  onCentreActiviteChange($event) {
    this.isCentreActiviteValide = true;
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

  /**
   * Transfère les données présentes dans le composant DureeFicheAppelComponent vers la fiche d'appel.
   */
  private transfererDonneesDureeFicheAppel(): void {
    const dureeFicheAppelDto: DureeFicheAppelDTO = this.appDureeFicheAppel.getDureeFicheAppelDTO();
    if (dureeFicheAppelDto) {
      this.ficheAppel.dureeCorrigee = dureeFicheAppelDto.dureeCorrigee;
      this.ficheAppel.dureeCumulee = dureeFicheAppelDto.dureeCumulee;
      this.ficheAppel.detailsDureeCorrigee = dureeFicheAppelDto.detailsDureeCorrigee;
    } else {
      this.ficheAppel.dureeCorrigee = null;
      this.ficheAppel.dureeCumulee = null;
      this.ficheAppel.detailsDureeCorrigee = null;
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
