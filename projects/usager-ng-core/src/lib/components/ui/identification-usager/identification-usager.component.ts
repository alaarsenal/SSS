import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BindingErrors, BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from "projects/sigct-ui-ng-lib/src/lib/utils/input-option";
import { Subscription } from 'rxjs';
import { ReferenceDTO, UsagerDTO } from '../../../models';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-identification-usager',
  templateUrl: './identification-usager.component.html',
  styleUrls: ['./identification-usager.component.css']
})
export class IdentificationUsagerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("fIdent", { static: true })
  form: NgForm;

  @Output()
  outputSubmit: EventEmitter<any> = new EventEmitter();

  @Output()
  outputChangeDtNasc: EventEmitter<any> = new EventEmitter();

  @Output()
  outputChangeSexe: EventEmitter<any> = new EventEmitter();

  @Output()
  messageErreur: EventEmitter<string> = new EventEmitter();

  @Output()
  messageAvertissement: EventEmitter<string> = new EventEmitter();

  @ViewChild("champ", { static: true })
  nomChamp: InputTextComponent;

  public usager: UsagerDTO;
  public ancienUsager: UsagerDTO;
  public dateNaissance: Date;
  public subscription: Subscription;
  public bindingErrors: BindingErrors;

  constructor(private bindingErrorsStore: BindingErrorsStore,
    private modalConfirmService: ConfirmationDialogService,
    private usagerService: UsagerService) {
  }

  public inputOptionSexe: InputOptionCollection = {
    name: "sexe",
    options: []
  }
  public errorsMessages = {}

  ngOnInit() {

    //this.chargementUsager();

    this.form.valueChanges.subscribe(value => this.form.valid); //TODO: nécessaire?

    this.bindingErrorsStore.state$.subscribe(bindingErrors => {
      this.bindingErrors = bindingErrors;
    });

    if (typeof this.usager === "undefined") {
      this.usager = new UsagerDTO();
    }

  }

  ngAfterViewInit() {
    this.nomChamp.focus();
  }

  /**
   * soumettre le formulaire
   * @param args 
   */
  onSubmit(args) {
    this.outputSubmit.emit("submitUsager");
  }

  groupeAgeChanged(args) {
    if (args.dateNaissance === null || args.dateNaissance == undefined || args.dateNaissance === "") {
      this.usager.dtNaiss = null;
    } else {
      this.usager.dtNaiss = args.dateNaissance;
    }
    this.onBlur(args);
    this.outputChangeDtNasc.emit("getCadenasUsager");
  }

  /** Peuple la liste des sexes */
  @Input("listeSexe")
  public set listeSexe(values: ReferenceDTO[]) {
    this.inputOptionSexe.options = [];

    if (values) {
      values.forEach(item => {
        let infoBulleText = item.nom;
        if(item.description) {
          infoBulleText = item.description;
        }
        this.inputOptionSexe.options.push({ label: item.nom, value: item.code, description: infoBulleText });
      });
    }
  }

  /**
   * Lors de la saisie s'il y a 2 caractères on met en majuscule la première lettre
   * @param event Origine de la modification
   */
  onKey(event: any): void {
    if (event.target.value.length >= 2) {
      event.target.value = StringUtils.convertFirstLetterToUpperCase(event.target.value);
    }

  }

  /**
   * Lorsque l'utilisateur accède au groupe d'âge on désactive l'erreur si elle est présente
   */
  onClickKeyupGroupeAge() {
    if (this.bindingErrors['dtNaiss'] != undefined) {
      this.bindingErrors['dtNaiss'] = undefined;
    }
  }


  /**
   * Quand l'usager choisi de ne pas modifier la valeur d'un nom ou d'un prénom ou d'une date de naissance
   * on remet l'ancienne valeur dans les champs.
   */
  resetChampsNomPrenomDDS() {

    if (this.ancienUsager.nom != this.usager.nom) {
      this.usager.nom = this.ancienUsager.nom;
    }

    if (this.ancienUsager.prenom != this.usager.prenom) {
      this.usager.prenom = this.ancienUsager.prenom;
    }

    if (this.ancienUsager.dtNaiss != this.usager.dtNaiss) {

      this.usager.dtNaiss = this.ancienUsager.dtNaiss;
      this.usager.groupeAgeOptions.dateNaissance = this.ancienUsager.dtNaiss;

    }
  }

 /**
  * fontions generiques pour ouvrir et fermer une fenetre modal popup
  */
  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    try {
      this.modalConfirmService.close(id);
      //Intercepte la fermeture de page modal non ouverte.
    } catch (e) {

    }

  }

  /**
   * Gère l'événement on lost focus sur les champs Nom, Prénom et Date de naissance.
   */
  onBlur(args) {
    if (this.usager.dtModifie) {
      if (this.ancienUsager) {
        let isNomModified: boolean = this.ancienUsager.nom?.toLocaleLowerCase() !== this.usager.nom?.toLocaleLowerCase();
        let isPrenomModified: boolean = this.ancienUsager.prenom?.toLocaleLowerCase() !== this.usager.prenom?.toLocaleLowerCase();
        let idDtNaissModified: boolean = this.ancienUsager.dtNaiss != this.usager.dtNaiss;

        if (isNomModified || isPrenomModified || idDtNaissModified) {
          // Le changement est validé une fois le popup est affcher quelque soit via un 'oui' ou un 'non'
          this.openModal('confirm_popup_modifier_nom_prenom_ddn', 'ok_confirm_button_modifs');
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe() };
  }

  /**
   * Permet de définir l'usager édité.
   * @param usagerDto 
   */
  public setUsager(usagerDto: UsagerDTO): void {
    this.usager = usagerDto;
    
    this.ancienUsager = new UsagerDTO;
    this.ancienUsager.nom = usagerDto?.nom;
    this.ancienUsager.prenom = usagerDto?.prenom;
    this.ancienUsager.dtNaiss = usagerDto?.dtNaiss;
  }

  /**
   * Met à jour le contenu des champs originaux nom, prénom et date de naissance.
   */
  updateChampsNomPrenomDDSOriginaux() {
    this.ancienUsager.nom = this.usager.nom;
    this.ancienUsager.prenom = this.usager.prenom;
    this.ancienUsager.dtNaiss = this.usager.dtNaiss;
  }

}
