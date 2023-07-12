import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { Subscription } from 'rxjs';
import { UsagerSanterSocialFichierDTO } from '../../model/UsagerSanterSocialFichierDTO';
import { InputOptionCollection } from '../../utils/input-option';
import { InputTextComponent } from '../input-text/input-text.component';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { SigctChosenComponent } from '../sigct-chosen/sigct-chosen.component';
import { TableInforUtileDTO } from './table-infor-utile-dto';

@Component({
  selector: 'msss-piloter-table-informations-utiles',
  templateUrl: './piloter-table-informations-utiles.component.html',
  styleUrls: ['./piloter-table-informations-utiles.component.css']
})
export class PiloterTableInformationsUtilesComponent implements OnInit, OnDestroy {

  dto : TableInforUtileDTO;
  listeFichiers : UsagerSanterSocialFichierDTO[];

  /*Pour caché les colonnes non nécessaire dans le gestionnaire de fichiers*/
  isShowListeProfile: boolean = false;
  isShowColReference: boolean = false;
  isShowColTitre: boolean = false;
  isShowColDescription: boolean = false;

  @Input()
  titreSection: string = 'Fichier attaché';
  msgSupprimer: string = this.translateService.instant('sa-iu-a00001',[this.titreSection]);

  public displayedColumns: string[] = ['aprecu', 'nom', 'actions'];

  @Input()
  fichierService: any;
  @Input()
  idFichier: any;

  @Output("saveInforUtileEvent")
  saveInforUtileEvent: EventEmitter<TableInforUtileDTO> = new EventEmitter<TableInforUtileDTO>();

  @Output("onAjouterFichier")
  public ajouterFichierEvent = new EventEmitter();

  @Output("onListFichier")
  public listFichierEvent = new EventEmitter();

  @Output("onSupprimerFichier")
  public supprimerFichierEvent = new EventEmitter();

  @Output("onTelechargerFichier")
  public telechargerFichierEvent = new EventEmitter();

  @Output("onAficherAlert")
  public aficherAlertEvent = new EventEmitter();


  @Input("tableInforUtileDTO")
  public set tableInforUtileDTO(value: TableInforUtileDTO) {
    this.dto = value;
  }

  @Input("listeFichiers")
  public set listeFichiersInforUtile(liste: UsagerSanterSocialFichierDTO[]) {

    this.listeFichiers = liste;

  }

  @Input("listeCategorieInforUtile")
  public set listeCategorieInforUtile(refCategorie: ReferenceDTO[]) {
    let valeurLibelleSelectionnez: string = this.translateService.instant("option.select.message");
    this.inputOptionsCategorieInforUtile.options = [{ label: valeurLibelleSelectionnez, value: null }];
    if(refCategorie){
      refCategorie.forEach((item) => {
        this.inputOptionsCategorieInforUtile.options.push({ label: item.nom, value: item.code, description: item.description });
      });

    }

  }

  @Input("typeFichierAccepter")
  typeFichierAccepter: string;


  @Input("isModifyMode")
  public set isModifyMode(value: boolean) {
    this._isModifyMode = value;
  }

  _isModifyMode: boolean = false;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;


  @ViewChild("triElement", {static: false})
  triElement: InputTextComponent;

  @ViewChild("nom", {static: false})
  nomElement: InputTextComponent;

  @ViewChild("categorie", {static: false})
  categorieElement: SigctChosenComponent;

  @Input("isNomValide")
  isNomValide: boolean = true;
  @Input("isTriValide")
  isTriValide: boolean = true;
  @Input("isCategorieValide")
  isCategorieValide: boolean = true;


  inputOptionActif: InputOptionCollection = {
    name: "actif",
    options: [{ label: 'sigct.ss.pilotage.info_utile.ajoutmodif.actif', value: 'false' }]
  };

  inputOptionsCategorieInforUtile: InputOptionCollection = {
    name: "Categorie",
    options: []
  };



  subscriptions: Subscription = new Subscription();

  constructor(private alertService: AlertService,
    private alertStore: AlertStore,
    private modalConfirmService: ConfirmationDialogService,
    private router: Router,
    private translateService: TranslateService
    ) { }


  ngOnInit(): void {
    this.alertStore.resetAlert();
    this.configureAlertMsg();
    if (!this.dto){
      this.dto = new TableInforUtileDTO();
    }
  }

  ngAfterViewInit() {
    this.affectFocusToUIElement();
  }


  private affectFocusToUIElement(): void {
    this.categorieElement.focus();
  }

  private configureAlertMsg(): void {
    this.subscriptions.add(this.alertStore.state$.subscribe((state: AlertModel[]) => {
      if(state){
        this.alertService.show(this.alertContainer, state);
      }

      })
    );
  }
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit(fCom: any): void {
    this.validerForm();
    this.alertStore.resetAlert();
    this.saveInforUtileEvent.emit(this.dto);
  }

  private validerForm(): void {
    if (!this.dto.nom) {
      this.isNomValide = false;
    }
    if (!this.dto.categorie) {
      this.isCategorieValide = false;
    }
    if (!this.dto.tri) {
      this.isTriValide = false;
    }
  }

  onFocus(event: any) {
    this.onFocusClick(event);
  }

  onClick(event: any) {
    this.onFocusClick(event.target.id);
  }

  private onFocusClick(id: string) {
    switch (id) {
      case "categorie": {
        this.isCategorieValide = true;
        break;
      }
      case "tri": {
        this.isTriValide = true;
        break;
      }
      case "nom": {
        this.isNomValide = true;
        break;
      }
    }
  }

  confirmBackToTableInformationsUtiles(): void {
    if (this.isExistOnlineModification()) {
      this.openModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    } else {
      this.router.navigate(["info-utile-page/" + this.dto.identifiant]);
    }
  }

  isExistOnlineModification(): boolean {
    if (this._isModifyMode) {
      let originalTableInforUtileDTO: TableInforUtileDTO = JSON.parse(localStorage.getItem("originalTableInforUtileDTO"));
      if (originalTableInforUtileDTO) {
        return  this.dto?.tri != originalTableInforUtileDTO.tri
          || this.dto?.nom != originalTableInforUtileDTO.nom
          || this.dto?.description != originalTableInforUtileDTO.description
          || this.dto?.actif != originalTableInforUtileDTO.actif


      }
      return false;
    }
    return  false;
  }

  annulerModifEtRetourListeRecherche(): void {
    this.closeModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    this.router.navigate(["info-utile-page/" + this.dto.identifiant]);
  }


  confirmerAnnulerAction(): void {
    this.openModal('confirm_popup_annuler-modif');
  }

  annulerAction(): void {
    this.closeModal('confirm_popup_annuler-modif');
    if (!this._isModifyMode) {
    } else if (this.isExistOnlineModification()) {
      this.dto = JSON.parse(localStorage.getItem("originalTableInforUtileDTO"));
    }
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
    this.subscriptions.unsubscribe();
  }

  setValideCategorie(val): void {
    this.categorieElement.valide = val;
  }

  /*-------------- Fichiers Attachés ----------------------*/
  onAjouterFichier(event) {
    this.ajouterFichierEvent.emit(event);
  }



  onListFichier(event){
    this.listFichierEvent.emit(event);
  }

  onSupprimerFichier(event) {
    this.supprimerFichierEvent.emit(event);
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {
    this.telechargerFichierEvent.emit(fichier);
  }

  isFichierReadOnly() {
    return false;
  }

  getUrlBaseTelecharge(){
    const url = this.fichierService.getUrlBaseTelecharge();
    return url;
  }

}
