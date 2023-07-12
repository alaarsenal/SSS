import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FicheAppelSocialDTO, MedicationSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';

@Component({
  selector: 'app-medication-actuelle',
  templateUrl: './medication-actuelle.component.html',
  styleUrls: ['./medication-actuelle.component.css']
})
export class MedicationActuelleComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  @Input()
  public id: string;
  public actionLinks: ActionLinkItem[];
  public listeMedications: Array<MedicationSocialDTO> = new Array<MedicationSocialDTO>();
  public idMedicationSocialSelectionne: number = null;
  public idMedicationSocialSelectionneNouveau: number = null;
  public idMedicationSocialASupprimer: number = null;

  public medicationSocialSaisi: MedicationSocialDTO = new MedicationSocialDTO();

  public titreMessage: string;
  public messageConfirmModif: string = null;
  public messageConfirmSupp: string = null;
  public isMedicationValide: boolean = true;

  @Input()
  public disabledAll: boolean = false;

  set isDisabled(disabled: boolean) {
    this.disabledAll = disabled;
    if (disabled==true) {
      this.medicationSocialSaisi = new MedicationSocialDTO();
    }
  }

  get isDisabled(): boolean {
    return this.disabledAll;
  }

  @ViewChild("fMed", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @ViewChild("medication", { static: true })
  medication: InputTextComponent;

  @Input("ficheAppel") public ficheAppelSocialDto: FicheAppelSocialDTO;

  /**
   * Peuple la liste des medications sauvegardes dans la base de donnees
   */
  @Input("listeMedication")
  public set listeMedication(medicationsSocialDTO: MedicationSocialDTO[]) {

    this.listeMedications = new Array<MedicationSocialDTO>();

    this.listeMedications = medicationsSocialDTO;

    //La liste est rechargée, si un élément de la liste était sélectionné on enlève la sélection
    this.deselectionnerMedication();
    this.resetChampsValides();
  }


  //Les événements qui sont poussés au parent
  @Output()
  medicationSave: EventEmitter<MedicationSocialDTO> = new EventEmitter();

  @Output()
  medicationDelete: EventEmitter<MedicationSocialDTO> = new EventEmitter();

  constructor(private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService) { }

  ngOnInit() {

    this.actionLinks = [{
                          action: this.submitAction,
                          icon: "fa fa-arrow-right fa-2x",
                          label: this.translateService.instant('sigct.ss.f_appel.compflechebleue.btnajouter'),
                        }];

      this.titreMessage = this.translateService.instant('sigct.so.f_appel.analyse.medactuelle');

      this.messageConfirmModif = this.translateService.instant("ss-iu-a30004", { 0: this.titreMessage });
      this.messageConfirmSupp = this.translateService.instant("ss-iu-a30002", { 0: this.titreMessage });
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

  onSubmit() {
    //On indique au parent que l'on veut sauvegarder la medication saisie
    this.medicationSave.emit(this.medicationSocialSaisi);
  }

  /**Effacer les highlights rouges des champs */
  resetChampsValides() {
    this.isMedicationValide = true;
  }

  /**
  * Formate la medication dans la liste à droite
  * @param medication
  */
  formatActionMedication(medication: MedicationSocialDTO) {
    let mediStr: string = '<span style="color:black;"> ' + medication.medication;

    if (medication.details) {
      mediStr += " (<i>" + medication.details + "</i>)</span>";
    }
    else {
      mediStr += "</span>";
    }

    return mediStr;

  }

  /**
 * vérifie si les champs de saisi de médication sont vide.
 * Si c'est le cas on renseigne les champs de saisi avec la médication à modifier
 * Sinon on affiche une popup de confirmation
 *
 * @param element
 */
  confirmerModifierMedication(element: any) {
    this.idMedicationSocialSelectionneNouveau = element.id;

    if (this.isMedicationVide(this.medicationSocialSaisi)) {
      this.remplacerMedication();
    } else {
      this.openModal('confirm_popup_modif_medication', 'confi_med_btn_oui');
    }
  }

  isMedicationVide(medication: MedicationSocialDTO): boolean {
    let champDetailVide: boolean = false;
    let champMedicationVide: boolean = false;

    if (!medication.details || StringUtils.isEmpty(medication.details)) {
      champDetailVide = true;
    }

    if (!medication.medication || StringUtils.isEmpty(medication.medication)) {
      champMedicationVide = true;
    }

    return champDetailVide && champMedicationVide;
  }

  /**
   * Utilisé par le composant parent
   */
  public isChampVide(): boolean {
    return this.isMedicationVide(this.medicationSocialSaisi);
  }

  /**
   * Recherche dans la liste de medication la medication correspondant à l'identifiant reçu
   * @param idMedicationSocial
   */
  rechercheMedication(idMedicationSocial: number): MedicationSocialDTO {
    return this.listeMedications.find((item: MedicationSocialDTO) => item.id === idMedicationSocial);;
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
   * Alimente les champs de saisi avec la médication sélectionné
   * Ferme la fenêtre de confirmation au cas ou elle est ouverte
   * Met le focus sur le champ medication
   */
  remplacerMedication(): void {
    this.idMedicationSocialSelectionne = this.idMedicationSocialSelectionneNouveau;

    // si on utilise l'objet retourné par rechercheMedication les modifications de l'utilisateur se verront directement
    // dans la liste de droite, ce que l'on ne veut pas
    let data: MedicationSocialDTO = this.rechercheMedication(this.idMedicationSocialSelectionne);
    this.medicationSocialSaisi.id = data.id;
    this.medicationSocialSaisi.medication = data.medication;
    this.medicationSocialSaisi.details = data.details;

    this.closeModal('confirm_popup_modif_medication');
    this.medication.focus();
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerMedication(element: any) {
    this.idMedicationSocialASupprimer = element.id;
    let medication: MedicationSocialDTO = this.rechercheMedication(this.idMedicationSocialASupprimer);

    if (medication) {
      this.medicationDelete.emit(medication);
    }
    this.reinitialiserChamp();
  }

  supprimerMedication() {

    let medication: MedicationSocialDTO = this.rechercheMedication(this.idMedicationSocialASupprimer);

    if (medication) {
      this.medicationDelete.emit(medication);
    }
    this.closeModal('confirm_popup_supri_medication');

    this.reinitialiserChamp();
  }

  /**
   * Lorsqu'on clique sur le champ Medication, on le rend valide au cas ou il soit invalide
   * @param idComposant non utilisé car dans ce composant il n'y a qu'un seul champ qui peut être invalide
   */
  public onFocusMedication(idComposant: string): void {
    this.setValideChampMedication(true);
  }

  /**
   * Réinitialise le contenu des champs de saisi
   */
  public reinitialiserChamp(): void {
    this.medicationSocialSaisi.id = null;
    this.medicationSocialSaisi.details = null;
    this.medicationSocialSaisi.medication = null;
  }

  /**
   * Au cas ou une médication est sélectionnée dans la liste de droite on enlève la sélection
   */
  public deselectionnerMedication(): void {
    this.idMedicationSocialSelectionne = null;
    this.idMedicationSocialSelectionneNouveau = null;
  }

  public setValideChampMedication(param: boolean) {
    this.isMedicationValide = param;
  }
}
