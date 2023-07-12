import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { InputOptionCollection } from '../../utils/input-option';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'msss-edition-liste-entite',
  templateUrl: './edition-liste-entite.component.html',
  styleUrls: ['./edition-liste-entite.component.css']
})
export class EditionListeEntiteComponent implements OnInit, OnDestroy {

  /**Les données de la table des reference de l'entité conserné */
  @Input()
  set referencesReference(values: ReferenceDTO[]) {
    this.chargerListeReferenceEntite(values);
  }
  _referencesReference: ReferenceDTO[];

  /**Les données de l'entité conserné transformées en ReferenceDTO */
  @Input()
  set references(values: ReferenceDTO[]) {
    this.chargerDonnees(values);
  }
  _references: ReferenceDTO[];
  _referencesInitials: ReferenceDTO[];

  @Input()
  titreReference: string;


  @Input()
  required: boolean;

  @Input()
  disabled: boolean;

  /**Si vrai, les boutons d'ajout et de suppression sont masqués*/
  @Input()
  set singleEntity(value: boolean) {
    if (value) {
      this.displayedColumns = ['reference']
    }
    this._singleEntity = value;
  }
  _singleEntity: boolean

  inputOptionsReference: InputOptionCollection = {
    name: "reference",
    options: []
  };
  referenceSuitesInterventionValide: boolean;

  dataSource = new MatTableDataSource<ReferenceDTO>([]);
  displayedColumns: string[] = ['reference', 'action'];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onClickBtnSupprimer(index: number): void {
    const libelle: string = this.translateService.instant(this.titreReference);
    const message: string = this.translateService.instant("ss-iu-a30002", { 0: libelle });
    this.subscriptions.add(
      this.materialModalDialogService.popupConfirmer(message).subscribe(
        (confirm: boolean) => {
          if (confirm) {
            this._references.splice(index, 1);
            this.dataSource.data = this._references;
          }
        }
      )
    );
  }

  onClickBtnAjouterUneLigne(): void {
    this._references.push(new ReferenceDTO());
    this.dataSource.data = this._references;
  }

  isFormVide(): boolean {
    let result: boolean = CollectionUtils.isBlank(this._references)
      && CollectionUtils.isBlank(this._referencesInitials);
    if (!result) {
      if (this._references?.length != this._referencesInitials?.length) {
        return false;
      }
      return this._references.every(item => {
        const aux = this._referencesInitials.find(item2 => item2.id == item.id);
        return item.code == aux?.code;
      });
    }
    return result;
  }

  getDisabledClass(): string {
    return this.disabled ? 'label-disabled' : '';
  }

  getDoublons(): ReferenceDTO[] {
    if (CollectionUtils.isBlank(this._references)) {
      return null;
    }
    let doublons: ReferenceDTO[] = [];
    let aux = [...this._references];
    this._references.forEach(ref => {
      const isDoublon: boolean = aux.filter(item => item.code && item.code == ref.code).length > 1;
      if (isDoublon && doublons.every(elm => elm.code != ref.code)) {
        ref.description = this.inputOptionsReference.options.find(el => el.value === ref.code).label;
        doublons.push(ref);
      }
    });
    return doublons;
  }

  private chargerDonnees(values: ReferenceDTO[]): void {
    this._references = values ? values : [];
    this._referencesInitials = [];
    if (CollectionUtils.isNotBlank(this._references)) {
      this._references.forEach(val => this._referencesInitials.push(Object.assign({}, val)));
    }
    this.dataSource.data = this._references;
  }

  private chargerListeReferenceEntite(values: ReferenceDTO[]): void {
    this.inputOptionsReference.options = [{ label: this.translateService.instant("option.select.message"), value: null }];
    if (CollectionUtils.isNotBlank(values)) {
      values.forEach(item => {
        this.inputOptionsReference.options.push({
          label: item.nom,
          value: item.code,
          description: item.description
        });
      });
    }
  }

}
