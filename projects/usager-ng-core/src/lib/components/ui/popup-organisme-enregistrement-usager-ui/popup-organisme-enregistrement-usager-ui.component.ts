import { Component, OnInit, OnDestroy, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrganismeDTO } from '../../../models/organisme-dto';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { TranslateService } from '@ngx-translate/core';
import { UsagerService } from '../../../services/usager.service';
import { SigctOrganismeDTO } from '../../../models/sigct-organisme-dto';
import { Subscription } from 'rxjs';
import { SigctSiteDTO } from '../../../models/sigct-site-dto';
import { SigctUserDTO } from '../../../models/sigct-user-dto';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';

const TYPE_SANTE: string = "SA";
const TYPE_SOCIAL: string = "SO";




@Component({
  selector: 'app-popup-organisme-enregistrement-usager-ui',
  templateUrl: './popup-organisme-enregistrement-usager-ui.component.html',
  styleUrls: ['./popup-organisme-enregistrement-usager-ui.component.css'],
  providers: [DatePipe, ConfirmationDialogService]
})
export class PopupOrganismeEnregistrementUsagerUiComponent implements OnInit, OnDestroy {

  // identifiant de l'usager
  idUsager: number;

  organismeEnregistreur = new OrganismeDTO();

  valeurLibelleSelectionnez: string;

  indexOrganismePourModif: number;

  subscriptions: Subscription = new Subscription();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  libelleMessageErreur: string;

  valide: boolean = true;
  messages: string[] = [];

  isRaisonValide: boolean = true;
  isTypeFicheValide: boolean = true;
  isOrganismeValide: boolean = true;
  isGestionnaireValide: boolean = true;
  isDateFermeturePrevueValide: boolean = true;
  isDernierOrganismeFermeture: boolean = false;
  hasRoleAjoutModifTous: boolean = false;

  //Conteneur pour la liste de valeurs
  public inputOptionTypeSante: InputOptionCollection = {
    name: "typeSante",
    options: []
  };
  public inputOptionTypeSocial: InputOptionCollection = {
    name: "typeSocial",
    options: []
  };

  //Conteneur pour la liste de valeurs des organismes
  public inputOptionsOrganismes: InputOptionCollection = {
    name: "organismes",
    options: []
  };

  //Conteneur pour la liste de valeurs des sites
  public inputOptionsSites: InputOptionCollection = {
    name: "sites",
    options: []
  };

  //Conteneur pour la liste de valeurs des gestionnaires
  public inputOptionsGestionnaires: InputOptionCollection = {
    name: "gestionnaires",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionFermeture: InputOptionCollection = {
    name: "fermeture",
    options: []
  };

  constructor(public dialogRef: MatDialogRef<PopupOrganismeEnregistrementUsagerUiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public datePipe: DatePipe,
    private usagerService: UsagerService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService) { }

  ngOnInit(): void {

    this.hasRoleAjoutModifTous = this.authenticationService.hasAnyRole(['ROLE_US_ENREGISTREMENT_AJOUT_TOUS', 'ROLE_US_ENREGISTREMENT_MODIF_TOUS']);

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );



    this.idUsager = this.data.idUsager;
    this.indexOrganismePourModif = this.data.indexOrganismePourModif;

    this.libelleMessageErreur = this.translateService.instant("girpi.error.label");

    this.initOptionsLabels();
    this.setInputOptionsOrganismes();

    if (this.isOrganismeModification()) {
      let idOrganisme = this.data.listeOrganismes[this.indexOrganismePourModif].idOrganisme;
      this.setInputOptionsSites(idOrganisme);
      this.setInputOptionsGestionnaires(idOrganisme);

    }

  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }

  }

  fermerDialog() {
    this.alertStore.resetAlert();
    this.dialogRef.close();
  }

  initOptionsLabels(): void {
    this.inputOptionTypeSante.options.push({ label: this.translateService.instant("usager.enregistrement.sec.org.popup.type.sante"), value: '1' });
    this.inputOptionTypeSocial.options.push({ label: this.translateService.instant("usager.enregistrement.sec.org.popup.type.social"), value: '1' });
    this.inputOptionFermeture.options.push({ label: this.translateService.instant("usager.enregistrement.sec.org.popup.fermeture"), value: '1' });

    this.valeurLibelleSelectionnez = this.translateService.instant("girpi.label.selectionnez");

    this.inputOptionsOrganismes.options.push({ label: this.valeurLibelleSelectionnez, value: null });
    this.inputOptionsSites.options.push({ label: this.valeurLibelleSelectionnez, value: null });
    this.inputOptionsGestionnaires.options.push({ label: this.valeurLibelleSelectionnez, value: null });

  }

  initOrganismeEnregistreur(): void {
    if (this.isOrganismeModification()) {
      let organismePourModif = Object.assign({}, this.data.listeOrganismes[this.indexOrganismePourModif]);
      this.organismeEnregistreur = organismePourModif;
    } else {
      this.organismeEnregistreur = new OrganismeDTO();
      this.organismeEnregistreur.idOrganisme = this.authenticationService.getAuthenticatedUser().idOrganismeCourant;
      this.setOrganismeAutreInfos(this.organismeEnregistreur.idOrganisme);
      this.setInputOptionsSites(this.organismeEnregistreur.idOrganisme);
      this.setInputOptionsGestionnaires(this.organismeEnregistreur.idOrganisme);
    }
  }

  isOrganismeModification(): boolean {
    if (this.indexOrganismePourModif || this.indexOrganismePourModif == 0) {
      return true;
    } else {
      return false;
    }
  }


  relierEtFermerDialog(): void {
    this.setOrganismeType(this.organismeEnregistreur.typeSante, this.organismeEnregistreur.typeSocial, this.organismeEnregistreur);
    this.setOrganismeFermetureAutresInfos(this.organismeEnregistreur.fermeture);
    if (this.validerOrganismeEnregistreur()) {
      if (this.isDernierOrganismeFermeture) {
        this.openModal('confirm_popup_relier_fermer_organisme', 'confi_relier_fermer_organisme_btn_oui');
      } else {
        this.confirmerRelierEtFermerDialog();
      }
    }
  }

  confirmerRelierEtFermerDialog(): void {
    if (this.isOrganismeModification()) {
      this.data.listeOrganismes[this.indexOrganismePourModif] = this.organismeEnregistreur;
    } else {
      this.data.listeOrganismes.push(this.organismeEnregistreur);
    }
    this.organismeEnregistreur.nomGestionnaire = this.getNomGestionaire();

    this.closeModal('confirm_popup_relier_fermer_organisme');
    this.fermerDialog();
  }

  getNomGestionaire() {
    return this.inputOptionsGestionnaires.options
      .filter(o => o.value == this.organismeEnregistreur.gestionnaire)
      .map(o => o.label)[0];
  }

  onChangeOrganisme(event: string): void {
    this.resetInputOptionsSites();
    this.resetInputOptionsGestionnaires();

    this.organismeEnregistreur.idSite = null;
    this.organismeEnregistreur.gestionnaire = null;

    if (event) {
      let organismeId = Number.parseInt(event);


      this.setInputOptionsSites(organismeId);
      this.setInputOptionsGestionnaires(organismeId);
      this.setOrganismeAutreInfos(organismeId);
    }

  }

  resetInputOptionsSites(): void {
    this.inputOptionsSites.options = [];
    this.inputOptionsSites.options.push({ label: this.valeurLibelleSelectionnez, value: null });
  }


  resetInputOptionsGestionnaires(): void {
    this.inputOptionsGestionnaires.options = [];
    this.inputOptionsGestionnaires.options.push({ label: this.valeurLibelleSelectionnez, value: null });
  }


  setInputOptionsOrganismes(): void {
    // Alimente la liste des organismes
    this.subscriptions.add(
      this.usagerService.getEnregistrementOrganismes(this.idUsager).subscribe((result: SigctOrganismeDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.inputOptionsOrganismes.options.push({ label: item.nom, value: '' + item.id });
          })
        };

        this.initOrganismeEnregistreur();
      })
    );

  }

  setInputOptionsSites(idOrganisme: number): void {
    // Alimente la liste des sites
    if (idOrganisme) {
      this.subscriptions = this.usagerService.getEnregistrementSites(this.idUsager, idOrganisme).subscribe((result: SigctSiteDTO[]) => {
        if (result) {
          this.resetInputOptionsSites();
          result.forEach(item => {
            this.inputOptionsSites.options.push({ label: item.siteNom, value: '' + item.id });
          })
        };
      });

    }

  }

  setInputOptionsGestionnaires(idOrganisme: number): void {
    // Alimente la liste des gestionnaires
    if (idOrganisme) {
      this.subscriptions = this.usagerService.getEnregistrementGestionnaires(this.idUsager, idOrganisme).subscribe((result: SigctUserDTO[]) => {
        if (result) {
          this.resetInputOptionsGestionnaires();
          result.forEach(item => {
            this.inputOptionsGestionnaires.options.push({ label: item.fullDisplayName, value: item.username });
          })
        };
      });
    }
  }



  setOrganismeAutreInfos(idOrganisme: number): void {
    if (idOrganisme) {
      this.subscriptions = this.usagerService.getEnregistrementOrganismeById(this.idUsager, idOrganisme).subscribe((result: SigctOrganismeDTO) => {
        if (result) {
          this.organismeEnregistreur.nomOrganisme = result.nom;
          this.organismeEnregistreur.codeOrganismeMG = result.codeMG;
          this.organismeEnregistreur.codeOrganismeRRSS = result.codeRRSS;
        };
      });

    }

  }

  onChangeSite(event: string): void {
    this.setSiteAutreInfos(Number.parseInt(event));
  }

  setSiteAutreInfos(idSite: number): void {
    if (idSite) {
      this.subscriptions = this.usagerService.getEnregistrementSiteById(this.idUsager, idSite).subscribe((result: SigctSiteDTO) => {
        if (result) {
          this.organismeEnregistreur.nomSite = result.siteNom;
          this.organismeEnregistreur.codeSiteMG = result.siteCodeMG;
          this.organismeEnregistreur.codeSiteRRSS = result.siteCodeRRSS;
        };
      });

    }

  }

  setOrganismeType(typeSante: boolean, typeSocial: boolean, organisme: OrganismeDTO): void {
    if (typeSante && typeSocial) {
      organisme.type = TYPE_SANTE + "/" + TYPE_SOCIAL;
    } else if (typeSante) {
      organisme.type = TYPE_SANTE;
    } else if (typeSocial) {
      organisme.type = TYPE_SOCIAL;
    } else {
      organisme.type = null;
    }

  }


  setOrganismeFermetureAutresInfos(fermeture: boolean) {
    if (fermeture) {
      this.organismeEnregistreur.dateFermetureEffective = new Date();
      this.organismeEnregistreur.fermetureFullDisplayName = this.authenticationService.getAuthenticatedUser().nomFamille + ", "
        + this.authenticationService.getAuthenticatedUser().prenom + " (" + this.authenticationService.getAuthenticatedUser().name + ")";
    } else {
      this.organismeEnregistreur.dateFermetureEffective = null;
      this.organismeEnregistreur.fermetureFullDisplayName = null;
    }

  }

  validerOrganismeEnregistreur(): boolean {
    this.valide = true;
    this.messages = [];

    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    this.validerTypeFiche();
    this.validerOrganisme();
    this.validerGestionnaire();
    this.validerRaison();
    this.validerDateFermeturePrevue();
    this.validerDernierOrganismeFermeture();

    this.creerErreurs(this.messages, this.libelleMessageErreur, AlertType.ERROR);
    return this.valide;
  }


  validerTypeFiche(): void {
    if (!this.organismeEnregistreur.typeSante && !this.organismeEnregistreur.typeSocial) {
      let champ = this.translateService.instant("usager.enregistrement.sec.org.popup.type");
      let msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      this.messages.push(msg);
      this.valide = false;
      this.isTypeFicheValide = this.valide;
    }

  }

  validerRaison(): void {
    if (!this.organismeEnregistreur.raison) {
      let champ = this.translateService.instant("usager.enregistrement.sec.org.popup.raison");
      let msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      this.messages.push(msg);
      this.valide = false;
      this.isRaisonValide = this.valide;
    }

  }

  validerOrganisme(): void {
    if (!this.organismeEnregistreur.idOrganisme) {
      let champ = this.translateService.instant("usager.enregistrement.sec.org.popup.organisme");
      let msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      this.messages.push(msg);
      this.valide = false;
      this.isOrganismeValide = this.valide;
    }
  }

  validerGestionnaire(): void {
    if (!this.organismeEnregistreur.gestionnaire) {
      let champ = this.translateService.instant("usager.enregistrement.sec.org.popup.gestionnaire");
      let msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      this.messages.push(msg);
      this.valide = false;
      this.isGestionnaireValide = this.valide;
    }

  }

  validerDateFermeturePrevue(): void {
    let dateCourante = new Date(this.datePipe.transform(new Date(), "yyyy-MM-dd"));
    if (!this.organismeEnregistreur.dateFermeturePrevue) {
      let champ = this.translateService.instant("usager.enregistrement.sec.org.popup.fermp");
      let msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      this.messages.push(msg);
      this.valide = false;
      this.isDateFermeturePrevueValide = this.valide;
    } else if (new Date(this.datePipe.transform(this.organismeEnregistreur.dateFermeturePrevue, "yyyy-MM-dd")) < dateCourante && !this.organismeEnregistreur.fermeture) {
      let msg = this.translateService.instant("us-e90008");
      this.messages.push(msg);
      this.valide = false;
      this.isDateFermeturePrevueValide = this.valide;

    }

  }

  validerDernierOrganismeFermeture(): void {

    this.isDernierOrganismeFermeture = false;
    let nbOrganismesOuverts = this.data.listeOrganismes.filter(o => o.dateFermetureEffective == null).length;

    if (this.organismeEnregistreur.fermeture) {
      if (nbOrganismesOuverts == 0) {
        this.isDernierOrganismeFermeture = true;
      } else if (this.isOrganismeModification()) {
        if (!this.data.listeOrganismes[this.indexOrganismePourModif].fermeture && nbOrganismesOuverts == 1) {
          this.isDernierOrganismeFermeture = true;
        }

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

  //Messages d'erreurs de validation
  creerErreurs(messages: string[], titre: string, erreurType: AlertType) {
    if (CollectionUtils.isNotBlank(messages)) {
      const alertM: AlertModel = new AlertModel();
      alertM.title = titre;
      alertM.type = erreurType;
      alertM.messages = messages;
      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertM));
      } else {
        this.alertStore.setState([alertM]);
      }
    }
  }


}
