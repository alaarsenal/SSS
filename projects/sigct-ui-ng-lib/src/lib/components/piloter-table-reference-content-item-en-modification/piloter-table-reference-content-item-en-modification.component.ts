import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { TableReferenceService } from 'projects/sigct-service-ng-lib/src/lib/services/table-reference/table-reference-service';
import { Subscription } from 'rxjs';
import { InputOptionCollection } from '../../utils/input-option';
import { PiloterTableReferenceContentItemAjoutModificationInterfaceComponent } from '../piloter-table-reference-content-item-ajout-modification-interface/piloter-table-reference-content-item-ajout-modification-interface.component';
import { TableRefItemDTO } from './table-ref-item-DTO';

@Component({
  selector: 'msss-piloter-table-reference-content-item-en-modification',
  templateUrl: './piloter-table-reference-content-item-en-modification.component.html',
  styleUrls: ['./piloter-table-reference-content-item-en-modification.component.css'],
  providers: [DatePipe]
})
export class PiloterTableReferenceContentItemEnModificationComponent implements OnInit, OnDestroy {

  @ViewChild(PiloterTableReferenceContentItemAjoutModificationInterfaceComponent, { static: true })
  public piloterTableReferenceContentItemAjoutModificationInterface: PiloterTableReferenceContentItemAjoutModificationInterfaceComponent;

  idTableRefTargetForModiftUI: number; // Sert à idendifier la table de référence, table mere de l'enrégistrement en cours de modification.
  idTableRefItemTargetForModiftUI: number; // Sert à idendifier l'enrégistrement la table de référence, qu'on modifie sont contenu.
  tableRefItemDTO: TableRefItemDTO = new TableRefItemDTO();
  subscriptoins: Subscription = new Subscription();
  moduleName: string

  inputOptionActif: InputOptionCollection = {
    name: "actif",
    options: [{ label: 'sigct.so.pilotage.tableref.valeur.edition.actif', value: 'false' }]
  };

  inputOptionDefaut: InputOptionCollection = {
    name: "actif",
    options: [{ label: 'sigct.so.pilotage.tableref.valeur.edition.pardefaut', value: 'false' }]
  };
  constructor(
  private route: ActivatedRoute,
    private tableReferenceService: TableReferenceService,
    public datePipe: DatePipe,
    private alertStore: AlertStore,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.moduleName = window["env"]?.appName;

    this.subscriptoins.add(this.route.paramMap.subscribe((params: ParamMap) => {
      let _idTableRefTargetForModiftUIStr = params?.get("idTabRef");
      let _idTableRefItemTargetForModiftUIStr = params?.get("idTabRefItem");
      let isValidParams = _idTableRefTargetForModiftUIStr && !isNaN(+_idTableRefTargetForModiftUIStr)
        && _idTableRefItemTargetForModiftUIStr
        && !isNaN(+_idTableRefItemTargetForModiftUIStr)
      if (isValidParams) {
        this.idTableRefTargetForModiftUI = +_idTableRefTargetForModiftUIStr;
        this.idTableRefItemTargetForModiftUI = +_idTableRefItemTargetForModiftUIStr;
        this.subscriptoins.add(this.tableReferenceService.obtainTableRefContentItem(this.idTableRefTargetForModiftUI, this.idTableRefItemTargetForModiftUI).subscribe((result: TableRefItemDTO) => {
          if (result) {
            this.tableRefItemDTO = result;
            this.tableRefItemDTO.tableRefContentDTO.dateCreation =  this.datePipe.transform(result.tableRefContentDTO.dateCreation, "yyyy-MM-dd HH:mm");
            this.tableRefItemDTO.tableRefContentDTO.dateModification = result.tableRefContentDTO.dateModification? this.datePipe.transform(result.tableRefContentDTO.dateModification, "yyyy-MM-dd HH:mm"): null;
            localStorage.setItem("originalTableRefItemDTO", JSON.stringify(this.tableRefItemDTO));
          }
        }));
      }
    }));
  }

  saveTableRefContentItem(tableRefItemDTO: TableRefItemDTO): void {
    this.tableRefItemDTO = tableRefItemDTO;
    this.tableRefItemDTO.tableRefContentDTO.dateCreation = null;
    this.tableRefItemDTO.tableRefContentDTO.dateModification = null;

    this.subscriptoins.add(this.tableReferenceService.updateOrSaveTableRefContent(this.tableRefItemDTO).subscribe((result: TableRefItemDTO) => {
      if (result) {
        this.tableRefItemDTO = result;
        this.tableRefItemDTO.tableRefContentDTO.dateCreation =  this.datePipe.transform(result.tableRefContentDTO.dateCreation, "yyyy-MM-dd HH:mm");
        this.tableRefItemDTO.tableRefContentDTO.dateModification = result.tableRefContentDTO.dateModification? this.datePipe.transform(result.tableRefContentDTO.dateModification, "yyyy-MM-dd HH:mm"): null;
        localStorage.setItem("originalTableRefItemDTO", JSON.stringify(this.tableRefItemDTO));
        this.afficherMessageSauvegardeReussie();
      }
    }));
  }

  private afficherMessageSauvegardeReussie(): void {
    const alertM: AlertModel = new AlertModel();
    alertM.title = "Confirmation";
    alertM.messages = [this.translateService.instant("ss-iu-c00008")];
    alertM.type = AlertType.SUCCESS;
    this.alertStore.addAlert(alertM);
  }

  ngOnDestroy(): void {
    this.subscriptoins.unsubscribe()
  }
  
}
