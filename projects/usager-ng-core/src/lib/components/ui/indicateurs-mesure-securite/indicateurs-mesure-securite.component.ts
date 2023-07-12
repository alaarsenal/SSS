import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ReferenceDTO } from '../../../models/reference-dto';
import { IndicateursMesuresSecuriteDTO } from '../../../models/indicateurs-mesures-securite';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';




@Component({
  selector: 'app-indicateurs-mesure-securite',
  templateUrl: './indicateurs-mesure-securite.component.html',
  styleUrls: ['./indicateurs-mesure-securite.component.css']
})
export class IndicateursMesureSecuriteComponent implements OnInit, OnDestroy {

  readonly displayedColumns: string[] = ['type', 'commentaires', 'actions'];
  readonly ACTION_AJOUTER: string = 'Ajouter';

  private idxElementSelectionne: any;
  private action: string;

  public listeIndicateurMesureSecurite: Array<IndicateursMesuresSecuriteDTO> = [];

  public dataSource = new MatTableDataSource<any>([]);
  // message de l'action supprimmer une inticateur
  public messageSupprimer: string;

  public abonnement: Subscription;

  listeIndicateurSubject = new BehaviorSubject<IndicateursMesuresSecuriteDTO[]>([]);
  public changementDataSource: Observable<any> = this.listeIndicateurSubject.asObservable();

  @ViewChildren('indicateurs_lien') indicateursLien : QueryList<SigctChosenComponent>;
  abonnementIndicateursLien: Subscription;

  //Conteneur pour la liste de valeurs
  public inputOptionsMesureSecurite: InputOptionCollection = {
    name: 'type',
    options: []
  };

  // action en cours
  @Input("actionEnCours")
  public set actionEnCours(valeur: string) {
    this.action = valeur;
  }

  /** Peuple la liste des mesures de securite */
  @Input("listeOptionsMesureSecurite")
  public set listeOptionsMesureSecurite(values: ReferenceDTO[]) {
    let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");

    if (this.inputOptionsMesureSecurite.options[0] === undefined) {
      this.inputOptionsMesureSecurite.options.push({ label: valeurLibelleVide, value: null });
    }

    if (values) {
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsMesureSecurite.options.push({ label: item.nom, value: item.code });
      });
    }
  }

  /** Peupler la liste des indicateurs de mesures de securité */
  @Input("listData")
  public set listData(values: IndicateursMesuresSecuriteDTO[]) {
    this.listeIndicateurMesureSecurite = values;
    this.listeIndicateurSubject.next(this.listeIndicateurMesureSecurite);
    // si on est en mode ajout
    if (this.listeIndicateurMesureSecurite != undefined && this.listeIndicateurMesureSecurite.length == 0) {
      this.ajouterUneNouvelleIndicateurMesure(false);
    }
  }

  constructor(private changeDetectorRefs: ChangeDetectorRef,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    // par defaut setter la datasource a la liste de données existante
    this.dataSource.data = this.listeIndicateurMesureSecurite;
    this.listeIndicateurSubject.next(this.listeIndicateurMesureSecurite);
    // abonnement aux changement de la liste
    this.abonnement = this.changementDataSource
      .subscribe(
        data => {
          this.refraichirListe(data);
        });

    this.changeDetectorRefs.detectChanges();
    // Initialiser le message de suppression
    let titreSection: string = this.translateService.instant('usager.enregistrement.sec.indicateur.titre');
    this.messageSupprimer = this.translateService.instant('sa-iu-a00001', { 0: titreSection });
  }


  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }

    if (this.abonnementIndicateursLien) {
      this.abonnementIndicateursLien.unsubscribe();
    }
  }

  /*
   Permet de suprimmer un indicateur de mesure
 */
  supprimerIndicateurMesure(idx?: number) {
    if (idx === undefined) {
      idx = this.idxElementSelectionne;
    }
    this.listeIndicateurMesureSecurite.splice(this.idxElementSelectionne, 1);
    this.listeIndicateurSubject.next(this.listeIndicateurMesureSecurite);
    this.closeModal('confirm_popup_supression_mesure_securite');
  }

  /*
    Permet d'ajouter un indicateur vierge dans le data-table
  */
  ajouterUneNouvelleIndicateurMesure(avecFocus : boolean): void {
    this.refreshSize();

    if (this.listeIndicateurMesureSecurite){
      this.listeIndicateurMesureSecurite.push(new IndicateursMesuresSecuriteDTO());
      this.listeIndicateurSubject.next(this.listeIndicateurMesureSecurite);

      if (avecFocus && this.indicateursLien) {
        this.abonnementIndicateursLien = this.indicateursLien.changes.subscribe(() => {
          this.indicateursLien.last.focus();
        });

      }
    }
  }

  // éviter le problème de disparition du bouton ajouter.
  refreshSize() {
    const h = window.innerWidth;
    const w = window.innerHeight;
    window.resizeTo(h-1, w-2);
    window.resizeTo(h, w);
  }


  /* Permet de refraichir la datasource de mat-table */
  refraichirListe(data: any): void {
    this.dataSource.data = data;

    if (this.abonnementIndicateursLien) {
      this.abonnementIndicateursLien.unsubscribe();
    }
  }


  /**
  * Ouvre la boite de dialogue pour confirmer la suppression.
  * @param elementId
  */
  confirmerSupprimerIndicateur(elementIdx: any) {
    this.idxElementSelectionne = elementIdx;
    this.openModal('confirm_popup_supression_mesure_securite', 'ok_supression_mesure_securite_button');
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
    } catch (e) {
    }
  }

}
