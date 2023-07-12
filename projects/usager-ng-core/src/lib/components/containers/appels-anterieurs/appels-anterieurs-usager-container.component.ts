import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { Subscription, Observable } from 'rxjs';
import { AppelAnterieurDTO } from '../../../models/appel-anterieur-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { UsagerService } from '../../../services/usager.service';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';




@Component({
  selector: 'sigct-usager-appels-anterieurs-container',
  templateUrl: './appels-anterieurs-usager-container.component.html',
  styleUrls: ['./appels-anterieurs-usager-container.component.css'],
  providers: [DatePipe]
})

export class AppelsAnterieursUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {
  /** Indique si le composant est utilisé en contexte d'un appel. */
  private isEnContextAppel: boolean = false;

  idUsagerIdent: number;

  formTopBarOptions: FormTopBarOptions;

  labelMenuTop: String = "";

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Input("idUsager")
  set usagerId(idUsagerIdent: number) {
    this.initUsager(idUsagerIdent);
  }

  @Output("consulterFicheAppel")
  consulterFicheAppel = new EventEmitter<AppelAnterieurDTO>();

  @Output("retourListe")
  retourRecherche = new EventEmitter<void>();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  subscriptions: Subscription = new Subscription();

  //**Constructeur */
  constructor(private usagerService: UsagerService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private appContextStore: AppContextStore,
    private translateService: TranslateService) {
    super();
  }

  ngOnInit() {
    this.alertStore.resetAlert();

    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.isEnContextAppel = appContext.isContextAppel;

        this.initTopBar(this.isEnContextAppel);
      })
    );

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  actionRetourRecherche = (): void => {
    this.retourRecherche.emit();
  }

  /**
   * Initialisation de l'usager. Récupère ses informations et les affichent à l'écran.
   * @param usagerId identifiant de l'usager
   */
  private initUsager(usagerId: number) {
    this.idUsagerIdent = usagerId;

    if (this.idUsagerIdent) {

      this.usagerService.getUsager(this.idUsagerIdent).subscribe((usagerDto: UsagerDTO) => {
        // Affiche le nom et le prénom de l'usager dans la barre de menu.
        if (usagerDto?.prenom && usagerDto?.nom) {
          this.labelMenuTop = usagerDto.prenom + " " + usagerDto.nom;
        } else if (usagerDto?.prenom) {
          this.labelMenuTop = usagerDto.prenom;
        } else if (usagerDto?.nom) {
          this.labelMenuTop = usagerDto.nom;
        } else {
          this.labelMenuTop = this.translateService.instant("usager.identification.usager.non.identifie");
        }

        this.labelMenuTop += " - " + this.translateService.instant("usager.menuvert.btnlstappel");
      });
    }
  }

  private initTopBar(isEnContexteAppel: boolean) {
    let topBarActions: Action[] = [];

    let topBarActionRetour: Action;
    if (isEnContexteAppel) {
      /** Revenir à la fiche si contexte d'appel **/
      topBarActionRetour = {
        tooltip: this.translateService.instant("usager.bandeau.btnfermer2"),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };

    } else {
      /** Revenir à la liste si hors contexte d'appel **/
      topBarActionRetour = {
        label: this.translateService.instant("usager.bandeau.btnfermer1"),
        actionFunction: this.actionRetourRecherche,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
    }

    topBarActions = [topBarActionRetour];

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }

  /**
   * Avise le parent qu'on désire consulter une fiche d'appel antérieure
   * @param appelAnterieur fiche d'appel antérieure à consulter
   */
  onConsulterFicheAppel(appelAnterieur: AppelAnterieurDTO): void {
    this.consulterFicheAppel.emit(appelAnterieur);
  }
}

