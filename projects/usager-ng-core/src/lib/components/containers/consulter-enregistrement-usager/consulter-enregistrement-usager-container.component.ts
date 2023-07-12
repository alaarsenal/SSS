import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { ImpressionDocumentDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-document-dto';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { BandeFlottanteComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/bande-flottante/bande-flottante.component';
import { ConsultationFicheSectionUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
import { ConsultationFicheSectionUsagerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager.component';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { SectionAdresseUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-adresse-usager-dto';
import { SectionCommunicationUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-communication-usager-dto';
import { SectionIdentificationUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-identification-usager-dto';
import { SectionInformationSuppDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-information-supp-dto';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { Subscription, Observable } from 'rxjs';
import { UsagerDTO, UsagerLieuResidenceDTO } from '../../../models';
import { AgeDTO } from '../../../models/age-dto';
import { ConsultationBandeauDTO } from '../../../models/consultation-bandeau-dto';
import { RapportJournalisationDTO } from '../../../models/rapport-journalisation-dto';
import { DialogUtilServiceService } from '../../../services/dialog-util-service.service';
import { ImpressionService } from '../../../services/impression-service.service';
import { JournalisationsUsagerService } from '../../../services/journalisations-usager-.service';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { ConsultationAutresInformationsComponent } from '../../ui/consultation-autres-informations/consultation-autres-informations.component';
import { ConsultationDatesComponent } from '../../ui/consultation-dates/consultation-dates.component';
import { ConsultationInformationsGeneralesComponent } from '../../ui/consultation-informations-generales/consultation-informations-generales.component';
import { ConsultationMedicationsComponent } from '../../ui/consultation-medications/consultation-medications.component';
import { ConsultationMesuresSecuriteComponent } from '../../ui/consultation-mesures-securite/consultation-mesures-securite.component';
import { ConsultationOrganismesEnregistrementComponent } from '../../ui/consultation-organismes-enregistrement/consultation-organismes-enregistrement.component';
import { ConsultationRessourcesProfessionnellesComponent } from '../../ui/consultation-ressources-professionnelles/consultation-ressources-professionnelles.component';
import { ConsultationSoinsServicesComponent } from '../../ui/consultation-soins-services/consultation-soins-services.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';




@Component({
  selector: 'sigct-usager-enregistement-consultation',
  templateUrl: './consulter-enregistrement-usager-container.component.html',
  styleUrls: ['./consulter-enregistrement-usager-container.component.css']
})
export class ConsulterEnregistrementUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {

  readonly labelEnregistrement = this.translateService.instant("usager.enregistrement.label");
  readonly labelUsagerNonIdentifie: string = this.translateService.instant("usager.identification.usager.non.identifie");

  public usagerDTO: UsagerDTO;

  public formTopBarOptions: FormTopBarOptions;
  public labelMenuTop: String = "";
  public detailMenuTop: string = "";

  private idUsagerIdent: number = null;
  idEnregistrementIdent: number = null;
  /** Indique si le composant est utilisé en contexte d'un appel. */
  private isEnContextAppel: boolean = false;


  private subscriptions: Subscription = new Subscription();

  @Input("idUsager")
  set usagerId(usagerId: number) {
    this.idUsagerIdent = usagerId;
    this.initAdresseUsager();
  }

  @Input("idEnregistrement")
  set enregistrementId(enregistrementId: number) {
    this.idEnregistrementIdent = enregistrementId;
    this.initBandeau();
  }

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;


  @Output("retourListeEnregistrements")
  retourEnregistrements = new EventEmitter<number>();

  @Output("editerEnregistrement")
  editerEnregistrement = new EventEmitter<number>();


  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @ViewChild('consultationFicheSectionUsager', { static: true })
  consultationFicheSectionUsager: ConsultationFicheSectionUsagerComponent;

  @ViewChild(ConsultationDatesComponent, { static: true })
  consultationDate: ConsultationDatesComponent;

  @ViewChild(ConsultationOrganismesEnregistrementComponent, { static: true })
  consultationOrganismes: ConsultationOrganismesEnregistrementComponent;

  @ViewChild(ConsultationInformationsGeneralesComponent, { static: true })
  consultationInformationsGenerales: ConsultationInformationsGeneralesComponent;

  @ViewChild(ConsultationRessourcesProfessionnellesComponent, { static: true })
  consultationRessourcesProfessionnellesComponent: ConsultationRessourcesProfessionnellesComponent;

  @ViewChild(ConsultationMedicationsComponent, { static: true })
  consultationMedicationsComponent: ConsultationMedicationsComponent;

  @ViewChild(ConsultationSoinsServicesComponent, { static: true })
  consultationSoinsServicesComponent: ConsultationSoinsServicesComponent;

  @ViewChild(ConsultationMesuresSecuriteComponent, { static: true })
  consultationMesuresSecuriteComponent: ConsultationMesuresSecuriteComponent;

  @ViewChild(ConsultationAutresInformationsComponent, { static: true })
  consultationAutresInformationsComponent: ConsultationAutresInformationsComponent;

  @ViewChild('bandeflottante', { static: true })
  bandeFlottante: BandeFlottanteComponent;

  @ViewChild("alertPagContainer", { read: ViewContainerRef, static: true })
  container;

  consultationFicheSectionUsagerDTO: ConsultationFicheSectionUsagerDTO = null;

  sectionsContentZones: Array<SigctContentZoneComponent> = new Array<SigctContentZoneComponent>();

  adressePrincipaleUsager: UsagerLieuResidenceDTO = null;

  consultationBandeauDTO: ConsultationBandeauDTO = null;

  avertissementPersistant: AlertModel;

  constructor(private authenticationService: AuthenticationService,
    private utilitaireService: UtilitaireService,
    private usagerService: UsagerService,
    private rapportService: JournalisationsUsagerService,
    private appContextStore: AppContextStore,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private dialogUtilService: DialogUtilServiceService,
    private translateService: TranslateService,
    private impressionService: ImpressionService) {
    super();
  }

  ngOnInit(): void {
    // Garder la session du portail active
    this.garderSessionPortailActive();

    // Journalise la consultation de l'enregistrement.
    this.subscriptions.add(
      this.usagerService.journaliserConsultationEnregistrement(this.idEnregistrementIdent).subscribe()
    );
  }

  ngAfterViewInit(): void {
    //Le setTimeout evite l`erreur ExpressionChangedAfterItHasBeenCheckedError d`arriver.
    // voir article: https://blog.angular-university.io/angular-debugging/ pour comprendre.
    setTimeout(() => {
      this.chargerSectionsContentZones();
      this.bandeFlottante.setFocusOnOuvrirTout();

    }, 0);

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  private initUsager(usagerId: number) {
    this.idUsagerIdent = usagerId;

    if (this.idUsagerIdent) {

      this.subscriptions.add(
        this.usagerService.getUsager(this.idUsagerIdent).subscribe((res: UsagerDTO) => {
        this.usagerDTO = res;

        // Affiche le nom et le prénom de l'usager dans la barre de menu.
        this.setUsagerMenuTop();

        this.chargerSectionUsager();

        })
      );

    } else {
      // Vide le composant
      this.resetUsagerMenuTop();
    }

  }

  private initTopBar(isEnContexteAppel: boolean, statusEnregistrement: string) {
    let topBarActions: Action[] = [];
    let topBarActionRetour: Action;

    let hasRoleEnregistrementModifier: boolean = AuthenticationUtils.hasAnyRole(["ROLE_US_ENREGISTREMENT_MODIF", "ROLE_US_ENREGISTREMENT_MODIF_TOUS"]);

    let topBarActionHistorique: Action = { label: this.translateService.instant("usager.bandeau.btnhistorique"), tooltip: this.translateService.instant("usager.bandeau.btnhistorique"), actionFunction: this.actionHistorique, compId: 'historiqueBtn', extraClass: "btn-primary form-btn" };
    let topBarActionEditer: Action = { label: this.translateService.instant("usager.bandeau.btnmodifier"), tooltip: this.translateService.instant("usager.bandeau.btnmodifier"), actionFunction: this.actionEditerEnregistrement, compId: 'modifierBtn', extraClass: "btn-primary form-btn" };

    let topBarActionPDF: Action = {
      label: this.translateService.instant("usager.bandeau.btnPDF"),
      actionFunction: this.actionPDF,
      icon: "fa fa-file-pdf-o fa-lg",
      compId: 'pdfBtn',
      extraClass: "btn-default btn-auto-disabled"
    };

    if (isEnContexteAppel) {
      /** Revenir à la fiche si contexte d'appel **/
      topBarActionRetour = {
        tooltip: this.translateService.instant("usager.bandeau.btnfermer2"),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };

    } else {
      /** Revenir à la liste si hors contexte d'appel **/
      topBarActionRetour = {
        label: this.translateService.instant("usager.bandeau.btnfermer1"),
        actionFunction: this.actionRetourEnregistrements,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
    }

    if (this.consultationBandeauDTO && this.consultationBandeauDTO.actif && hasRoleEnregistrementModifier) {
      topBarActions = [topBarActionHistorique, topBarActionEditer, topBarActionPDF, topBarActionRetour];
    } else {
      topBarActions = [topBarActionHistorique, topBarActionPDF, topBarActionRetour];
    }



    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }

  private garderSessionPortailActive() {
    this.subscriptions.add(
      this.authenticationService.setSessionActivePortail().subscribe()
    );

  }

  private setContexteApplicatif() {
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.isEnContextAppel = appContext.isContextAppel;

        const statusEnregistrementsUsager: string = <string>appContext.statusEnregistrementsUsager;
        this.initTopBar(this.isEnContextAppel, statusEnregistrementsUsager);
      })
    );

  }

  private setUsagerMenuTop() {
    if (this.usagerDTO.prenom && this.usagerDTO.nom) {
      this.labelMenuTop = this.usagerDTO.prenom + " " + this.usagerDTO.nom;
    } else if (this.usagerDTO.prenom) {
      this.labelMenuTop = this.usagerDTO.prenom;
    } else if (this.usagerDTO.nom) {
      this.labelMenuTop = this.usagerDTO.nom;
    } else {
      this.labelMenuTop = this.labelUsagerNonIdentifie;
    }

    this.labelMenuTop = this.labelMenuTop.concat(" - ").concat(this.labelEnregistrement);
    if (this.consultationBandeauDTO) {
      let infoRegionUsager = this.consultationBandeauDTO.codRegion.concat(" - ").concat(this.consultationBandeauDTO.nomRegion);
      this.labelMenuTop = this.labelMenuTop.concat("  (").concat(infoRegionUsager).concat(")");
    }
    this.detailMenuTop = "#" + this.usagerDTO.id;
  }

  private resetUsagerMenuTop() {
    this.usagerDTO = new UsagerDTO();
    this.idUsagerIdent = this.usagerDTO.id;
    this.labelMenuTop = this.labelUsagerNonIdentifie;
  }

  private chargerSectionsContentZones(): void {
    if (this.consultationFicheSectionUsager.contentZones) {
      this.sectionsContentZones = this.consultationFicheSectionUsager.contentZones.toArray();
    }
    this.sectionsContentZones.push(...this.contentZones.toArray());
  }

  private chargerSectionUsager() {
    if (this.usagerDTO) {
      if (this.usagerDTO.dtNaiss) {
        // Calcule l'âge de l'usager et l'affiche.
        this.subscriptions.add(
          this.utilitaireService.getAgeParDateNaissance(this.usagerDTO.dtNaiss.toLocaleString()).subscribe((age: AgeDTO) => {
          this.consultationFicheSectionUsagerDTO = {
            idUsager: this.usagerDTO.id,
            idUsagerHisto: this.usagerDTO.id,
            ageAnnees: age.years,
            ageMois: age.months,
            ageJours: age.days
          };

          })
        );

      } else {
        this.consultationFicheSectionUsagerDTO = {
          idUsager: this.usagerDTO.id,
          idUsagerHisto: this.usagerDTO.id,
          ageAnnees: this.usagerDTO.groupeAgeOptions ? this.usagerDTO.groupeAgeOptions.anneesNumber : null,
          ageMois: this.usagerDTO.groupeAgeOptions ? this.usagerDTO.groupeAgeOptions.moisNumber : null,
          ageJours: this.usagerDTO.groupeAgeOptions ? this.usagerDTO.groupeAgeOptions.joursNumber : null
        };

      }

    }

  }

  private initAdresseUsager() {
    this.subscriptions.add(
      this.utilitaireService.getUsagerLieuResidencePrincipal(this.idUsagerIdent).subscribe((res: UsagerLieuResidenceDTO) => {
      this.adressePrincipaleUsager = res;
      if (this.consultationBandeauDTO) {
        let validationAdresse = this.isAdresseUsagerValide(this.consultationBandeauDTO, this.adressePrincipaleUsager);
        if (!validationAdresse.isAdresseUsagerValide) {
          this.afficherMessages(validationAdresse.codMessage);
        }

      }
      })
    );
  }

  private initBandeau() {
    this.subscriptions.add(
      this.usagerService.consulterBandeau(this.idEnregistrementIdent).subscribe((res: ConsultationBandeauDTO) => {
      this.consultationBandeauDTO = res;
      // Récupère le contexte applicatif.
      this.setContexteApplicatif();
      this.initUsager(this.idUsagerIdent ? this.idUsagerIdent : this.consultationBandeauDTO.idUsager);
      this.validerAdresseUsager(this.consultationBandeauDTO);
      })
    );
  }

  private validerAdresseUsager(consultationBandeau: ConsultationBandeauDTO): void {

    if (this.adressePrincipaleUsager) {
      let validationAdresse = this.isAdresseUsagerValide(consultationBandeau, this.adressePrincipaleUsager);
      if (!validationAdresse.isAdresseUsagerValide) {
        this.afficherMessages(validationAdresse.codMessage);
      }
    } else {
      this.initAdresseUsager();
    }

  }

  private isAdresseUsagerValide(consultationBandeau: ConsultationBandeauDTO, adresseUsager: UsagerLieuResidenceDTO): { isAdresseUsagerValide: boolean, codMessage: string } {
    this.alertStore.resetAlert();

    let returnValid = {
      isAdresseUsagerValide: true,
      codMessage: ''
    }

    if (adresseUsager == null) {
      returnValid.isAdresseUsagerValide = false;
      // us-a90001=Région de l'enregistrement : l'usager doit avoir au moins une adresse active de type "Principale" contenant une région. Assurez-vous que...
      returnValid.codMessage = 'us-a90001'
    } else {
      if (!(adresseUsager.codeRegion != null && adresseUsager.nomRegion != null)) {
        returnValid.isAdresseUsagerValide = false;
      // us-a90001=Région de l'enregistrement : l'usager doit avoir au moins une adresse active de type "Principale" contenant une région. Assurez-vous que...
      returnValid.codMessage = 'us-a90001'
      }

      if (consultationBandeau.idRegion != undefined && adresseUsager.codeRegion != consultationBandeau.codRegion) {
        returnValid.isAdresseUsagerValide = false;
        // us-a90002=Région de l'enregistrement : région différente de la région de l'adresse principale de l'usager. Assurez-vous que...
        returnValid.codMessage = 'us-a90002'
      }
    }

    return returnValid;
  }

  private afficherMessages(codeMessage: string) {
    this.avertissementPersistant = new AlertModel();
    this.avertissementPersistant.title = 'Message d’avertissement';
    this.avertissementPersistant.type = AlertType.WARNING;
    this.avertissementPersistant.messages = [this.translateService.instant(codeMessage)];
    this.alertStore.addAlerts([this.avertissementPersistant]);
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        if (!this.dialogUtilService.isDialogOpened) {
          this.alertService.show(this.container, state);
        }
      })
    );
  }


  actionHistorique = (): void => {
    this.alertStore.resetAlert();

    this.subscriptions.add(
      this.rapportService.genererRapportJournalisationEnregistrement(this.idEnregistrementIdent).subscribe(
        (rapport: RapportJournalisationDTO) => {
          if (this.validerRapportJournalisation(rapport)) {
            const data: any = rapport.contenu;
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
            const byteArray = new Uint8Array(byteNumbers);
            let blob = new Blob([byteArray], { type: 'application / vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.download = rapport.nomRapport;
            anchor.href = url;
            anchor.click();
            anchor.remove();
          }
        })
    );
  }

  /**
   * Vérifie si le rapport de journalisation a été produit correctement. Les erreurs survenues
   * sont affichées dans la barre d'erreurs.
   * @param dto
   */
  private validerRapportJournalisation(dto: RapportJournalisationDTO): boolean {
    let errors: string[] = [];

    //Si les erreurs viennents du backend
    if (dto.erreurs) {
      errors = Object.keys(dto.erreurs).map(key => (dto.erreurs[key]));
    }

    if (CollectionUtils.isNotBlank(errors)) {
      let messages: string[] = [];
      for (let i = 0; i < errors.length; i++) {
        const msg = this.translateService.instant(errors[i]);
        messages.push(msg);
      }

      const title = this.translateService.instant("sigct.ss.error.label");
      const alerte: AlertModel = AlertModelUtils.createAlertModel(messages, title, AlertType.ERROR);
      this.alertStore.addAlert(alerte);

      return false;
    }

    return true;
  }

  actionPDF = (): void => {
    let document = new ImpressionDocumentDTO();
    document.docTemplate = "fiche-enregistrement.html"
    document.fileName = "fiche-enregistrement"
    document.title = this.translateService.instant("us.enregistrements.impression.numero") + this.idEnregistrementIdent;
    document.organisme = this.consultationBandeauDTO.codRegion.concat(" - ").concat(this.consultationBandeauDTO.nomRegion);

    document.pageLabel = this.translateService.instant("us.enregistrements.impression.page");
    document.surLabel = this.translateService.instant("us.enregistrements.impression.sur");;
    document.parLabel = this.translateService.instant("us.enregistrements.impression.par");;
    document.imprimerLeLabel = this.translateService.instant("us.enregistrements.impression.date");

    document.loadSection("section-identification-usager", this.loadDataIdentificationUsager(), this.sectionsContentZones);
    document.loadSection("section-communications-usager", this.loadDataComunicationUsager(), this.sectionsContentZones);
    document.loadSection("section-informations-supp-usager", this.loadDataInformationsSupp(), this.sectionsContentZones);
    document.loadSection("section-adresses-usager", this.loadDataAdresseSupp(), this.sectionsContentZones);
    document.loadSection("consulter-dates-enregistrement", this.loadDataConsultationDate(), this.sectionsContentZones);
    document.loadSection("consulter-organisme-enregistrement-usager", this.loadOrganismes(), this.sectionsContentZones);
    document.loadSection("consulter-informations-generales-enregistrement", this.loadInformationsGenerales(), this.sectionsContentZones);
    document.loadSection("consulter-ressources-pro-usager", this.loadResources(), this.sectionsContentZones);
    document.loadSection("consulter-medications-usager", this.loadMedications(), this.sectionsContentZones);
    document.loadSection("consulter-soins-service", this.loadSoinsServices(), this.sectionsContentZones);
    document.loadSection("consulter-indicateurs-mesures-securite", this.loadMesureSecurite(), this.sectionsContentZones);
    document.loadSection("consulter-autres-informations-enregistrement", this.loadAutresInfo(), this.sectionsContentZones);

    this.impressionService.genererPdfEnregistrement(this.idEnregistrementIdent, document);
  }


  loadDataIdentificationUsager() {
    const section = new SectionIdentificationUsagerDTO();
    this.consultationFicheSectionUsager.loadSectionIdentificationUsager(section);
    return section;
  }

  loadDataComunicationUsager() {
    const section = new SectionCommunicationUsagerDTO();
    this.consultationFicheSectionUsager.loadSectionCommunicationUsager(section);
    return section;
  }

  loadDataInformationsSupp() {
    const section = new SectionInformationSuppDTO
    this.consultationFicheSectionUsager.loadSectionInformationSupp(section);
    return section;
  }

  loadDataAdresseSupp() {
    const section = new SectionAdresseUsagerDTO();
    this.consultationFicheSectionUsager.loadSectionAdresseUsager(section);
    return section;
  }

  loadDataConsultationDate() {
    return this.consultationDate.dates;
  }

  loadOrganismes() {
    return this.consultationOrganismes.dataSource
  }

  loadInformationsGenerales() {
    return this.consultationInformationsGenerales.informationsGenerales;
  }

  loadResources() {
    return this.consultationRessourcesProfessionnellesComponent.dataSource;
  }

  loadMedications() {
    return {
      medications: this.consultationMedicationsComponent.dataSource,
      therapie: this.consultationMedicationsComponent.therapieIntraveineuse,
      fichiers: this.consultationMedicationsComponent.consultationFichiersComponent.dataSource.data
    };
  }

  loadSoinsServices() {
    return this.consultationSoinsServicesComponent.dataSource;
  }

  loadMesureSecurite() {
    return this.consultationMesuresSecuriteComponent.dataSource
  }

  loadAutresInfo() {
    return {
      autresInformations: this.consultationAutresInformationsComponent.autresInformations,
      fichiers: this.consultationAutresInformationsComponent.consultationFichiersComponent.dataSource.data
    }
  }


  actionEditerEnregistrement = (): void => {
    this.editerEnregistrement.emit(this.idEnregistrementIdent);
  }

  actionRetourEnregistrements = (): void => {
    this.retourEnregistrements.emit(this.idUsagerIdent);
  }


}
