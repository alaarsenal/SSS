import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import TelephoneUtils from 'projects/sigct-service-ng-lib/src/lib/utils/telephone-utils';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { TypeEquipementCommunicationEnum } from 'projects/usager-ng-core/src/lib/models/type-equipement-communication.enum';
import { UsagerCommDTO } from 'projects/usager-ng-core/src/lib/models/usager-comm-dto';
import { UsagerCommFusionDTO } from 'projects/usager-ng-core/src/lib/models/usager-comm-fusion-dto';
import FusionUtils from 'projects/usager-ng-core/src/lib/utils/fusion-utils';
import { Subscription } from 'rxjs';

const MAX_LENGTH_DETAIL: number = 255;

export interface FusionData {
  index: number;
  idUsagerIdent1: number;
  idUsagerIdent2: number;
  usagerComm1Dto: UsagerCommDTO;
  usagerComm2Dto: UsagerCommDTO;
  usagerCommFusionDto: UsagerCommDTO;
  typeEquipementCommOptions: InputOption[];
  typeCoordonneCommOptions: InputOption[];
}




@Component({
  selector: 'fusion-communications-usager-popup',
  templateUrl: './fusion-communications-usager-popup.component.html',
  styleUrls: ['./fusion-communications-usager-popup.component.css']
})
export class FusionCommunicationsUsagerPopupComponent implements OnInit, OnDestroy {
  // Variables pour utilisation des constantes dans le html
  readonly TEL: string = TypeEquipementCommunicationEnum.TEL;
  readonly TEL2: string = TypeEquipementCommunicationEnum.TEL2;
  readonly COURELEC: string = TypeEquipementCommunicationEnum.COURELEC;

  private subscriptions: Subscription = new Subscription();
  private inputOptionSelectionnez: InputOption;

  idUsagerIdent1: number;
  idUsagerIdent2: number;
  usagerComm1Dto?: UsagerCommFusionDTO;
  usagerComm2Dto?: UsagerCommFusionDTO;
  usagerCommFusionDto: UsagerCommFusionDTO;
  usagerCommFusionInitial: string;

  usagerComm1DetailChecked: boolean = false;
  usagerComm2DetailChecked: boolean = false;

  isActifValide: boolean = true;
  isPosteValide: boolean = true;
  isTypeEquipementValide: boolean = true;
  isTypeCoordonneeValide: boolean = true;

  ouiLabel: string;
  nonLabel: string;
  selectionnezLabel: string;

  courrielOptions: InputOptionCollection = {
    name: "courriel-options",
    options: []
  };

  numeroOptions: InputOptionCollection = {
    name: "numero-options",
    options: []
  };

  ouiNonOptions: InputOptionCollection = {
    name: "oui-non-options",
    options: []
  };

  posteOptions: InputOptionCollection = {
    name: "poste-options",
    options: []
  };

  typeCoordCommOptions: InputOptionCollection = {
    name: "type-coordonnee-options",
    options: []
  };

  typeEquipCommOptions: InputOptionCollection = {
    name: "type-equipement-options",
    options: []
  };

  @ViewChild("chosenTypeEquipement")
  chosenTypeEquipement: SigctChosenComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FusionCommunicationsUsagerPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FusionData,
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.alertStore.resetAlert();

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );

    this.ouiLabel = this.translateService.instant("sigct.ss.boolean.true");
    this.nonLabel = this.translateService.instant("sigct.ss.boolean.false");
    this.selectionnezLabel = this.translateService.instant("option.select.message");

    this.inputOptionSelectionnez = {
      value: null,
      label: this.selectionnezLabel,
      description: " "
    };

    // Initialise les options Oui/Non
    this.ouiNonOptions.options = [
      this.inputOptionSelectionnez,
      { value: String(true), label: this.ouiLabel, description: "" },
      { value: String(false), label: this.nonLabel, description: "" }
    ];

    this.initData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Initialise le contenu du popup avec les données reçues par le constructeur.
   */
  private initData(): void {
    this.isActifValide = true;
    this.isPosteValide = true;
    this.isTypeEquipementValide = true;
    this.isTypeCoordonneeValide = true;

    if (this.data) {
      this.idUsagerIdent1 = this.data.idUsagerIdent1;
      this.idUsagerIdent2 = this.data.idUsagerIdent2;
      this.usagerComm1Dto = this.copierUsagerCommDto(this.data.usagerComm1Dto);
      this.usagerComm2Dto = this.copierUsagerCommDto(this.data.usagerComm2Dto);
      this.usagerCommFusionDto = this.data.usagerCommFusionDto ? this.copierUsagerCommDto(this.data.usagerCommFusionDto) : this.fusionnerUsagerCommDtos(this.data.usagerComm1Dto, this.data.usagerComm2Dto);
      this.typeCoordCommOptions.options = [...this.data.typeCoordonneCommOptions]; // Important, on utilise une copie des options
      this.typeEquipCommOptions.options = [...this.data.typeEquipementCommOptions];// Important, on utilise une copie des options

      // Garde une copie initiale du contenu du dto pour utilisation dans le isDirty().
      this.usagerCommFusionInitial = JSON.stringify(this.usagerCommFusionDto);

      // Coche les checkbox Detail selon le contenu de la fusion.
      this.initCheckboxDetails();

      // Peuple les listes déroulantes selon le contenu des communications.
      this.peuplerListesDeroulantes();
    }
  }

  /**
   * Coche les checkbox Detail dont le contenu se retrouve déjà dans la fusion.
   */
  private initCheckboxDetails(): void {
    this.usagerComm1DetailChecked = false;
    this.usagerComm2DetailChecked = false;

    // Si la fusion possède un détail 
    if (this.usagerCommFusionDto.detail) {
      // Si les 2 communications possèdent un détail différent, car sinon les checkbox ne sont pas visibles
      if (this.usagerComm1Dto?.detail && this.usagerComm2Dto?.detail && this.usagerComm1Dto?.detail != this.usagerComm2Dto?.detail) {
        if (this.usagerCommFusionDto.detail.startsWith(this.usagerComm1Dto?.detail)) {
          this.usagerComm1DetailChecked = true;
          this.usagerComm2DetailChecked = this.usagerCommFusionDto.detail.length > this.usagerComm1Dto?.detail.length;
        } else {
          this.usagerComm2DetailChecked = true;
          this.usagerComm1DetailChecked = this.usagerCommFusionDto.detail.length > this.usagerComm2Dto?.detail.length;
        }
      }
    }
  }

  /**
   * Fusionne le contenu de deux UsagerCommDTO pour en produire un nouveau. 
   * Les données identiques ou qui se retrouvent dans un seul DTO sont retenues.
   * @param usagerComm1Dto 1er UsagerCommDTO à fusionner
   * @param usagerComm2Dto 2e UsagerCommDTO à fusionner
   * @returns un UsagerCommDTO résultat de la fusion
   */
  private fusionnerUsagerCommDtos(usagerComm1Dto: UsagerCommDTO, usagerComm2Dto: UsagerCommDTO): UsagerCommFusionDTO {
    let usagerCommFusionDto: UsagerCommFusionDTO = new UsagerCommFusionDTO();

    usagerCommFusionDto.idSource1 = usagerComm1Dto?.id;
    usagerCommFusionDto.idSource2 = usagerComm2Dto?.id;

    usagerCommFusionDto.actif = FusionUtils.equalsOuUniqueBool(usagerComm1Dto?.actif, usagerComm2Dto?.actif);
    usagerCommFusionDto.archive = usagerCommFusionDto.actif != null ? String(!usagerCommFusionDto.actif) : null;
    usagerCommFusionDto.coordonnees = FusionUtils.equalsOuUnique(usagerComm1Dto?.coordonnees, usagerComm2Dto?.coordonnees);
    usagerCommFusionDto.courriel = FusionUtils.equalsOuUnique(usagerComm1Dto?.courriel, usagerComm2Dto?.courriel);
    usagerCommFusionDto.numero = FusionUtils.equalsOuUnique(usagerComm1Dto?.numero, usagerComm2Dto?.numero);
    usagerCommFusionDto.poste = FusionUtils.equalsOuUnique(usagerComm1Dto?.poste, usagerComm2Dto?.poste);
    usagerCommFusionDto.detail = FusionUtils.equalsOuUnique(usagerComm1Dto?.detail, usagerComm2Dto?.detail);
    usagerCommFusionDto.codeTypeCoordComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.codeTypeCoordComm, usagerComm2Dto?.codeTypeCoordComm);
    usagerCommFusionDto.nomTypeCoordComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.nomTypeCoordComm, usagerComm2Dto?.nomTypeCoordComm);
    usagerCommFusionDto.codeTypeEquipComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.codeTypeEquipComm, usagerComm2Dto?.codeTypeEquipComm);
    usagerCommFusionDto.nomTypeEquipComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.nomTypeEquipComm, usagerComm2Dto?.nomTypeEquipComm);

    return usagerCommFusionDto;
  }

  /**
   * Retourne une copie du UsagerCommDTO pour briser la référence avec le DTO source.
   * @param usagerCommDto dto à copier
   * @returns un UsagerCommFusionDTO
   */
  private copierUsagerCommDto(usagerCommDto: UsagerCommDTO): UsagerCommFusionDTO {
    let dto: UsagerCommFusionDTO = null;
    if (usagerCommDto) {
      dto = new UsagerCommFusionDTO();

      if (usagerCommDto instanceof UsagerCommFusionDTO) {
        dto.idSource1 = usagerCommDto.idSource1;
        dto.idSource2 = usagerCommDto.idSource2;
      }

      dto.actif = usagerCommDto.actif;
      dto.archive = usagerCommDto.actif != null ? String(!usagerCommDto.actif) : null;

      dto.courriel = usagerCommDto.courriel;
      dto.numero = usagerCommDto.numero;
      dto.poste = usagerCommDto.poste;
      dto.detail = usagerCommDto.detail;
      dto.codeTypeCoordComm = usagerCommDto.codeTypeCoordComm;
      dto.nomTypeCoordComm = usagerCommDto.nomTypeCoordComm;
      dto.codeTypeEquipComm = usagerCommDto.codeTypeEquipComm;
      dto.nomTypeEquipComm = usagerCommDto.nomTypeEquipComm;
    }
    return dto;
  }

  /**
   * Récupère la communication fusionnée.
   * @returns 
   */
  private getUsagerCommFusionDto(): UsagerCommDTO {
    if (this.usagerCommFusionDto.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
      this.usagerCommFusionDto.coordonnees = this.usagerCommFusionDto.courriel;
    } else if (this.usagerCommFusionDto.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL || this.usagerCommFusionDto.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2) {
      this.usagerCommFusionDto.coordonnees = this.usagerCommFusionDto.numero + (this.usagerCommFusionDto.poste ? "#" + this.usagerCommFusionDto.poste : "");
    } else {
      this.usagerCommFusionDto.coordonnees = this.usagerCommFusionDto.numero;
    }

    this.usagerCommFusionDto.actif = StringUtils.isBlank(this.usagerCommFusionDto.archive) ? null : this.usagerCommFusionDto.archive === "false";

    const typeCoordonneeCommOption: InputOption = FusionUtils.getInputOptionFromCollection(this.usagerCommFusionDto.codeTypeCoordComm, this.typeCoordCommOptions);
    this.usagerCommFusionDto.nomTypeCoordComm = typeCoordonneeCommOption.label;

    const typeEquipementCommOption: InputOption = FusionUtils.getInputOptionFromCollection(this.usagerCommFusionDto.codeTypeEquipComm, this.typeEquipCommOptions);
    this.usagerCommFusionDto.nomTypeEquipComm = typeEquipementCommOption.label;

    return this.usagerCommFusionDto
  }

  /**
   * Retourne true si des modifications ont été apportées à la fusion.
   * @returns 
   */
  private isDirty(): boolean {
    return (this.usagerCommFusionInitial != JSON.stringify(this.usagerCommFusionDto));
  }

  /**
   * Peuple le contenu des listes déroulantes avec les données de usager1 et usager2.
   */
  private peuplerListesDeroulantes(): void {
    this.numeroOptions.options = [];
    this.posteOptions.options = [];
    this.courrielOptions.options = [];

    const noTel1: string = TelephoneUtils.formatTelephoneAvecPoste(this.usagerComm1Dto?.numero, false);
    const noTel2: string = TelephoneUtils.formatTelephoneAvecPoste(this.usagerComm2Dto?.numero, false);
    this.numeroOptions.options = FusionUtils.creerInputOptionsFromValuesEtLibelles(this.usagerComm1Dto?.numero, noTel1, this.usagerComm2Dto?.numero, noTel2, this.inputOptionSelectionnez);
    this.posteOptions.options = FusionUtils.creerInputOptionsFromValues(this.usagerComm1Dto?.poste, this.usagerComm2Dto?.poste, this.inputOptionSelectionnez);
    this.courrielOptions.options = FusionUtils.creerInputOptionsFromValues(this.usagerComm1Dto?.courriel, this.usagerComm2Dto?.courriel, this.inputOptionSelectionnez);

    // Si la communication n'est pas de type courriel, on retire l'option "Courriel" de la liste d'équipements.
    if (this.usagerComm1Dto && (this.usagerComm1Dto.codeTypeEquipComm != TypeEquipementCommunicationEnum.COURELEC) ||
      this.usagerComm2Dto && (this.usagerComm2Dto.codeTypeEquipComm != TypeEquipementCommunicationEnum.COURELEC)) {
      const courrielIndex: number = this.typeEquipCommOptions.options.findIndex((value: InputOption) => value.value == this.COURELEC);
      this.typeEquipCommOptions.options.splice(courrielIndex, 1);
    }
  }

  /**
   * Valide le contenu de la fusion. Affiche un message rouge si non valdie.
   * @returns true si valide, false si non valide
   */
  private validerFusion(): boolean {
    this.alertStore.resetAlert();

    this.isActifValide = true;
    this.isPosteValide = true;
    this.isTypeEquipementValide = true;
    this.isTypeCoordonneeValide = true;

    let messages: string[] = [];

    const isTypeEquipAvecPoste: boolean = (this.usagerCommFusionDto?.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL ||
      this.usagerCommFusionDto?.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2);

    // Le poste est obligatoire si les 2 communications possèdent un poste et que le type d'équipement est TEL ou TEL2
    if (this.usagerComm1Dto?.poste && this.usagerComm2Dto?.poste && isTypeEquipAvecPoste && !this.usagerCommFusionDto.poste) {
      this.isPosteValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editcomm.poste");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerCommFusionDto.codeTypeEquipComm) {
      this.isTypeEquipementValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editcomm.moyen");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerCommFusionDto.codeTypeCoordComm) {
      this.isTypeCoordonneeValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editcomm.type");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerCommFusionDto.archive) {
      this.isActifValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editcomm.archivee");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Lors de la sélectionne d'un type d'équipememnt (Moyen), la valeur du poste est ajustée selon l'équipement sélectionné.
   * @param selection 
   */
  onTypeEquipementSelected(selection: InputOption): void {
    if (selection.value == TypeEquipementCommunicationEnum.TEL || selection.value == TypeEquipementCommunicationEnum.TEL2) {
      // Le moyen est TEL ou TEL2, on s'assure que le poste est présent sinon on met celui par défaut
      if (!this.usagerCommFusionDto.poste) {
        this.usagerCommFusionDto.poste = FusionUtils.equalsOuUnique(this.usagerComm1Dto.poste, this.usagerComm2Dto.poste);
      }
    } else {
      // Le moyen est autre que TEL ou TEL2, on vide le poste après avertissement
      if (this.usagerCommFusionDto.poste) {
        // Certaines informations seront perdues si vous modifiez le moyen de communication.
        const msg = this.translateService.instant("us-iu-a30003");
        this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe(_ => {
          this.chosenTypeEquipement.focus(false);
        });

        // Vide le poste de la fusion
        this.usagerCommFusionDto.poste = null;
      }
    }
  }

  /**
   * Lors d'un clic sur la case à cocher du détail de l'usager 1, copie le détail dans la fusion.
   * @param event 
   */
  onPopupUsagerComm1DetailClick(event: MatCheckboxChange): void {
    this.usagerCommFusionDto.detail = "";

    if (this.usagerComm2DetailChecked) {
      this.usagerCommFusionDto.detail = this.usagerComm2Dto.detail;
    }

    if (event.checked) {
      if (this.usagerCommFusionDto.detail) {
        this.usagerCommFusionDto.detail += " ";
      }
      const detail: string = this.usagerCommFusionDto.detail + this.usagerComm1Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe();
      }
      this.usagerCommFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }
  }

  /**
   * Lors d'un clic sur la case à cocher du détail de l'usager 2, copie le détail dans la fusion.
   * @param event 
   */
  onPopupUsagerComm2DetailClick(event: MatCheckboxChange): void {
    this.usagerCommFusionDto.detail = "";

    if (this.usagerComm1DetailChecked) {
      this.usagerCommFusionDto.detail = this.usagerComm1Dto.detail;
    }

    if (event.checked) {
      if (this.usagerCommFusionDto.detail) {
        this.usagerCommFusionDto.detail += " ";
      }
      const detail: string = this.usagerCommFusionDto.detail + this.usagerComm2Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe();
      }
      this.usagerCommFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }
  }

  /**
   * Lors d'un clic sur le bouton "Sauvegarder et fermer", on ferme le popup et retourne les données saisie au parent.
   */
  onSauvegarderClick(): void {
    if (this.validerFusion()) {
      this.data.usagerCommFusionDto = this.getUsagerCommFusionDto();
      this.dialogRef.close(this.data);
    }
  }

  /**
   * Lors d'un clic sur le bouton "Annuler", on recharge les données initiales du popup.
   */
  onAnnulerClick(): void {
    this.alertStore.resetAlert();
    if (this.isDirty()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-c70005").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.initData();
            }
          }
        ));
    } else {
      this.initData();
    }
  }

  /**
   * Lors d'un clic sur le bouton "Retour", on ferme le popup sans sauvegarder.
   */
  onRetourFusionClick(): void {
    this.alertStore.resetAlert();
    if (this.isDirty()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-c70005").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.dialogRef.close();
            }
          }
        ));
    } else {
      this.dialogRef.close();
    }
  }
}
