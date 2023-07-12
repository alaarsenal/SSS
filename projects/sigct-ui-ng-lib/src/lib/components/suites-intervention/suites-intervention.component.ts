import { Component, OnInit, Input, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { RrssDTO } from '../rrss/rrss-dto';
import { InputOptionCollection } from '../../utils/input-option';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { Subscription } from 'rxjs';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { MatTableDataSource } from '@angular/material/table';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { TranslateService } from '@ngx-translate/core';

export interface ItemSuitesIntervention {
  id?: number;
  idFicheAppel: number;
  codeReferenceSuitesIntervention?: string;
  codeCnReferenceSuitesIntervention?: string;
  nomReferenceSuitesIntervention?: string;
  programmeService?: string;
  details?: string;
  rrssDTOs?: RrssDTO[];
  rrssListContent?: string;
}

@Component({
  selector: 'msss-suites-intervention',
  templateUrl: './suites-intervention.component.html',
  styleUrls: ['./suites-intervention.component.css']
})
export class SuitesInterventionComponent implements OnInit, OnDestroy {

  @Input()
  set orientations(values: OrientationSuitesInterventionDTO[]) {
    this.chargerDonneesOrientations(values);
  }

  @Input()
  set references(values: ReferenceSuitesInterventionDTO[]) {
    this.chargerDonneesReferences(values);
  }

  @Input()
  set referencesItemSuitesIntervention(values: ReferenceDTO[]) {
    this.chargerReferencesItemSuitesIntervention(values);
  }

  @Input()
  idFicheAppel: number;
  @Input()
  libelle: string;

  @Output()
  updateListEvent = new EventEmitter<number>();

  dataSource = new MatTableDataSource<ItemSuitesIntervention>([]);
  suitesInterventions: ItemSuitesIntervention[];
  suitesInterventionsInitial: ItemSuitesIntervention[];

  inputOptionsReferenceSuitesIntervention: InputOptionCollection = {
    name: "referenceSuitesIntervention",
    options: []
  };
  titreReferenceSuitesIntervention: string;
  suitesinterventionLabel: string="sigct.ss.f_appel.corriger.suitesintervention.details";

  displayedColumns: string[] = ['referenceSuitesIntervention', 'rrss', 'programmeService', 'details', 'action'];

  isSuitesInterventionReference: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    if(this.libelle=="SA"){
      this.suitesinterventionLabel="sigct.sa.f_appel.corriger.suitesintervention.details";
       }else{
       this.suitesinterventionLabel="sigct.ss.f_appel.corriger.suitesintervention.details";
      }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCloseRrssDialog(rrssDTOList: RrssDTO[], item: ItemSuitesIntervention): void {
    if (item && CollectionUtils.isNotBlank(rrssDTOList)) {
      item.rrssDTOs = [...rrssDTOList];
      item.rrssListContent = this.generateRrssListContent(rrssDTOList, item.rrssListContent);
    }
  }

  onClickBtnSupprimer(index: number): void {
    const libelle: string = this.translateService.instant(this.titreReferenceSuitesIntervention);
    const message: string = this.translateService.instant("ss-iu-a30002", { 0: libelle });
    this.subscriptions.add(
      this.materialModalDialogService.popupConfirmer(message).subscribe(
        (confirm: boolean) => {
          if (confirm) {
            this.suitesInterventions.splice(index, 1);
            this.dataSource.data = this.suitesInterventions;
            this.updateListEvent.emit(this.suitesInterventions?.length);
          }
        }
      )
    );
  }

  onClickBtnAjouterUneLigne(): void {
    this.suitesInterventions.push({ idFicheAppel: this.idFicheAppel, rrssListContent: "" });
    this.dataSource.data = this.suitesInterventions;
    this.updateListEvent.emit(this.suitesInterventions?.length);
  }

  isFormVide(): boolean {
    let result: boolean = CollectionUtils.isBlank(this.suitesInterventions)
      && CollectionUtils.isBlank(this.suitesInterventionsInitial);
    if (!result) {
      if (this.suitesInterventions?.length != this.suitesInterventionsInitial?.length) {
        return false;
      }
      return this.suitesInterventions.every(item => {
        const aux = this.suitesInterventionsInitial.find(item2 => item2.id == item.id);
        return aux
          && aux.codeReferenceSuitesIntervention == item.codeReferenceSuitesIntervention
          && aux.programmeService == item.programmeService
          && aux.details == item.details
          && aux.rrssListContent == item.rrssListContent;
      });
    }
    return result;
  }

  getDoublons(): ItemSuitesIntervention[] {
    if (CollectionUtils.isBlank(this.suitesInterventions)) {
      return null;
    }
    let doublons: ItemSuitesIntervention[] = [];
    let aux = [...this.suitesInterventions];
    this.suitesInterventions.forEach(ref => {
      const isDoublon: boolean = aux.filter(
        item => item.codeReferenceSuitesIntervention == ref.codeReferenceSuitesIntervention
      ).length > 1;
      if (isDoublon && doublons.every(elm => elm.codeReferenceSuitesIntervention != ref.codeReferenceSuitesIntervention)) {
        ref.nomReferenceSuitesIntervention = this.inputOptionsReferenceSuitesIntervention.options.find(el => el.value === ref.codeReferenceSuitesIntervention).label;
        doublons.push(ref);
      }
    });
    return doublons;
  }

  private chargerDonneesOrientations(values: OrientationSuitesInterventionDTO[]): void {
    this.suitesInterventions = [];
    if (CollectionUtils.isNotBlank(values)) {
      values.forEach(item => {
        this.suitesInterventions.push({
          id: item.id,
          idFicheAppel: item.idFicheAppel,
          codeCnReferenceSuitesIntervention: item.codeCnReferenceOrientation,
          codeReferenceSuitesIntervention: item.codeReferenceOrientation,
          nomReferenceSuitesIntervention: item.nomReferenceOrientation,
          programmeService: item.programmeService,
          details: item.details,
          rrssDTOs: item.rrssDTOs,
          rrssListContent: this.generateRrssListContent(item.rrssDTOs)
        });
      });
    } else if (values != undefined) {
      this.titreReferenceSuitesIntervention = "sigct.ss.f_appel.corriger.suitesintervention.orientation";
      this.isSuitesInterventionReference = false;
    }
    this.suitesInterventionsInitial = [...this.suitesInterventions];
    this.dataSource.data = this.suitesInterventions;
  }

  private chargerDonneesReferences(values: ReferenceSuitesInterventionDTO[]): void {
    this.suitesInterventions = [];
    if (CollectionUtils.isNotBlank(values)) {
      values.forEach(item => {
        this.suitesInterventions.push({
          id: item.id,
          idFicheAppel: item.idFicheAppel,
          codeCnReferenceSuitesIntervention: item.codeCnReferenceReference,
          codeReferenceSuitesIntervention: item.codeReferenceReference,
          nomReferenceSuitesIntervention: item.nomReferenceReference,
          programmeService: item.programmeService,
          details: item.details,
          rrssDTOs: item.rrssDTOs,
          rrssListContent: this.generateRrssListContent(item.rrssDTOs)
        });
      });
    } else if (values != undefined) {
      this.titreReferenceSuitesIntervention = "sigct.ss.f_appel.corriger.suitesintervention.reference";
      this.isSuitesInterventionReference = true;
    }
    this.suitesInterventionsInitial = [...this.suitesInterventions];
    this.dataSource.data = this.suitesInterventions;
  }

  private chargerReferencesItemSuitesIntervention(values: ReferenceDTO[]): void {
    this.inputOptionsReferenceSuitesIntervention.options = [
      { label: this.translateService.instant("option.select.message"), value: null }
    ];
    if (CollectionUtils.isNotBlank(values)) {
      values.forEach(item => {
        let labelStr: string = item.nom;
        if(item.codeCn) {
          labelStr = item.codeCn + ' - ' + labelStr;
        }
        this.inputOptionsReferenceSuitesIntervention.options.push({
          label: labelStr,
          value: item.code,
          description: item.description
        });
      });
    }
  }

  private generateRrssListContent(rrssDTOList: RrssDTO[], rrssListContent?: string): string {
    if (!rrssListContent || this.isSuitesInterventionReference) {
      rrssListContent = "";
    }
    if (CollectionUtils.isBlank(rrssDTOList)) {
      return rrssListContent;
    }
    rrssDTOList.forEach(rrssDTO => {
      rrssListContent += "; " + rrssDTO.rrssNom;
    });
    if (rrssListContent.charAt(0) == ';') {
      rrssListContent = rrssListContent.substring(2, rrssListContent.length);
    }
    return rrssListContent;
  }

}
