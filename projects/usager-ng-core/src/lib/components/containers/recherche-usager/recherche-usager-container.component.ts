import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { AgeDTO } from '../../../models/age-dto';
import { BaseUsagerDTO } from '../../../models/base-usager-dto';
import { EnregistrementsUsagerResultatDTO } from '../../../models/enregistrements-usager-resultat-dto';
import { ReferenceDTO } from '../../../models/reference-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { ReferencesService } from '../../../services/references.service';
import { UsagerFusionApiService } from '../../../services/usager-fusion-api.service';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { RechercheUsagerUiComponent } from '../../ui/recherche-usager-ui/recherche-usager-ui.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';




@Component({
  selector: 'sigct-usager-recherche',
  templateUrl: './recherche-usager-container.component.html',
  styleUrls: ['./recherche-usager-container.component.css'],
  providers: [DatePipe]
})

export class RechercheUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {
  public formTopBarOptions: FormTopBarOptions;

  public labelMenuTop: String = "Rechercher un usager";

  public listeSexe: ReferenceDTO[];
  public listeLangue: ReferenceDTO[];
  public listeRegion: ReferenceDTO[];

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Input("fusionEnabled")
  fusionEnabled: boolean = false;

  @Input()
  set inputInfobulleButtonFermer(value: string) {
    if (!StringUtils.isBlank(value)) {
      this.infobulleButtonFermer = value;
    }
  }
  private infobulleButtonFermer: string = "usager.bandeau.btnfermer2";

  @Input()
  infoAppelCti: InfoAppelCtiDTO = null;

  @Input()
  alerts: AlertModel[];

  @Output()
  consulterEnregistrementsUsager = new EventEmitter<number>();

  @Output("consulterUsager")
  consulterUsager = new EventEmitter<number>();

  @Output("editerUsager")
  editerUsager = new EventEmitter<number>();

  @Output("fusionnerUsager")
  fusionnerUsager: EventEmitter<number[]> = new EventEmitter();

  @Output("relierUsager")
  relierUsager = new EventEmitter<BaseUsagerDTO>();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  @ViewChild("appRechercheUsagerUi", { static: true })
  appRechercheUsagerUi: RechercheUsagerUiComponent;

  subscriptions: Subscription = new Subscription();

  private listeGroupeAge: ReferenceDTO[];

  //**Constructeur */
  constructor(
    private authenticationService: AuthenticationService,
    private usagerService: UsagerService,
    private usagerFusionApiService: UsagerFusionApiService,
    private referencesService: ReferencesService,
    private utilitaireService: UtilitaireService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService,
    private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.alertStore.resetAlert();

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );

    this.subscriptions.add(
      this.route.queryParamMap.subscribe(params => {
        const alert: string = params.get('alert');

        // Si alert est présent, on crée l'alert et l'affiche à l'écran.
        if (alert) {
          const msg: string = this.translateService.instant(alert);
          const label: string = this.translateService.instant("sigct.ss.error.label");
          const alerte: AlertModel = AlertModelUtils.createAlertModel([msg], label, AlertType.ERROR);
          this.alertStore.setAlerts([alerte]);
        }
      })
    );

    // Affiche les alertes poussées au composant.
    if (this.alerts) {
      this.alertStore.setAlerts(this.alerts);
    }

    /**
     * Lance un keep-alive pour s'assurer que l'authentification du module s'est bien effectuée avant de récupérer
     * le contenu des listes, sinon on obtient une erreur 401 au démarrage de l'application.
     */
    this.usagerService.keepAlive().subscribe(result => {
      // Alimente les listes de valeurs d'un bloc.
      // ForkJoin lance les traitements en parallèle et effectue le subscribe quand ils sont tous terminés.
      forkJoin([
        this.referencesService.getListeSexe(),
        this.referencesService.getListeRegion(),
        this.referencesService.getListeLangue(),
        this.referencesService.getListeGroupeDAge()
      ]).subscribe(result => {
        this.listeSexe = result[0] as ReferenceDTO[];
        this.listeRegion = result[1] as ReferenceDTO[];
        this.listeLangue = result[2] as ReferenceDTO[];
        this.listeGroupeAge = result[3] as ReferenceDTO[];

        this.appRechercheUsagerUi.initRecherche();
      });
    });

    let topBarActions: Action[] = [];
    if (this.authenticationService.hasAnyRole(["ROLE_US_USAGER_MODIF"])) {
      this.translateService.get("usager.bandeau.btnajouter").subscribe((libelle: string) => {
        let actionAjouter: Action = {
          label: libelle,
          actionFunction: this.creer,
          compId: 'enregistrerBtn',
          extraClass: "btn-primary form-btn"
        };
        topBarActions.push(actionAjouter);
      });
    }

    if (this.boutonFermerDialogVisible) {
      let actionFermer: Action = {
        tooltip: this.translateService.instant(this.infobulleButtonFermer),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      }
      topBarActions.push(actionFermer);
    }

    this.formTopBarOptions = {
      title: { icon: "fa fa-search fa-lg" },
      actions: topBarActions
    };
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  /**
   * Création d'un usager et redirection vers l'inteface d'édition.
   */
  creer = (): void => {
    // Mémorisation des critères de recherche afin de renseigner les champs saisis dans la page édition usager
    this.usagerService.sauvegarderCritereRecherche(this.appRechercheUsagerUi.getCriteresRecherche());

    this.subscriptions.add(
      this.usagerService.creerUsager().subscribe((usagerIdent: UsagerDTO) => {
        this.editerUsager.emit(usagerIdent.id);
      })
    );
  }

  /**
   * Vérifie si les 2 usagers sont actifs.
   * @param idUsager1
   * @param idUsager2
   * @returns true si les 2 usagers sont actifs
   */
  private validerUsagersActifs(idUsager1: number, idUsager2: number): Observable<boolean> {
    return forkJoin([
      this.usagerService.getUsager(idUsager1),
      this.usagerService.getUsager(idUsager2),
    ]).pipe(map(results => {
      const usager1: UsagerDTO = results[0] as UsagerDTO;
      const usager1Actif: boolean = usager1.actif;

      const usager2: UsagerDTO = results[1] as UsagerDTO;
      const usager2Actif: boolean = usager2.actif;

      if (!usager1Actif || !usager2Actif) {
        // Vous ne pouvez pas fusionner ces usagers, car au moins l'un d'entre eux est inactif.
        this.materialModalDialogService.popupAvertissement("us-iu-a30006").subscribe();

        return false;
      }

      return true;
    }));
  }

  /**
   * Vérifie si les 2 usager ne sont pas reliés à une fiche d'appel ouverte.
   * @param idUsager1
   * @param idUsager2
   * @returns true si les 2 usager ne sont pas reliés à une fiche d'appel ouverte
   */
  private validerUsagersNonReliesFicheAppelOuverte(idUsager1: number, idUsager2: number): Observable<boolean> {
    return forkJoin([
      this.usagerFusionApiService.getNombreFicheAppelOuverteByIdUsagerIdent(idUsager1),
      this.usagerFusionApiService.getNombreFicheAppelOuverteByIdUsagerIdent(idUsager2),
    ]).pipe(map(results => {
      let nbFicheAppelUsager1: number = results[0] as number;
      let nbFicheAppelUsager2: number = results[1] as number;

      if ((nbFicheAppelUsager1 + nbFicheAppelUsager2) > 0) {
        // Un des usagers est présentement relié à une fiche en cours. Veuillez recommencer plus tard.
        this.materialModalDialogService.popupAvertissement("us-iu-a30008").subscribe();

        return false;
      }

      return true;
    }));
  }

  /**
   * Vérifie si les 2 usagers ne possèdent aucune enregistrement actif.
   * @param idUsager1
   * @param idUsager2
   * @returns true si les 2 usagers ne possèdent aucune enregistrement actif
   */
  private validerUsagersPossedentAucunEnregistrementActif(idUsager1: number, idUsager2: number): Observable<boolean> {
    return forkJoin([
      this.usagerService.getEnregistrementsUsager(idUsager1),
      this.usagerService.getEnregistrementsUsager(idUsager2),
    ]).pipe(map(results => {
      const enregUsager1: EnregistrementsUsagerResultatDTO[] = results[0] as EnregistrementsUsagerResultatDTO[];
      const nbEnregUsager1: number = enregUsager1.filter((enreg: EnregistrementsUsagerResultatDTO) => enreg.actif).length;

      const enregUsager2: EnregistrementsUsagerResultatDTO[] = results[1] as EnregistrementsUsagerResultatDTO[];
      const nbEnregUsager2: number = enregUsager2.filter((enreg: EnregistrementsUsagerResultatDTO) => enreg.actif).length;

      if (nbEnregUsager1 > 0 && nbEnregUsager2 > 0) {
        // Vous ne pouvez pas fusionner ces usagers car ils ont tous les deux un enregistrement actif.
        this.materialModalDialogService.popupAvertissement("us-iu-a30005").subscribe();

        return false;
      }

      return true;
    }));
  }

  /**
   * Vérifie si la fusion des 2 usagers est possible. La fusion est possible si :
   * - les deux usagers sont actifs
   * - les deux usagers ne sont pas liés à une fiche d'appel ouverte
   * - les deux usagers ne possèdent pas une fiche d'enregistrement active
   * @param idUsager1
   * @param idUsager2
   * @returns true si la fusion des 2 usagers est possible
   */
  private validerFusion(idUsager1: number, idUsager2: number): Observable<boolean> {
    return this.validerUsagersActifs(idUsager1, idUsager2).pipe(
      concatMap((isUsagersActifs: boolean) => {
        if (isUsagersActifs) {
          return this.validerUsagersNonReliesFicheAppelOuverte(idUsager1, idUsager2);
        }
        return of(false);
      }),
      concatMap((isUsagersNonReliesFicheAppelOuverte: boolean) => {
        if (isUsagersNonReliesFicheAppelOuverte) {
          return this.validerUsagersPossedentAucunEnregistrementActif(idUsager1, idUsager2);
        }
        return of(false);
      })
    );

    // return this.validerUsagersActifs(idUsager1, idUsager2).pipe(
    //   filter(isUsagersActifs => isUsagersActifs),
    //   switchMap(() => this.validerUsagersNonReliesFicheAppelOuverte(idUsager1, idUsager2)),
    //   filter(isUsagersNonReliesFicheAppelOuverte => isUsagersNonReliesFicheAppelOuverte),
    //   switchMap(() => this.validerUsagersPossedentAucunEnregistrementActif(idUsager1, idUsager2)),
    // );
  }

  /**
   * Avise le parent qu'on désire consulter les enregistrement de l'usager
   * @param idUsagerIdent identifiant de l'usager
   */
  onConsulterEnregistrementsUsager(idUsagerIdent: number): void {
    this.consulterEnregistrementsUsager.emit(idUsagerIdent);
  }

  /**
   * Avise le parent qu'on désire consulter un usager
   * @param event identifiant de l'usager à consulter
   */
  onConsulterUsager(event: number): void {
    this.consulterUsager.emit(event);
  }

  /**
   * Avise le parent qu'on désire éditer un usager
   * @param event identifiant de l'usager à éditer
   */
  onEditerUsager(event: number): void {
    this.editerUsager.emit(event);
  }

  /**
   * Avise le parent qu'on désire fusionner des usagers
   * @param event identifiants des usagers à fusionner
   */
  onFusionnerUsager(event: number[]): void {
    this.subscriptions.add(
      this.validerFusion(event[0], event[1]).subscribe((result: boolean) => {
        if (result) {
          this.fusionnerUsager.emit(event);
        }
      })
    );
  }

  /**
   * Avise le parent qu'on désire relier un usager
   * @param usager usager à relier
   */
  onRelierUsager(usager: UsagerDTO): void {
    if (!usager.groupeAgeOptions && usager.dtNaiss) {
      // Calcule l'âge de l'usager avant de le relier.
      this.subscriptions.add(
        this.utilitaireService.getAgeParDateNaissance(usager.dtNaiss.toLocaleString()).subscribe((age: AgeDTO) => {
          const referenceGroupeAge: ReferenceDTO = this.getReferenceGroupeAge(age);
          usager.groupeAgeOptions = new GroupeAgeOptions();
          usager.groupeAgeOptions.groupeId = referenceGroupeAge?.id;
          usager.groupeAgeOptions.dateNaissance = usager.dtNaiss;
          usager.groupeAgeOptions.annees = age.years ? age.years + "" : null;
          usager.groupeAgeOptions.mois = age.months ? age.months + "" : null;
          usager.groupeAgeOptions.jours = age.days;
          this.relierUsager.emit(usager);
        })
      );
    } else {
      this.relierUsager.emit(usager);
    }
  }

  private getReferenceGroupeAge(age: AgeDTO): ReferenceDTO {
    const totalMois: number =
      (age.years ? age.years * 12 : 0)
      + (age.months ? age.months : 0)
      + (age.days ? age.days / 30 : 0);
    return this.listeGroupeAge.find(
      item => (item.min && item.min <= totalMois) && (!item.max || totalMois <= item.max)
    );
  }

}

