import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceSourceInformationDTO } from '../../../../../../../../infosante-ng-core/src/lib/models/reference-source-information-dto';
import { SourcesInformationDTO } from 'projects/infosante-ng-core/src/lib/models/sources-information-dto';
import { AutresSourcesInformationDataService } from '../../../services/autres-sources-information-data.service';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';

@Component({
  selector: 'app-autres-sources-information',
  templateUrl: './autres-sources-information.component.html',
  styleUrls: ['./autres-sources-information.component.css']
})
export class AutresSourcesInformationComponent implements OnInit, OnDestroy {

  public inputOptionsAutreSource: InputOptionCollection = {
    name: "autreSource",
    options: []
  }

  @ViewChild('fAutreSourceInformation', { static: true }) fAutreSourceInformation: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;


  @Input("listeAutresSourcesInformation")
  public set listeAutresSourcesInformation(values: SourcesInformationDTO[]) {
    this.resetFrom();
    if (values) {
      this.listeAutresSourcesInformationDTO = values;
    }
  }

  @Input("listeRefAutresSourcesInformation")
  public set listeRefAutresSourcesInformation(values: ReferenceSourceInformationDTO[]) {

    if (this.inputOptionsAutreSource.options[0] === undefined) {
      this.inputOptionsAutreSource.options.push({ label: this.optionDefaultSelectionnez, value: null });
    }

    if (values) {
      values.forEach((item: ReferenceSourceInformationDTO) => {
        this.inputOptionsAutreSource.options.push({ label: item.nom, value: item.code });
      });
      this.listeRefAutresSourcesInformationDTO = values;
    }
  }

  public listeRefAutresSourcesInformations: ReferenceSourceInformationDTO[];

  @Output()
  ajoutAutreSourceInformation: EventEmitter<SourcesInformationDTO> = new EventEmitter();

  @Output()
  supprimerAutreSourceInformation: EventEmitter<number> = new EventEmitter();

  listeAutresSourcesInformationDTO: SourcesInformationDTO[];
  listeRefAutresSourcesInformationDTO: ReferenceSourceInformationDTO[];

  messageConfirmerSuppression: string;

  idAutreSourceInformationASupprimer: number;
  nomAutreSourceInformationASupprimer: string;

  cleInfoBulleSauvegarder: string = "sigct.sa.f_appel.evaluation.ajousvgrd";
  cleInfoBulleSupprimer: string = "sigct.supprimer.title";
  public messageDoublon: string;
  private messageNonSelection: string;
  private optionDefaultSelectionnez: string = 'Sélectionnez...';
  private listeAlert: AlertModel[] = [];
  private translateSub: Subscription = new Subscription();

  private idFicheAppel: number;

  public autresSourcesInformationDTO: SourcesInformationDTO = new SourcesInformationDTO();
  public isValide: boolean = true;

  public actionLinks: ActionLinkItem[];


  @Input()
  isDisabled = false;

  constructor(private modalConfirmService: ConfirmationDialogService,
    private autresSourcesInformationDataService: AutresSourcesInformationDataService,
    private route: ActivatedRoute,
    private alertStore: AlertStore,
    private translate: TranslateService) {
  }

  ngOnInit() {

    let messages: string[] = [];

    /* À chaque changement d'URL on va chercher le paramètre idFicheAppel pour le mémoriser*/
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.idFicheAppel = +params.get('idFicheAppel');

      // remet la valeur par défaut de la liste déroulante "autreSource" et du champ détail
      this.fAutreSourceInformation.reset();
    });

    this.translateSub = this.translate.get(['sa-iu-a00011', 'sa-iu-e00014', 'sigct.sa.f_appel.evaluation.ajousvgrd']).subscribe(
      (values: string[]) => {
        this.messageDoublon = values['sa-iu-a00011'];
        this.messageNonSelection = values['sa-iu-e00014'];
        messages.push(values['sigct.sa.f_appel.evaluation.ajousvgrd']);
      }
    );

    this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];

  }

  ngOnDestroy() {
    if (this.translateSub) {
      this.translateSub.unsubscribe();
    }
    this.alertStore.setAlerts([]); // Permet de réinitialiser la partie message
  }

  resetChampsValides(): void {
    this.isValide = true;
  }

  /**
   * Gestion de l'ouverture d'une fenêtre modale pour ce composant et ses enfants
   * @param id identifiant de la fenêtre modale
   */
  private openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  /**
   * Gestion de la fermeture d'une fenêtre modale pour ce composant et ses enfants
   * @param id identifiant de la fenêtre modale
   */
  private closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  /**
   *
   */
  private validation(): boolean {
    let valide: boolean = true;

    // Vérifier si un choix a été fait pour la liste déroulante
    if (this.autresSourcesInformationDTO && !this.autresSourcesInformationDTO.codeRefSourceInformation) {
      valide = false;
      this.setValide(valide);

      this.creerErreurs([this.messageNonSelection], "Message d'erreur", AlertType.ERROR);
    }


    return valide;
  }

  /**
   * Utiliser par le formulaire parent pour avertir l'usager d'une possible perte d'information.
   */
  public isEmptyForm(): boolean {
    let vide: boolean = true;

    if (this.autresSourcesInformationDTO.codeRefSourceInformation || this.autresSourcesInformationDTO.details) {
      vide = false;
    }


    return vide;

  }

  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  onSubmit() {
    this.alertStore.resetAlert();
    if (this.validation()) {
      this.onAddAutreSource();

    }

  }

  resetFrom(): void {
    this.fAutreSourceInformation.reset();
    this.isValide = true;
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
   * Gestion d'appui sur le bouton de sauvegarde de la source d'information
   */
  public onAddAutreSource() {

    let tmpAutreSourceInformationDTO = this.autresSourcesInformationDataService.getAutreSourceInformationDTO(this.idFicheAppel,
      this.listeRefAutresSourcesInformationDTO.find(ref => this.autresSourcesInformationDTO.codeRefSourceInformation === ref.code),
      this.autresSourcesInformationDTO.details);


    // Vérification s'il y a un doublon
    if (this.autresSourcesInformationDataService.isExistant(tmpAutreSourceInformationDTO, this.listeAutresSourcesInformationDTO)) {

      this.creerErreurs([this.messageDoublon], "Avertissement", AlertType.WARNING);

    }

    this.ajoutAutreSourceInformation.emit(tmpAutreSourceInformationDTO);

  }

  /**
   * Demande confirmation de la suppression en mémorisant l'id Autre Source Information à supprimer
   * @param idAutreSourceInformationASupprimer
   */
  confirmerDeleteAutreSource(element: any) {


    this.idAutreSourceInformationASupprimer = element.id;
    let autreSourceInformation = this.listeAutresSourcesInformationDTO.find(asi => asi.id === element.id);

    this.nomAutreSourceInformationASupprimer = this.listeRefAutresSourcesInformationDTO.find(refAsi => refAsi.code === autreSourceInformation.codeRefSourceInformation).description;

    this.supprimerAutreSourceInformation.emit(this.idAutreSourceInformationASupprimer);
  }


  /**
   * Formate les items dans la liste des sources d'information
   *
   * @param itemAutreSource Liste des sources d'information
   */
  public formatActionAutreSource(itemAutreSource: SourcesInformationDTO) {
    let textSrc: string = '';
    let title = itemAutreSource.description? itemAutreSource.description : '';

    if (itemAutreSource.typeSource === 'URL') {
      if (itemAutreSource.isDownloadSource) {
        textSrc += '<a href="' + itemAutreSource.source + '" title="' + title + '">' + itemAutreSource.nom + '</a>';
      } else {
        textSrc += '<a href="' + itemAutreSource.source + '" target="_blank"  title="' + title + '">' + itemAutreSource.nom + '</a>';
      }
    } else {
      textSrc += '<span title="' + title + '">' + itemAutreSource.nom + '<span>';
    }
    if (itemAutreSource.details) {
      textSrc += ' <span *ngIf="itemAutreSource.details" title="' + title + '" >&nbsp;(<em>' + itemAutreSource.details + '</em>)</span>';
    }

    return textSrc;
  }

  /**
   * Reset la validité du champ quand il est sélectionné
   *
   * @param $event la liste des autres sources
   */
  public onAutreSourceValide($event) {

    this.isValide = true;

  }

  public setValide(param: boolean) {
    this.isValide = param;

  }
}
