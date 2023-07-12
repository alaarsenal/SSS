import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgForm } from '@angular/forms';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { AppelantCommDTO } from './appelant-Comm-dto';
import { InputOptionCollection } from '../../utils/input-option';
import { Subscription } from 'rxjs';
import { ActionLinkItem } from '../action-link/action-link.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';

export enum enumMoyenComm {
  TEL = "TEL",
  TEL2 = "TEL2",
  CEL1 = "CEL1",
  CEL2 = "CEL2",
  COURELEC = "COURELEC",
  TELAV = "TELAV",
  TELCP = "TELCP",
  TELSCRPT = "TELSCRPT",
  AUTRE = "AUTRE"
}

export namespace enumMoyenComm {
  export function values() {
    return Object.keys(enumMoyenComm).filter(
      (type) => isNaN(<any>type) && type !== 'values'
    );
  }
}

export enum enumTypeComm {
  PRINC = "PRINC",
  SECOND = "SECOND",
  TEMP = "TEMP",
  AUTRE = "AUTRE",
}

export namespace enumTypeComm {
  export function values() {
    return Object.keys(enumTypeComm).filter(
      (type) => isNaN(<any>type) && type !== 'values'
    );
  }
}

@Component({
  selector: 'msss-sigct-appelant-communication',
  templateUrl: './sigct-appelant-communication.component.html',
  styleUrls: ['./sigct-appelant-communication.component.css']
})
export class SigctAppelantCommunicationComponent implements OnInit, ControlValueAccessor, OnDestroy {

  public _appelantCommunications: AppelantCommDTO[];
  public actionLinks: ActionLinkItem[];
  public idElementModifieSelectionne: number = null;
  public appelantCommDTO: AppelantCommDTO = new AppelantCommDTO();
  public moyenCommunicationValide: boolean = true;
  public isTypeCoordValide: boolean = true;
  public isTypeEquipValide: boolean = true;
  public isCourrielValid: boolean = true;
  public isNumeroValide: boolean = true;

  @Input()
  public isDisabled = false;

  inputOptionMoyenCommunication: InputOptionCollection = {
    name: 'moyenCommunication',
    options: []
  };

  inputOptionTypeCoordMoyenCommunication: InputOptionCollection = {
    name: 'typeCoordMoyenCommunication',
    options: []
  };

  @Output()
  outputSubmitAppelantInitialCommunication: EventEmitter<any> = new EventEmitter();

  @Output()
  outputSubmitUpdateAppelantComm: EventEmitter<any> = new EventEmitter();

  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  isNumberVisible: boolean = true;
  isPosteVisible: boolean = true;
  isEmailVisible: boolean = false;
  patternMaskNumero: string = "000 000-0000";
  patternMaskPoste: string = "099999999999999";
  idElementSelectionne: number = null;
  _moyenCommunication: ReferenceDTO[];
  elementSelectionne: AppelantCommDTO;
  messageConfirmerRemplacer: string;
  _typeCoordMoyenCommunication: ReferenceDTO[];

  private labelSelectionnez: string = 'Sélectionnez...'
  private subscriptions: Subscription = new Subscription();
  private defaultValueTypeEquip: string;
  private defaultValueTypeCoord: string;

  constructor(private translateService: TranslateService, private modalConfirmService: ConfirmationDialogService, private alertStore: AlertStore) { }

  @Input("moyenCommunication")
  public set moyenCommunication(values: ReferenceDTO[]) {
    if (values) {
      this._moyenCommunication = values;
      let telTypeypeEquip: ReferenceDTO = values.find(ref => ref.code == enumMoyenComm.TEL);
      this.defaultValueTypeEquip = telTypeypeEquip.id + "#" + telTypeypeEquip.code;
      this.appelantCommDTO.idCombinedToCodeTypeEquip =  this.defaultValueTypeEquip;
      this.populatePlaylistOptions(values, this.inputOptionMoyenCommunication);
    }
  }

  @Input("typeCoordMoyenCommunication")
  public set typeCoordMoyenCommunication(values: ReferenceDTO[]) {
    if (values) {
      this._typeCoordMoyenCommunication = values;
      let princTypeCoord: ReferenceDTO = values.find(ref => ref.code == enumTypeComm.PRINC);
      this.defaultValueTypeCoord = princTypeCoord.id + "#" + princTypeCoord.code;
      this.appelantCommDTO.idCombinedToCodeTypeCoord = this.defaultValueTypeCoord;
      this.populatePlaylistOptions(values, this.inputOptionTypeCoordMoyenCommunication);
    }
  }


  @Input("appelantCommunications")
  public set appelantCommunications(values: AppelantCommDTO[]) {
    if (values) {
      this._appelantCommunications = this.sortappelantCommunications(values);
    }
  }

  public get appelantCommunications(): AppelantCommDTO[] {
    return this._appelantCommunications;
  }

  resetChampsValides():void {
    this.isNumeroValide = true;
    this.isCourrielValid = true;
    this.isTypeCoordValide = true;
    this.isTypeEquipValide = true;
  }

  private populatePlaylistOptions(playlist: ReferenceDTO[], playlistOptions: InputOptionCollection): void {
    playlistOptions.options.push({ label: this.labelSelectionnez, value: null });
    playlist.forEach((item: ReferenceDTO) => {
      playlistOptions.options.push({ label: item.nom, value: item.id + "#" + item.code, description: item.description });
    });
  }


  private sortappelantCommunications(source: AppelantCommDTO[]): AppelantCommDTO[] {
    let sortedAppelantComms: AppelantCommDTO[] = [];
    enumMoyenComm.values().forEach(moyen => {
      enumTypeComm.values().forEach(type => {
        let appelantCommFound = source.find(appelantCommDTO => appelantCommDTO.codeTypeEquip == moyen && appelantCommDTO.codeTypeCoord == type);
        if (appelantCommFound) {
          sortedAppelantComms.push(appelantCommFound);
        }
      });
    })
    return sortedAppelantComms;
  }

  ngOnInit(): void {

    this.subscriptions.add(
      this.translateService.get("sigct.ss.f_appel.aplntusag.btnajoutercomm").subscribe((libelle: string) => {
        this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: libelle }];
      }));
  }

  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit(from: any) {
    if (this.appelantCommDTOValid(this.appelantCommDTO.burstCombinedIdAndCode())) {
      this.manageAppelantCommDTOToPrepareForSaving(this.appelantCommDTO);
      let appelantCommDTOFound = this.getAppelantCommIfExistAlreadyIntoBD(this.appelantCommDTO);
      let isNewAppelantCommWithExistingSimilarity: Boolean = appelantCommDTOFound != null
                                                             && appelantCommDTOFound != undefined
                                                             && this.appelantCommDTO.id != appelantCommDTOFound.id;
      if (isNewAppelantCommWithExistingSimilarity) {
        this.buildMsgToConfirmReplacement(appelantCommDTOFound);
        this.openModal('confirm_popup_remplacer');
      } else {
        this.forwardSavingEvent();
      }
    }
  }

  public appelantCommDTOValid(appelantCommDTO: AppelantCommDTO) {
    let messages: string[] = [];

    if (!appelantCommDTO.idCombinedToCodeTypeEquip) {
      const msg = this.translateService.instant("ss-iu-e00004");
      messages.push(msg);
      this.isTypeEquipValide = false;
    }

    if (!appelantCommDTO.idCombinedToCodeTypeCoord) {
      const msg = this.translateService.instant("ss-iu-e00001");
      messages.push(msg);
      this.isTypeCoordValide = false;
    }

    if (appelantCommDTO.codeTypeEquip === enumMoyenComm.COURELEC) {
      if (!appelantCommDTO.courriel) {
        const msg = this.translateService.instant("ss-iu-e00005");
        messages.push(msg);
        this.isCourrielValid = false;
      } else if (!this.isCourrielHasCorrectFormat(appelantCommDTO.courriel)) {
        const msg = this.translateService.instant("ss-iu-e00006");
        messages.push(msg);
        this.isCourrielValid = false;
      }
    } else {
      if (!appelantCommDTO.numero) {
        const msg = this.translateService.instant("ss-iu-e00003");
        messages.push(msg);
        this.isNumeroValide = false;
      } else if (!this.isNumeroTelHasCorrectFormat(appelantCommDTO.numero)) {
        const msg = this.translateService.instant("ss-iu-e00007");
        messages.push(msg);
        this.isNumeroValide = false;
      }
    }

    if (messages.length > 0) {
      let alert: AlertModel = new AlertModel();
      alert.title = this.translateService.instant("girpi.error.label");
      alert.type = AlertType.ERROR;
      alert.messages = messages;
      this.alertStore.setAlerts([alert]);
      return false;
    } else {
      this.alertStore.resetAlert();
      return true;
    }
  }

  private manageAppelantCommDTOToPrepareForSaving(appelantCommDTO: AppelantCommDTO) {
    if (this.appelantCommDTO.id == null || this.appelantCommDTO.id == undefined) {
      this.appelantCommDTO.actif = true;
    }

    let isCourriel: boolean = this.appelantCommDTO.codeTypeEquip == enumMoyenComm.COURELEC;
    let isTelephone: boolean = this.appelantCommDTO.codeTypeEquip == enumMoyenComm.TEL || this.appelantCommDTO.codeTypeEquip == enumMoyenComm.TEL2

    if (isCourriel) {
      this.appelantCommDTO.coordonnees = this.appelantCommDTO.courriel;
    } else if (isTelephone && this.appelantCommDTO.poste != undefined && this.appelantCommDTO.poste != "") {
      this.appelantCommDTO.coordonnees = this.appelantCommDTO.numero + "#" + this.appelantCommDTO.poste;
    } else {
      this.appelantCommDTO.coordonnees = this.appelantCommDTO.numero
    }
    this.appelantCommDTO.burstCombinedIdAndCode();
  }

  private getAppelantCommIfExistAlreadyIntoBD(appelantCommDTO: AppelantCommDTO): AppelantCommDTO {
    let appelantCommDTOFound = null;
    if (appelantCommDTO.codeTypeEquip && appelantCommDTO.codeTypeCoord) {
      appelantCommDTOFound = this._appelantCommunications.find(element =>
        appelantCommDTO.codeTypeEquip === element.codeTypeEquip &&
        appelantCommDTO.codeTypeCoord === element.codeTypeCoord
      )
    }
    return appelantCommDTOFound;
  }

  private buildMsgToConfirmReplacement(appelantCommDTO: AppelantCommDTO) {
    let params = {
      0: appelantCommDTO.nomTypeEquip.toLowerCase(),
      1: appelantCommDTO.nomTypeCoord.toLowerCase(),
      2: appelantCommDTO.nomTypeEquip.toLowerCase(),
      3: appelantCommDTO.nomTypeCoord.toLowerCase()
    };
    this.messageConfirmerRemplacer = this.translateService.instant("ss-iu-a00001", params);
  }

  public forwardSavingEvent() {
    this.idElementModifieSelectionne = null;
    this.outputSubmitAppelantInitialCommunication.emit("submitAppelantInitialCommunication");
  }

  forwardUpdateAppelantCommEvent() {
    let appelantCommDTOFound = this.getAppelantCommIfExistAlreadyIntoBD(this.appelantCommDTO);
    if (appelantCommDTOFound != null && appelantCommDTOFound != undefined) {
      this.outputSubmitUpdateAppelantComm.emit({ 'id': +appelantCommDTOFound.id });
    }
    this.closeModal('confirm_popup_remplacer');
  }

  public reinitializeCommunicationControls() {

    this.appelantCommDTO.codeTypeCoord = enumTypeComm.PRINC;
    this.appelantCommDTO.codeTypeEquip = enumMoyenComm.TEL;
    this.idElementModifieSelectionne = null;

    let telTypeEquip = this._moyenCommunication.find(moyen => moyen.code == enumMoyenComm.TEL)
    this.appelantCommDTO.idCombinedToCodeTypeEquip = telTypeEquip.id + "#" + telTypeEquip.code;

    let princRefTypeCoord = this._typeCoordMoyenCommunication.find(type => type.code == enumTypeComm.PRINC);
    this.appelantCommDTO.idCombinedToCodeTypeCoord = princRefTypeCoord.id + "#" + princRefTypeCoord.code;

    this.changeMoyen(this.appelantCommDTO.idCombinedToCodeTypeEquip)
    this.appelantCommDTO.id = null;
    this.appelantCommDTO.courriel = "";
    this.appelantCommDTO.numero = "";
    this.appelantCommDTO.poste = "";
    this.appelantCommDTO.detail = "";
    this.appelantCommDTO.coordonnees = "";

    let valeursParDefaut: any = {
      idCombinedToCodeTypeEquip: this.appelantCommDTO.idCombinedToCodeTypeEquip,
      idCombinedToCodeTypeCoord: this.appelantCommDTO.idCombinedToCodeTypeCoord,
      numero: this.appelantCommDTO.numero,
      poste: this.appelantCommDTO.poste,
      courriel: this.appelantCommDTO.courriel,
      detail: this.appelantCommDTO.detail
    };

    this.form.resetForm(valeursParDefaut);
    this.moyenCommunicationValide = true;
    this.isTypeCoordValide = true;
    this.isTypeEquipValide = true;
    this.isCourrielValid = true;
    this.isNumeroValide = true;
  }

  public formatActionAppelantCommunication(appelantCommDTO: AppelantCommDTO) {
    let appelantCommDTOFormat: string;
    if (appelantCommDTO.actif) {
      appelantCommDTOFormat = '<span style="color:black;font-weight:bold;">' + appelantCommDTO.nomTypeEquip + " " + appelantCommDTO.nomTypeCoord.toLowerCase() + "</span> : ";
    } else {
      appelantCommDTOFormat = '<span style="color:grey;font-weight:bold;">' + appelantCommDTO.nomTypeEquip + " " + appelantCommDTO.nomTypeCoord.toLowerCase() + "</span> : ";
    }

    let coordFormate = "";
    if (appelantCommDTO.coordonnees != null) {
      if (appelantCommDTO.codeTypeEquip == enumMoyenComm.COURELEC) {
        coordFormate = appelantCommDTO.coordonnees;
      } else if ((appelantCommDTO.codeTypeEquip == enumMoyenComm.TEL) || (appelantCommDTO.codeTypeEquip == enumMoyenComm.TEL2)) {
        if (appelantCommDTO.coordonnees.includes('#')) {
          let tabCoordonnes = appelantCommDTO.coordonnees.split('#');
          coordFormate = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            coordFormate = coordFormate + " Poste " + tabCoordonnes[1];
          }
        } else {
          coordFormate = appelantCommDTO.coordonnees.substr(0, 3) + " " + appelantCommDTO.coordonnees.substr(3, 3) + "-" + appelantCommDTO.coordonnees.substr(6, 4);
        }
      } else {
        coordFormate = appelantCommDTO.coordonnees.substr(0, 3) + " " + appelantCommDTO.coordonnees.substr(3, 3) + "-" + appelantCommDTO.coordonnees.substr(6, 4);
      }

      appelantCommDTOFormat += coordFormate;
      if (appelantCommDTO.detail != null) {
        appelantCommDTOFormat += " (<i>" + appelantCommDTO.detail + "</i>)";
      }
      return appelantCommDTOFormat;
    }
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
    return this.isEmpty(this.appelantCommDTO.id) &&
      this.isEmpty(this.appelantCommDTO.numero) &&
      this.isEmpty(this.appelantCommDTO.poste) &&
      this.isEmpty(this.appelantCommDTO.courriel) &&
      !this.isEmpty(this.appelantCommDTO.idCombinedToCodeTypeEquip) &&
      this.appelantCommDTO.idCombinedToCodeTypeEquip == this.defaultValueTypeEquip &&
      !this.isEmpty(this.appelantCommDTO.idCombinedToCodeTypeCoord) &&
      this.appelantCommDTO.idCombinedToCodeTypeCoord == this.defaultValueTypeCoord &&
      this.isEmpty(this.appelantCommDTO.detail);
  }

  private isEmpty(element: any) {
    return element == null || element == undefined || element == "";
  }

  /**
 * Selectionner un moyen de communication dans la liste pour l'editer
 */
  selectionnerCommunicationEditer() {
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getAppelantCommDTOById(this.idElementSelectionne);
    let data: AppelantCommDTO = this.elementSelectionne;
    this.appelantCommDTO.id = data.id;
    this.appelantCommDTO.idAppelant = data.idAppelant;
    this.appelantCommDTO.codeTypeCoord = data.codeTypeCoord;
    this.appelantCommDTO.idCombinedToCodeTypeCoord = data.idCombinedToCodeTypeCoord;
    this.appelantCommDTO.codeTypeEquip = data.codeTypeEquip;
    this.appelantCommDTO.idCombinedToCodeTypeEquip = data.idCombinedToCodeTypeEquip;
    this.appelantCommDTO.coordonnees = data.coordonnees;
    this.appelantCommDTO.detail = data.detail;
    this.appelantCommDTO.actif = data.actif;

    if (data.coordonnees != null) {
      if (data.codeTypeEquip == enumMoyenComm.COURELEC) {
        this.appelantCommDTO.courriel = data.coordonnees;
      } else if ((data.codeTypeEquip == enumMoyenComm.TEL) || (data.codeTypeEquip == enumMoyenComm.TEL2)) {
        if (data.coordonnees.includes('#')) {
          let tabCoordonnes = data.coordonnees.split('#');
          this.appelantCommDTO.numero = tabCoordonnes[0];
          this.appelantCommDTO.poste = tabCoordonnes[1];
        } else {
          this.appelantCommDTO.numero = data.coordonnees;
        }
      } else {
        this.appelantCommDTO.numero = data.coordonnees;
      }
    }
    this.changeMoyen(this.appelantCommDTO.idCombinedToCodeTypeEquip);
    this.closeModal('confirm_popup_modif');
  }

  changeMoyen(moyen: string) {
    let parts: string[] = []
    if (moyen && moyen.indexOf("#") !== -1) {
      parts = moyen.split("#");
      moyen = parts[1];
      this.isPosteVisible = moyen == enumMoyenComm.TEL || moyen == enumMoyenComm.TEL2;
      this.isNumberVisible = moyen != enumMoyenComm.COURELEC;
      this.isEmailVisible = moyen == enumMoyenComm.COURELEC;
    }
  }

  /**
  * obtenir l'objet AppelantCommDTO a partir de son id
  * @param idCommunication
  */
  getAppelantCommDTOById(idCommunication: number) {
    this._appelantCommunications.filter(
      (appelantCommDTO: AppelantCommDTO) => {
        if (+appelantCommDTO.id == idCommunication) {
          this.elementSelectionne = appelantCommDTO;
        }
      }
    )
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

  public isCourrielHasCorrectFormat(courriel: string): boolean {
    let regexpEmail = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.+[a-z]{2,4}$');
    return regexpEmail.test(courriel);
  }


  public isNumeroTelHasCorrectFormat(numero: string): boolean {
    let regexpNumTel = new RegExp('^[0-9]{10}$');
    return regexpNumTel.test(numero);
  }

  writeValue(obj: any): void { }
  registerOnChange(fn: any): void { }
  registerOnTouched(fn: any): void { }

  ngOnDestroy(): void {

  }
  public get moyenCommunication(): ReferenceDTO[] {
    return this._moyenCommunication;
  }

  public get typeCoordMoyenCommunication(): ReferenceDTO[] {
    return this._typeCoordMoyenCommunication;
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
      case "numeroApp": {
        this.isNumeroValide = true;
        break;
      }

      case "courriel": {
        this.isCourrielValid = true;
        break;
      }

      case "idCombinedToCodeTypeEquip": {
        this.isTypeEquipValide = true;
        break;
      }

      case "idCombinedToCodeTypeCoord": {
        this.isTypeCoordValide = true;
      }
    }
  }

  public resetRedColorWhenPressBtnSave() {
    this.isNumeroValide = true;
    this.isCourrielValid = true;
    this.isTypeEquipValide = true;
    this.isTypeCoordValide = true;
  }
}
