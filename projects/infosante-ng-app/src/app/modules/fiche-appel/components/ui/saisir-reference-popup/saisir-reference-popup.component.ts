import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef, ApplicationRef, ChangeDetectorRef
} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { ReferenceSaisibleEnPopupDTO } from '../../../models/reference-saisible-en-popup-dto';
import { SaisirParSystemePopupDataDTO } from '../../../models/saisir-par-systeme-popup-data-dto';

@Component({
  selector: 'app-saisir-reference-popup',
  templateUrl: './saisir-reference-popup.component.html',
  styleUrls: ['./saisir-reference-popup.component.css']
})
export class SaisirReferencePopupComponent implements OnInit {
  /** Liste contenant les id des références dans l'ordre de leur saisie */
  private ordreSaisieReferenceIdSet: Set<number> = new Set();
  private doitGarderOrdreDeSaisie: boolean = false;

  public formTopBarOptions: FormTopBarOptions;

  public leftMenuItems: MenuItem[];

  public systemeSecetioneId: number;

  public systemeSecetioneIdPrescedent: number;

  public inputOptionsSystemes: InputOptionCollection;

  public abonnement: Subscription;

  public changeData = false;
  public showDataTable = false;

  public onBtnOuiConfirme: Function;

  public onBtnNoConfirme: Function;

  subscriptions: Subscription = new Subscription();

  @Output()
  onAjouter: Function;

  @Output()
  onInitListeSystemes: Function;
  @ViewChild('topBarComponent', { static: false }) topBarComponent: ElementRef;
  @ViewChild('organismes', { static: false })       organismes: ElementRef;

  @ViewChild("alertPopUpContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { data: SaisirParSystemePopupDataDTO },
    private translateService: TranslateService,
    private dialog: MatDialog,
    private modalConfirmService: ConfirmationDialogService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private alertStore: AlertStore,
    private router: Router) { }

  ngOnInit() {
    this.subscriptions.add(this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
          this.dialog.closeAll();
      }
    }));
    this.initSubscribAlerts();

    this.initTopBarOptions();
    this.initData();
    this.initListOptionsSystemes();
    const topBarComponent = document.getElementById('topBarComponent');
    topBarComponent.blur();
    const organismes = document.getElementById('organismes');

    organismes.focus();

  }


  initSubscribAlerts() {
    this.alertStore.state$.subscribe((state: AlertModel[]) => {
      this.alertService.show(this.alertContainer, state);
    });
  }

  initTopBarOptions() {

    const ajouterLabel = this.translateService.instant(this.dialogData.data.ajouterLabel);
    const anulerLabel = this.translateService.instant(this.dialogData.data.anulerLabel);
    const fermerLabel = this.translateService.instant(this.dialogData.data.fermerLabel);
    const returnLabel = this.translateService.instant("button.back.title");

    this.formTopBarOptions = {
      title: { icon: "" },
      actions: [
        { label: ajouterLabel, actionFunction: this.ajouter, compId: 'modifierBtn', extraClass: "btn-primary  btn-auto-disabled" },
        { label: anulerLabel, actionFunction: this.anuler, compId: 'modifierBtn', extraClass: "btn-default  btn-auto-disabled" },
        { label: returnLabel, actionFunction: this.fermer, icon: "fa fa-times  fa-lg", compId: 'retourBtn', extraClass: "btn btn-default btn-sm form-btn" },
      ]
    };
  }
  ngAfterViewInit() {
    // Remove the tabindex attribute to cancel the effect of tabindex="-1"
    const topBarComponent = document.getElementById('topBarComponent');
    topBarComponent.blur();
    const organismes = document.getElementById('organismes');

    organismes.focus();

  }

  initData() {
    this.doitGarderOrdreDeSaisie = this.dialogData.data.doitGarderOrdreDeSaisie;
    this.onAjouter = this.dialogData.data.onAjouterCallBack;
    this.onInitListeSystemes = this.dialogData.data.onInitListeSystemesCallBack;
    this.inputOptionsSystemes = this.dialogData.data.inputOptionsSystemes;
  }

  initListOptionsSystemes() {
    this.onInitListeSystemes.call(this);
  }



  ajouter = (): void => {
    this.alertStore.resetAlert();
    if (this.changeData) {
      this.ajouterReferences();
    } else {
      const msg = this.translateService.instant(this.dialogData.data.msgSaisirObligatoire);
      this.creerErreurs([msg], "Message d'erreur", AlertType.ERROR);
    }



  }


  private refreshDialog() {
    this.initListAtntecedentsPossibles();
    this.onInitListeSystemes.call(this);
    this.systemeSecetioneIdPrescedent = null;
    this.systemeSecetioneId = null;
    this.showDataTable = false;
    this.dialogData.data.allReferencesPossibles = [];
    this.changeDetectorRef.detectChanges();
  }

  anuler = (): void => {
    if (this.changeData) {
      this.modalConfirmService.openAndFocus('confirm_popup', 'ok_confirm_popup');
      this.onBtnOuiConfirme = () => { this.confirmeChangementCategorie() };
      this.onBtnNoConfirme = () => { this.modalConfirmService.close('confirm_popup') };
    }
  }

  fermer = (): void => {
   /* if (this.changeData) {
      this.modalConfirmService.openAndFocus('confirm_popup', 'ok_confirm_popup');
      this.onBtnOuiConfirme = () => { this.alertStore.resetAlert(); this.dialog.closeAll(); };
      this.onBtnNoConfirme = () => { this.modalConfirmService.close('confirm_popup') };
    } else {*/
      this.dialog.closeAll();
  //  }
  }

  private ajouterReferences() {
    let listeAjouter: Array<ReferenceSaisibleEnPopupDTO> = new Array();
    if (this.doitGarderOrdreDeSaisie) {
      // Construit la liste des références à ajouter, dans l'ordre qu'elles ont été saisies.
       listeAjouter= Array.from(this.ordreSaisieReferenceIdSet)
        .map((referenceId: number) => this.dialogData.data.allReferencesPossibles.find((ref: ReferenceSaisibleEnPopupDTO) => ref.referenceId === referenceId))
        .filter((reference: ReferenceSaisibleEnPopupDTO) => reference !== undefined);


    } else {
      listeAjouter = this.dialogData.data.allReferencesPossibles.filter(i => i.presence || i.details);
    }

    // Stock les messages dans un Set pour éviter les doublons.
    let messageSet: Set<string> = new Set();
    listeAjouter.forEach(reference => {
      const msg: string = this.validerDonnes(reference);
      if (msg) {
        messageSet.add(msg);
      }
    });

    if (messageSet.size == 0) {
      this.onAjouter.call(this, listeAjouter);
      this.refreshDialog();
    ///  this.dialog.closeAll();
    } else {
      // Affiche les messages retournés par les validations.
      this.creerErreurs(Array.from(messageSet), "Message d'erreur", AlertType.ERROR);
    }
  }

  onChageData(row: ReferenceSaisibleEnPopupDTO) {
    this.changeData = true;

    this.updateOrdreDeSaisie(row);
  }


  onChangeCategorie(event: InputOption) {
    if (event) {
     this.resetCategorie(+event.value);
    }
    this.showDataTable=true;
  }

  resetCategorie(idCateg: number) {
   /*if (this.changeData) {
      this.systemeSecetioneId = idCateg;
      this.modalConfirmService.openAndFocus('confirm_popup', 'ok_confirm_popup');
      this.onBtnOuiConfirme = this.confirmeChangementCategorie;
      this.onBtnNoConfirme = this.anulerChangementCategorie;
    } else {*/
      this.initListAtntecedentsPossibles();
   // }
  }

  confirmeChangementCategorie() {
    this.initListAtntecedentsPossibles();
  }

  anulerChangementCategorie() {
    this.systemeSecetioneId = this.systemeSecetioneIdPrescedent;
    this.modalConfirmService.close('confirm_popup');
  }

  initListAtntecedentsPossibles() {
   this.ordreSaisieReferenceIdSet.clear();
    this.systemeSecetioneIdPrescedent = this.systemeSecetioneId;
    this.changeData = false;
    //this.modalConfirmService.close('confirm_popup');
    this.dialogData.data.allReferencesPossibles = [];
    if (this.systemeSecetioneId) {
      this.dialogData.data.onInitListeAllReferencesPossiblesCallBack.call(this, this.systemeSecetioneId);
    } else {
      this.dialogData.data.allReferencesPossibles = [];
    }
  }

  onPresenceClick(row: ReferenceSaisibleEnPopupDTO) {
    if (row.presence == '1') {
      row.presence = null;
    } else {
      row.presence = '1';
    }
    this.changeData = true;

    this.updateOrdreDeSaisie(row);
  }

  onAbsenceClick(row: ReferenceSaisibleEnPopupDTO) {
    if (row.presence == '0') {
      row.presence = null;
    } else {
      row.presence = '0';
    }
    this.changeData = true;

    this.updateOrdreDeSaisie(row);
  }

  setAbsenceStyle(row: ReferenceSaisibleEnPopupDTO): string {

    if (row.presence == '0') {
      return " color: red;";
    } else {
      return "color: gray;";
    }
  }

  setPresenceStyle(row: ReferenceSaisibleEnPopupDTO): string {

    if (row.presence == '1') {
      return "color: green;";
    } else {
      return "color: gray;";
    }

  }

  private validerDonnes(reference: ReferenceSaisibleEnPopupDTO): string {
    let msg: string = null;

    //Présence obligaoire
    if (reference.presence != '1' && reference.presence != '0') {
      msg = this.translateService.instant(this.dialogData.data.msgPresenceObligatoire);
    }



    return msg;
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

  /**
   * Met à jour la liste contenant les id des références dans l'ordre de leur saisie.
   * @param reference
   */
  private updateOrdreDeSaisie(reference: ReferenceSaisibleEnPopupDTO): void {
    if (this.doitGarderOrdreDeSaisie && reference) {
      if (StringUtils.isBlank(reference.presence) && StringUtils.isBlank(reference.details)) {
        // La référence reçue est vide. On doit la retirer de la liste.
        this.ordreSaisieReferenceIdSet.delete(reference.referenceId);
      } else {
        this.ordreSaisieReferenceIdSet.add(reference.referenceId);
      }
    }
  }
}
