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
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { UsagerLieuResidenceDTO } from 'projects/usager-ng-core/src/lib/models/usager-lieu-residence-dto';
import { UsagerLieuResidenceFusionDTO } from 'projects/usager-ng-core/src/lib/models/usager-lieu-residence-fusion-dto';
import FusionUtils from 'projects/usager-ng-core/src/lib/utils/fusion-utils';
import { Subscription } from 'rxjs';

const MAX_LENGTH_DETAIL: number = 255;

export interface FusionData {
  index: number;
  idUsagerIdent1: number;
  idUsagerIdent2: number;
  usagerLieuRes1Dto: UsagerLieuResidenceDTO;
  usagerLieuRes2Dto: UsagerLieuResidenceDTO;
  usagerLieuResFusionDto: UsagerLieuResidenceDTO;
  typeLieuResidenceOptions: InputOption[];
}




@Component({
  selector: 'fusion-lieux-residence-usager-popup',
  templateUrl: './fusion-lieux-residence-usager-popup.component.html',
  styleUrls: ['./fusion-lieux-residence-usager-popup.component.css']
})
export class FusionLieuxResidenceUsagerPopupComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private inputOptionSelectionnez: InputOption;

  idUsagerIdent1: number;
  idUsagerIdent2: number;
  usagerLieuRes1Dto?: UsagerLieuResidenceFusionDTO;
  usagerLieuRes2Dto?: UsagerLieuResidenceFusionDTO;
  usagerLieuResFusionDto: UsagerLieuResidenceFusionDTO;
  usagerLieuResFusionInitial: string;

  usagerLieuRes1DetailChecked: boolean = false;
  usagerLieuRes2DetailChecked: boolean = false;

  isActifValide: boolean = true;
  isNoCiviqRueValdie: boolean = true;
  isCodeTypeAdresseValide: boolean = true;

  ouiLabel: string;
  nonLabel: string;
  selectionnezLabel: string;

  noCiviqRueOptions: InputOptionCollection = {
    name: "no-civiq-rue-options",
    options: []
  };

  ouiNonOptions: InputOptionCollection = {
    name: "oui-non-options",
    options: []
  };

  typeLieuResidenceOptions: InputOptionCollection = {
    name: "type-lieu-reisdence-options",
    options: []
  };

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FusionLieuxResidenceUsagerPopupComponent>,
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
    this.isNoCiviqRueValdie = true;
    this.isCodeTypeAdresseValide = true;

    if (this.data) {
      this.idUsagerIdent1 = this.data.idUsagerIdent1;
      this.idUsagerIdent2 = this.data.idUsagerIdent2;
      this.usagerLieuRes1Dto = this.copierUsagerLieuResidenceDto(this.data.usagerLieuRes1Dto);
      this.usagerLieuRes2Dto = this.copierUsagerLieuResidenceDto(this.data.usagerLieuRes2Dto);
      this.usagerLieuResFusionDto = this.data.usagerLieuResFusionDto ? this.copierUsagerLieuResidenceDto(this.data.usagerLieuResFusionDto) : this.fusionnerUsagerLieuResidenceDtos(this.data.usagerLieuRes1Dto, this.data.usagerLieuRes2Dto);
      this.typeLieuResidenceOptions.options = [...this.data.typeLieuResidenceOptions]; // Important, on doit utiliser une copie des options

      // Garde une copie initiale du contenu du dto pour utilisation dans le isDirty().
      this.usagerLieuResFusionInitial = JSON.stringify(this.usagerLieuResFusionDto);

      // Coche les checkbox Detail selon le contenu de la fusion.
      this.initCheckboxDetails();

      // Peuple les listes déroulantes selon le contenu des adresses.
      this.peuplerListesDeroulantes();
    }
  }

  /**
   * Coche les checkbox Detail dont le contenu se retrouve déjà dans la fusion.
   */
  private initCheckboxDetails(): void {
    this.usagerLieuRes1DetailChecked = false;
    this.usagerLieuRes2DetailChecked = false;

    // Si la fusion possède un détail 
    if (this.usagerLieuResFusionDto.detail) {
      // Si les 2 adresses possèdent un détail différent, car sinon les checkbox ne sont pas visibles
      if (this.usagerLieuRes1Dto?.detail && this.usagerLieuRes2Dto?.detail && this.usagerLieuRes1Dto?.detail != this.usagerLieuRes2Dto?.detail) {
        if (this.usagerLieuResFusionDto.detail.startsWith(this.usagerLieuRes1Dto?.detail)) {
          this.usagerLieuRes1DetailChecked = true;
          this.usagerLieuRes2DetailChecked = this.usagerLieuResFusionDto.detail.length > this.usagerLieuRes1Dto?.detail.length;
        } else {
          this.usagerLieuRes2DetailChecked = true;
          this.usagerLieuRes1DetailChecked = this.usagerLieuResFusionDto.detail.length > this.usagerLieuRes2Dto?.detail.length;
        }
      }
    }
  }

  /**
   * Fusionne le contenu de deux UsagerLieuResidenceDTO pour en produire un UsagerLieuResidenceFusionDTO. 
   * Les données identiques ou qui se retrouvent dans un seul DTO sont retenues.
   * @param usagerComm1Dto 1er UsagerLieuResidenceDTO à fusionner
   * @param usagerComm2Dto 2e UsagerLieuResidenceDTO à fusionner
   * @returns un UsagerLieuResidenceFusionDTO résultat de la fusion
   */
  private fusionnerUsagerLieuResidenceDtos(usagerLieuRes1Dto: UsagerLieuResidenceDTO, usagerLieuRes2Dto: UsagerLieuResidenceDTO): UsagerLieuResidenceFusionDTO {
    let usagerLieuResFusionDto: UsagerLieuResidenceFusionDTO = new UsagerLieuResidenceFusionDTO();

    usagerLieuResFusionDto.idSource1 = usagerLieuRes1Dto?.id;
    usagerLieuResFusionDto.idSource2 = usagerLieuRes2Dto?.id;

    usagerLieuResFusionDto.actif = FusionUtils.equalsOuUniqueBool(usagerLieuRes1Dto?.actif, usagerLieuRes2Dto?.actif);
    usagerLieuResFusionDto.archive = usagerLieuResFusionDto.actif != null ? String(!usagerLieuResFusionDto.actif) : null;
    usagerLieuResFusionDto.noCiviq = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.noCiviq, usagerLieuRes2Dto?.noCiviq);
    usagerLieuResFusionDto.noCiviqSuffx = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.noCiviqSuffx, usagerLieuRes2Dto?.noCiviqSuffx);
    usagerLieuResFusionDto.rue = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rue, usagerLieuRes2Dto?.rue);
    usagerLieuResFusionDto.codeCategSubdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeCategSubdvImmeu, usagerLieuRes2Dto?.codeCategSubdvImmeu);
    usagerLieuResFusionDto.nomCategSubdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomCategSubdvImmeu, usagerLieuRes2Dto?.nomCategSubdvImmeu);
    usagerLieuResFusionDto.subdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.subdvImmeu, usagerLieuRes2Dto?.subdvImmeu);
    usagerLieuResFusionDto.municCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.municCode, usagerLieuRes2Dto?.municCode);
    usagerLieuResFusionDto.municNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.municNom, usagerLieuRes2Dto?.municNom);
    usagerLieuResFusionDto.codePostal = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codePostal, usagerLieuRes2Dto?.codePostal);
    usagerLieuResFusionDto.codeTypeAdresse = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeTypeAdresse, usagerLieuRes2Dto?.codeTypeAdresse);
    usagerLieuResFusionDto.nomTypeAdresse = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomTypeAdresse, usagerLieuRes2Dto?.nomTypeAdresse);
    usagerLieuResFusionDto.codeRegion = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeRegion, usagerLieuRes2Dto?.codeRegion);
    usagerLieuResFusionDto.nomRegion = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomRegion, usagerLieuRes2Dto?.nomRegion);
    usagerLieuResFusionDto.codeProvince = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeProvince, usagerLieuRes2Dto?.codeProvince);
    usagerLieuResFusionDto.nomProvince = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomProvince, usagerLieuRes2Dto?.nomProvince);
    usagerLieuResFusionDto.codePays = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codePays, usagerLieuRes2Dto?.codePays);
    usagerLieuResFusionDto.nomPays = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomPays, usagerLieuRes2Dto?.nomPays);
    usagerLieuResFusionDto.rtsCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rtsCode, usagerLieuRes2Dto?.rtsCode);
    usagerLieuResFusionDto.rtsNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rtsNom, usagerLieuRes2Dto?.rtsNom);
    usagerLieuResFusionDto.rlsCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rlsCode, usagerLieuRes2Dto?.rlsCode);
    usagerLieuResFusionDto.rlsNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rlsNom, usagerLieuRes2Dto?.rlsNom);
    usagerLieuResFusionDto.clscCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.clscCode, usagerLieuRes2Dto?.clscCode);
    usagerLieuResFusionDto.clscNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.clscNom, usagerLieuRes2Dto?.clscNom);
    usagerLieuResFusionDto.detail = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.detail, usagerLieuRes2Dto?.detail);

    usagerLieuResFusionDto.noCiviqRue = FusionUtils.equalsOuUnique(this.formaterNoCivicRue(usagerLieuRes1Dto), this.formaterNoCivicRue(usagerLieuRes2Dto))

    return usagerLieuResFusionDto;
  }

  /**
   * Copie le contenu d'un UsagerLieuResidenceDTO dans une UsagerLieuResidenceFusionDTO.
   * @param usagerLieuResDto dto à copier
   * @returns un UsagerLieuResidenceFusionDTO
   */
  private copierUsagerLieuResidenceDto(usagerLieuResDto: UsagerLieuResidenceDTO): UsagerLieuResidenceFusionDTO {
    let dto: UsagerLieuResidenceFusionDTO = null;
    if (usagerLieuResDto) {
      dto = new UsagerLieuResidenceFusionDTO();

      if (usagerLieuResDto instanceof UsagerLieuResidenceFusionDTO) {
        dto.idSource1 = usagerLieuResDto.idSource1;
        dto.idSource2 = usagerLieuResDto.idSource2;
      }

      dto.actif = usagerLieuResDto.actif;
      dto.archive = usagerLieuResDto.actif != null ? String(!usagerLieuResDto.actif) : null;
      
      dto.noCiviq = usagerLieuResDto.noCiviq;
      dto.noCiviqSuffx = usagerLieuResDto.noCiviqSuffx;
      dto.rue = usagerLieuResDto.rue;
      dto.codeCategSubdvImmeu = usagerLieuResDto.codeCategSubdvImmeu;
      dto.nomCategSubdvImmeu = usagerLieuResDto.nomCategSubdvImmeu;
      dto.subdvImmeu = usagerLieuResDto.subdvImmeu;
      dto.municCode = usagerLieuResDto.municCode;
      dto.municNom = usagerLieuResDto.municNom;
      dto.codePostal = usagerLieuResDto.codePostal;
      dto.codeTypeAdresse = usagerLieuResDto.codeTypeAdresse;
      dto.nomTypeAdresse = usagerLieuResDto.nomTypeAdresse;
      dto.codeRegion = usagerLieuResDto.codeRegion;
      dto.nomRegion = usagerLieuResDto.nomRegion;
      dto.codeProvince = usagerLieuResDto.codeProvince;
      dto.nomProvince = usagerLieuResDto.nomProvince;
      dto.codePays = usagerLieuResDto.codePays;
      dto.nomPays = usagerLieuResDto.nomPays;
      dto.rtsCode = usagerLieuResDto.rtsCode;
      dto.rtsNom = usagerLieuResDto.rtsNom;
      dto.rlsCode = usagerLieuResDto.rlsCode;
      dto.rlsNom = usagerLieuResDto.rlsNom;
      dto.clscCode = usagerLieuResDto.clscCode;
      dto.clscNom = usagerLieuResDto.clscNom;
      dto.detail = usagerLieuResDto.detail;

      dto.noCiviqRue = this.formaterNoCivicRue(usagerLieuResDto);
    }
    return dto;
  }

  /**
   * Formate le no civique, la rue et l'appartement d'une adresse.
   * Concatène: noCiviq + noCiviqSuffx + rue + nomCategSubdvImmeu + subdvImmeu
   * @param usagerLieuResidenceDTO 
   * @returns 
   */
  private formaterNoCivicRue(usagerLieuResidenceDTO: UsagerLieuResidenceDTO): string {
    let noCivicRue: string = "";
    if (usagerLieuResidenceDTO) {
      if (usagerLieuResidenceDTO.noCiviq) {
        noCivicRue += usagerLieuResidenceDTO.noCiviq + " ";
      }
      if (usagerLieuResidenceDTO.noCiviqSuffx) {
        noCivicRue += usagerLieuResidenceDTO.noCiviqSuffx + " ";
      }
      if (usagerLieuResidenceDTO.rue) {
        noCivicRue += usagerLieuResidenceDTO.rue + " ";
      }
      if (usagerLieuResidenceDTO.subdvImmeu) {
        noCivicRue += usagerLieuResidenceDTO.nomCategSubdvImmeu + " " + usagerLieuResidenceDTO.subdvImmeu + " ";
      }
      if (noCivicRue) {
        noCivicRue = noCivicRue.substring(0, noCivicRue.length - 1);
      }
    }
    return noCivicRue;
  }

  /**
   * Récupère l'adresse fusionnée.
   * @returns 
   */
  private getUsagerLieuResidenceFusionDto(): UsagerLieuResidenceDTO {
    if (this.usagerLieuResFusionDto.noCiviqRue) {
      if (this.usagerLieuResFusionDto.noCiviqRue == this.usagerLieuRes1Dto?.noCiviqRue) {
        this.usagerLieuResFusionDto.noCiviq = this.usagerLieuRes1Dto.noCiviq;
        this.usagerLieuResFusionDto.noCiviqSuffx = this.usagerLieuRes1Dto.noCiviqSuffx;
        this.usagerLieuResFusionDto.codeCategSubdvImmeu = this.usagerLieuRes1Dto.codeCategSubdvImmeu;
        this.usagerLieuResFusionDto.nomCategSubdvImmeu = this.usagerLieuRes1Dto.nomCategSubdvImmeu;
        this.usagerLieuResFusionDto.subdvImmeu = this.usagerLieuRes1Dto.subdvImmeu;
      } else if (this.usagerLieuResFusionDto.noCiviqRue == this.usagerLieuRes2Dto?.noCiviqRue) {
        this.usagerLieuResFusionDto.noCiviq = this.usagerLieuRes2Dto.noCiviq;
        this.usagerLieuResFusionDto.noCiviqSuffx = this.usagerLieuRes2Dto.noCiviqSuffx;
        this.usagerLieuResFusionDto.codeCategSubdvImmeu = this.usagerLieuRes2Dto.codeCategSubdvImmeu;
        this.usagerLieuResFusionDto.nomCategSubdvImmeu = this.usagerLieuRes2Dto.nomCategSubdvImmeu;
        this.usagerLieuResFusionDto.subdvImmeu = this.usagerLieuRes2Dto.subdvImmeu;
      }
    }

    this.usagerLieuResFusionDto.actif = StringUtils.isBlank(this.usagerLieuResFusionDto.archive) ? null : this.usagerLieuResFusionDto.archive === "false";

    const typeLieuResidenceOption: InputOption = FusionUtils.getInputOptionFromCollection(this.usagerLieuResFusionDto.codeTypeAdresse, this.typeLieuResidenceOptions);
    this.usagerLieuResFusionDto.nomTypeAdresse = typeLieuResidenceOption.label;

    return this.usagerLieuResFusionDto
  }

  /**
   * Retourne true si des modifications ont été apportées à la fusion.
   * @returns 
   */
  private isDirty(): boolean {
    return (this.usagerLieuResFusionInitial != JSON.stringify(this.usagerLieuResFusionDto));
  }

  /**
   * Peuple le contenu des listes déroulantes avec les données de usager1 et usager2.
   */
  private peuplerListesDeroulantes(): void {
    this.noCiviqRueOptions.options = FusionUtils.creerInputOptionsFromValues(this.usagerLieuRes1Dto?.noCiviqRue, this.usagerLieuRes2Dto?.noCiviqRue, this.inputOptionSelectionnez);
  }

  /**
   * Valide le contenu de la fusion. Affiche un message rouge si non valdie.
   * @returns true si valide, false si non valide
   */
  private validerFusion(): boolean {
    this.alertStore.resetAlert();

    this.isActifValide = true;
    this.isNoCiviqRueValdie = true;
    this.isCodeTypeAdresseValide = true;

    let messages: string[] = [];

    // Le numéro civique et la rue sont obligatoires si les 2 adresses possèdent un numéro civique et une rue
    if (this.usagerLieuRes1Dto?.noCiviqRue && this.usagerLieuRes2Dto?.noCiviqRue && !this.usagerLieuResFusionDto.noCiviqRue) {
      this.isNoCiviqRueValdie = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editadresse.nociviqnomrue");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerLieuResFusionDto.codeTypeAdresse) {
      this.isCodeTypeAdresseValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editadresse.type");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerLieuResFusionDto.archive) {
      this.isActifValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.editadresse.archivee");
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
   * Lors d'un clic sur la case à cocher du détail de l'usager 1, copie le détail dans la fusion.
   * @param event 
   */
  onPopupUsagerLieuRes1DetailClick(event: MatCheckboxChange): void {
    this.usagerLieuResFusionDto.detail = "";

    if (this.usagerLieuRes2DetailChecked) {
      this.usagerLieuResFusionDto.detail = this.usagerLieuRes2Dto.detail;
    }

    if (event.checked) {
      if (this.usagerLieuResFusionDto.detail) {
        this.usagerLieuResFusionDto.detail += " ";
      }
      const detail: string = this.usagerLieuResFusionDto.detail + this.usagerLieuRes1Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe();
      }
      this.usagerLieuResFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }
  }

  /**
   * Lors d'un clic sur la case à cocher du détail de l'usager 2, copie le détail dans la fusion.
   * @param event 
   */
  onPopupUsagerLieuRes2DetailClick(event: MatCheckboxChange): void {
    this.usagerLieuResFusionDto.detail = "";

    if (this.usagerLieuRes1DetailChecked) {
      this.usagerLieuResFusionDto.detail = this.usagerLieuRes1Dto.detail;
    }

    if (event.checked) {
      if (this.usagerLieuResFusionDto.detail) {
        this.usagerLieuResFusionDto.detail += " ";
      }
      const detail: string = this.usagerLieuResFusionDto.detail + this.usagerLieuRes2Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe();
      }
      this.usagerLieuResFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }
  }

  /**
   * Lors d'un clic sur le bouton "Sauvegarder et fermer", on ferme le popup et retourne les données saisie au parent.
   */
  onSauvegarderClick(): void {
    if (this.validerFusion()) {
      this.data.usagerLieuResFusionDto = this.getUsagerLieuResidenceFusionDto();
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
