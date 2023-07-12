import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { AvisDTO } from '../../../models/avis-dto';
import { AvisService } from '../../../services/avis.service';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';

@Component({
  selector: 'app-avis-communiques',
  templateUrl: './avis-communiques.component.html',
  styleUrls: ['./avis-communiques.component.css']
})
export class AvisCommuniquesComponent implements OnInit {

  idFicheAppel : number;

  idAvisASupprimer: number;
  nomAvisASupprimer: string;

  private subscription: Subscription = new Subscription();

  public avisDTOs: AvisDTO[] = [];

  @Input("idFicheAppel")
  set FicheAppelId(idFicheAppel: number) {
    if (idFicheAppel) {
      this.idFicheAppel = idFicheAppel;
      this.chargerAvisRelies(this.idFicheAppel);
    }
  }

  @Output()
  consulterAvis: EventEmitter<number> = new EventEmitter();

  constructor(private avisService: AvisService,
    private modalConfirmService: ConfirmationDialogService,) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }

  //Alimente la liste des avis reliés à une fiche d'appel.
  chargerAvisRelies(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.subscription.add(this.avisService.getListeAvis(idFicheAppel).subscribe(result => {
        if (result) {
          this.avisDTOs = result;
        }
      }));
    }

  }

  confirmerDeleteAvis(idAvisASupprimer: number, nomAvisASupprimer: string) {
    this.idAvisASupprimer = idAvisASupprimer;
    this.nomAvisASupprimer = nomAvisASupprimer;

    this.modalConfirmService.openAndFocus('confirm_popup_suppression_avis', 'ok_confirm_button_avis');
  }

  deleteAvis() {
    this.modalConfirmService.close('confirm_popup_suppression_avis');
    if (this.idFicheAppel) {
      this.subscription.add(this.avisService.supprimerAvis(this.idFicheAppel, this.idAvisASupprimer).subscribe(() => {
        this.chargerAvisRelies(this.idFicheAppel);
      }));
    }
  }

  afficherAvis(idAvis: number) {
    this.consulterAvis.emit(idAvis);
  }

}
