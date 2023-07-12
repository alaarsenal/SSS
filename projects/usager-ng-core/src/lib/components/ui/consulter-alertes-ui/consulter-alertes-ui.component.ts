import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { VerificateurDeChangementComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/verificateur-de-changement/verificateur-de-changement.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { forkJoin, Subscription } from 'rxjs';
import { ConsultationAlertesCritereDTO } from '../../../models/consultation-alertes-critere-dto';
import { ConsultationAlertesDTO } from '../../../models/consultation-alertes-dto';
import { SigctSiteDTO } from '../../../models/sigct-site-dto';
import { SigctUserDTO } from '../../../models/sigct-user-dto';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-consulter-alertes-ui',
  templateUrl: './consulter-alertes-ui.component.html',
  styleUrls: ['./consulter-alertes-ui.component.css']
})
export class ConsulterAlertesUiComponent implements OnInit, OnDestroy {

  avertissementPersistant: AlertModel;

  public rechercheCritere: ConsultationAlertesCritereDTO = new ConsultationAlertesCritereDTO();

  public inputOptionsGestionaire: InputOptionCollection;
  public inputOptionsSite: InputOptionCollection;

  public displayedColumns: string[] = ['dateAppel', 'type', 'nom', 'prenom', 'dateNaissance', 'gestionaire', 'site', 'traite', 'action'];

  public consultationAlertes: ConsultationAlertesDTO[];

  public dataSource = new MatTableDataSource();

  @Output()
  consulterFicheAppel = new EventEmitter<ConsultationAlertesDTO>();

  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  public container;


  @ViewChild("verificateurDeChangementUi", { static: true })
  verificateurDeChangementUi: VerificateurDeChangementComponent;

  private sort;
  @ViewChild(MatSort, { static: false })
  set content(content: ElementRef) {
    this.sort = content;
    this.dataSource.sort = this.sort;
  }

  //Conteneur pour la liste de valeurs
  public inputOptionAlerteTraite: InputOptionCollection = {
    name: "alerteTraites",
    options: [{ label: "", value: "1" }]
  };


  subscriptions: Subscription = new Subscription();

  private loadOptions = {
    gestionnaires: false,
    sites: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usagerService: UsagerService,
    private translateService: TranslateService,
    private alertStore: AlertStore,
    private alertService: AlertService) {


  }

  ngOnInit() {
    this.subscribeAlertStore();
    this.populerOptions();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeAlertStore() {
    this.alertStore.resetAlert();
    this.alertStore.state$.subscribe((state: AlertModel[]) => {
      this.alertService.show(this.container, state);
    });
  }

  initCritere() {
    if (this.loadOptions.gestionnaires || this.loadOptions.sites) {
      this.obtenirCriteresDuStorage();
    }
  }

  obtenirConsultationAlertesSiCriteresExistent() {
    this.rechercher();
  }

  private populerOptions() {
    const valeurLibelleSelectionnez: string = this.translateService.instant("option.select.message");

    this.subscriptions.add(
      forkJoin([
        this.usagerService.getGestionnairesUtilisateurAuthentifie(),
        this.usagerService.getAllSitesOrgUtilisateurAuthentifie()]).subscribe((results) => {
          if (results[0]) {
            this.inputOptionsGestionaire = { name: "gestionaire", options: [{ label: valeurLibelleSelectionnez, value: "" }] }

            const gestionnaires: SigctUserDTO[] = results[0] as SigctUserDTO[];
            gestionnaires.forEach((gestionnaire: SigctUserDTO) => {
              this.inputOptionsGestionaire.options.push({ label: gestionnaire.fullDisplayName, value: '' + gestionnaire.username, actif: gestionnaire.actif, description: "" });
            });
            this.loadOptions.gestionnaires = true;
          }

          if (results[1]) {
            this.inputOptionsSite = { name: "sites", options: [{ label: valeurLibelleSelectionnez, value: "" }] }

            const sites: SigctSiteDTO[] = results[1] as SigctSiteDTO[];
            sites.forEach((site: SigctSiteDTO) => {
              this.inputOptionsSite.options.push({ label: site.siteNom, value: "" + site.id, actif: site.actif, description: "" });
            });
            this.loadOptions.sites = true;
          }

          this.initCritere();
        })
    );
  }

  sauvegarder() {
    this.garderCriteresDansStorage();
    this.alertStore.resetAlert();
    this.subscriptions = this.usagerService.sauvegarderConsultationsAlertes(this.consultationAlertes).subscribe(data => {
      this.paginator.length = data.length;
      this.consultationAlertes = data;
      this.dataSource.data = this.consultationAlertes;

      //tous
      this.sort.active = 'dateAppel';

      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.reinitialiser();
      this.afficherMessageSauvegardeReussie();
    }, () => {
      this.alertService.show(this.container, this.alertStore.state);
    });

  }

  rechercher() {
    this.garderCriteresDansStorage();
    this.alertStore.resetAlert();
    this.subscriptions = this.usagerService.getConsultationAlertesUsager(this.rechercheCritere).subscribe(data => {
      this.paginator.length = data.length;
      this.consultationAlertes = data;
      this.dataSource.data = this.consultationAlertes;

      //tous
      this.sort.active = 'dateAppel';

      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }, () => {
      this.alertService.show(this.container, this.alertStore.state);
    });

  }

  rechercherAvecConfirmation() {
    if (this.verificateurDeChangementUi.isExisteChangements()) {
      this.verificateurDeChangementUi.verifierChangments(
        () => { //onBtnOuiClick
          this.rechercher();
          this.verificateurDeChangementUi.closeModal();
        },
        () => { //onBtnNomClick
          this.verificateurDeChangementUi.closeModal();
        }
      )
    } else {
      this.rechercher();
    }

  }


  reinitialiser() {
    this.viderLesCriteresDuStorage();
    this.initCritere();
    this.consultationAlertes = [];
    this.dataSource.data = this.consultationAlertes;

  }

  reinitialiserAvecConfirmation() {
    if (this.verificateurDeChangementUi.isExisteChangements()) {
      this.verificateurDeChangementUi.verifierChangments(
        () => { //onBtnOuiClick
          this.reinitialiser();
          this.verificateurDeChangementUi.closeModal();
        },
        () => { //onBtnNomClick
          this.verificateurDeChangementUi.closeModal();
        }
      )
    } else {
      this.reinitialiser();
    }
  }

  garderCriteresDansStorage() {
    localStorage.setItem(ConsultationAlertesCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(this.rechercheCritere))
  }

  viderLesCriteresDuStorage() {

    localStorage.setItem(ConsultationAlertesCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(new ConsultationAlertesCritereDTO()));
  }

  obtenirCriteresDuStorage() {
    this.rechercheCritere = JSON.parse(localStorage.getItem(ConsultationAlertesCritereDTO.CACHED_CRITERES_KEY));
    if (this.rechercheCritere == null)
      this.rechercheCritere = new ConsultationAlertesCritereDTO();
    this.obtenirConsultationAlertesSiCriteresExistent();
  }

  consulter(consultationAlerteDTO: ConsultationAlertesDTO) {
    this.consulterFicheAppel.emit(consultationAlerteDTO);
  }

  consulterAvecConfirmation(obj: ConsultationAlertesDTO) {
    if (this.verificateurDeChangementUi.isExisteChangements()) {
      this.verificateurDeChangementUi.verifierChangments(
        () => { //onBtnOuiClick
          this.verificateurDeChangementUi.reset();
          this.verificateurDeChangementUi.closeModal();
          this.consulter(obj);
        },
        () => { //onBtnNomClick
          this.verificateurDeChangementUi.closeModal();
        }
      )
    } else {
      this.consulter(obj);
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


}
