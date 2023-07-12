import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { ExportationExcelDTO } from '../../../models/exportation-excel-dto';
import { RechercheListEnregistrementCritereDTO } from '../../../models/recherche-liste-enregistrement-critere-dto';
import { RechercheSuiviEnregistramentResultatDTO } from '../../../models/recherche-suivi-enregistrament-resultat-dto ';
import { SigctOrganismeDTO } from '../../../models/sigct-organisme-dto';
import { SigctSiteDTO } from '../../../models/sigct-site-dto';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-liste-des-enregistrements-ui',
  templateUrl: './liste-des-enregistrements-ui.component.html',
  styleUrls: ['./liste-des-enregistrements-ui.component.css']
})
export class ListeDesEnregistrementsUiComponent implements OnInit {

  public rechercheCritere = new  RechercheListEnregistrementCritereDTO();

  public inputOptionsOrganismes: InputOptionCollection;

  public inputOptionsSite: InputOptionCollection;

  public inputOptionsGestionnaire: InputOptionCollection;

  public displayedColumns: string[] = ['usager',  'nam', 'dtNaissance', 'type', 'organisme', 'gestionaire', 'cree', 'fermPrevue', 'aReviser', 'actions'];

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

  @Output() public onConsulterClick = new EventEmitter<any>();

  @Output() public onEditerClick = new EventEmitter<any>();

  subscriptions: Subscription = new Subscription();

  private loadOptions = {gestionaries: false, sites: false};

  constructor(
    private usagerService: UsagerService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private router: Router,
    private authService: AuthenticationService ) {
  }

  ngOnInit() {
    this.subscribeAlertStore();
    this.populerOptionsOrganismes();
    this.initOptions();
    //this.obtenirEnregistrementsSiCriteresExistent();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initOptions(){
    this.inputOptionsSite = {name: "site", options: [{label: "Sélectionnez...", value: ""}]}
    this.inputOptionsGestionnaire = {name: "gestionaire", options: [{label: "Sélectionnez...", value: ""}]}
  }

  subscribeAlertStore() {
    this.alertStore.resetAlert();
    this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
    });
  }

  initCritere(){
    this.rechercheCritere = new RechercheListEnregistrementCritereDTO();

    //
    /*if (this.loadOptions.gestionaries && this.loadOptions.sites ) {
      this.obtenirCriteresDuStorage();
    }
    */

  }

  obtenirEnregistrementsSiCriteresExistent() {
    //TODO: VERIFIER AVEC LES CHAMPS OBLIGATOIRES
    //if (this.rechercheCritere.idOrganisme != null){
      //this.rechercher();
    //}
  }

  populerOptionsOrganismes(){
    this.inputOptionsOrganismes = {name: "organisme", options: [{label: "Sélectionnez...", value: ""}]}
    this.subscriptions.add(
      this.usagerService.getOrganiemesEnregistrementsByRegionAuthentifie().subscribe((result: SigctOrganismeDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsOrganismes.options.push({ label: item.nom , value: '' + item.id, actif: item.actif });
          })
          this.loadOptions.sites = true;
          //this.initCritere();
        };
      })
    );
  }

  onOptionOrganismeChange(eve){
    this.initOptions();
    const idOrganisme = this.rechercheCritere.idOrganisme;
    if (idOrganisme) {
      this.populerOptionsSite(idOrganisme, idOrganisme);
      this.populerOptionsGestionnaires(idOrganisme, idOrganisme);
    }else{
      this.initCritere();
    }
  }

  populerOptionsSite(idUsager: number, idOrganisme: number) {
    this.rechercheCritere.idSite = null;
    this.subscriptions.add(
      this.usagerService.getEnregistrementSites(idUsager, idOrganisme).subscribe((result: SigctSiteDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsSite.options.push({ label: item.siteNom, value: '' + item.id });
          })
          this.loadOptions.sites = true;
        };
      })
    );

  }

  populerOptionsGestionnaires(idUsager: number, idOrganisme: number) {
    this.rechercheCritere.idGestionnaire = null;
    this.subscriptions.add(
      this.usagerService.getEnregistrementGestionnairesIncludInactif(idUsager, idOrganisme).subscribe((result: any) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsGestionnaire.options.push({ label: item.fullDisplayName, value: '' + item.username, actif: item.actif});
          })
          this.loadOptions.gestionaries = true;
        };
      })
    );
  }

  rechercher() {

    this.garderCriteresDansStorage();
    this.alertStore.resetAlert();
    this.usagerService.getListeEnregistrementsUsager(this.rechercheCritere).subscribe( data => {
      this.paginator.length = data.length;
      this.enregistramentsResultat = data;
      this.dataSource.data = this.getGroupData();
      //this.sort.active = 'usager';
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }, (err) => {
      this.alertService.show(this.container, this.alertStore.state);
    });

  }

  getGroupData() {
    let enregistrementsSet = [];
      this.enregistramentsResultat.forEach(item => {
        if (! enregistrementsSet.some(itemExistent => itemExistent.idEnregistrement == item.idEnregistrement)){
          enregistrementsSet.push({
            idEnregistrement: item.idEnregistrement,
            idUsager: item.idUsager,
            usager: item.usager,
            nam: item.nam,
            dtNaissance: item.dtNaissance,
            organismes: this.enregistramentsResultat.filter(organisme => item.idEnregistrement == organisme.idEnregistrement)
          })
        }
      });


    return enregistrementsSet;
  }


  reinitialiser() {
    this.viderLesCriteresDuStorage();
    this.initCritere();
    this.enregistramentsResultat = [];
    this.dataSource.data = this.enregistramentsResultat;
    this.sort.active = 'usager'
  }

  garderCriteresDansStorage() {
    localStorage.setItem(RechercheListEnregistrementCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(this.rechercheCritere))
  }

  viderLesCriteresDuStorage() {
    localStorage.setItem(RechercheListEnregistrementCritereDTO.CACHED_CRITERES_KEY, JSON.stringify(new RechercheListEnregistrementCritereDTO()));
  }

  obtenirCriteresDuStorage() {
    this.rechercheCritere = JSON.parse( localStorage.getItem(RechercheListEnregistrementCritereDTO.CACHED_CRITERES_KEY) );
    if (this.rechercheCritere == null)
      this.rechercheCritere = new RechercheListEnregistrementCritereDTO();
    this.obtenirEnregistrementsSiCriteresExistent();
  }

  consulter(obj: RechercheSuiviEnregistramentResultatDTO){
    this.onConsulterClick.emit(obj);
  }

  editer(obj: RechercheSuiviEnregistramentResultatDTO){
    this.onEditerClick.emit(obj)
  }

  exporter(): void {
    this.subscriptions.add(this.usagerService.genererExcelListeEnregistrementsUsager(this.rechercheCritere).subscribe((result: ExportationExcelDTO) => {
      if (result) {
        this.usagerService.convertByteDataToExcelAndMakeDownload(result.fileContent, result.fileName);
      }
    }));
  }

}
