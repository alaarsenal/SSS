import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { Subscription } from 'rxjs';
import CollectionUtils from '../../../../../sigct-service-ng-lib/src/lib/utils/collection-utils';
import { InputOptionCollection } from '../../utils/input-option';
import { InputTextComponent } from '../input-text/input-text.component';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { TableRefItemDTO } from '../piloter-table-reference-content-item-en-modification/table-ref-item-DTO';

@Component({
  selector: 'msss-piloter-table-reference-content-item-ajout-modification-interface',
  templateUrl: './piloter-table-reference-content-item-ajout-modification-interface.component.html',
  styleUrls: ['./piloter-table-reference-content-item-ajout-modification-interface.component.css']
})
export class PiloterTableReferenceContentItemAjoutModificationInterfaceComponent implements OnInit, OnDestroy {

  @Output("saveTableRefContentItemEvent")
  saveTableRefContentItemEvent: EventEmitter<TableRefItemDTO> = new EventEmitter<TableRefItemDTO>();

  @Input("tableRefItemDTO")
  public set tableRefItemDTO(value: TableRefItemDTO) {
    this._tableRefItemDTO = value;
  }
  _tableRefItemDTO: TableRefItemDTO;

  @Input("isModifyMode")
  public set isModifyMode(value: boolean) {
    this._isModifyMode = value;
  }

  _isModifyMode: boolean = false;

  @Input("moduleName")
  set moduleName(value: string) {
    this._moduleName = value;
  }

  _moduleName: string;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @ViewChild('fCom')
  mytemplateForm: NgForm;

  @ViewChild("triElement", { static: false })
  triElement: InputTextComponent;

  @ViewChild("codeElement")
  codeElement: InputTextComponent;

  isNomValide: boolean = true;
  isTriValide: boolean = true;
  isCodeValide: boolean = true;

  inputOptionActif: InputOptionCollection = {
    name: "actif",
    options: [{ label: 'sigct.ss.pilotage.tableref.valeur.edition.actif', value: 'false' }]
  };

  inputOptionDefaut: InputOptionCollection = {
    name: "actif",
    options: [{ label: 'sigct.ss.pilotage.tableref.valeur.edition.pardefaut', value: 'false' }]
  };

  subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private alertStore: AlertStore,
    private modalConfirmService: ConfirmationDialogService,
    private router: Router) { }


  ngOnInit(): void {
    this.alertStore.resetAlert();
    this.configureAlertMsg();

  }

  ngAfterViewInit() {
    this.affectFocusToUIElement();
  }

  private affectFocusToUIElement(): void {
    if (this._isModifyMode) {
      this.triElement.focus();
    } else {
      this.codeElement.focus();
    }
  }

  private configureAlertMsg(): void {
    this.subscriptions.add(this.alertStore.state$.subscribe((state: AlertModel[]) => {
      this.alertService.show(this.alertContainer, state);
    })
    );
  }

  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit(fCom: any): void {
    this.validerForm();
    this.alertStore.resetAlert();
    this.saveTableRefContentItemEvent.emit(this._tableRefItemDTO);
  }

  private validerForm(): void {
    if (!this._tableRefItemDTO.tableRefContentDTO?.code) {
      this.isCodeValide = false;
    }
    if (!this._tableRefItemDTO.tableRefContentDTO?.nom) {
      this.isNomValide = false;
    }
    if (!this._tableRefItemDTO.tableRefContentDTO?.tri) {
      this.isTriValide = false;
    }
    this.validerNonStandardProperties();
  }

  private validerNonStandardProperties() {
    if (this._tableRefItemDTO?.tableRefContentDTO?.validationStatusOfRequiredByNonStandardPropertyName) {
      let validationStatusOfRequiredByNonStandardPropertyName = new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName));
      if (validationStatusOfRequiredByNonStandardPropertyName?.size > 0 && this._tableRefItemDTO?.tableRefContentDTO?.objectProps) {
        let objectProps = new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO.objectProps));
        for (var [key, val] of objectProps) {
          if (!val) {
            this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[key] = false;
          }
        }
      }
    }

    // Cette partie permet de valider les propriétés, dont ils ont une relation de comparaison <, >, <=, >= ...
    if (this._tableRefItemDTO?.tableRefContentDTO?.objectProps && this._tableRefItemDTO?.tableRefContentDTO?.comparisonFieldRelationShip) {
      let objectProps = new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO.objectProps));

      let valueOne: number = null;
      let nameValueOne: string = null;
      let valueTwo: number = null;
      let nameValueTwo: string = null;
      let comparisonRlelationShip: string = null;
      let comparisonFieldRelationShip = new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO.comparisonFieldRelationShip));

      for (var [key, val] of comparisonFieldRelationShip) {
        let comparisonRelationShipByComparedToValue = new Map(Object.entries(val));
        let comparedTo = comparisonRelationShipByComparedToValue.entries().next().value;
        comparisonRlelationShip = comparedTo[0];

        for (var [key1, val1] of objectProps) {
          nameValueOne = key;
          nameValueTwo = key1
          if (val1 !== null && val1 !== "") {
            if (key1 == key) {
              valueOne = +val1;
            }
            if (key1 == comparedTo[1]) {
              valueTwo = +val1;
            }
          }
        }

        if (valueOne !== null && valueTwo !== null && comparisonRlelationShip == "inferior" && valueOne >= valueTwo) {
          this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameValueOne] = false;
          this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameValueTwo] = false;
        } else {
          this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameValueOne] = true;
          this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameValueTwo] = true;
        }
      }
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
      case "code": {
        this.isCodeValide = true;
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
    this.resetValidationNonStandardProperties(id);
  }

  private resetValidationNonStandardProperties(id: string) {
    if (this._tableRefItemDTO?.tableRefContentDTO?.validationStatusOfRequiredByNonStandardPropertyName) {
      this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[id] = true;
    }
  }

  confirmBackToTAbleRefContenPagination(): void {
    if (this.isExistOnlineModification()) {
      this.openModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    } else {
      this.router.navigate(["consult-table-reference-content/" + this._tableRefItemDTO.idTableRef]);
    }
  }

  isExistOnlineModification(): boolean {
    if (this._isModifyMode) {
      let originalTableRefItemDTO: TableRefItemDTO = JSON.parse(localStorage.getItem("originalTableRefItemDTO"));
      if (originalTableRefItemDTO) {
        return this._tableRefItemDTO.tableRefContentDTO?.code != originalTableRefItemDTO.tableRefContentDTO.code
          || this._tableRefItemDTO.tableRefContentDTO?.tri != originalTableRefItemDTO.tableRefContentDTO.tri
          || this._tableRefItemDTO.tableRefContentDTO?.nom != originalTableRefItemDTO.tableRefContentDTO.nom
          || this._tableRefItemDTO.tableRefContentDTO?.description != originalTableRefItemDTO.tableRefContentDTO.description
          || this._tableRefItemDTO.tableRefContentDTO?.actif != originalTableRefItemDTO.tableRefContentDTO.actif
          || this._tableRefItemDTO.tableRefContentDTO?.defaut != originalTableRefItemDTO.tableRefContentDTO.defaut
          || this._tableRefItemDTO.tableRefContentDTO?.codeCn != originalTableRefItemDTO.tableRefContentDTO.codeCn
          || !CollectionUtils.compareMaps(new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO.objectProps)), new Map(Object.entries(originalTableRefItemDTO.tableRefContentDTO.objectProps)))
      }
      return false;
    }
    return this._tableRefItemDTO.tableRefContentDTO?.code
      || this._tableRefItemDTO.tableRefContentDTO?.tri
      || this._tableRefItemDTO.tableRefContentDTO?.nom
      || this._tableRefItemDTO.tableRefContentDTO?.description
      || this._tableRefItemDTO.tableRefContentDTO?.actif
      || this._tableRefItemDTO.tableRefContentDTO?.defaut
      || this._tableRefItemDTO.tableRefContentDTO?.codeCn
      || !CollectionUtils.isMapValuesEmpty(new Map(Object.entries(this._tableRefItemDTO.tableRefContentDTO?.objectProps)));
  }

  annulerModifEtRetourListeRecherche(): void {
    this.closeModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    this.resetFrom();
    this.router.navigate(["consult-table-reference-content/" + this._tableRefItemDTO.idTableRef]);
  }

  public resetFrom(): void {
    this.mytemplateForm?.reset();
  }

  confirmerAnnulerAction(): void {
    this.openModal('confirm_popup_annuler-modif');
  }

  annulerAction(): void {
    this.closeModal('confirm_popup_annuler-modif');
    if (!this._isModifyMode) {
      this.resetFrom();
    } else if (this.isExistOnlineModification()) {
      this._tableRefItemDTO = JSON.parse(localStorage.getItem("originalTableRefItemDTO"));
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

  getPiloterTablesRefTitleClass(): string {
    let appName: string = window["env"]?.appName;
    let className: string = "piloterTablesRefTitleSocial";
    if (appName == "infosante") {
      className = "piloterTablesRefTitleSante";
    }
    if (appName == "usager") {
      className = "piloterTablesRefTitleUsager";
    }
    return className;
  }

  getRequiredForNonStandardPorperty(nameProperty: string): string {
    if (nameProperty && this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameProperty]) {
      return "required"
    }
  }

  isRequiredForNonStandardPorperty(nameProperty: string): boolean {
    if (nameProperty && this._tableRefItemDTO.tableRefContentDTO.validationStatusOfRequiredByNonStandardPropertyName[nameProperty]) {
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
    this.subscriptions.unsubscribe();
  }

}
