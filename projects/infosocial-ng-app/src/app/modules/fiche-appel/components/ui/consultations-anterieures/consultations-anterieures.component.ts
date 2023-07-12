import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { BindingErrors, BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConsultationAnterieureDTO, FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { NgForm } from '@angular/forms';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ReferenceRessConsultDTO } from '../../../models/reference-ress-consult-dto';



@Component({
  selector: 'app-consultations-anterieures',
  templateUrl: './consultations-anterieures.component.html',
  styleUrls: ['./consultations-anterieures.component.css']
})
export class ConsultationsAnterieuresComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  @Input()
  public id: string;
  public actionLinks: ActionLinkItem[];
  public listeConsultationsAnterieure: Array<ConsultationAnterieureDTO>;
  public idConsultationAnterieureSelectionne: number = null;
  public idConsultationAnterieureSelectionneNouveau: number = null;
  public idConsultationAnterieureASupprimer: number = null;

  @Input()
  public consultationAnterieureSaisi: ConsultationAnterieureDTO = new ConsultationAnterieureDTO();

  public titreMessage: string;
  public messageConfirmModif: string = null;
  public messageConfirmSupp: string = null;

  public bindingErrors: BindingErrors;

  raisonConsultationValide: boolean = true;

  @ViewChild("fConsultationAnterieure", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @ViewChild("momentConsultation", { static: true })
  momentConsultation: InputTextComponent;


  @Input("ficheAppel") public ficheAppelSocialDTO: FicheAppelSocialDTO;


  @Input()
  public disabledAll: boolean = false;

  set isDisabled(disabled: boolean) {
    this.disabledAll = disabled;
    if (disabled==true) {
      this.consultationAnterieureSaisi = new ConsultationAnterieureDTO;
    }
  }

  get isDisabled(): boolean {
    return this.disabledAll;
  }

  /**
   * Peuple la liste des consultations antérieures sauvegardes dans la base de donnees
   */
  @Input("listeConsultationAnterieure")
  public set listeConsultationAnterieure(consultationsAnterieureDTO: ConsultationAnterieureDTO[]) {

    this.listeConsultationsAnterieure = consultationsAnterieureDTO;


    //La liste est rechargée, si un élément de la liste était sélectionné on enlève la sélection
    this.deselectionnerConsultationAnterieure();

  }

  public inputOptionsRessourceConsulte: InputOptionCollection = {
    name: "ressourceConsulte",
    options: []
  };
  public listeRefRessConsultDTO: ReferenceRessConsultDTO[] = new Array<ReferenceRessConsultDTO>();

  @Input("listeRefRessConsult")
  public set listeRefRessConsult(values: ReferenceRessConsultDTO[]) {

    if (this.inputOptionsRessourceConsulte.options[0] === undefined) {
      this.inputOptionsRessourceConsulte.options.push({ label: this.translateService.instant("girpi.label.selectionnez"), value: null });
    }

    if (values) {
      values.forEach((item: ReferenceRessConsultDTO) => {
        this.inputOptionsRessourceConsulte.options.push({ label: item.nom, value: item.code, description: item.description });
      });
      this.listeRefRessConsultDTO = values;
    }
  }

  @Output()
  consultationAnterieureSave: EventEmitter<ConsultationAnterieureDTO> = new EventEmitter();

  @Output()
  consultationAnterieureDelete: EventEmitter<ConsultationAnterieureDTO> = new EventEmitter();


  constructor(private translateService: TranslateService,
    private bindingErrorsStore: BindingErrorsStore,
    private modalConfirmService: ConfirmationDialogService) { }

  ngOnInit() {
    this.subscription.add(
      this.translateService.get(["sigct.so.f_appel.analyse.medactuelle.btnajouter", "sigct.so.f_appel.analyse.consulant"]).subscribe((messages: string[]) => {
        this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.so.f_appel.analyse.medactuelle.btnajouter"] }];
        this.titreMessage = messages["sigct.so.f_appel.analyse.consulant"];

        this.messageConfirmModif = this.translateService.instant("ss-iu-a30004", { 0: this.titreMessage });
        this.messageConfirmSupp = this.translateService.instant("ss-iu-a30002", { 0: this.titreMessage });
      })
    );

    this.bindingErrorsStore.state$.subscribe(bindingErrors => {
      this.bindingErrors = bindingErrors;
    });
    this.listenToBindingErrorStore();
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  private listenToBindingErrorStore() {
    this.subscription.add(
      this.bindingErrorsStore.state$.subscribe(errors => {
        if (errors) {
          if (errors['raison']) {
            this.raisonConsultationValide = false;
          }
        }
      })
    );
  }

  /**
   * fonction generique de soumission du formulaire. simule le clic sur le bouton fleche
   */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit() {

    //On indique au parent que l'on veut sauvegarder la consultation saisie
    this.consultationAnterieureSave.emit(this.consultationAnterieureSaisi);
  }

  /**Effacer les highlights rouges des champs */
  resetChampsValides() {
    this.raisonConsultationValide = true;
  }

  /**
   * Formate la consultation antérieure dans la liste à droite
  * @param consultation
  */
  formatActionConsultationAnterieure(consultation: ConsultationAnterieureDTO): string {
    let codeHTML: string = '<span style="color:black;"> ';
    let ajouterSeparateur: boolean = false;

    if (consultation.quand) {
      codeHTML += consultation.quand;
      ajouterSeparateur = true;
    }

    if (consultation.codeRefRessConsult) {
      if (ajouterSeparateur) {
        codeHTML += ", "
      }

      if (consultation.nomRefRessConsult) {
        codeHTML += consultation.nomRefRessConsult;
      }
      else {
        codeHTML += consultation.codeRefRessConsult;
      }
      ajouterSeparateur = true;
    }

    if (consultation.raison) {
      if (ajouterSeparateur) {
        codeHTML += ", "
      }

      codeHTML += consultation.raison;
    }

    if (consultation.precision) {
      codeHTML += " (<i>" + consultation.precision + "</i>)";
    }

    codeHTML += "</span>";

    return codeHTML;

  }


  /**
   * vérifie si les champs de saisi de consultation antérieure sont vide.
   * Si c'est le cas on renseigne les champs de saisi avec la consultation antérieure à modifier
   * Sinon on affiche une popup de confirmation
   *
   * @param element
   */
  confirmerModifierConsultationAnterieure(element: any) {
    this.idConsultationAnterieureSelectionneNouveau = element.id;

    if (this.isConsultationVide(this.consultationAnterieureSaisi)) {
      this.remplacerConsultationAnterieure();
    } else {
      this.openModal('confirm_popup_modif_consultation_anterieure', 'confi_consult_btn_oui');
    }
  }

  /**
 * Recherche dans la liste de consultation antérieure la consultation correspondant à l'identifiant reçu
 * @param idConsultationAnterieure
 */
  rechercheConsultationAnterieure(idConsultationAnterieure: number): ConsultationAnterieureDTO {
    return this.listeConsultationsAnterieure.find((item: ConsultationAnterieureDTO) => item.id === idConsultationAnterieure);;
  }

  isConsultationVide(consultation: ConsultationAnterieureDTO): boolean {
    let champQuandVide: boolean = false;
    let champCodeRessConsultVide: boolean = false;
    let champRaisonVide: boolean = false;
    let champPrecisionVide: boolean = false;

    if (!consultation.quand || StringUtils.isEmpty(consultation.quand)) {
      champQuandVide = true;
    }

    if (!consultation.codeRefRessConsult || StringUtils.isEmpty(consultation.codeRefRessConsult)) {
      champCodeRessConsultVide = true;
    }

    if (!consultation.raison || StringUtils.isEmpty(consultation.raison)) {
      champRaisonVide = true;
    }

    if (!consultation.precision || StringUtils.isEmpty(consultation.precision)) {
      champPrecisionVide = true;
    }

    return champQuandVide && champCodeRessConsultVide && champRaisonVide && champPrecisionVide;
  }

  /**
   * Utilisé par le composant parent
   */
  public isChampVide(): boolean {
    return this.isConsultationVide(this.consultationAnterieureSaisi);
  }

  /**
   * Alimente les champs de saisi avec la consultation antérieure sélectionnée
   * Ferme la fenêtre de confirmation au cas ou elle est ouverte
   * Met le focus sur le champ medication
   */
  remplacerConsultationAnterieure(): void {
    this.idConsultationAnterieureSelectionne = this.idConsultationAnterieureSelectionneNouveau;

    // si on utilise l'objet retourné par rechercheMedication les modifications de l'utilisateur se verront directement
    // dans la liste de droite, ce que l'on ne veut pas
    let data: ConsultationAnterieureDTO = this.rechercheConsultationAnterieure(this.idConsultationAnterieureSelectionne);
    this.consultationAnterieureSaisi.id = data.id;
    this.consultationAnterieureSaisi.quand = data.quand;
    this.consultationAnterieureSaisi.codeRefRessConsult = data.codeRefRessConsult;
    this.consultationAnterieureSaisi.raison = data.raison;
    this.consultationAnterieureSaisi.precision = data.precision;

    this.closeModal('confirm_popup_modif_consultation_anterieure');
    this.momentConsultation.focus();
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerConsultationAnterieure(element: any) {
    this.idConsultationAnterieureASupprimer = element.id;
    let consultation: ConsultationAnterieureDTO = this.rechercheConsultationAnterieure(this.idConsultationAnterieureASupprimer);

    if (consultation) {
      this.consultationAnterieureDelete.emit(consultation);
    }

    this.reinitialiserChamp();
  }

  supprimerConsultationAnterieure() {

    let consultation: ConsultationAnterieureDTO = this.rechercheConsultationAnterieure(this.idConsultationAnterieureASupprimer);

    if (consultation) {
      this.consultationAnterieureDelete.emit(consultation);
    }
    this.closeModal('confirm_popup_supri_consultation_anterieure');

    this.reinitialiserChamp();
  }



  /**
   * Lorsqu'on clique sur le champ Moment, on le rend valide au cas ou il soit invalide
   * @param idComposant non utilisé car dans ce composant il n'y a qu'un seul champ qui peut être invalide
   */
  public onFocus(idComposant: string): void {

    switch (idComposant) {

      case "RaisonConsultationInputText": {
        if (this.bindingErrors['raison'] != undefined) {
          this.bindingErrors['raison'] = undefined;
        }
        break;
      }

      case "referenceRessConsult": {
        if (this.bindingErrors['referenceRessConsult'] != undefined) {
          this.bindingErrors['referenceRessConsult'] = undefined;
        }
        break;
      }

    }
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
   * Réinitialise le contenu des champs de saisi
   */
  public reinitialiserChamp(): void {
    this.consultationAnterieureSaisi.id = null;
    this.consultationAnterieureSaisi.precision = null;
    this.consultationAnterieureSaisi.quand = null;
    this.consultationAnterieureSaisi.raison = null;
    this.consultationAnterieureSaisi.codeRefRessConsult = null;
    this.raisonConsultationValide = true;
  }


  /**
   * Au cas ou une consultation antérieure est sélectionnée dans la liste de droite on enlève la sélection
   */
  public deselectionnerConsultationAnterieure(): void {
    this.idConsultationAnterieureSelectionne = null;
    this.idConsultationAnterieureSelectionneNouveau = null;
  }

}
