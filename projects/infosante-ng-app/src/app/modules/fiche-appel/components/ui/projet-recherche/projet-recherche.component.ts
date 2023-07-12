import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProjetRechercheDTO } from 'projects/infosante-ng-core/src/lib/models/projet-recherche-dto';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-projet-recherche',
  templateUrl: './projet-recherche.component.html',
  styleUrls: ['./projet-recherche.component.css']
})
export class ProjetRechercheComponent implements OnInit, OnDestroy {

  projetRecherche: ProjetRechercheDTO = new ProjetRechercheDTO();
  subscription: Subscription = new Subscription();
  abonnementProjet: Subscription;



  public actionLinks: ActionLinkItem[];
  public listeProjetRecherche: Array<ProjetRechercheDTO> = new Array<ProjetRechercheDTO>();

  private listeProjets: Array<ReferenceDTO> = new Array<ReferenceDTO>();


  private elementSelectionner: ProjetRechercheDTO;



  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;


  public isProjetRechercheValide: boolean = true;



  public infoBulleProjetRecherche: string = 'Sélectionnez...';

  public valeurLibelleSelectionnez: string;

  public readOnly: string = '';



  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;

  messageSupprimerProjetRecherche: any;

  @Input()
  public isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService,
  ) {

  }


  /**
   * Peuple la liste des projets de Recherches sauvegardes dans la base de donnees
   */
  @Input("listeProjetRecherche")
  public set listeProjetRecherches(projetRecherchesDTO: ProjetRechercheDTO[]) {

    this.listeProjetRecherche = new Array<ProjetRechercheDTO>();
    this.listeProjetRecherche = projetRecherchesDTO;


    this.reinitialiserProjetRecherche();

  }



  //Les événements qui sont poussés au parent
  @Output()
  projetRechercheSave: EventEmitter<any> = new EventEmitter();

  @Output()
  projetRechercheDelete: EventEmitter<any> = new EventEmitter();


  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.sa.error.label", "sigct.sa.f_appel.evaluation.aucunante", "sigct.sa.f_appel.evaluation.anteincon",
        "sigct.sa.f_appel.evaluation.nonperti", "sigct.sa.f_appel.evaluation.ajousvgrd", "sigct.sa.f_appel.evaluation.action", "sigct.sa.f_appel.evaluation.pre", "sigct.sa.f_appel.evaluation.abs", "girpi.label.selectionnez", "general.msg.obligatoire"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["sigct.sa.error.label"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];

          this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];

        })

    );

    // Alimente la liste des projetRecherches.

    let titre: string;
    titre = this.translateService.instant('sigct.sa.f_appel.terminaison.validfinintervention.projetrech');
    this.messageSupprimerProjetRecherche = this.translateService.instant('sa-iu-a00001', { 0: titre });


    this.inputOptionsProjetRecherche.options.push({ label: this.valeurLibelleSelectionnez, value: null });



    if (this.abonnementProjet == null) {
      this.abonnementProjet = this.referencesService.getListeProjetRecherche().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeProjets.push(item);
            this.inputOptionsProjetRecherche.options.push({ label: item.nom, value: item.code, description: item.description });
          })
        };
      });
    }

  }


  //Conteneur pour la liste de valeurs
  public inputOptionsProjetRecherche: InputOptionCollection = {
    name: "projets",
    options: []
  };



  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitRechProjetBtn", { static: true })
  submitProjetRechercheBtn: ElementRef;

  @ViewChild("liste_projet", { static: true })
  autoProjetHTML: InputTextComponent;




  isEmpty(str) {
    return (!str || 0 === str.length);
  }


  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerProjetRecherche(element: any) {

    this.idElementSelectionne = element.id;
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getProjetRechercheDTOById(this.idElementSelectionne);
    let data: ProjetRechercheDTO = this.elementSelectionner;
    this.projetRecherche.id = data.id;

    this.projetRechercheDelete.emit(this.projetRecherche);

  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'une Projet Recherche.
   * @param ProjetRechercheDTO
   */
  formatActionProjetRecherche(projetRecherche: ProjetRechercheDTO) {

    let anteStr: string;

    anteStr = '<div style="color:black;"title="' + projetRecherche.referenceProjetRechercheNom + '" >';


    if (projetRecherche.referenceProjetRechercheCode) {
      if (window.innerWidth >= 1441) {
        if (projetRecherche.referenceProjetRechercheNom.length <= 106) {
          anteStr += projetRecherche.referenceProjetRechercheNom;
        } else {
          anteStr += projetRecherche.referenceProjetRechercheNom.substr(0, 103) + "...";
        }
      } else {
        if (projetRecherche.referenceProjetRechercheNom.length <= 80) {
          anteStr += projetRecherche.referenceProjetRechercheNom;
        } else {
          anteStr += projetRecherche.referenceProjetRechercheNom.substr(0, 77) + "...";
        }
      }
    }


    anteStr += "</div>";

    return anteStr;

  }

  /**
   * obtenir l'objet ProjetRechercheDTO a partir de son id
   * @param id
   */
  getProjetRechercheDTOById(id: number) {
    this.listeProjetRecherche.forEach(
      (projetRechercheDTO: ProjetRechercheDTO) => {
        if (projetRechercheDTO.id == id) {
          this.elementSelectionner = projetRechercheDTO;
        }
      }
    )
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
  * Met à jour l'infobulle de la ressource consulté.  Met la description si elle est
  * disponnible.
  */
  onProjetChange() {

    this.listeProjets.forEach(item => {
      const refCode = this.projetRecherche.referenceProjetRechercheCode;

      if (item.code == refCode) {
        if (item.description != null) {
          this.infoBulleProjetRecherche = item.description;
        } else {
          this.infoBulleProjetRecherche = item.nom;
        }

      }
    });

    if (this.projetRecherche.referenceProjetRechercheCode === null) {
      this.infoBulleProjetRecherche = 'Sélectionnez...';
    }


  }



  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitProjetRechercheBtn.nativeElement.click();
  }




  onSubmitProjetRecherche() {

    if (this.validerProjetRecherche()) {
      this.saveDonnees();
    }

  }

  //Sauvegarder les données
  saveDonnees(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }


    this.projetRecherche.valid = true;

    this.projetRechercheSave.emit(this.projetRecherche);

  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  creerErreur(err: any) {
    let messages: string[] = [];
    const msg = err;
    messages.push(msg);

    const alertM: AlertModel = new AlertModel();
    alertM.title = this.libelleMessageErreur;
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }
  }

  //Messages d'erreurs de validation
  creerErreurs(messages: string[], titre: string, erreurType: AlertType) {

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

  /**
   * reinitialiser le formulaire d'edition du moyen de communication
   */
  reinitialiserProjetRecherche() {
    this.projetRecherche = new ProjetRechercheDTO();

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      projet: null,
    };



    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.closeModal('confirm_popup_supri_projet_recherche');

  }

  resetChampsValides(): void {
    this.isProjetRechercheValide = true;
  }

  //Libère les abonnements
  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementProjet) { this.abonnementProjet.unsubscribe(); }

    this.alertStore.resetAlert();

  }


  isProjetRechercheVide(): boolean {

    if ((this.projetRecherche.referenceProjetRechercheCode === undefined || this.projetRecherche.referenceProjetRechercheCode === null)) {
      return true;
    }
    return false;
  }


  validerProjetRecherche(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //A consulter null
    if (this.projetRecherche.referenceProjetRechercheCode === null || this.projetRecherche.referenceProjetRechercheCode === undefined) {

      const champ = this.translateService.instant("sigct.sa.f_appel.terminaison.validfinintervention.projetrech");
      const msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);


      valide = false;

      this.isProjetRechercheValide = valide;

    }


    if (!valide) {

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

      this.projetRecherche.valid = false;
    }

    return valide;

  }


  onProjetValide($event) {
    this.isProjetRechercheValide = true;
  }

  onNgModelChange() {
    this.isProjetRechercheValide = true;
  }



}
