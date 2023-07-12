import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EventEmitter } from 'events';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { ExportationExcelDTO } from '../../../models/exportation-excel-dto';
import { RechercheSuiviEnregistramentResultatDTO } from '../../../models/recherche-suivi-enregistrament-resultat-dto ';
import { RechercheSuiviEnregistrementCritereDTO } from '../../../models/recherche-suivi-enregistrement-critere-dto';
import { SigctSiteDTO } from '../../../models/sigct-site-dto';
import { SigctUserDTO } from '../../../models/sigct-user-dto';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-suivi-etat-enregistrement-ui',
  templateUrl: './suivi-etat-enregistrement-ui.component.html',
  styleUrls: ['./suivi-etat-enregistrement-ui.component.css']
})
export class SuiviEtatEnregistrementUiComponent implements OnInit, OnDestroy {

  public rechercheCritere: RechercheSuiviEnregistrementCritereDTO = new  RechercheSuiviEnregistrementCritereDTO();

  public inputOptionsTypeDAlert: InputOptionCollection;

  public inputOptionsSite: InputOptionCollection;

  public inputOptionsGestionaire: InputOptionCollection;

  public displayedColumns: string[] = ['cree', 'fermPrevue', 'aReviser', 'usager', 'nam', 'naissance', 'type', 'site', 'gestionaire', 'actions'];

  public enregistramentsResultat: RechercheSuiviEnregistramentResultatDTO[];

  public dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  public container;

  private sort;
  @ViewChild(MatSort, {static: false})
  set content(content: ElementRef) {
    this.sort = content;
    this.dataSource.sort = this.sort;
  }


  subscriptions: Subscription = new Subscription();

  private loadOptions = {gestionaries: false, sites: false};

  constructor(
    private usagerService: UsagerService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private router: Router) {


  }

  ngOnInit() {
    this.subscribeAlertStore();
    this.populerOptionsTypeDalert();
    this.populerOptionsGestionaires();
    this.populerOptionsSite();
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

  initCritere(){
    if (this.loadOptions.gestionaries && this.loadOptions.sites ) {
      this.obtenirCriteresDuStorage();
    }
  }

  obtenirEnregistrementsSiCriteresExistent() {
    if (this.rechercheCritere.typeAlert != null){
      this.rechercher();
    }
  }

  populerOptionsTypeDalert(){
    this. inputOptionsTypeDAlert = {
      name: "typeDalert",
      options: RechercheSuiviEnregistrementCritereDTO.INPUT_OPTIONS_TYPES
    }
  }


  populerOptionsSite() {
    this.inputOptionsSite = {name: "site", options: [{label: "Sélectionnez...", value: ""}]}
    this.subscriptions.add(
      this.usagerService.getEnregistrementSitesUtilisateurAuthentifie().subscribe((result: SigctSiteDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsSite.options.push({ label: item.siteNom, value: '' + item.id });
          })
          this.loadOptions.sites = true;
          this.initCritere();
        };
      })
    );

  }

  populerOptionsGestionaires() {
    this.inputOptionsGestionaire = {name: "gestionaire", options: [{label: "Sélectionnez...", value: ""}]}

    this.subscriptions.add(
      this.usagerService.getEnregistrementGestionnairesUtilisateurAuthentifie().subscribe((result: any) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsGestionaire.options.push({ label: item.fullDisplayName, value: '' + item.username, actif: item.actif});
          })
          this.loadOptions.gestionaries = true;
          this.initCritere();
        };
      })
    );
  }

  rechercher() {
    this.garderCriteresDansStorage();
    this.alertStore.resetAlert();
    this.usagerService.getSuiviEnregistrementsUsager(this.rechercheCritere).subscribe( data => {
      this.paginator.length = data.length;
      this.enregistramentsResultat = data;
      this.dataSource.data = this.enregistramentsResultat;

      if (this.rechercheCritere.typeAlert == RechercheSuiviEnregistrementCritereDTO.FERMER_AVANT) {
        this.sort.active = 'fermPrevue';
      } else if (this.rechercheCritere.typeAlert == RechercheSuiviEnregistrementCritereDTO.FERMER_AVANT) {
        this.sort.active = 'aReviser';
      } else { //tous
        this.sort.active = 'cree';
      }
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }, (err) => {
      this.alertService.show(this.container, this.alertStore.state);
    });
  }


  reinitialiser() {
    this.viderLesCriteresDuStorage();
    this.initCritere();
    this.enregistramentsResultat = [];
    this.dataSource.data = this.enregistramentsResultat;
  }

  garderCriteresDansStorage() {
    localStorage.setItem(RechercheSuiviEnregistrementCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(this.rechercheCritere))
  }

  viderLesCriteresDuStorage() {

    localStorage.setItem(RechercheSuiviEnregistrementCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(new RechercheSuiviEnregistrementCritereDTO()));
  }

  obtenirCriteresDuStorage() {
    this.rechercheCritere = JSON.parse( localStorage.getItem(RechercheSuiviEnregistrementCritereDTO.CACHED_CRITERES_KEY) );
    if (this.rechercheCritere == null)
      this.rechercheCritere = new RechercheSuiviEnregistrementCritereDTO();
    this.obtenirEnregistrementsSiCriteresExistent();
  }

  consulter(obj: RechercheSuiviEnregistramentResultatDTO){
    this.router.navigateByUrl('/'+obj.idUsager+'/enregistrement/'+obj.idEnregistrement+'/consulter');
  }

  editer(obj: RechercheSuiviEnregistramentResultatDTO){
    this.router.navigateByUrl('/'+obj.idUsager+'/enregistrement/'+obj.idEnregistrement+'/editer');
  }

  exporter(): void {
    this.subscriptions.add(this.usagerService.genererExcelSuiviEnregistrementsUsager(this.rechercheCritere).subscribe((result: ExportationExcelDTO) => {
      if (result) {
        this.usagerService.convertByteDataToExcelAndMakeDownload(result.fileContent, result.fileName);
      }
    }));
  }

  onOptionsTypeChange(e: EventEmitter){
    if (this.rechercheCritere.typeAlert == RechercheSuiviEnregistrementCritereDTO.TOUS)
      this.rechercheCritere.date = new Date();
  }

  isDateDisabled() {
    return this.rechercheCritere.typeAlert === RechercheSuiviEnregistrementCritereDTO.TOUS;
  }

 }
