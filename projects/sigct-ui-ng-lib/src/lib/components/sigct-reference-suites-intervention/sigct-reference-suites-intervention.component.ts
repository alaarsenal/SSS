import { Component, OnInit, ViewChild, EventEmitter, Output, Input, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { InputOptionCollection } from '../../utils/input-option';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { RrssDTO } from '../rrss/rrss-dto';
import { Tuple } from '../../utils/tuple';
import { ActionLinkItem } from '../action-link/action-link.component';

@Component({
  selector: 'app-reference-suites-intervention',
  templateUrl: './sigct-reference-suites-intervention.component.html',
  styleUrls: ['./sigct-reference-suites-intervention.component.css']
})
export class SigctReferenceSuitesInterventionComponent implements OnInit, OnDestroy {

  @ViewChild("fReferenceSuitesIntervention", { static: true })
  fReferenceSuitesIntervention: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @Input()
  idFicheAppel: number;

  @Input()
  libelle: String;


  @Input()
  set listeReferenceSuitesIntervention(values: ReferenceSuitesInterventionDTO[]) {
    this.resetForm();
    this.listeReferenceSuitesInterventionDTO = values
  }
  listeReferenceSuitesInterventionDTO: ReferenceSuitesInterventionDTO[];

  @Input("listeRefReferenceSuiteIntervention")
  public set listeRefReferenceSuiteIntervention(values: ReferenceDTO[]) {
    if (this.inputOptionsReference.options[0] === undefined) {
      this.inputOptionsReference.options.push({
        label: this.translate.instant("girpi.label.selectionnez"),
        value: null
      });
    }

    if (values) {
      values.forEach((item: ReferenceDTO) => {
        let labelStr: string = item.nom;
        if(item.codeCn) {
          labelStr = item.codeCn + ' - ' + labelStr;
        }
        this.inputOptionsReference.options.push({
          label: labelStr,
          value: item.code,
          description: item.description
        });
      });
      this.listeRefReferenceSuiteInterventionDTO = values;
    }
  }
  listeRefReferenceSuiteInterventionDTO: ReferenceDTO[];

  @Output('onSubmit')
  submitEvent: EventEmitter<ReferenceSuitesInterventionDTO> = new EventEmitter<ReferenceSuitesInterventionDTO>();

  @Output('onDelete')
  deleteEvent: EventEmitter<number> = new EventEmitter<number>();

  referenceSuitesInterventionDTO: ReferenceSuitesInterventionDTO = new ReferenceSuitesInterventionDTO();
  referenceSuitesInterventionSelectionneDTO: ReferenceSuitesInterventionDTO;
  codeCNReferenceSuiteInterventionDTO: string;

  inputOptionsReference: InputOptionCollection = {
    name: "reference",
    options: []
  };
  referenceValid: boolean = true;
  label: string="sigct.ss.f_appel.suitesintervention.detailsorientation";

  listeRessourceRrss: Tuple[] = [];

  modalConfirmationId: string = "confirm_popup_suppression_reference";
  msgChampReferenceObligatoire: string;
  msgReferenceDejaSaisie: string;
  msgConfirmDelete: string;
  nomSection: string;

  private subscription: Subscription = new Subscription();
  public actionLinks: ActionLinkItem[];

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private translate: TranslateService,
    private modalConfirmService: ConfirmationDialogService) { }

  ngOnInit(): void {
    this.fReferenceSuitesIntervention.reset();
    this.subscription.add(
      this.translate.get(["ss-iu-e00009", "sigct.ss.f_appel.suitesintervention.reference", "sigct.ss.f_appel.suitesintervention.btnajouter"])
        .subscribe((messages: string[]) => {
          this.msgChampReferenceObligatoire = messages["ss-iu-e00009"];
          this.nomSection = messages["sigct.ss.f_appel.suitesintervention.reference"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.ss.f_appel.suitesintervention.btnajouter"] }];
        })
    );

    if(this.libelle=="SA"){
      this.label="sigct.sa.f_appel.suitesintervention.detailsorientation";
       }else{
       this.label="sigct.ss.f_appel.suitesintervention.detailsorientation";
      }

  }

  onOptionSelectedReference(): void {
    this.referenceValid = true;
  }

  /**
* fonction generique de soumission du formulaire. simule le clic sur le bouton fleche
*/
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit(): void {
    this.referenceValid = true;
    this.alertStore.resetAlert();

    if (!this.validerChampReferenceObligatoire()) {
      this.referenceValid = false;
      this.alertStore.addAlerts(this.alertService.buildErrorAlertModelList([this.msgChampReferenceObligatoire]));
      return;
    }
    if (!this.validerReferenceDejaSaisie()) {
      this.subscription.add(
        //ss-iu-e30004={{0}} : l'information {{1}} existe déjà.
        this.translate.get("ss-iu-e30004", { '0': this.nomSection, '1': this.codeCNReferenceSuiteInterventionDTO })
          .subscribe((value: string) => this.msgReferenceDejaSaisie = value)
      );
      this.alertStore.addAlerts(this.alertService.buildWarningAlertModelList([this.msgReferenceDejaSaisie]));
    }
    this.referenceSuitesInterventionDTO.idFicheAppel = this.idFicheAppel;
    this.submitEvent.emit({ ...this.referenceSuitesInterventionDTO });
  }

  resetForm(): void {
    this.fReferenceSuitesIntervention.reset();
    this.referenceSuitesInterventionDTO.rrssDTOs = [];
    this.listeRessourceRrss = [];
    this.referenceValid = true;
  }

  resetChampsValides() {
    this.referenceValid = true;
  }

  onDelete(referenceSuitesInterventionDTO: ReferenceSuitesInterventionDTO): void {
    this.referenceSuitesInterventionSelectionneDTO = {
      ...referenceSuitesInterventionDTO
    };
    this.subscription.add(
      this.translate.get("ss-iu-a00003", { '0': this.nomSection })
        .subscribe((value: string) => this.msgConfirmDelete = value)
    );
    if (this.alertStore) {
      this.alertStore.resetAlert();
    }
    this.resetForm();

    this.deleteEvent.emit(this.referenceSuitesInterventionSelectionneDTO.id);
  }



  onCloseRrssDialog(rrssDTOList: RrssDTO[]): void {
    if (rrssDTOList) {
      this.referenceSuitesInterventionDTO.rrssDTOs = rrssDTOList;
      this.listeRessourceRrss = [];
      rrssDTOList.forEach(rrssDTO => this.listeRessourceRrss.push({
        key: rrssDTO.rrssNom,
        value: rrssDTO.id
      }));
    }
  }

  isEmptyForm(): boolean {
    return !this.referenceSuitesInterventionDTO
      || (!this.referenceSuitesInterventionDTO.programmeService
        && !this.referenceSuitesInterventionDTO.details
        && !this.referenceSuitesInterventionDTO.codeReferenceReference
        && (!this.referenceSuitesInterventionDTO.rrssDTOs
          || this.referenceSuitesInterventionDTO.rrssDTOs.length == 0));
  }

  private validerChampReferenceObligatoire(): boolean {
    return this.referenceSuitesInterventionDTO.codeReferenceReference !== undefined
      && this.referenceSuitesInterventionDTO.codeReferenceReference !== null;
  }

  private validerReferenceDejaSaisie(): boolean {
    let valid: boolean = true;
    this.codeCNReferenceSuiteInterventionDTO = null;

    if (this.listeReferenceSuitesInterventionDTO
      && this.referenceSuitesInterventionDTO
      && this.referenceSuitesInterventionDTO.codeReferenceReference) {

      this.listeReferenceSuitesInterventionDTO.forEach((item: ReferenceSuitesInterventionDTO) => {
        if (item.codeReferenceReference == this.referenceSuitesInterventionDTO.codeReferenceReference) {

          this.codeCNReferenceSuiteInterventionDTO = item.codeCnReferenceReference ? item.codeCnReferenceReference + ' - ' + item.nomReferenceReference : item.nomReferenceReference;
          valid = false;
          return;
        }
      });
    }
    return valid;
  }

  /**
    * Retourne le code HTML d'une reference pour la liste action
    * @param reference
    */
  formatActionReferenceSuitesIntervention(reference: ReferenceSuitesInterventionDTO): string {

    let codeHTML: string = '<div class="list-reference padding-top-bottom-4"><div class="titre">'
    let fullName: string = reference.nomReferenceReference;
    if(reference.codeCnReferenceReference) {
      fullName = reference.codeCnReferenceReference + ' - ' + fullName;
    }
    codeHTML += fullName;

    codeHTML += '</div>'; // Fermeture de <div class="titre">

    codeHTML += '<div class="contenu">'

    if (reference.rrssDTOs) {
      reference.rrssDTOs.forEach((rrss: RrssDTO) => {
        codeHTML += '<div class="rrss"><i class="fa fa-info"></i>';
        codeHTML += '<span>' + rrss.rrssNom + '</span>';
        codeHTML += '</div>'; // Fermeture de <div class="rrss">
      });
    }

    if (reference.programmeService || reference.details) {
      codeHTML += '<div class="programme-service-detail">';
    }

    if (reference.programmeService) {
      codeHTML += '<span>' + reference.programmeService + '<span>';
    }

    if (reference.details) {
      codeHTML += '<span class="detail">(' + reference.details + ')</span>';
    }

    if (reference.programmeService || reference.details) {
      codeHTML += '</div>'; // Fermeture de <div class="programme-service-detail">
    }

    codeHTML += '</div>'; // Fermeture de <div class="contenu">
    codeHTML += '</div>'; // Fermeture de <div class="list padding-top-bottom-2">

    return codeHTML;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
