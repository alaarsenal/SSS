import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AgeUtils from 'projects/sigct-service-ng-lib/src/lib/utils/age-utils';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { RrssParamsUrl } from 'projects/sigct-ui-ng-lib/src/lib/components/rrss/rrss-params-url';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsagerCommDTO, UsagerLieuResidenceDTO } from '../../../models';
import { AgeDTO } from '../../../models/age-dto';
import { BaseUsagerDTO } from '../../../models/base-usager-dto';
import { ReferenceDTO } from '../../../models/reference-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { ReferencesService } from '../../../services/references.service';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { ConsulterUiComponent } from '../../ui/consulter-ui-component/consulter-ui-component.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';





@Component({
  selector: 'sigct-usager-consultation',
  templateUrl: './consulter-usager-container.component.html',
  styleUrls: ['./consulter-usager-container.component.css']
})
export class ConsulterUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {
  private idUsager: number = null;

  public listeGroupeDAge: Array<ReferenceDTO>;
  public listUsagerCommunications: Array<UsagerCommDTO>;
  public listeSexe: Array<ReferenceDTO>;
  public listeLieuResidence: Array<UsagerLieuResidenceDTO>;
  public usagerDTO: UsagerDTO;
  public ageDTO: AgeDTO;
  public idAppel: number;
  public ficheAppelDTO: FicheAppelDTO = new FicheAppelDTO();
  public isCodeCatgLienValid: Boolean = true;
  public inputOptionCategoriesAppelant: InputOptionCollection = {
    name: "categoriesAppelant",
    options: []
  }

  @Input("idUsager")
  set usagerId(usagerId: number) {
    this.initUsager(usagerId);
  }

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Input("topBarreVisible")
  topBarreVisible: boolean = true;

  @Input()
  doublonPotentielVisible: boolean = true;

  @Input()
  alertContainerVisible: boolean = true;

  @Output("relierUsager")
  relierUsager = new EventEmitter<BaseUsagerDTO>();

  @Output("retourListe")
  retourRecherche = new EventEmitter<void>();

  titreSection: string = "Usager";

  @ViewChild("appConsulterUiComponent", { static: true })
  appConsulterUiComponent: ConsulterUiComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  formTopBarOptions: FormTopBarOptions;
  categoriesAppelant: ReferenceDTO[];
  appIdentificationUsager: any;
  appAdresseUsager: any;
  appCommunicationUsager: any;
  appInfoSupUsager: any;
  classCadenaUsager: any;
  detailMenuTop: string = "";
  labelMenuTop: string = "";
  labelUsagerNonIdentifie: string;
  private subscriptions: Subscription = new Subscription();
  rrssParamsUrl: RrssParamsUrl = new RrssParamsUrl();

  private validAuditConsultationUsager: boolean;

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private utilitaireService: UtilitaireService,
    private translate: TranslateService,
    private usagerService: UsagerService,
    private appContextStore: AppContextStore,
    private referencesService: ReferencesService,
    private router: Router) {

    super();
  }

  ngOnInit() {
    this.alertStore.resetAlert();

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        if (this.alertContainer){
          this.alertService.show(this.alertContainer, state);
        }
      })
    );

    // Alimente la liste des groupes d'âges.
    this.subscriptions.add(
      this.referencesService.getListeGroupeDAge().subscribe((result: ReferenceDTO[]) => {
        this.listeGroupeDAge = result;
      })
    );
    // Alimente la liste des sexes.
    this.subscriptions.add(
      this.referencesService.getListeSexe().subscribe((result: ReferenceDTO[]) => {
        this.listeSexe = result;
      })
    );

    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.initTopBar(appContext.isContextAppel || appContext.isContextCorrectionFicheAppel);
      })
    );
  }

  ngOnDestroy() {
    this.validAuditConsultationUsager = false;

    this.subscriptions.unsubscribe();

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    this.alertStore.resetAlert();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  private initTopBar(isEnContexteAppel: boolean) {
    let topBarActions: Action[] = [];
    if (isEnContexteAppel) {
      let topBarActionRelier: Action = {
        label: this.translate.instant("usager.bandeau.btnrelierusager"),
        actionFunction: this.actionRelierUsager,
        compId: 'relierEtFermerBtn',
        extraClass: "btn-primary form-btn"
      };
      topBarActions.push(topBarActionRelier);

      let topBarActionFermer: Action = {
        tooltip: this.translate.instant("usager.bandeau.btnfermer2"),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
      topBarActions.push(topBarActionFermer);
    } else {
      let topBarActionRetour: Action = {
        tooltip: this.translate.instant("usager.bandeau.btnfermer1"),
        actionFunction: this.actionRetourRecherche,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
      topBarActions.push(topBarActionRetour);
    }

    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }


  /**
   * Récupère l'usager de la base de données et l'affiche.
   * @param usagerId identifiant de l'usager à afficher
   */
  private initUsager(usagerId: number) {
    this.idUsager = usagerId;

    if (this.idUsager) {
      //Journaliser consultation usager
      this.auditConsultation(usagerId);

      // Populer l'usager dans le composant enfant
      this.usagerService.getUsager(this.idUsager).subscribe((res: UsagerDTO) => {
        this.usagerDTO = res;

        this.appContextStore.setvalue('statusEnregistrementsUsager', this.usagerDTO.statusEnregistrement);

        // Affiche le nom et le prénom de l'usager dans la barre de menu.
        if (this.usagerDTO.prenom && this.usagerDTO.nom) {
          this.labelMenuTop = this.usagerDTO.prenom + " " + this.usagerDTO.nom;
        } else if (this.usagerDTO.prenom) {
          this.labelMenuTop = this.usagerDTO.prenom;
        } else if (this.usagerDTO.nom) {
          this.labelMenuTop = this.usagerDTO.nom;
        } else {
          this.labelMenuTop = this.labelUsagerNonIdentifie;
        }

        this.detailMenuTop = "#" + this.usagerDTO.id;

        // Lorsque consulter-usager-container est utilisé en contexte d'un appel, on doit afficher le groupe d'âge
        // de l'usager en contexte d'appel.
        // Récupère l'usager en contexte d'appel si présent.
        const usagerEnContexteAppel: BaseUsagerDTO = this.appContextStore.state.usagerEnContexteAppel;

        // Affiche en priorité le groupe d'âge de l'usager en contexte d'appel.
        if (this.idUsager == usagerEnContexteAppel?.id && usagerEnContexteAppel?.groupeAgeOptions) {
          let groupeAgeUsagerEnContextAppel: GroupeAgeOptions = usagerEnContexteAppel.groupeAgeOptions;
          this.usagerDTO.groupeAgeOptions = groupeAgeUsagerEnContextAppel;

          // S'assure que AMJ est calculé lorsqu'une date est présente
          if (groupeAgeUsagerEnContextAppel.dateNaissance && !groupeAgeUsagerEnContextAppel.annees && !groupeAgeUsagerEnContextAppel.mois && !groupeAgeUsagerEnContextAppel.jours) {
            this.utilitaireService.getAgeParDateNaissance(this.usagerDTO.dtNaiss.toLocaleString()).subscribe((age: AgeDTO) => {
              groupeAgeUsagerEnContextAppel.annees = age.years ? age.years + "" : null;
              groupeAgeUsagerEnContextAppel.mois = age.months ? age.months + "" : null;
              groupeAgeUsagerEnContextAppel.jours = age.days;

              // Met à jour l'affichage du groupe d'âge.
              this.appConsulterUiComponent.setGroupeAge(groupeAgeUsagerEnContextAppel);

              this.usagerDTO.groupeAgeOptions = groupeAgeUsagerEnContextAppel;
            });
          }
        } else if (this.usagerDTO.dtNaiss) {
          // Calcule l'âge de l'usager et l'affiche.
          this.subscriptions.add(
            this.utilitaireService.getAgeParDateNaissance(this.usagerDTO.dtNaiss.toLocaleString()).subscribe((age: AgeDTO) => {
              const ageEnMois: number = AgeUtils.ageToNbMois(age.years, age.months);

              // Récupère le groupe d'âge correspondant à l'âge de l'usager
              this.subscriptions.add(
                this.referencesService.getGroupeDAgeByNbMois(ageEnMois).subscribe((referenceGroupeAge: ReferenceDTO) => {
                  const grpAge: GroupeAgeOptions = new GroupeAgeOptions();

                  grpAge.groupeId = referenceGroupeAge?.id;
                  grpAge.groupe = referenceGroupeAge?.code;

                  grpAge.annees = age.years ? age.years + "" : null;
                  grpAge.mois = age.months ? age.months + "" : null;
                  grpAge.jours = age.days;

                  this.usagerDTO.groupeAgeOptions = grpAge;
                  this.appConsulterUiComponent.setGroupeAge(grpAge);
                })
              );
            })
          );
        } else {
          this.usagerDTO.groupeAgeOptions = null;
        }

        this.appConsulterUiComponent.setUsager(this.usagerDTO);

        // Récupère la liste des communications de l'usager et alimente le composant.
        this.utilitaireService.listUsagerCommunications(+this.idUsager).subscribe(res => {
          this.listUsagerCommunications = res;
          this.appConsulterUiComponent.setListeUsagerCommunication(this.listUsagerCommunications);
        });

        // Récupère la liste des lieux de résidence de l'usager et alimente le composant.
        this.utilitaireService.getAllUsagerLieuResidences(+this.idUsager).subscribe(res => {
          this.listeLieuResidence = res;
          this.appConsulterUiComponent.setListeUsagerLieuResidence(res);
        });
      });
    } else {
      // Vide le composant
      this.usagerDTO = new UsagerDTO();
      this.appConsulterUiComponent.setUsager(this.usagerDTO);
      this.listUsagerCommunications = new Array<UsagerCommDTO>();
      this.appConsulterUiComponent.setListeUsagerCommunication(this.listUsagerCommunications);
      this.listeLieuResidence = new Array<UsagerLieuResidenceDTO>();
      this.appConsulterUiComponent.setListeUsagerLieuResidence(this.listeLieuResidence);

      this.labelMenuTop = this.labelUsagerNonIdentifie;
    }
  }

  /**
   * Avise le parent qu'on désire relier l'usager en cours
   */
  actionRelierUsager = (): void => {
    this.subscriptions.add(
      this.validerUsagerActif(this.usagerDTO.id).subscribe((isActif: boolean) => {
        if (isActif) {
          this.relierUsager.emit(this.usagerDTO);
        }
      })
    );
  }

  /**
   * Avise le parent qu'on désire retourner à la recherche.
   */
  actionRetourRecherche = (): void => {
    this.retourRecherche.emit();
  }

  /** Journaliser l'accès à la consultation */
  private auditConsultation(idUsager: number): void {
    if (!this.validAuditConsultationUsager) {
      this.validAuditConsultationUsager = true;
      this.subscriptions.add(
        this.usagerService.journaliserConsultationUsager(idUsager).subscribe()
      );
    }
  }

  /**
   * Vérifie si l'usager est actif dans la bd. Affiche un message d'erreur si addAlert est true.
   * @param idUsagerIdent identifiant de l'usager
   * @returns
   */
  public validerUsagerActif(idUsagerIdent: number): Observable<boolean> {
    return this.usagerService.isUsagerActif(idUsagerIdent).pipe(map((isActif: boolean) => {
      if (!isActif) {
        // ss-iu-e30008: L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg: string = this.translate.instant("ss-iu-e30008");
        const label: string = this.translate.instant("sigct.ss.error.label");
        const alert: AlertModel = AlertModelUtils.createAlertModel([msg], label, AlertType.ERROR);
        this.alertStore.setAlerts([alert]);
      }

      return isActif;
    }));
  }
}
