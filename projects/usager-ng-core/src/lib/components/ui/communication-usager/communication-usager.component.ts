import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrors, BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { ActionLinkItem } from "projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component";
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { LinkedUsagerDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { ReferenceDTO, UsagerCommDTO } from '../../../models';
import { TypeCoordonneeCommunicationEnum } from '../../../models/type-coordonnee-communication.enum';
import { TypeEquipementCommunicationEnum } from '../../../models/type-equipement-communication.enum';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { TypeDataToBind } from '../popup-import-comm-addrss-linked-usager/popup-import-comm-addrss-linked-usager.component';
import StringUtils from '../../../../../../sigct-service-ng-lib/src/lib/utils/string-utils';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-communication-usager',
  templateUrl: './communication-usager.component.html',
  styleUrls: ['./communication-usager.component.css'],
  providers: [ConfirmationDialogService],
})

export class CommunicationUsagerComponent implements OnInit, OnDestroy {

  constructor(private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService,
    private appContextStore: AppContextStore,
    private usagerService: UsagerService) {
  }

  public bindingErrors: BindingErrors;
  public usagerComm: UsagerCommDTO = new UsagerCommDTO();
  public oldUsagerComm: UsagerCommDTO;
  public actionLinks: ActionLinkItem[];
  public usagerCommunications: Array<UsagerCommDTO>;
  public listeTypeCommunicationValide: boolean = true;
  public listeMoyenCommunicationValide: boolean = true;
  public inputTextCourrielValide: boolean = true;
  public inputTextNumeroValide: boolean = true;
  communicationActif: UsagerCommDTO;
  messageConfirmerAjout: string;
  showCourriel: Boolean = false;
  showNumero: Boolean = true;
  showPoste: Boolean = true;
  cssColDivNumero: string = "col-md-3";
  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;
  elementSelectionne: UsagerCommDTO;
  public errorsMessages = {};
  public etatDisplayAll: boolean = false;
  public cacherAfficherReduire: boolean = false;

  private translateListeMoyenCommSub: Subscription;
  private translateListeTypeCommSub: Subscription;
  private subscription: Subscription = new Subscription();

  private libelleMessageErreur: string;
  private messageCourrielInvalide: string;
  private messageNumeroInvalide: string;
  isContextAppel: boolean = false;
  likedUsagerAvailable: boolean = false;
  importerCommMsg: string;
  selectLabelMsg: string;

  patternMaskPoste: string = "099999999999999";

  //Conteneur pour la liste de valeurs   
  public inputOptionMoyenComm: InputOptionCollection = {
    name: 'moyenComm',
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionTypeComm: InputOptionCollection = {
    name: "typeComm",
    options: []
  };

  public inputOptionlinkedUsager: InputOptionCollection = {
    name: "linkedUsager",
    options: []
  }

  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("courriel")
  courriel: NgModel;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @Output()
  outputSubmit: EventEmitter<any> = new EventEmitter();

  @Output()
  outputArchiverCommunication: EventEmitter<any> = new EventEmitter();

  @Output()
  outputRemplacerCommunication: EventEmitter<any> = new EventEmitter();

  @Output()
  outputafficherToutCommunication: EventEmitter<any> = new EventEmitter();

  @Output()
  outputafficherToutCommunicationInactif: EventEmitter<any> = new EventEmitter();

  @Output()
  selectCommLinkedUsagerEvent: EventEmitter<any> = new EventEmitter();

  /** Peuple la liste des moyens de communication */
  @Input("listeMoyenCommunication")
  public set listeMoyenCommunication(values: ReferenceDTO[]) {
    this.inputOptionMoyenComm.options = [];

    if (this.translateListeMoyenCommSub) { this.translateListeMoyenCommSub.unsubscribe(); }
    this.translateListeMoyenCommSub = this.translateService.get("option.select.message").subscribe((valeurLibelle: string) => {
      if (this.inputOptionMoyenComm.options[0] === undefined) {
        this.inputOptionMoyenComm.options.push({ label: valeurLibelle, value: null });
      }

      if (values) {
        values.forEach((item: ReferenceDTO) => {
          this.inputOptionMoyenComm.options.push({ label: item.nom, value: item.code });
        });
      }
    });
  }

  /** Peuple la liste des types de communication */
  @Input("listeTypeCommunication")
  public set listeTypeCommunication(values: ReferenceDTO[]) {
    this.inputOptionTypeComm.options = [];

    if (this.translateListeTypeCommSub) { this.translateListeTypeCommSub.unsubscribe(); }
    this.translateListeTypeCommSub = this.translateService.get("option.select.message").subscribe((valeurLibelle: string) => {

      if (this.inputOptionTypeComm.options[0] === undefined) {
        this.inputOptionTypeComm.options.push({ label: valeurLibelle, value: null });
      }

      if (values) {
        values.forEach((item: ReferenceDTO) => {
          this.inputOptionTypeComm.options.push({ label: item.nom, value: item.code, selected: true });
        });
      }
    })
  }

  /**
   * Peuple la liste des communications sauvegardes dans la base de donnees
   */
  @Input("listeCommunication")
  public set listeCommunication(usagerCommDTO: UsagerCommDTO[]) {
    this.usagerCommunications = usagerCommDTO;
  }

  @Input("linkedUsagerDTOs")
  public set linkedUsagerDTOs(linkedUsagerDTOs: LinkedUsagerDTO[]) {
    this.inputOptionlinkedUsager.options = [];
    const selectMsg: string = this.translateService.instant("option.select.message");
    this.inputOptionlinkedUsager.options.push({ label: selectMsg, value: null });
    if (linkedUsagerDTOs?.length > 0) {
      this.likedUsagerAvailable = true;
      linkedUsagerDTOs.forEach(item => {
        let fullName: string = this.translateService.instant("usager.non.identifier");
        if (item.nom && item.prenom) {
          fullName = item.nom + ", " + item.prenom;
        } else if(item.nom && !item.prenom) {
          fullName = item.nom
        } else if(!item.nom && item.prenom) {
          fullName = item.prenom
        }
        
        this.inputOptionlinkedUsager.options.push({ label: fullName, value: `${item.idUsagerIdent}`, description: "" });
      });
    }
  }

  @Input("idUsager")
  idUsager: number;

  @Output()
  openModalForConfirmerArchiverCommEvent: EventEmitter<any> = new EventEmitter();
  element: any;

  ngOnInit() {
    this.isContextAppel = this.appContextStore.state.isContextAppel;
    this.importerCommMsg = this.translateService.instant("usager.comm.importer");
    this.selectLabelMsg = this.translateService.instant("usager.comm.btn.label.select");

    this.bindingErrorsStore.state$.subscribe(bindingErrors => {
      this.bindingErrors = bindingErrors;
    });

    this.changeMoyen(TypeEquipementCommunicationEnum.TEL);

    this.subscription.add(
      this.translateService.get(["girpi.error.label", "usager.communication.courriel.invalid", "usager.label.ajout_sauvegarder",
        "usager.communication.numero.invalid"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["girpi.error.label"];
          this.messageCourrielInvalide = messages["usager.communication.courriel.invalid"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["usager.label.ajout_sauvegarder"] }];
          this.messageNumeroInvalide = messages["usager.communication.numero.invalid"];
        })
    );
  }

  ngOnDestroy() {
    if (this.translateListeMoyenCommSub) { this.translateListeMoyenCommSub.unsubscribe(); }
    if (this.translateListeTypeCommSub) { this.translateListeTypeCommSub.unsubscribe(); }
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit(args) {
    if (this.usagerComm.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
      this.usagerComm.coordonnees = this.usagerComm.courriel;
    } else {
      this.usagerComm.coordonnees = this.usagerComm.numero;
      if ((this.usagerComm.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL || this.usagerComm.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2)
        && !StringUtils.isBlank(this.usagerComm.poste)) {
        this.usagerComm.coordonnees += "#" + this.usagerComm.poste;
      };
    }

    if (!this.usagerComm.id) {
      this.communicationActif = null;
      this.usagerCommunications.forEach(element => {
        if (element.actif && element.codeTypeEquipComm == this.usagerComm.codeTypeEquipComm && element.codeTypeCoordComm == this.usagerComm.codeTypeCoordComm) {
          this.communicationActif = element;
        }
      });
    }

    if (this.valider(this.usagerComm)) {
      this.subscription.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
        if (result) {
          if (!this.verifierPresenceCommActive()) {
            this.ajouterOuModifierCommunication();
          }
        } else {
          this.ajouterOuModifierCommunication();
        }
      }));
    }
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  /**
   * Selectionner un moyen de communication dans la liste pour l'editer
   */
  selectionnerCommunicationEditer() {
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getUsagerCommDTOById(this.idElementSelectionne);
    let data: UsagerCommDTO = this.elementSelectionne;
    this.usagerComm.id = data.id;
    this.usagerComm.idUsagerIdentification = data.idUsagerIdentification;
    this.usagerComm.codeTypeCoordComm = data.codeTypeCoordComm;
    this.usagerComm.codeTypeEquipComm = data.codeTypeEquipComm;
    this.usagerComm.coordonnees = data.coordonnees;
    if (data.coordonnees != null) {
      if (data.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
        this.usagerComm.courriel = data.coordonnees;
      } else if ((data.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL) || (data.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2)) {
        if (data.coordonnees.includes('#')) {
          let tabCoordonnes = data.coordonnees.split('#');
          this.usagerComm.numero = tabCoordonnes[0];
          this.usagerComm.poste = tabCoordonnes[1];
        } else {
          this.usagerComm.numero = data.coordonnees;
        } 
      } else {
        this.usagerComm.numero = data.coordonnees;
      }
    }

    this.changeMoyen(this.usagerComm.codeTypeEquipComm);

    this.usagerComm.detail = data.detail;
    this.usagerComm.actif = data.actif;

    this.closeModal('confirm_popup_modif');
  }

  /**
   * obtenir l'objet UsagerCommDTO a partir de son id
   * @param idCommunication 
   */
  getUsagerCommDTOById(idCommunication: number) {
    this.usagerCommunications.forEach(
      (usagerCommDTO: UsagerCommDTO) => {
        if (usagerCommDTO.id == idCommunication) {
          this.elementSelectionne = usagerCommDTO;
        }
      }
    )
  }

  /**
   * archiver un moyen de communication - le rendre inactif
   */
  archiverCommunication() {
    this.getUsagerCommDTOById(this.idElementSelectionne);
    this.closeModal('confirm_popup_archiv');
    this.outputArchiverCommunication.emit('archiverCommunication');
  }

  makeSelectedElementInactive(): void {
    this.elementSelectionne.actif = false;
  }

  /**
   * ouvrir la fenetre modal pour demander la confirmation d'archivage du moyen de communication
   * @param element 
   */
  confirmerArchiverCommunication(element: any) {
    this.element = element;
    this.openModalForConfirmerArchiverCommEvent.emit();
   
  }

  openModalForConfirmerArchiverCommunication() {
    this.idElementSelectionne = this.element.id;
    this.getUsagerCommDTOById(this.idElementSelectionne);
    this.outputArchiverCommunication.emit('archiverCommunication');
  }


  /**
   * ouvrir la fenetre modal pour demander avertir que les informations saisies seront perdues
   * @param element 
   */
  confirmerModifierCommunication(element: any) {
    this.idElementSelectionne = element.id;

    if (!this.isCommunicationVide()) {
      this.openModal('confirm_popup_modif');
    } else {
      this.selectionnerCommunicationEditer()
    }
  }

  /**
   * Vérifie si la communication en édition est vide (contient que des valeurs vides ou des valeurs par défaut).
   */
  public isCommunicationVide(): boolean {
    let vide: boolean = true;

    if (this.usagerComm.id ||
      this.usagerComm.numero ||
      this.usagerComm.poste ||
      this.usagerComm.courriel ||
      this.usagerComm.detail ||
      (this.usagerComm.codeTypeCoordComm != 'PRINC' && this.usagerComm.codeTypeCoordComm != "") ||
      (this.usagerComm.codeTypeEquipComm != 'TEL' && this.usagerComm.codeTypeEquipComm != "")) {
      vide = false;
    }

    return vide;
  }

  /**
   * remplacer le moyen de communication par un deja existant
   * inactiver l'ancien moyen de communication
   */
  remplacerCommunication() {
    this.ajouterOuModifierCommunication();
    this.closeModal('confirm_popup_ajout');
  }

  /**
   * ajouter ou mettre a jour un moyen de communication
   */
  ajouterOuModifierCommunication() {
    this.alertStore.setAlerts(undefined);
    this.idElementModifieSelectionne = null;
    this.outputSubmit.emit("submitCommunication");
  }

  /**
   * Vérifier la présence d'une comunication active dans la liste des communication
   */
  verifierPresenceCommActive(): boolean {
    let trouver = false;
    let isSameCoordonneefoundthis = this.verifierPresenceMemeCoordonnee();
    if(!isSameCoordonneefoundthis) {
      this.communicationActif = null;

      this.usagerCommunications.forEach(element => {
        let usagerCoordonnee: string = this.usagerComm?.coordonnees?.split("#")[0];
        let elementCoordonnee: string = element.coordonnees.split("#")[0];
        if (element.actif && element.codeTypeEquipComm == this.usagerComm.codeTypeEquipComm && element.codeTypeCoordComm == this.usagerComm.codeTypeCoordComm && elementCoordonnee != usagerCoordonnee) {
          this.communicationActif = element;
        }
      });

      if (this.communicationActif != null && this.usagerComm.id != this.communicationActif.id) {
        this.openModal('confirm_popup_ajout');
        let params = {
          0: this.communicationActif.nomTypeEquipComm.toLowerCase(),
          1: this.communicationActif.nomTypeCoordComm.toLowerCase(),
          2: this.communicationActif.nomTypeEquipComm.toLowerCase(),
          3: this.communicationActif.nomTypeCoordComm.toLowerCase()
        };
        // Un {{0}} {{1}} existe déjà dans les communications actives. Voulez-vous archiver le {{2}} {{3}} existant et le remplacer par le nouveau?
        this.messageConfirmerAjout = this.translateService.instant("usager.msg.exist", params);
        trouver = true;
      }
    }

    return trouver;
  }

  verifierPresenceMemeCoordonnee(): boolean {
    let currentCoordonnee: string = this.usagerComm?.coordonnees?.split("#")[0];
    let sameCoordonneefound = this.usagerCommunications.find(c => c.coordonnees.split("#")[0] == currentCoordonnee && c.id != this.usagerComm.id);
    if(sameCoordonneefound) {
      return true;
    }
    return false;
  }

  /**
   * reinitialiser le formulaire d'edition du moyen de communication
   */
  reinitialiserUsagerCommunication() {
    this.usagerComm = new UsagerCommDTO();

    this.usagerComm.codeTypeEquipComm = TypeEquipementCommunicationEnum.TEL;
    this.usagerComm.codeTypeCoordComm = TypeCoordonneeCommunicationEnum.PRINC;
    this.usagerComm.coordonnees = "";
    this.usagerComm.numero = "";
    this.changeMoyen(TypeEquipementCommunicationEnum.TEL);
    this.listeMoyenCommunicationValide = true;
    this.listeTypeCommunicationValide = true;
    this.inputTextCourrielValide = true;
    this.inputTextNumeroValide = true;

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      moyen: this.usagerComm.codeTypeEquipComm,
      type: this.usagerComm.codeTypeCoordComm,
      numero: this.usagerComm.numero,
      poste: this.usagerComm.poste,
      courriel: this.usagerComm.courriel,
      detail: this.usagerComm.detail
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;
  }

  /**
   * Afficher ou reduire la liste de moyens de communications sauvegardes (actifs ou tous)
   * @param element 
   */
  afficherOuReduireListeCommunications(element: any) {
    let displayAll = element.displayAll;

    if (!displayAll) {
      this.outputafficherToutCommunication.emit('getListeResultatCommunication');
    } else {
      this.outputafficherToutCommunicationInactif.emit('getListeResultatCommunicationInactif');
    }

    this.etatDisplayAll = displayAll;
  }

  /**
   * Change le moyen de communication pour courriel 
   */
  changeMoyenCourelec() {
    this.usagerComm.codeTypeEquipComm = TypeEquipementCommunicationEnum.COURELEC;
    this.changeMoyen(TypeEquipementCommunicationEnum.COURELEC);
  }

  /**
   * evenement onchange sur le champ moyen de communication
   * les autres champs varie selon la valeur du moyen selecionne
   * ex: telephone et courriel
   * @param moyen 
   * Attention cette méthode ne fait pas changer le champ this.usagerComm.codeTypeEquipComm, voir la méthode changeMoyenCourelec()
   */
  changeMoyen(moyen: string) {
    if (moyen == TypeEquipementCommunicationEnum.COURELEC) {
      this.showCourriel = true;
      this.showNumero = false;
      this.showPoste = false;
      this.usagerComm.numero = "";
      this.usagerComm.poste = "";
      this.inputTextCourrielValide = true;
    } else {
      this.showCourriel = false;
      this.showNumero = true;
      this.usagerComm.courriel = "";
      this.inputTextNumeroValide = true;
      if ((moyen == TypeEquipementCommunicationEnum.TEL) || (moyen == TypeEquipementCommunicationEnum.TEL2)) {
        this.showPoste = true;
        this.cssColDivNumero = "col-md-3";
      } else {
        this.showPoste = false;
        this.cssColDivNumero = "col-md-5";
        this.usagerComm.poste = "";
      }

    }
  }

  /**
   * Format des informations de communications dans la liste de droite.
   * @param usagerCommunication 
   */
  formatActionUsagerCommunication(usagerCommunication: UsagerCommDTO) {
    let usCommFormate: string;

    if (usagerCommunication.actif) {
      usCommFormate = '<span style="color:black;font-weight:bold;">' + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    } else {
      usCommFormate = '<span style="color:grey;font-weight:bold;">' + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    }

    let coordFormate = "";
    if (usagerCommunication.coordonnees != null) {
      if (usagerCommunication.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
        coordFormate = usagerCommunication.coordonnees;
      } else if ((usagerCommunication.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL) || (usagerCommunication.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2)) {
        if (usagerCommunication.coordonnees.includes('#')) {
          let tabCoordonnes = usagerCommunication.coordonnees.split('#');
          coordFormate = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            coordFormate = coordFormate + " Poste " + tabCoordonnes[1];
          }
        } else { 
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
        }
      } else {

        coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);

      }


    }

    usCommFormate += coordFormate;
    if (usagerCommunication.detail != null) {
      usCommFormate += " (<i>" + usagerCommunication.detail + "</i>)";
    }

    return usCommFormate;
  }

  onFocus(event: string) {
    this.onFocusClick(event);
  }

  onClick(event) {
    this.onFocusClick(event.target.id);
  }
  /**
   * Lorsqu'on clique dans un champ on veut qu'il ne soit plus marqué comme invalide
   * @param event 
   */
  private onFocusClick(id: string) {

    switch (id) {
      case "numero": {
        this.inputTextNumeroValide = true;
        break;
      }

      case "courriel": {
        this.inputTextCourrielValide = true;
        break;
      }

      case "moyen": {
        this.listeMoyenCommunicationValide = true;
        break;
      }

      case "type": {
        this.listeTypeCommunicationValide = true;
      }
    }
  }
  /**
   * Valide l'objet de transfert des communications pour valider le format.
   * @param usagerCommDto 
   */
  public valider(usagerCommDto: UsagerCommDTO): boolean {
    let messages: string[] = [];

    if (!usagerCommDto.codeTypeCoordComm) {
      // {{0}} : la saisie est obligatoire.
      const msg = this.translateService.instant("us-iu-e00010", { 0: 'Type' });
      messages.push(msg);

      this.listeTypeCommunicationValide = false;
    }

    if (!usagerCommDto.codeTypeEquipComm) {
      // {{0}} : la saisie est obligatoire.
      const msg = this.translateService.instant("us-iu-e00010", { 0: 'Moyen' });
      messages.push(msg);

      this.listeMoyenCommunicationValide = false;
    }

    if (usagerCommDto.codeTypeEquipComm === TypeEquipementCommunicationEnum.COURELEC) {
      if (!usagerCommDto.courriel) {
        // {{0}} : la saisie est obligatoire.
        const msg = this.translateService.instant("us-iu-e00010", { 0: 'Courriel' });
        messages.push(msg);

        this.inputTextCourrielValide = false;
      } else if (!this.validerCourriel(usagerCommDto.courriel)) {
        // Courriel : la saisie est invalide.
        messages.push(this.messageCourrielInvalide);

        this.inputTextCourrielValide = false;
      }
    }

    if (usagerCommDto.codeTypeEquipComm !== TypeEquipementCommunicationEnum.COURELEC) {
      if (!usagerCommDto.numero) {
        // {{0}} : la saisie est obligatoire.
        const msg = this.translateService.instant("us-iu-e00010", { 0: 'Numéro' });
        messages.push(msg);

        this.inputTextNumeroValide = false;
      } else if (!this.validerNumeroTelephone(usagerCommDto.numero)) {
        // Numéro : la saisie est invalide.
        messages.push(this.messageNumeroInvalide);

        this.inputTextNumeroValide = false;
      }
    }

    if (messages.length > 0) {
      let alert: AlertModel = new AlertModel();
      alert.title = this.libelleMessageErreur;
      alert.type = AlertType.ERROR;
      alert.messages = messages;

      this.alertStore.setAlerts([alert]);

      return false;
    } else {
      this.alertStore.resetAlert();
      return true;
    }
  }

  /**
   * Valide le format d'un numéro de téléphone ou téléavertisseur ou ...
   * @param numero 
   */
  public validerNumeroTelephone(numero: string): boolean {

    let resultat: boolean = false;

    if (numero) {
      let numeroValide = numero.match("^[0-9]{10}$");

      if (numeroValide !== null && numeroValide.length > 0) {
        resultat = true;
      }
    }

    return resultat;
  }
  /**
   * Valide la valeur des courriels.
   * @param courriel 
   */
  public validerCourriel(courriel: string): boolean {

    if (courriel) {
      courriel = courriel.toLowerCase();
      let ret = courriel.match("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$");

      if (ret !== null && ret.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  selctionnerCommunications(): void {
    this.selectCommLinkedUsagerEvent.emit({idIdentifLinkedUsager: this.usagerComm.idIdentifLinkedUsager, typeDataToAdd: TypeDataToBind.COMM});
  }
}
