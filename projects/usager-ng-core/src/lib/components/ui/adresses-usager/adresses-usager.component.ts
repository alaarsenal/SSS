import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrors, BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { MsssM10Adresse, MsssM10CodePostal, MsssM10Municipalite, MsssM10Pays, MsssM10Province, MsssM10Territoire, TypeTerritoireEnum } from 'projects/sigct-service-ng-lib/src/lib/models/msss-m10-models';
import { MsssM10Service } from 'projects/sigct-service-ng-lib/src/lib/services/msss-m10/msss-m10.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { ActionLinkItem } from "projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component";
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { MsssM10MunicipaliteAutocompleteComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/msss-m10/components/msss-m10-municipalite-autocomplete/msss-m10-municipalite-autocomplete.component';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { LinkedUsagerDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { ReferenceDTO, UsagerLieuResidenceDTO } from '../../../models';
import { UsagerService } from '../../../services/usager.service';
import { TypeDataToBind } from '../popup-import-comm-addrss-linked-usager/popup-import-comm-addrss-linked-usager.component';

export enum enumTypeAdr {
  PRINC = "PRINC",
  SECOND = "SECOND",
  TEMP = "TEMP"
}




@Component({
  selector: 'app-adresses-usager',
  templateUrl: './adresses-usager.component.html',
  styleUrls: ['./adresses-usager.component.css'],
  providers: [ConfirmationDialogService],
})
export class AdressesUsagerComponent implements OnInit, OnDestroy {

  constructor(private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private modalConfirmService: ConfirmationDialogService,
    private msssM10Service: MsssM10Service,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private appContextStore: AppContextStore,
    private usagerService: UsagerService) {
  }

  subscriptions: Subscription = new Subscription();
  formSubmitted: boolean;
  public bindingErrors: BindingErrors;
  public usagerLieuResidence: UsagerLieuResidenceDTO = new UsagerLieuResidenceDTO();
  public errorsMessages = {};
  public actionLinks: ActionLinkItem[];
  public usagerLieuResidences: UsagerLieuResidenceDTO[] = [];
  public usagerLieuResidenceActives: UsagerLieuResidenceDTO[] = [];
  public usagerLieuResidenceArchivees: UsagerLieuResidenceDTO[] = [];
  public elementSelectionne: UsagerLieuResidenceDTO;
  public adresseAModifier: string;
  public idElementModifieSelectionne: number = null;
  public modeEditer: boolean = false;
  public etatDisplayAll: boolean = false;
  public idIdentique: boolean = false;
  public messageConfirmationArchiverAdresse: string;
  public cacherAfficherReduire: boolean = false;

  listePaysValide: boolean = true;
  listeProvinceValide: boolean = true;
  listeRegionValide: boolean = true;
  listeTypeAdresseValide: boolean = true;

  isContextAppel: boolean = false;
  likedUsagerAvailable: boolean = false;
  importerCommMsg: string;
  selectLabelMsg: string;

  //Conteneur pour la liste de valeurs
  public inputOptionRegion: InputOptionCollection = {
    name: "region",
    options: []
  };

  public inputOptionCodePostalInconnu: InputOptionCollection = {
    name: "codePostalInconnu",
    options: [] // Voir ngInit()
  }

  //Conteneur pour la liste de valeurs
  public inputOptionType: InputOptionCollection = {
    name: "type",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionAppartement: InputOptionCollection = {
    name: "appartement",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionPays: InputOptionCollection = {
    name: "pays",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionProvince: InputOptionCollection = {
    name: "province",
    options: []
  };

  public inputOptionlinkedUsager: InputOptionCollection = {
    name: "linkedUsager",
    options: []
  }

  @ViewChild("fAdresse", { static: true })
  form: NgForm;

  @ViewChild("municipalite", { static: true })
  municipalite: MsssM10MunicipaliteAutocompleteComponent;

  @ViewChild("submitFAdresseBtn", { static: true })
  submitFAdresseBtn: ElementRef;

  @Output()
  outputSubmit: EventEmitter<any> = new EventEmitter();

  @Output()
  outputArchiverLieuResidence: EventEmitter<number> = new EventEmitter();

  @Input()
  ngSwitchCase: any

  @Output()
  outputafficherToutLieuResidence: EventEmitter<any> = new EventEmitter();

  @Output()
  outputafficherToutLieuResidenceInactif: EventEmitter<any> = new EventEmitter();

  @Output()
  outputClearCodePostal: EventEmitter<any> = new EventEmitter();

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
        } else if (item.nom && !item.prenom) {
          fullName = item.nom
        } else if (!item.nom && item.prenom) {
          fullName = item.prenom
        }

        this.inputOptionlinkedUsager.options.push({ label: fullName, value: `${item.idUsagerIdent}`, description: "" });
      });
    }
  }

  @Output()
  selectAddressLinkedUsagerEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  openModalForConfirmerArchiverAddressEvent: EventEmitter<any> = new EventEmitter();
  element: any;

  @Input("idUsager")
  idUsager: number;

  ngOnInit() {
    this.isContextAppel = this.appContextStore.state.isContextAppel;
    this.importerCommMsg = this.translateService.instant("usager.adresses.importer");
    this.selectLabelMsg = this.translateService.instant("usager.comm.btn.label.select");

    this.subscriptions.add(
      this.translateService.get("usager.label.ajout_sauvegarder").subscribe((libelle: string) => {
        this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: libelle, id: "btnSubmitAdresse" }];
      }));

    this.subscriptions.add(
      this.translateService.get("usager.label.code_postal_inc").subscribe((libelle: string) => {
        this.inputOptionCodePostalInconnu.options = [{ label: libelle, value: "true" }];
      }));

    this.subscriptions.add(
      this.bindingErrorsStore.state$.subscribe(bindingErrors => {
        this.bindingErrors = bindingErrors;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /** Définit la liste des régions */
  @Input("listeRegion")
  public set listeRegion(values: ReferenceDTO[]) {
    this.inputOptionRegion.options = [];

    this.subscriptions.add(
      this.translateService.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionRegion.options[0] === undefined) {
          this.inputOptionRegion.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            this.inputOptionRegion.options.push({ label: item.nom, value: item.code });
          })
        }
      }));
  }

  /** Définit la liste des types d'adresses */
  @Input("listeTypeAdresse")
  public set listeTypeAdresse(values: ReferenceDTO[]) {
    this.inputOptionType.options = [];

    this.subscriptions.add(
      this.translateService.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionType.options[0] === undefined) {
          this.inputOptionType.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach((item: ReferenceDTO) => {
            this.inputOptionType.options.push({ label: item.nom, value: item.code });
          });
        }
      }));
  }

  /** Définit la liste des types d'appartements */
  @Input("listeTypeAppartement")
  public set listeTypeAppartement(values: ReferenceDTO[]) {
    this.inputOptionAppartement.options = [];

    this.subscriptions.add(
      this.translateService.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionAppartement.options[0] === undefined) {
          this.inputOptionAppartement.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            this.inputOptionAppartement.options.push({ label: item.nom, value: item.code });
          });
        }
      }));
  }

  /** Définit la liste des provinces */
  @Input("listeProvince")
  public set listeProvince(values: ReferenceDTO[]) {
    this.inputOptionProvince.options = [];

    this.subscriptions.add(
      this.translateService.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionProvince.options[0] === undefined) {
          this.inputOptionProvince.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            this.inputOptionProvince.options.push({ label: item.nom, value: item.code });
          });
        }
      }));
  }

  /** Définit la liste des pays */
  @Input("listePays")
  public set listePays(values: ReferenceDTO[]) {
    this.inputOptionPays.options = [];

    this.subscriptions.add(
      this.translateService.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionPays.options[0] === undefined) {
          this.inputOptionPays.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            this.inputOptionPays.options.push({ label: item.nom, value: item.code });
          });
        }
      }));
  }

  /**
   * Peuple la liste des adresses sauvegardes dans la base de donnees
   */
  @Input("listeAdresse")
  public set listeAdresse(usagerLieuResidenceDTOs: UsagerLieuResidenceDTO[]) {
    this.usagerLieuResidences = usagerLieuResidenceDTOs;
  }

  submitAction = () => {
    this.submitFAdresseBtn.nativeElement.click();
  }

  /**
   * Valide le contenu de l'adresse. 
   * @returns retourne true si l'adresse est valide
   */
  validerAdresse(): boolean {
    this.listePaysValide = true;
    this.listeProvinceValide = true;
    this.listeRegionValide = true;
    this.listeTypeAdresseValide = true;

    let alert: AlertModel = new AlertModel();
    let messages: string[] = [];

    if (!this.usagerLieuResidence.codePays) {
      // REQ-548-18 - Le pays est obligatoire 
      // Pays : la saisie est obligatoire.
      const msg = this.translateService.instant("us-iu-e00015");
      messages.push(msg);
      this.listePaysValide = false;
    }

    if (this.usagerLieuResidence.codePays == MsssM10Pays.CODE_CANADA) {
      if (!this.usagerLieuResidence.codeProvince) {
        // REQ-548-19 - Règle adresse hors-Québec.
        // Province : la saisie est obligatoire.
        const msg = this.translateService.instant("us-iu-e00016");
        messages.push(msg);
        this.listeProvinceValide = false;
      } else if (this.usagerLieuResidence.codeProvince == MsssM10Province.CODE_QUEBEC) {
        // REQ-548-20 - Règle adresse québécoise.
        if (!this.usagerLieuResidence.codeRegion) {
          // Région : la saisie est obligatoire.
          const msg = this.translateService.instant("us-iu-e00017");
          messages.push(msg);
          this.listeRegionValide = false;
        }
      }
    }

    if (!this.usagerLieuResidence.codeTypeAdresse) {
      // Type : la saisie est obligatoire.
      const msg = this.translateService.instant("usager.lieuresidence.type.adresse.required");
      messages.push(msg);
      this.listeTypeAdresseValide = false;
    }

    if (messages.length > 0) {
      alert.messages = messages;
      alert.title = this.translateService.instant("girpi.error.label");
      alert.type = AlertType.ERROR;
      this.alertStore.setAlerts([alert]);
      return false;
    } else {
      this.alertStore.resetAlert();
      return true;
    }
  }

  private verifierPresenceMemeCodePostal(): boolean {
    const currentCodePostal: string = this.usagerLieuResidence?.codePostal
    if (currentCodePostal) {
      return this.usagerLieuResidences.some((adr: UsagerLieuResidenceDTO) => adr.codePostal == currentCodePostal && adr.id != this.usagerLieuResidence.id);
    }
    return false;
  }

  onSubmit(args) {
    if (!this.validerAdresse()) {
      this.usagerLieuResidence.isSimilarityCheckIsDone = false;
    } else {
      // La validation est possible uniquement si l'adresse possède un identifiant d'usager
      // La validation est nécessaire uniquement si l'adresse possède un no civique, une rue ou un code postal
      let isNociviqAndCodePostalAndRueAreValid: boolean = false;
      if (this.usagerLieuResidence.noCiviq && this.usagerLieuResidence.codePostal && this.usagerLieuResidence.rue) {
        isNociviqAndCodePostalAndRueAreValid = true;
      }
      let isSameAdrWithCodePostalfound = this.verifierPresenceMemeCodePostal();
      let adrWithSameCodePostalAndNoCiviqAndRueExistAlready = this.usagerLieuResidences.find(adr => isNociviqAndCodePostalAndRueAreValid && adr.id != this.usagerLieuResidence.id && adr.codePostal == this.usagerLieuResidence.codePostal && adr.noCiviq == this.usagerLieuResidence.noCiviq && adr.rue == this.usagerLieuResidence.rue);
      if (isSameAdrWithCodePostalfound || adrWithSameCodePostalAndNoCiviqAndRueExistAlready) {
        this.soummettreAdresse();
      } else {
        let adrWithSameTypeExistAlready = this.usagerLieuResidences.find(adr => adr.codeTypeAdresse === this.usagerLieuResidence.codeTypeAdresse && adr.actif);

        if (!this.usagerLieuResidence.isSimilarityCheckIsDone && adrWithSameTypeExistAlready) {
          this.usagerLieuResidence.isSimilarityCheckIsDone = true;

          if (adrWithSameTypeExistAlready.id === this.usagerLieuResidence.id) {
            this.idIdentique = true;
          } else {
            this.idIdentique = false;
          }

          if (this.modeEditer && !this.idIdentique) {
            this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
              if (result) {
                this.messageConfirmationArchiverAdresse = this.getMessageConfirmationArchiverAdresse();
                this.openModal("confirm_popup");
                this.modeEditer = false;
              } else {
                this.submitAction()
              }
            }));
          } else {
            if (!this.idIdentique) {
              this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
                if (result) {
                  this.messageConfirmationArchiverAdresse = this.getMessageConfirmationArchiverAdresse();
                  this.openModal("confirm_popup");
                } else {
                  this.submitAction()
                }
              }));
            } else {
              this.soummettreAdresse();
            }
          }
        } else {
          this.closeModal("confirm_popup");
          this.soummettreAdresse();
        }
      }
    }
  }

  /**
   * Soummet l'adresse dans le formulaire
   */
  private soummettreAdresse() {
    // En appuyant sur ENTER, l'utilsateur peut soumettre l'adresse avant même avoir sélectionné une municipalité dans la liste de suggestions.
    // Ceci entraine la sauvegarde d'une municipalité sans code munic. Pour éviter une incohérence des données, on vide le nom de la municipalité
    // si son code est absent.
    if (!this.usagerLieuResidence.municCode) {
      this.usagerLieuResidence.municNom = null;
    }

    this.idElementModifieSelectionne = null;
    this.usagerLieuResidence.isSimilarityCheckIsDone = false;
    this.alertStore.setAlerts(undefined);
    this.usagerLieuResidence.actif = true;
    this.outputSubmit.emit("submitAdresse");
  }

  /**
   * reinitialiser le formulaire d'edition du moyen de communication
   */
  reinitialiserUsagerAdresse() {
    this.usagerLieuResidence = new UsagerLieuResidenceDTO();
    this.usagerLieuResidence.codeTypeAdresse = enumTypeAdr.PRINC;
    this.listeTypeAdresseValide = true;
    this.listeRegionValide = true;

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      codeTypeAdresse: this.usagerLieuResidence.codeTypeAdresse
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;
  }

  /**
   * Vide le formulaire des adresses
   */
  reload() {
    this.form.resetForm();
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
   * Selectionner un adresse dans la liste pour l'editer
   */
  public selectionnerLieuResidenceEditer(arg: any) {
    if (!this.isAdresseVide()) {
      this.adresseAModifier = arg;
      this.modeEditer = true;
      this.openModal("confirm_popup_modif");
    } else {
      this.modifier(arg);
    }

  }

  /**
   * Ferme la page popuip et exécute l'initialisation des champs.
   */
  public confirmModif() {

    this.closeModal("confirm_popup_modif");
    this.modifier(this.adresseAModifier);
  }

  public refuserModif() {

    this.usagerLieuResidence.isSimilarityCheckIsDone = false;
    this.closeModal("confirm_popup_modif");

  }

  /**
   * Initialise les champs de l'interface par une adresse que l'on souhaite modifier.
   * @param arg
   */
  public modifier(arg: any) {
    this.idElementModifieSelectionne = arg.id;
    let adresseToModify: UsagerLieuResidenceDTO = this.usagerLieuResidences.find(adr => adr.id === arg.id);
    this.transfertDataToUI(adresseToModify);
  }

  public transfertDataToUI(adresseToModify: UsagerLieuResidenceDTO): void {
    this.usagerLieuResidence.actif = true;
    this.usagerLieuResidence.id = adresseToModify.id;
    this.usagerLieuResidence.codePostal = adresseToModify.codePostal;
    this.usagerLieuResidence.municCode = adresseToModify.municCode;
    this.usagerLieuResidence.municNom = adresseToModify.municNom;
    this.usagerLieuResidence.noCiviq = adresseToModify.noCiviq;
    this.usagerLieuResidence.noCiviqSuffx = adresseToModify.noCiviqSuffx;
    this.usagerLieuResidence.rue = adresseToModify.rue;
    this.usagerLieuResidence.adresse = adresseToModify.adresse;
    this.usagerLieuResidence.detail = adresseToModify.detail;
    this.usagerLieuResidence.codeRegion = adresseToModify.codeRegion;
    this.usagerLieuResidence.nomRegion = adresseToModify.nomRegion;
    this.usagerLieuResidence.codePays = adresseToModify.codePays;
    this.usagerLieuResidence.nomPays = adresseToModify.nomPays;
    this.usagerLieuResidence.codeProvince = adresseToModify.codeProvince;
    this.usagerLieuResidence.nomProvince = adresseToModify.nomProvince;
    this.usagerLieuResidence.codeTypeAdresse = adresseToModify.codeTypeAdresse;
    this.usagerLieuResidence.nomTypeAdresse = adresseToModify.nomTypeAdresse;
    this.usagerLieuResidence.codeCategSubdvImmeu = adresseToModify.codeCategSubdvImmeu;
    this.usagerLieuResidence.nomCategSubdvImmeu = adresseToModify.nomCategSubdvImmeu;
    this.usagerLieuResidence.detail = adresseToModify.detail;
    this.usagerLieuResidence.subdvImmeu = adresseToModify.subdvImmeu;
    this.usagerLieuResidence.rlsCode = adresseToModify.rlsCode;
    this.usagerLieuResidence.rlsNom = adresseToModify.rlsNom;
    this.usagerLieuResidence.rtsCode = adresseToModify.rtsCode;
    this.usagerLieuResidence.rtsNom = adresseToModify.rtsNom;
    this.usagerLieuResidence.clscCode = adresseToModify.clscCode;
    this.usagerLieuResidence.clscNom = adresseToModify.clscNom;

    this.usagerLieuResidence.isActionToModifyAdress = true;
  }
  /**
   * Vérifie
   */
  public isAdresseVide(): boolean {
    let vide: boolean = true;

    if (
      (this.usagerLieuResidence.codePostal) ||
      (this.usagerLieuResidence.municNom) ||
      (this.usagerLieuResidence.noCiviq) ||
      (this.usagerLieuResidence.noCiviqSuffx) ||
      (this.usagerLieuResidence.adresse) ||
      (this.usagerLieuResidence.detail) ||
      (this.usagerLieuResidence.codeRegion) ||
      (this.usagerLieuResidence.codePays) ||
      (this.usagerLieuResidence.codeProvince) ||
      ((this.usagerLieuResidence.codeTypeAdresse != enumTypeAdr.PRINC) && (this.usagerLieuResidence.codeTypeAdresse != "")) ||
      (this.usagerLieuResidence.codeCategSubdvImmeu) ||
      (this.usagerLieuResidence.subdvImmeu) ||
      (this.usagerLieuResidence.id)
    ) {
      vide = false;
    }

    return vide;
  }

  /**
   * ouvrir la fenetre modal pour demander la confirmation d'archivage de l'adresse
   * @param arg 
   */
  public confirmerArchiverLieuResidence(arg?: any) {
    this.element = arg.id;
    this.openModalForConfirmerArchiverAddressEvent.emit();
  }

  openModalForConfirmerArchiverAddress() {
    this.usagerLieuResidence.idAdresseToArchive = this.element;
    if (this.usagerLieuResidence.idAdresseToArchive) {
      this.outputArchiverLieuResidence.emit(this.usagerLieuResidence.idAdresseToArchive);
    }
  }

  /**
   * archiver un adresse - le rendre inactif
   */
  public archiverLieuResidence() {
    this.closeModal("confirm_popup_archiver");

    if (this.usagerLieuResidence.idAdresseToArchive) {
      this.outputArchiverLieuResidence.emit(this.usagerLieuResidence.idAdresseToArchive);
    }
  }

  /**
     * Afficher ou reduire la liste de moyens d'adresses' sauvegardes (actifs ou tous)
     * @param element 
     */
  afficherOuReduireListeLieuResidence(element: any) {
    let displayAll = element.displayAll;
    if (!displayAll) {
      this.outputafficherToutLieuResidence.emit('getListeResultatAdresse');
    } else {
      this.outputafficherToutLieuResidenceInactif.emit('getListeResultatAdresseInatif');
    }
    this.etatDisplayAll = displayAll;

  }


  formatActionUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO) {
    let formattedAddress: string = "";

    if (usagerLieuResidence) {
      let codePostal = "";
      if (usagerLieuResidence.codePostal && usagerLieuResidence.codePostal != null) {
        codePostal = usagerLieuResidence.codePostal.substring(0, 3) + " " + usagerLieuResidence.codePostal.substring(3, 6);
      }

      let adresseLigneUn = [usagerLieuResidence.adresse, usagerLieuResidence.nomCategSubdvImmeu, usagerLieuResidence.subdvImmeu, usagerLieuResidence.municNom, codePostal];
      let adresseLigneDeux = [usagerLieuResidence.codeRegion, ' - ', usagerLieuResidence.nomRegion, usagerLieuResidence.nomProvince, usagerLieuResidence.nomPays];
      let adresseLigneTrois: string = "";
      if (usagerLieuResidence.rtsNom) {
        adresseLigneTrois = usagerLieuResidence.rtsNom;
      }
      if (usagerLieuResidence.rlsNom) {
        if (adresseLigneTrois) {
          adresseLigneTrois += ", ";
        }
        adresseLigneTrois += usagerLieuResidence.rlsNom;
      }
      if (usagerLieuResidence.clscNom) {
        if (adresseLigneTrois) {
          adresseLigneTrois += ", ";
        }
        adresseLigneTrois += usagerLieuResidence.clscNom;
      }

      let adresseLigneQuatre: string = usagerLieuResidence.detail ? usagerLieuResidence.detail : "";

      let typeAdresse: string = "";
      switch (usagerLieuResidence.codeTypeAdresse) {
        case enumTypeAdr.PRINC: {
          typeAdresse = "Principale";
          break;
        }
        case enumTypeAdr.SECOND: {
          typeAdresse = "Secondaire";
          break;
        }
        case enumTypeAdr.TEMP: {
          typeAdresse = "Temporaire";
          break;
        }
      }

      formattedAddress =
        '<div>' +
        '  <table cellspacing="0" width="100%" style="word-break: break-word;">' +
        '    <tr>' +
        '      <th style="vertical-align:top;"><div style="width:90px">' + typeAdresse + '</div></th>' +
        '      <td width="100%">' +
        '          <div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneUn.filter(Boolean).join(" ") + '</div>' +
        '          <div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneDeux.filter(Boolean).join(" ") + '</div>';

      if (adresseLigneTrois) {
        formattedAddress += '<div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneTrois + '</div>';
      }

      if (adresseLigneQuatre) {
        formattedAddress += '<div style="word-wrap:break-word; margin-bottom:7px;">(<i>' + adresseLigneQuatre + '</i>)</div>';
      }

      formattedAddress += '' +
        '      </td>' +
        '    </tr>' +
        '  </table>' +
        '</div>';
    }
    return formattedAddress;
  }

  /**
   * Formate une adresse avec le numéro civique, le suffixe du numéro civique et la rue.
   * @param adresse MsssM10Adresse contenant les parties de l'adresse
   */
  private formaterNoCiviqueRue(adresse: MsssM10Adresse): string {
    let adresseFormate: string = "";
    if (adresse) {
      if (adresse.adrNoCivique) {
        adresseFormate += adresse.adrNoCivique;
      }

      if (adresse.adrNoCiviqueSuffixe) {
        if (adresseFormate) {
          adresseFormate += " ";
        }
        adresseFormate += adresse.adrNoCiviqueSuffixe;
      }

      if (adresse.adrRue) {
        if (adresseFormate) {
          adresseFormate += " ";
        }
        adresseFormate += adresse.adrRue;
      }
    }
    return adresseFormate;
  }

  public getMessageConfirmationArchiverAdresse(): string {
    let message: string;

    message = this.translateService.instant("us-iu-a00001", { "0": this.getNomTypeAdresse(), "1": this.getNomTypeAdresse() });
    return message;
  }

  public getNomTypeAdresse(): string {
    switch (this.usagerLieuResidence.codeTypeAdresse) {
      case enumTypeAdr.PRINC:
        return "principale";
      case enumTypeAdr.SECOND:
        return "secondaire";
      default:
        return "temporaire";
    }
  }

  toggleVisibility() {
    this.outputClearCodePostal.emit("clearCodePostal");
  }

  /**
   * Lorsque le champ Adresse perd le focus, on le vide si son contenu ne provient pas de M10.
   * @param isValeurM10 indique si la valeur provient de M10
   */
  onAdresseBlur(isValeurM10: boolean) {
    if (!isValeurM10) {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne une adresse dans l'autocomplétion d'adresse.
   * @param adresseSelected adresse sélectionnée
   */
  onAdresseSelected(adresseSelected: MsssM10Adresse) {
    // (DEF-501-6) - TR-Autocomplétion adresse
    if (adresseSelected) {
      this.spinner.show("spinner-adresse");

      this.viderChampsAdresse();

      if (adresseSelected.typeAdresse == TypeTerritoireEnum.ANCIENNE_ADRESSE) {
        // L'utilisateur a sélectionné une ancienne adresse.
        // Tous les champs de la nouvelle adresse sont concaténés dans adrRue (nocivique + rue + municipalité + code postal) et sont difficilement utilisables.
        // Donc, on cherche la nouvelle adresse afin d'obtenir l'adresse dans des champs distincts.

        const idAncienneAdresse: string = adresseSelected.adrId;

        this.subscriptions.add(
          this.msssM10Service.rechercherAdresses(adresseSelected.adrRue, false).subscribe((m10Adresses: MsssM10Adresse[]) => {
            if (m10Adresses.length > 0) {
              // Filtre les adresses ayant le même ID. Devrait retourner une seule adresse.
              let m10AdressesIdentiques: MsssM10Adresse[] = m10Adresses.filter((m10Adresse: MsssM10Adresse) => m10Adresse.adrId === idAncienneAdresse);

              // Si la recherche retourne plusieurs adresses, on utilise la première, car il s'agit de l'adresse ayant le meilleur score.
              this.usagerLieuResidence.codePostal = m10AdressesIdentiques[0].codePostal;

              this.usagerLieuResidence.municCode = m10AdressesIdentiques[0].municipaliteCode;
              this.usagerLieuResidence.municNom = m10AdressesIdentiques[0].municipaliteNom ? m10AdressesIdentiques[0].municipaliteNom.substr(0, 70) : null;

              this.usagerLieuResidence.noCiviq = m10AdressesIdentiques[0].adrNoCivique;
              this.usagerLieuResidence.noCiviqSuffx = m10AdressesIdentiques[0].adrNoCiviqueSuffixe;
              this.usagerLieuResidence.rue = m10AdressesIdentiques[0].adrRue ? m10AdressesIdentiques[0].adrRue.substr(0, 40) : null;
              this.usagerLieuResidence.adresse = this.formaterNoCiviqueRue(m10AdressesIdentiques[0]);

              this.usagerLieuResidence.codePays = m10AdressesIdentiques[0].paysCode;
              this.usagerLieuResidence.nomPays = m10AdressesIdentiques[0].paysNom;
              this.usagerLieuResidence.codeProvince = m10AdressesIdentiques[0].provinceCode;
              this.usagerLieuResidence.nomProvince = m10AdressesIdentiques[0].provinceNom;
            } else {
              // La recherche ne retourne pas l'adresse prévue.
              // On affiche l'adresse sélectionnée au départ et logue l'erreur.
              this.usagerLieuResidence.codePostal = adresseSelected.codePostal;

              this.usagerLieuResidence.municCode = adresseSelected.municipaliteCode;
              this.usagerLieuResidence.municNom = (adresseSelected.municipaliteNom ? adresseSelected.municipaliteNom.substr(0, 70) : null);

              this.usagerLieuResidence.noCiviq = adresseSelected.adrNoCivique;
              this.usagerLieuResidence.noCiviqSuffx = adresseSelected.adrNoCiviqueSuffixe ? adresseSelected.adrNoCiviqueSuffixe.substr(0, 3) : null;
              this.usagerLieuResidence.rue = adresseSelected.adrRue ? adresseSelected.adrRue.substr(0, 40) : null;
              this.usagerLieuResidence.adresse = this.formaterNoCiviqueRue(adresseSelected);

              this.usagerLieuResidence.codePays = adresseSelected.paysCode;
              this.usagerLieuResidence.nomPays = adresseSelected.paysNom;
              this.usagerLieuResidence.codeProvince = adresseSelected.provinceCode;
              this.usagerLieuResidence.nomProvince = adresseSelected.provinceNom;

              console.error("La recherche de la nouvelle adresse '" + adresseSelected.adrRue + " n'a retourné aucune adresse.");
            }
          }));
      } else {
        // Distribue les informations de l'adresse dans les autres champs.
        this.usagerLieuResidence.codePostal = adresseSelected.codePostal;

        this.usagerLieuResidence.municCode = adresseSelected.municipaliteCode;
        this.usagerLieuResidence.municNom = (adresseSelected.municipaliteNom ? adresseSelected.municipaliteNom.substr(0, 70) : null);

        this.usagerLieuResidence.noCiviq = adresseSelected.adrNoCivique;
        this.usagerLieuResidence.noCiviqSuffx = adresseSelected.adrNoCiviqueSuffixe ? adresseSelected.adrNoCiviqueSuffixe.substr(0, 3) : null;
        this.usagerLieuResidence.rue = adresseSelected.adrRue ? adresseSelected.adrRue.substr(0, 40) : null;
        this.usagerLieuResidence.adresse = this.formaterNoCiviqueRue(adresseSelected);

        this.usagerLieuResidence.codePays = adresseSelected.paysCode;
        this.usagerLieuResidence.nomPays = adresseSelected.paysNom;
        this.usagerLieuResidence.codeProvince = adresseSelected.provinceCode;
        this.usagerLieuResidence.nomProvince = adresseSelected.provinceNom;
      }

      // Récupère les informations sur les territoires de l'adresse.
      // NB: adrId possède toujours l'id de la nouvelle adresse même si une ancienne adresse est sélectionnée.
      this.subscriptions.add(
        this.msssM10Service.obtenirTerritoiresByIdAdresse(adresseSelected.adrId).subscribe((m10Territoires: MsssM10Territoire[]) => {
          if (m10Territoires && m10Territoires.length > 0) {
            m10Territoires.forEach((m10Territoire: MsssM10Territoire) => {
              switch (m10Territoire.type) {
                case TypeTerritoireEnum.MUNICIPALITE:
                  this.usagerLieuResidence.municCode = m10Territoire.code;
                  this.usagerLieuResidence.municNom = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.RSS:
                  this.usagerLieuResidence.codeRegion = m10Territoire.code;
                  this.usagerLieuResidence.nomRegion = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.RTS:
                  this.usagerLieuResidence.rtsCode = m10Territoire.code;
                  this.usagerLieuResidence.rtsNom = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.RLS:
                  this.usagerLieuResidence.rlsCode = m10Territoire.code;
                  this.usagerLieuResidence.rlsNom = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.CLSC:
                  this.usagerLieuResidence.clscCode = m10Territoire.code;
                  this.usagerLieuResidence.clscNom = m10Territoire.nom;
                  break;
                default:
                  break;
              }
            });
          }
          this.spinner.hide("spinner-adresse");
        }));
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne une catégorie de subdivision d'immeuble dans la liste déroulante.
   * @param optionSelected option sélectionnée
   */
  onCategSubdvImmeu(optionSelected: InputOption) {
    if (optionSelected) {
      this.usagerLieuResidence.nomCategSubdvImmeu = optionSelected.label;
    } else {
      this.usagerLieuResidence.nomCategSubdvImmeu = null;
    }
  }

  /**
   * Lorsque le champ Code postal perd le focus, on le vide si son contenu ne provient pas de M10.
   * @param isValeurM10 indique si la valeur provient de M10
   */
  onCodePostalBlur(isValeurM10: boolean) {
    if (!isValeurM10) {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne un code postal dans l'autocomplétion du code postal.
   * @param codePostalSelected code postal sélectionné
   */
  onCodePostalSelected(codePostalSelected: MsssM10CodePostal): void {
    if (codePostalSelected) {
      this.spinner.show("spinner-adresse");

      this.viderChampsAdresse();

      this.usagerLieuResidence.codePostal = codePostalSelected.codePostal;

      this.usagerLieuResidence.municCode = codePostalSelected.codeMunicipalite;
      this.usagerLieuResidence.municNom = codePostalSelected.nomMunicipalite;

      this.usagerLieuResidence.codePays = MsssM10Pays.CODE_CANADA;
      this.usagerLieuResidence.nomPays = MsssM10Pays.NOM_CANADA;
      this.usagerLieuResidence.codeProvince = MsssM10Province.CODE_QUEBEC;
      this.usagerLieuResidence.nomProvince = MsssM10Province.NOM_QUEBEC;

      // Dans un monde idéal, M10 nous aurait déjà fourni tous les territoires dans MsssM10CodePostal. 
      // Pour l'instant, nous devons intéroger M10 à nouveau pour récupérer l'information manquante. 
      // Dans un premier temps on recherche les territoires du code postal. Si une seule municipalité et 
      // un seul CLSC sont retournés, on peut les utiliser, sinon on doit aller chercher les territoires 
      // par la municipalité du code postal et voir à ne garder que les territoires communs.
      this.subscriptions.add(
        // Récupère les territoires du code postal.
        this.msssM10Service.obtenirTerritoiresByCodePostal(codePostalSelected.codePostal).subscribe((m10Territoires: MsssM10Territoire[]) => {
          const nbMun: number = m10Territoires?.filter((m10Territoire: MsssM10Territoire) => m10Territoire.type == TypeTerritoireEnum.MUNICIPALITE).length;
          const nbClsc: number = m10Territoires?.filter((m10Territoire: MsssM10Territoire) => m10Territoire.type == TypeTerritoireEnum.CLSC).length;

          if (nbClsc == 1 && nbMun == 1) {
            // Par défaut, région "00 - Aucune"
            this.usagerLieuResidence.codeRegion = MsssM10Territoire.CODE_REGION_AUCUNE;
            this.usagerLieuResidence.nomRegion = MsssM10Territoire.NOM_REGION_AUCUNE;

            if (m10Territoires && m10Territoires.length > 0) {

              m10Territoires.forEach((m10Territoire: MsssM10Territoire) => {
                switch (m10Territoire.type) {
                  case TypeTerritoireEnum.MUNICIPALITE:
                    this.usagerLieuResidence.municNom = m10Territoire.nom;
                    break;
                  case TypeTerritoireEnum.RSS:
                    this.usagerLieuResidence.codeRegion = m10Territoire.code;
                    this.usagerLieuResidence.nomRegion = m10Territoire.nom;
                    break;
                  case TypeTerritoireEnum.RTS:
                    this.usagerLieuResidence.rtsCode = m10Territoire.code;
                    this.usagerLieuResidence.rtsNom = m10Territoire.nom;
                    break;
                  case TypeTerritoireEnum.RLS:
                    this.usagerLieuResidence.rlsCode = m10Territoire.code;
                    this.usagerLieuResidence.rlsNom = m10Territoire.nom;
                    break;
                  case TypeTerritoireEnum.CLSC:
                    this.usagerLieuResidence.clscCode = m10Territoire.code;
                    this.usagerLieuResidence.clscNom = m10Territoire.nom;
                    break;
                  default:
                    break;
                }
              });
            }
            this.spinner.hide('spinner-adresse');
          } else {
            // Récupère les territoires de la municipalité.
            this.subscriptions.add(
              this.msssM10Service.obtenirTerritoiresByCodeMunicipalite(codePostalSelected.codeMunicipalite).subscribe((m10Territoires: MsssM10Territoire[]) => {
                // Par défaut, région "00 - Aucune"
                this.usagerLieuResidence.codeRegion = MsssM10Territoire.CODE_REGION_AUCUNE;
                this.usagerLieuResidence.nomRegion = MsssM10Territoire.NOM_REGION_AUCUNE;

                if (m10Territoires && m10Territoires.length > 0) {
                  let nbRts: number = 0;
                  let nbRls: number = 0;
                  let nbClsc: number = 0;

                  m10Territoires.forEach((m10Territoire: MsssM10Territoire) => {
                    switch (m10Territoire.type) {
                      case TypeTerritoireEnum.MUNICIPALITE:
                        this.usagerLieuResidence.municNom = m10Territoire.nom;
                        break;
                      case TypeTerritoireEnum.RSS:
                        this.usagerLieuResidence.codeRegion = m10Territoire.code;
                        this.usagerLieuResidence.nomRegion = m10Territoire.nom;
                        break;
                      case TypeTerritoireEnum.RTS:
                        // On garde la valeur du territoire RTS si aucune valeur n'est déjà présente, mais on retire
                        // le terriroire RTS si des territoires RTS différents sont présents dans la liste. 
                        // Ceci indique que la municipalité contient plus d'un territoire RTS et qu'on ne peut déterminer
                        // lequel attribuer au code postal.
                        // Ex: le code postal J3Y7Z8 retourne la municipalité Longueil (58227) qui elle possède les RTS "RTS de la Montérégie-Centre" et "RTS de la Montérégie-Est"
                        if (nbRts == 0) {
                          this.usagerLieuResidence.rtsCode = m10Territoire.code;
                          this.usagerLieuResidence.rtsNom = m10Territoire.nom;
                        } else if (this.usagerLieuResidence.rtsCode != m10Territoire.code) {
                          this.usagerLieuResidence.rtsCode = null;
                          this.usagerLieuResidence.rtsNom = null;
                        }
                        nbRts++;
                        break;
                      case TypeTerritoireEnum.RLS:
                        if (codePostalSelected.codePostal.length == 6) {
                          // On garde la valeur du territoire RLS si aucune valeur n'est déjà présente, mais on retire
                          // le terriroire RLS si des territoires RLS différents sont présents dans la liste. 
                          // Ceci indique que la municipalité contient plus d'un territoire RLS et qu'on ne peut déterminer
                          // lequel attribuer au code postal.
                          // Ex: le code postal J3Y7Z8 retourne la municipalité Longueil (58227) qui elle possède les RLS "RLS de Champlain" et "RLS Pierre-Boucher".
                          if (nbRls == 0) {
                            this.usagerLieuResidence.rlsCode = m10Territoire.code;
                            this.usagerLieuResidence.rlsNom = m10Territoire.nom;
                          } else if (this.usagerLieuResidence.rlsCode != m10Territoire.code) {
                            this.usagerLieuResidence.rlsCode = null;
                            this.usagerLieuResidence.rlsNom = null;
                          }
                          nbRls++;
                        }
                        break;
                      case TypeTerritoireEnum.CLSC:
                        if (codePostalSelected.codePostal.length == 6) {
                          // On garde la valeur du territoire CLSC si aucune valeur n'est déjà présente, mais on retire
                          // le terriroire CLSC si des territoires CLSC différents sont présents dans la liste. 
                          // Ceci indique que la municipalité contient plus d'un territoire CLSC et qu'on ne peut déterminer
                          // lequel attribuer au code postal.
                          // Ex: le code postal J3Y7Z8 retourne la municipalité Longueil (58227) qui elle possède les CLSC "Saint-Hubert", "Longueuil-Ouest", "Longueuil-Est"...
                          if (nbClsc == 0) {
                            this.usagerLieuResidence.clscCode = m10Territoire.code;
                            this.usagerLieuResidence.clscNom = m10Territoire.nom;
                          } else if (this.usagerLieuResidence.clscCode != m10Territoire.code) {
                            this.usagerLieuResidence.clscCode = null;
                            this.usagerLieuResidence.clscNom = null;
                          }
                          nbClsc++;
                        }
                        break;
                      default:
                        break;
                    }
                  });
                }
                this.spinner.hide('spinner-adresse');
              })
            );
          }
        })
      );
    }
  }

  /**
   * Lorsque le champ Municipalité perd le focus, on le vide si son contenu ne provient pas de M10.
   * @param isValeurM10 indique si la valeur provient de M10
   */
  onMunicipaliteBlur(isValeurM10: boolean) {
    if (!isValeurM10) {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne une municipalité dans l'autocomplétion du champ municipalité.
   * @param m10MunicipaliteSelected municipalité sélectionnée
   */
  onMunicipaliteSelected(m10MunicipaliteSelected: MsssM10Municipalite) {
    // (DEF-501-4) - Réinitialiser tous les champs d'adresse sauf Pays, Province, Détails et Type
    if (m10MunicipaliteSelected) {
      this.spinner.show('spinner-adresse');

      this.viderChampsAdresse();

      this.usagerLieuResidence.codePostal = m10MunicipaliteSelected.codePostal;
      this.usagerLieuResidence.municCode = m10MunicipaliteSelected.code;
      this.usagerLieuResidence.codePays = m10MunicipaliteSelected.pays.code;
      this.usagerLieuResidence.nomPays = m10MunicipaliteSelected.pays.nom;
      this.usagerLieuResidence.codeProvince = m10MunicipaliteSelected.province.code;
      this.usagerLieuResidence.nomProvince = m10MunicipaliteSelected.province.nom;

      // Récupère les territoires de la municipalité.
      // NB: code possède toujours le code de la nouvelle municipalité même si une ancienne municipalité est sélectionnée.
      this.subscriptions.add(
        this.msssM10Service.obtenirTerritoiresByCodeMunicipalite(m10MunicipaliteSelected.code).subscribe((m10Territoires: MsssM10Territoire[]) => {
          if (m10Territoires && m10Territoires.length > 0) {
            m10Territoires.forEach((m10Territoire: MsssM10Territoire) => {
              switch (m10Territoire.type) {
                case TypeTerritoireEnum.MUNICIPALITE:
                  this.usagerLieuResidence.municNom = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.RSS:
                  this.usagerLieuResidence.codeRegion = m10Territoire.code;
                  this.usagerLieuResidence.nomRegion = m10Territoire.nom;
                  break;
                case TypeTerritoireEnum.RTS:
                  this.usagerLieuResidence.rtsCode = m10Territoire.code;
                  this.usagerLieuResidence.rtsNom = m10Territoire.nom;
                  break;
                // Lors d'une recherche de municipalité, on ne retient que la région et le territoire RTS
                // case TypeTerritoireEnum.RLS:
                //   this.usagerLieuResidence.rlsCode = m10Territoire.code;
                //   this.usagerLieuResidence.rlsNom = m10Territoire.nom;
                //   break;
                // case TypeTerritoireEnum.CLSC:
                //   this.usagerLieuResidence.clscCode = m10Territoire.code;
                //   this.usagerLieuResidence.clscNom = m10Territoire.nom;
                //   break;
                default:
                  break;
              }
            });
          }
          this.spinner.hide('spinner-adresse');
        }));
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne un pays dans la liste déroulante.
   * @param optionSelected 
   */
  onPaysSelected(optionSelected: InputOption) {
    // (DEF-501-9) - Si le pays sélectionné n'est pas Canada, on vide tous les champs sauf Details et Type
    if (optionSelected) {
      this.viderChampsAdresse();
      if (optionSelected.value) {
        this.usagerLieuResidence.codePays = optionSelected.value;
        this.usagerLieuResidence.nomPays = optionSelected.label;
      }
    } else {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne une province dans la liste déroulante.
   * @param optionSelected 
   */
  onProvinceSelected(optionSelected: InputOption) {
    // (DEF-501-8) - Réinitialiser tous les champs d'adresse sauf Pays, Détails et Type
    if (optionSelected) {
      this.viderChampsAdresse();
      if (optionSelected.value) {
        this.usagerLieuResidence.codeProvince = optionSelected.value;
        this.usagerLieuResidence.nomProvince = optionSelected.label;
        this.usagerLieuResidence.codePays = MsssM10Pays.CODE_CANADA;
        this.usagerLieuResidence.nomPays = MsssM10Pays.NOM_CANADA;
      }
    } else {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne une région dans la liste déroulante.
   * @param optionSelected option sélectionnée
   */
  onRegionSelected(optionSelected: InputOption) {
    // (DEF-501-4) - Réinitialiser tous les champs d'adresse sauf Pays, Province, Détails et Type
    if (optionSelected) {
      this.viderChampsAdresse();
      if (optionSelected.value) {
        this.usagerLieuResidence.codeRegion = optionSelected.value;
        this.usagerLieuResidence.nomRegion = optionSelected.label;
        this.usagerLieuResidence.codePays = MsssM10Pays.CODE_CANADA;
        this.usagerLieuResidence.nomPays = MsssM10Pays.NOM_CANADA;
        this.usagerLieuResidence.codeProvince = MsssM10Province.CODE_QUEBEC;
        this.usagerLieuResidence.nomProvince = MsssM10Province.NOM_QUEBEC;
      }
    } else {
      this.viderChampsAdresse();
    }
  }

  /**
   * Lorsque l'utilisateur sélectionne un type d'adresse dans la liste déroulante.
   * @param optionSelected option sélectionnée
   */
  onTypeAdresse(optionSelected: InputOption) {
    if (optionSelected) {
      this.usagerLieuResidence.nomTypeAdresse = optionSelected.label;
    } else {
      this.usagerLieuResidence.nomTypeAdresse = null;
    }
  }

  /**
   * Vide tous les champs de l'adresse à l'exception de Details et Type.
   */
  viderChampsAdresse() {
    this.usagerLieuResidence.codePostal = null;

    this.usagerLieuResidence.municCode = null;
    this.usagerLieuResidence.municNom = null;

    this.usagerLieuResidence.noCiviq = null;
    this.usagerLieuResidence.noCiviqSuffx = null;
    this.usagerLieuResidence.rue = null;
    this.usagerLieuResidence.adresse = null;

    this.usagerLieuResidence.codeCategSubdvImmeu = null;
    this.usagerLieuResidence.nomCategSubdvImmeu = null;
    this.usagerLieuResidence.subdvImmeu = null;

    this.usagerLieuResidence.codeRegion = null;
    this.usagerLieuResidence.nomRegion = null;

    this.usagerLieuResidence.codePays = null;
    this.usagerLieuResidence.nomPays = null;

    this.usagerLieuResidence.codeProvince = null;
    this.usagerLieuResidence.nomProvince = null;

    this.usagerLieuResidence.clscCode = null;
    this.usagerLieuResidence.clscNom = null;

    this.usagerLieuResidence.rlsCode = null;
    this.usagerLieuResidence.rlsNom = null;

    this.usagerLieuResidence.rtsCode = null;
    this.usagerLieuResidence.rtsNom = null;

    this.listePaysValide = true;
    this.listeProvinceValide = true;
    this.listeRegionValide = true;
    this.listeTypeAdresseValide = true;
  }

  /**
   * Au focus d'un champ on le rend valide
   * @param id 
   */
  public onFocus(id: string) {

    switch (id) {
      case "codePays": {
        this.listePaysValide = true;
        break;
      }

      case "codeProvince": {
        this.listeProvinceValide = true;
        break;
      }

      case "codeTypeAdresse": {
        this.listeTypeAdresseValide = true;
        break;
      }

      case "codeRegion": {
        this.listeRegionValide = true;
        break;
      }
    }
  }

  selctionnerAddress(): void {
    this.selectAddressLinkedUsagerEvent.emit({ idIdentifLinkedUsager: this.usagerLieuResidence.idIdentifLinkedUsager, typeDataToAdd: TypeDataToBind.ADDRESS });
  }
}