import { Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceSourceInformationDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { SourcesInformationDTO } from '../../../models';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { AutresSourcesInformationDataService } from '../../../services/autres-sources-information-data.service';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';


@Component({
  selector: 'app-autres-sources-information',
  templateUrl: './autres-sources-information.component.html',
  styleUrls: ['./autres-sources-information.component.css']
})
export class AutresSourcesInformationComponent implements OnInit, OnDestroy {

  public inputOptionsAutreSource:InputOptionCollection = {
    name: "autreSource",
    options: []
  }

  @ViewChild('fAutreSourceInformation', { static: true }) fAutreSourceInformation: NgForm;

  @Input("listeAutresSourcesInformation") 
  public set listeAutresSourcesInformation(values: SourcesInformationDTO[]) {
    
    if (values) {
      this.listeAutresSourcesInformationDTO = values;
    } 
  }  

   @Input("listeRefAutresSourcesInformation") 
  public set listeRefAutresSourcesInformation(values: ReferenceSourceInformationDTO[]) {
    
    if(this.inputOptionsAutreSource.options[0] === undefined){
      this.inputOptionsAutreSource.options.push({ label: this.optionDefaultSelectionnez, value: null });  
    }

    if (values) {
      values.forEach((item:ReferenceSourceInformationDTO) => {
        this.inputOptionsAutreSource.options.push({ label: item.nom, value: item.code });
      });
      this.listeRefAutresSourcesInformationDTO = values;
    } 
  }

  @Output() 
  ajoutAutreSourceInformation: EventEmitter<SourcesInformationDTO> = new EventEmitter();  

  @Output() 
  supprimerAutreSourceInformation: EventEmitter<number> = new EventEmitter(); 

  listeAutresSourcesInformationDTO: SourcesInformationDTO[];
  listeRefAutresSourcesInformationDTO: ReferenceSourceInformationDTO[];

  messageConfirmerSuppression: string;

  idAutreSourceInformationASupprimer: number;
  nomAutreSourceInformationASupprimer: string;

  cleInfoBulleSauvegarder: string = "sigct.so.f_appel.evaluation.ajousvgrd";
  cleInfoBulleSupprimer: string = "sigct.supprimer.title";
  public messageDoublon: string;
  private messageNonSelection: string;
  private optionDefaultSelectionnez: string = 'Sélectionnez...';
  private listeAlert: AlertModel[] = [];
  private translateSub: Subscription = new Subscription();

  private idFicheAppel: number;

  public autresSourcesInformationDTO: SourcesInformationDTO = new SourcesInformationDTO();

  constructor(private modalConfirmService: ConfirmationDialogService,
    private autresSourcesInformationDataService: AutresSourcesInformationDataService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private translate: TranslateService) {
  }

  ngOnInit() {
    
    /* À chaque changement d'URL on va chercher le paramètre idFicheAppel pour le mémoriser*/
    this.route.parent.paramMap.subscribe( (params: ParamMap) => {
      this.idFicheAppel = +params.get('idFicheAppel');

      // remet la valeur par défaut de la liste déroulante "autreSource" et du champ détail
      this.fAutreSourceInformation.reset();
    });

    this.translateSub = this.translate.get(['sa-iu-a00011', 'sa-iu-e00014']).subscribe(
      (values: string[]) => {
        this.messageDoublon = values['sa-iu-a00011'];
        this.messageNonSelection = values['sa-iu-e00014'];
      }
    );

  }

  ngOnDestroy() {
    if (this.translateSub) {
      this.translateSub.unsubscribe();
    }
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
   * Gestion d'appui sur le bouton de sauvegarde de la source d'information
   */
  onAddAutreSource() { 

    this.alertStore.setAlerts([]); // Permet de réinitialiser la partie message

    // Vérifier si un choix a été fait pour la liste déroulante 
    if (!this.fAutreSourceInformation.value.autreSource) {
      this.alertStore.setAlerts(this.alertService.buildErrorAlertModelList([this.messageNonSelection]));
      return;  
    }

    let tmpAutreSourceInformationDTO = this.autresSourcesInformationDataService.getAutreSourceInformationDTO(this.idFicheAppel,
      this.listeRefAutresSourcesInformationDTO.find(ref => this.autresSourcesInformationDTO.codeRefSourceInformation === ref.code),
      this.autresSourcesInformationDTO.details);

    // Vérification s'il y a un doublon  
    if (this.autresSourcesInformationDataService.isExistant(tmpAutreSourceInformationDTO, this.listeAutresSourcesInformationDTO)) {

      this.listeAlert = this.alertService.buildErrorAlertModelList([this.messageDoublon]);
      this.alertStore.setAlerts(this.listeAlert);
      return;
    }

    this.ajoutAutreSourceInformation.emit(tmpAutreSourceInformationDTO);
  }

  /**
   * Demande confirmation de la suppression en mémorisant l'id Autre Source Information à supprimer
   * @param idAutreSourceInformationASupprimer 
   */
  confirmerDeleteAutreSource(idAutreSourceInformationASupprimer: number) {


    this.idAutreSourceInformationASupprimer = idAutreSourceInformationASupprimer;
    let autreSourceInformation = this.listeAutresSourcesInformationDTO.find(asi => asi.id === idAutreSourceInformationASupprimer);
    
    this.nomAutreSourceInformationASupprimer = this.listeRefAutresSourcesInformationDTO.find(refAsi => refAsi.code === autreSourceInformation.codeRefSourceInformation).description;

    this.openModal('confirm_popup_suppression');
  }

  /**
   * Suppression d'une autre source information enregistré
   * @param index 
   */
  deleteAutreSource() {
    this.closeModal('confirm_popup_suppression');
    this.supprimerAutreSourceInformation.emit(this.idAutreSourceInformationASupprimer);
  }

  /**
   * À partir d'un code retourne la référence Autre Source Information DTO
   * @param code 
   */
  public getRefAutreSourceInformation(code: string): ReferenceSourceInformationDTO {

    let refAsi = this.listeRefAutresSourcesInformationDTO.find(refAsi => refAsi.code === code);
    return refAsi;

  }

  /**
   * Retourne le nom d'une référence Autre Source Information à partir d'un code
   * @param code 
   */
  public getNomRefAutresSourcesInformation(code: string): string {
    return this.getRefAutreSourceInformation(code).nom;
  }

  /**
   * Retourne l'attribut 1 d'une référence Autre Source Information à partir d'un code
   * @param code 
   */
  public getAttribut1RefAutresSourcesInformation(code: string): string {
    return this.getRefAutreSourceInformation(code).attribut1;
  }

  /**
   * Retourne l'attribut 2 d'une référence Autre Source Information à partir d'un code
   * @param code 
   */
  public getAttribut2RefAutresSourcesInformation(code: string): string {
    return this.getRefAutreSourceInformation(code).attribut2;
  }  
}
