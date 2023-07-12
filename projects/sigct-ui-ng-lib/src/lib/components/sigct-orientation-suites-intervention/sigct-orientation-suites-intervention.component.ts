import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from "projects/sigct-service-ng-lib/src/lib/alert/alert.service";
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { TranslateService } from "@ngx-translate/core";
import { RrssDTO } from '../rrss/rrss-dto';
import { Tuple } from '../../utils/tuple';
import { ActionLinkItem } from '../action-link/action-link.component'

import { Subscription } from "rxjs";
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { OrientationSuitesInterventionDTO } from "projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto";

@Component({
  selector: 'app-orientation-suites-intervention',
  templateUrl: './sigct-orientation-suites-intervention.component.html',
  styleUrls: ['./sigct-orientation-suites-intervention.component.css']
})
export class SigctOrientationSuitesInterventionComponent implements OnInit, OnDestroy {

  @ViewChild("fOrientationSuitesIntervention", { static: true })
  fOrientationSuitesIntervention: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @Input()
  idFicheAppel: number;

  @Input()
  libelle: String;

  // Reçoit les orientations déjà en mémoire
  @Input()
  public set listeOrientationRrss(orientations: OrientationSuitesInterventionDTO[]) {
    this.resetForm();
    this.listeOrientation = orientations;
  }

  public inputOptionsOrientationSuitesIntervention: InputOptionCollection = {
    name: "orientation",
    options: []
  };

  @Input("listeRefOrientationSuitesIntervention")
  public set listeRefOrientationSuitesIntervention(values: ReferenceDTO[]) {
    if (this.inputOptionsOrientationSuitesIntervention.options[0] === undefined) {
      this.inputOptionsOrientationSuitesIntervention.options.push({ label: this.translateService.instant("girpi.label.selectionnez"), value: null });
    }

    if (values) {
      values.forEach((item: ReferenceDTO) => {
        let labelStr: string = item.nom;
        if(item.codeCn) {
          labelStr = item.codeCn + ' - ' + labelStr;
        }
        this.inputOptionsOrientationSuitesIntervention.options.push({ label: labelStr, value: item.code, description: item.description });
      })
    }

  }

  @Output()
  orientationSave: EventEmitter<OrientationSuitesInterventionDTO> = new EventEmitter();

  @Output()
  orientationDelete: EventEmitter<OrientationSuitesInterventionDTO> = new EventEmitter();

  private subscription: Subscription = new Subscription();
  listeRessourceRrss: Tuple[] = [];

  label: string="sigct.ss.f_appel.suitesintervention.detailsorientation";

  public idOrientationASupprimer: number = null;
  public orientationSaisi: OrientationSuitesInterventionDTO = new OrientationSuitesInterventionDTO();
  public listeOrientation: Array<OrientationSuitesInterventionDTO>;

  public actionLinks: ActionLinkItem[];
  public messageConfirmSupp: string = null;
  public chosenOrientationValide: boolean = true;
  public messageChampOrientationObligatoire: string;
  public libelleChampOrientation: string;
  private codeCNRefOrientationDejaSaisi: string;

  constructor(private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private alertStore: AlertStore,
    private alertService: AlertService) {

  }

  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.ss.f_appel.suitesintervention.orientation", "sigct.ss.f_appel.suitesintervention.btnajouter",
        "general.msg.obligatoire"]).subscribe((messages: string[]) => {
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.ss.f_appel.suitesintervention.btnajouter"] }];

          const titreMessage = messages["sigct.ss.f_appel.suitesintervention.orientation"];
          this.messageConfirmSupp = this.translateService.instant("ss-iu-a30002", { 0: titreMessage });
          this.libelleChampOrientation = messages["sigct.ss.f_appel.suitesintervention.orientation"];
          this.messageChampOrientationObligatoire = this.translateService.instant("general.msg.obligatoire", { 0: this.libelleChampOrientation });

        })
    );

    
    if(this.libelle=="SA"){
      this.label="sigct.sa.f_appel.suitesintervention.detailsorientation";
       }else{
       this.label="sigct.ss.f_appel.suitesintervention.detailsorientation";
      }
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
  * fonction generique de soumission du formulaire. simule le clic sur le bouton fleche
  */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  //clic sur la fleche
  onSubmit(): void {

    this.alertStore.resetAlert();

    if (!this.validerChampOrientationObligatoire()) {

      this.chosenOrientationValide = false;
      this.alertStore.setAlerts(
        this.alertService.buildErrorAlertModelList([this.messageChampOrientationObligatoire])
      );
      return;
    }

    if (!this.validerOrientationDejaSaisie()) {

      this.chosenOrientationValide = false;
      let msgOrientationDejaSaisie: string;

      this.subscription.add(
        this.translateService.get("ss-iu-e30004", { '0': this.libelleChampOrientation, '1': this.codeCNRefOrientationDejaSaisi })
          .subscribe((value: string) => msgOrientationDejaSaisie = value)
      );

      this.alertStore.setAlerts(
        this.alertService.buildErrorAlertModelList([msgOrientationDejaSaisie])
      );
      return;
    }

    //Les données sont valides
    //On indique au parent que l'on veut sauvegarder l'orientation saisie
    this.orientationSaisi.idFicheAppel = this.idFicheAppel;
    this.orientationSave.emit(this.orientationSaisi);
  }

  resetChampsValides() {
    this.chosenOrientationValide = true;
  }

  /**
   * Valide le(s) champ(s) obligatoire(s) du composant
   */
  private validerChampOrientationObligatoire(): boolean {
    return this.orientationSaisi.codeReferenceOrientation !== undefined
      && this.orientationSaisi.codeReferenceOrientation !== null;
  }

  /**
   * Valide si l'orientation qui veut être sauvegardé est déjà saisi
   * La notion de doublon se fait uniquement sur le contenu de la liste déroulante Orientation
   */
  private validerOrientationDejaSaisie(): boolean {
    let valid: boolean = true;
    this.codeCNRefOrientationDejaSaisi = null;

    if (this.listeOrientation
      && this.orientationSaisi
      && this.orientationSaisi.codeReferenceOrientation) {

      this.listeOrientation.forEach(item => {
        if (item.codeReferenceOrientation == this.orientationSaisi.codeReferenceOrientation) {
          valid = false;
          this.codeCNRefOrientationDejaSaisi = item.codeCnReferenceOrientation ? item.codeCnReferenceOrientation + ' - ' + item.nomReferenceOrientation : item.nomReferenceOrientation;
          return;
        }
      });
    }
    return valid;
  }

  onCloseRrssDialog(rrssDTOList: RrssDTO[]): void {
    if (rrssDTOList && rrssDTOList.length > 0) {
      if (this.orientationSaisi.rrssDTOs) {
        this.orientationSaisi.rrssDTOs.push(...this.extractNewRrssDTOs(rrssDTOList));
      } else {
        this.orientationSaisi.rrssDTOs = rrssDTOList;
      }
      this.listeRessourceRrss = [];
      this.orientationSaisi.rrssDTOs.forEach(rrssDTO => this.listeRessourceRrss.push({
        key: rrssDTO.rrssNom,
        value: rrssDTO.id
      }));
    }
  }

  private extractNewRrssDTOs(rrssDTOList: RrssDTO[]) {
    let push: boolean = true;
    let auxList: RrssDTO[] = [];
    rrssDTOList.forEach(item => {
      this.orientationSaisi.rrssDTOs.forEach((element: RrssDTO) => {
        if (item.rrssId == element.rrssId) {
          push = false;
          return;
        }
      });
      if (push) {
        auxList.push(item);
      }
    });
    return auxList;
  }

  /**
 * Ouvre la boite de dialogue pour confirmer la suppression.
 * @param element
 */
  confirmerSupprimerOrientation(element: any) {
    this.idOrientationASupprimer = element.id;
    let orientation: OrientationSuitesInterventionDTO = this.rechercheOrientation(this.idOrientationASupprimer);

    if (orientation) {
      this.orientationDelete.emit(orientation);
    }
    this.closeModal('confirm_popup_supri_orientation');

    if (this.alertStore) {
      this.alertStore.resetAlert();
    }
    this.reinitialiserChamp();
  }

 

  /**
 * Recherche dans la liste de consultation antérieure la consultation correspondant à l'identifiant reçu
 * @param idConsultationAnterieure
 */
  rechercheOrientation(idOrientation: number): OrientationSuitesInterventionDTO {
    return this.listeOrientation.find((item: OrientationSuitesInterventionDTO) => item.id === idOrientation);
  }

  public resetForm(): void {
    this.reinitialiserChamp();
  }
  /**
 * Réinitialise le contenu des champs de saisi
 */
  public reinitialiserChamp(): void {
    this.orientationSaisi.id = null;
    this.orientationSaisi.codeReferenceOrientation = null;
    this.orientationSaisi.details = null;
    this.orientationSaisi.programmeService = null;
    this.orientationSaisi.rrssDTOs = [];
    this.listeRessourceRrss = [];
    this.chosenOrientationValide = true;
  }

  isEmptyForm(): boolean {
    return !this.orientationSaisi
      || (!this.orientationSaisi.programmeService
        && !this.orientationSaisi.details
        && !this.orientationSaisi.codeReferenceOrientation
        && (!this.orientationSaisi.rrssDTOs
          || this.orientationSaisi.rrssDTOs.length == 0));
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }


  /**
   * Retourne le code HTML d'une orientation pour la liste action
   * @param orientation
   */
  formatActionOrientation(orientation: OrientationSuitesInterventionDTO): string {

    let codeHTML: string = '<div class="list-orientation padding-top-bottom-4"><div class="titre">'
    let fullName: string = orientation.nomReferenceOrientation;
    if(orientation.codeCnReferenceOrientation) {
      fullName = orientation.codeCnReferenceOrientation + ' - ' + fullName;
    }
    codeHTML += fullName;

    codeHTML += '</div>'; // Fermeture de <div class="titre">

    codeHTML += '<div class="contenu">'

    if (orientation.rrssDTOs) {
      orientation.rrssDTOs.forEach((rrss: RrssDTO) => {
        codeHTML += '<div class="rrss"><i class="fa fa-info"></i>';
        codeHTML += '<span>' + rrss.rrssNom + '</span>';
        codeHTML += '</div>'; // Fermeture de <div class="rrss">
      });
    }

    if (orientation.programmeService || orientation.details) {
      codeHTML += '<div class="programme-service-detail">';
    }

    if (orientation.programmeService) {
      codeHTML += '<span>' + orientation.programmeService + '<span>';
    }

    if (orientation.details) {
      codeHTML += '<span class="detail">(' + orientation.details + ')</span>';
    }

    if (orientation.programmeService || orientation.details) {
      codeHTML += '</div>'; // Fermeture de <div class="programme-service-detail">
    }

    codeHTML += '</div>'; // Fermeture de <div class="contenu">
    codeHTML += '</div>'; // Fermeture de <div class="list-orientation padding-top-bottom-2">

    return codeHTML;
  }

  /**
   * Si on clique sur un composant on le rend valide au cas où il est invalide
   * @param idComposant
   */
  public onFocus(idComposant: string): void {

    switch (idComposant) {

      case "referenceOrientationSuitesIntervention": {
        this.chosenOrientationValide = true;

        break;
      }
    }
  }

}
