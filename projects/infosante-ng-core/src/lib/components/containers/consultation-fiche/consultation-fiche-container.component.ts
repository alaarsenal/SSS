import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UrlTree } from '@angular/router';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { ConsultationContainerStateService, ConsultationRouterState } from 'projects/sigct-service-ng-lib/src/lib/services/consultation-container-state.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { RelanceWrapperComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/relance-wrapper/relance-wrapper.component';
import { Observable } from 'rxjs';
import { EnumTypeFicheAppel } from '../../../models/type-fiche-appel-enum';
import { ConsultationFicheAppelWrapperComponent } from '../consultation-fiche-appel-wrapper/consultation-fiche-appel-wrapper.component';
import { NoteComplementaireWrapperComponent } from '../note-complementaire-wrapper/note-complementaire-wrapper.component';

@Component({
  selector: 'sa-consultation-fiche-container',
  templateUrl: './consultation-fiche-container.component.html',
  styleUrls: ['./consultation-fiche-container.component.css']
})
export class ConsultationFicheContainerComponent implements OnInit, OnDestroy {

  @ViewChild('consultationWrapper', { static: false })
  consultationWrapper: ConsultationFicheAppelWrapperComponent;

  @ViewChild('relanceWrapper', { static: false })
  relanceWrapper: RelanceWrapperComponent;

  @ViewChild('noteComplementaireWrapper', { static: false })
  noteComplementaireWrapper: NoteComplementaireWrapperComponent;

  @Input()
  resetState: boolean = true;

  @Input("idAppel")
  idAppel: number;

  @Input()
  saisieDifferee: boolean = false;

  @Input("statutFiche")
  statutFiche: string;

  @Input()
  afficherBoutonCorrigerFicheAppel: boolean;

  @Input("idFicheAppel")
  set idFicheAppel(value: number) {
    this.chargerDonnees(value);
  }
  _idFicheAppel: number;

  @Output()
  supprimerFicheApple: EventEmitter<any> = new EventEmitter();

  @Output()
  redirectionEvent: EventEmitter<UrlTree> = new EventEmitter();

  @Output()
  corrigerFicheAppelEvent: EventEmitter<void> = new EventEmitter();

  isAfficherBoutonConvertirFicheAppelEnNoteCompl: boolean = false;
  isConversionFicheEnNoteCompl: boolean = false;
  consultationWrapperState: boolean;
  relanceWrapperState: boolean;
  noteComplementaireWrapperState: boolean;

  constructor(
    private appContextStore: AppContextStore,
    private stateService: ConsultationContainerStateService,
    private materialModalDialogService: MaterialModalDialogService) {
  }

  ngOnInit(): void {
    this.isAfficherBoutonConvertirFicheAppelEnNoteCompl = this.appContextStore.state.contexteDetailUsagerPage?.saisieDifferee === false;
  }

  ngOnDestroy(): void {
  }

  /**
   * Lance la sauvegarde automatique lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload ', ['$event'])
  beforeUnload(event: any) {
    if (!this.canLeavePage()) {
      event.returnValue = "popup";
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.canLeavePage()) {
      return this.materialModalDialogService.popupConfirmer("ss-iu-a00004");
    } else {
      return true;
    }
  }

  onEditionRelanceEvent(): void {
    this.stateService.changeState(this._idFicheAppel, ConsultationRouterState.RELANCE_WRAPPER);
    this.updateWrappersState();
  }

  onAjouterNoteComplementaire(): void {
    // Vide les données de conversion du composent pour lui signifier qu'il s'agit d'un ajout normal de note complémentaire.
    this.isConversionFicheEnNoteCompl = false;
    this.stateService.changeState(this._idFicheAppel, ConsultationRouterState.NOTE_COMPLEMENTAIRE_WRAPPER);
    this.updateWrappersState();
  }

  onBtnConvertirFicheAppelEnNoteCompl(): void {
    // Ajoute les données de conversion au composent pour lui signifier qu'il s'agit d'un processus de conversion de fiche en note complémentaire.
    this.isConversionFicheEnNoteCompl = true;
    this.stateService.changeState(this._idFicheAppel, ConsultationRouterState.NOTE_COMPLEMENTAIRE_WRAPPER);
    this.updateWrappersState();
  }

  onCorrigerFicheEvent(): void {
    this.corrigerFicheAppelEvent.emit();
  }

  onRelanceReturnEvent(): void {
    this.stateService.changeState(this._idFicheAppel);
    this.updateWrappersState();
  }

  onNoteComplementaireReturnEvent(urlRedirection: UrlTree): void {
    this.stateService.changeState(this._idFicheAppel);
    this.updateWrappersState();

    if (urlRedirection) {
      this.redirectionEvent.emit(urlRedirection);
    }
  }

  onBtnSupprimerFicheAppelClick(dataFicheASupp: any) {
    this.supprimerFicheApple.emit(dataFicheASupp);
  }

  canLeavePage(): boolean {
    if (this.relanceWrapperState) {
      return this.relanceWrapper?.canLeavePage();
    } else if (this.noteComplementaireWrapperState) {
      return this.noteComplementaireWrapper?.canLeavePage();
    } else {
      return true;
    }
  }

  private chargerDonnees(idFicheAppel: number): void {
    this._idFicheAppel = idFicheAppel;
    if (idFicheAppel) {
      if (this.resetState) {
        this.stateService.changeState(idFicheAppel);
      } else {
        this.stateService.changeStateIfNotExists(idFicheAppel);
      }
      this.updateWrappersState();
    }
  }

  private updateWrappersState(): void {
    const state: ConsultationRouterState = this.stateService.currentState;
    this.consultationWrapperState = ConsultationRouterState.CONSULTATION_FICHE_WRAPPER == state;
    this.relanceWrapperState = ConsultationRouterState.RELANCE_WRAPPER == state;
    this.noteComplementaireWrapperState = ConsultationRouterState.NOTE_COMPLEMENTAIRE_WRAPPER == state;
  }

}
