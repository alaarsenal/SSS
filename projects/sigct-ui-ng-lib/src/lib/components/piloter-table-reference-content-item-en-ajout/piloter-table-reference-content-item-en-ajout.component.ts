import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { TableReferenceService } from 'projects/sigct-service-ng-lib/src/lib/services/table-reference/table-reference-service';
import { Subscription } from 'rxjs';
import { PiloterTableReferenceContentItemAjoutModificationInterfaceComponent } from '../piloter-table-reference-content-item-ajout-modification-interface/piloter-table-reference-content-item-ajout-modification-interface.component';
import { TableRefItemDTO } from '../piloter-table-reference-content-item-en-modification/table-ref-item-DTO';

@Component({
  selector: 'msss-piloter-table-reference-content-item-en-ajout',
  templateUrl: './piloter-table-reference-content-item-en-ajout.component.html',
  styleUrls: ['./piloter-table-reference-content-item-en-ajout.component.css'],
  providers: [DatePipe]
})
export class PiloterTableReferenceContentItemEnAjoutComponent implements OnInit, OnDestroy {

  @ViewChild(PiloterTableReferenceContentItemAjoutModificationInterfaceComponent, { static: true })
  public piloterTableReferenceContentItemAjoutModificationInterface: PiloterTableReferenceContentItemAjoutModificationInterfaceComponent;

  tableRefContentPageTile: string;
  idTableRef: number; // Sert à idendifier la table de référence, qu'on y ajoute du contenu sur l'ajout UI.
  tableRefItemDTO: TableRefItemDTO = new TableRefItemDTO();
  subscriptions: Subscription = new Subscription();
  moduleName: string

  constructor(
    private route: ActivatedRoute,
    private tableReferenceService: TableReferenceService,
    public datePipe: DatePipe,
    private alertStore: AlertStore,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.moduleName = window["env"]?.appName;

    this.subscriptions.add(this.route.paramMap.subscribe((params: ParamMap) => {
      this.idTableRef = +params?.get("idTabRef");
      this.tableRefContentPageTile = params?.get("nomTabRef");
      this.tableRefItemDTO.idTableRef = this.idTableRef;
      this.tableRefItemDTO.descriptionTableRef = this.tableRefContentPageTile;

      this.subscriptions.add(this.tableReferenceService.obtainTableRefEmptyContentToPrepareNewAdd(this.idTableRef).subscribe((result: TableRefItemDTO) => {
        if (result) {
          this.tableRefItemDTO = result;
          this.tableRefItemDTO.tableRefContentDTO = result.tableRefContentDTO;
        }
      }));
    }));
  }

  saveTableRefContentItem(tableRefItemDTO: TableRefItemDTO): void {
    this.tableRefItemDTO = tableRefItemDTO;
    this.tableRefItemDTO.tableRefContentDTO.dateCreation = null;
    this.tableRefItemDTO.tableRefContentDTO.dateModification = null;

    this.subscriptions.add(this.tableReferenceService.updateOrSaveTableRefContent(this.tableRefItemDTO).subscribe((result: TableRefItemDTO) => {
      if (result) {
        this.tableRefItemDTO = result;
        this.tableRefItemDTO.tableRefContentDTO.dateCreation = this.datePipe.transform(result.tableRefContentDTO.dateCreation, "yyyy-MM-dd HH:mm");
        this.tableRefItemDTO.tableRefContentDTO.dateModification = result.tableRefContentDTO.dateModification ? this.datePipe.transform(result.tableRefContentDTO.dateModification, "yyyy-MM-dd HH:mm") : null;
        localStorage.setItem("originalTableRefItemDTO", JSON.stringify(this.tableRefItemDTO));
        this.piloterTableReferenceContentItemAjoutModificationInterface.isModifyMode = true;
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
    this.subscriptions.unsubscribe()
  }

}
