import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReferenceDTO } from 'projects/infosante-ng-core/src/lib/models/reference-dto';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { RelanceService } from 'projects/sigct-ui-ng-lib/src/lib/components/relance/relance-api.service';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';
import { RelanceDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/relance-dto';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-relance',
  templateUrl: './relance.component.html',
  styleUrls: ['./relance.component.css']
})
export class RelanceComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('formRelance', { static: true })
  formRelance: NgForm;

  @ViewChild('inputDateDebut', { static: false })
  inputDateDebut: SigctDatepickerComponent;

  @Input()
  domaine: string;

  @Input()
  set idFicheAppel(value: number) {
    this.chargerDonnees(value);
  }

  @Output()
  cancelEvent = new EventEmitter();

  @Output()
  returnEvent = new EventEmitter();

  inputOptionsStatut: InputOptionCollection = {
    name: "statut",
    options: []
  };

  inputOptionsAssignation: InputOptionCollection = {
    name: "assignation",
    options: []
  };

  titreInterface: string;

  dto = new RelanceDTO();
  startDate = new Date();
  dateFinStartDate: Date = this.startDate;

  isDateDebutValide: boolean;
  isDateFinValide: boolean;
  isReferenceStatutRelanceValide: boolean;
  isFormOnCreateMode: boolean = true;

  private subscriptions = new Subscription();
  private previousDto: RelanceDTO;
  private referencesStatutRelance: ReferenceDTO[];

  constructor(
    private relanceService: RelanceService,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService,
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore) { }

  ngOnInit(): void {
    this.alertStore.resetAlert();
  }

  ngAfterViewInit(): void {
    this.inputDateDebut?.focus();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Action qui declanche la sauvegarde d'une relance
   */
  onSubmit(): void {
    if (this.isValideForm()) {
      this.subscriptions.add(
        this.relanceService.save(this.dto, this.domaine).subscribe(
          (dto: RelanceDTO) => {
            this.dto = dto;
            this.previousDto = dto;
            this.loadDateHeureDebut();
            this.loadDateHeureFin();
            this.afficherMessageSauvegardeReussie();
            this.relanceService.updateTotalRelancesARealiser(this.domaine);
            this.updateStatutReporteSaved();
          }, (error: HttpErrorResponse) => {
            console.log(error);
          }
        )
      );
    }
  }

  /**
   * Action qui declanche l'annulation de l'edition d'une
   * relance
   */
  onCancel(): void {
    this.cancelEvent.emit();
  }

  /**
   * Action qui declanche le fait de retourner ver la page
   * de la consultation de la fiche d'appel
   */
  onReturn(): void {
    this.alertStore.resetAlert();
    this.returnEvent.emit();
  }

  isFormVide(): boolean {
    return !this.dto || (this.previousDto
      && this.previousDto.dateHeureDebut == this.dto.dateHeureDebut
      && this.previousDto.dateHeureFin == this.dto.dateHeureFin
      && this.previousDto.referenceStatutRelanceId == this.dto.referenceStatutRelanceId
      && this.previousDto.assigneUsername == this.dto.assigneUsername
      && this.previousDto.details == this.dto.details);
  }

  resetForm(idFicheAppel: number) {
    this.formRelance.reset();
    this.chargerDonnees(idFicheAppel);
  }

  onDateDebutChange(): void {
    this.dateFinStartDate = this.dto?.dateHeureDebut ? this.dto.dateHeureDebut : this.startDate;
  }

  onHeureDebutChange(): void {
    if (!DateUtils.isValidTime(this.dto.heureDebut)) {
      this.dto.heureDebut = null;
    }
  }

  onHeureDebutBlur(): void {
    this.dto.heureDebut = DateUtils.completeTimeFormatHHMM(this.dto.heureDebut);
  }

  onHeureFinChange(): void {
    if (!DateUtils.isValidTime(this.dto.heureFin)) {
      this.dto.heureFin = null;
    }
  }

  onHeureFinBlur(): void {
    this.dto.heureFin = DateUtils.completeTimeFormatHHMM(this.dto.heureFin);
  }

  private chargerDonnees(idFicheAppel: number): void {
    if (idFicheAppel !== undefined) {
      this.dto = new RelanceDTO();
      this.alertStore.resetAlert();
      this.resetChampsValides();
      this.subscriptions.add(
        forkJoin([
          this.relanceService.getListeStatusRelance(this.domaine),
          this.relanceService.getListeAssignationsRelance(this.domaine),
          this.relanceService.getRelanceARealiser(idFicheAppel, this.domaine)
        ]).subscribe(results => {
          this.dto.ficheAppelId = idFicheAppel;
          this.majRefStatutsRelance(results[0] as ReferenceDTO[]);
          this.majRefAssignations(results[1] as ReferenceDTO[]);
          if (results[2]) {
            this.dto = results[2];
            this.loadDateHeureDebut();
            this.loadDateHeureFin();
          }
          this.titreInterface = this.dto?.id
            ? 'sigct.ss.f_appel.consultation.modifierrelance'
            : 'sigct.ss.f_appel.consultation.ajouterrelance';
          this.previousDto = { ...this.dto };
          this.listenToBindingErrorStore();
        })
      );
    }
  }

  public getTitleCssSelonModule() {
    return this.relanceService.getModule(this.domaine);
  }

  private loadDateHeureDebut() {
    const date: Date = new Date(this.dto.dateHeureDebut);
    if (date) {
      this.dto.dateHeureDebut = date;
      this.dto.heureDebut = DateUtils.getHourAndMinutesFromDate(date);
    }
  }

  private loadDateHeureFin() {
    const date: Date = new Date(this.dto.dateHeureFin);
    if (date) {
      this.dto.dateHeureFin = date;
      this.dto.heureFin = DateUtils.getHourAndMinutesFromDate(date);
    }
  }

  private majRefStatutsRelance(references: ReferenceDTO[]) {
    this.inputOptionsStatut.options = [];
    this.referencesStatutRelance = references;
    if (references) {
      references.forEach(item => {
        this.inputOptionsStatut.options.push({ label: item.nom, value: '' + item.id, description: item.description });
        if (!this.dto.id && 'SR10' == item.code) {
          this.dto.referenceStatutRelanceId = item.id;
        }
      });
    };
  }

  private majRefAssignations(references: ReferenceDTO[]) {
    this.inputOptionsAssignation.options = [{ label: 'Sélectionnez...', value: "" }];
    if (references) {
      references.forEach(item => {
        this.inputOptionsAssignation.options.push({ label: item.nom, value: item.code, description: item.description });
      });
    };
  }

  private listenToBindingErrorStore() {
    this.subscriptions.add(
      this.bindingErrorsStore.state$.subscribe(errors => {
        if (errors) {
          if (errors['dateDebut']) {
            this.isDateDebutValide = false;
          }
          if (errors['dateFin']) {
            this.isDateFinValide = false;
          }
          if (errors['referenceStatutRelanceId']) {
            this.isReferenceStatutRelanceValide = false;
          }
        }
      })
    );
  }

  private isValideForm(): boolean {
    this.alertStore.resetAlert();
    this.resetChampsValides();

    if (this.dto.id) {
      return true;
    }
    const alertTitle: string = this.translateService.instant("girpi.error.label");
    let messages: string[] = [];

    if (!this.dto.dateHeureDebut || !this.dto.heureDebut) {
      const libelle: string = this.translateService.instant("sigct.ss.f_appel.consultation.relance.edition.dtdebut");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isDateDebutValide = false;
    }
    if (!this.dto.dateHeureFin || !this.dto.heureFin) {
      const libelle: string = this.translateService.instant("sigct.ss.f_appel.consultation.relance.edition.dtfin");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isDateFinValide = false;
    }
    this.dto.dateHeureDebut = DateUtils.updateDateTimeInString(this.dto.dateHeureDebut, this.dto.heureDebut);
    this.dto.dateHeureFin = DateUtils.updateDateTimeInString(this.dto.dateHeureFin, this.dto.heureFin);

    if (this.dto.dateHeureDebut > this.dto.dateHeureFin) {
      const libelle: string = this.translateService.instant("sigct.ss.f_appel.consultation.relance.edition.dtfin");
      let msg: string = this.translateService.instant('ss-iu-e30011');
      msg = libelle + ' : ' + msg.split(":")[1];
      messages.push(msg);
      this.isDateFinValide = false;
    }
    const date = new Date();

    if (this.dto.dateHeureDebut && date > this.dto.dateHeureDebut) {
      const libelle: string = this.translateService.instant("sigct.ss.f_appel.consultation.relance.edition.dtdebut");
      let msg: string = this.translateService.instant('ss-iu-e30009');
      msg = libelle + ' : ' + msg.split(":")[1];
      messages.push(msg);
      this.isDateDebutValide = false;
    }
    if (this.dto.dateHeureFin && date > this.dto.dateHeureFin) {
      const libelle: string = this.translateService.instant("sigct.ss.f_appel.consultation.relance.edition.dtfin");
      let msg: string = this.translateService.instant('ss-iu-e30009');
      msg = libelle + ' : ' + msg.split(":")[1];
      messages.push(msg);
      this.isDateFinValide = false;
    }
    if (messages?.length > 0) {
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  private resetChampsValides() {
    this.isDateDebutValide = true;
    this.isDateFinValide = true;
    this.isReferenceStatutRelanceValide = true;
  }

  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("ss.msg.succes.confirmation");
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    alertM.messages = msg;

    this.alertStore.addAlert(alertM);
  }

  private updateStatutReporteSaved(): void {
    if (CollectionUtils.isNotBlank(this.referencesStatutRelance)) {
      const statutReporte: ReferenceDTO = this.referencesStatutRelance.find(item => item.code == "SR40");

      if (statutReporte && statutReporte.id == this.dto?.referenceStatutRelanceId) {
        this.subscriptions.add(
          this.materialModalDialogService.popupAvertissement("sigct.ss.f_appel.consultation.relance.edition.statutreporte").subscribe(
            (confirm: boolean) => {
              if (confirm) {
                this.onReturn();
              }
            }
          )
        );
      } else {
        this.onReturn();
      }
    }
  }

}
