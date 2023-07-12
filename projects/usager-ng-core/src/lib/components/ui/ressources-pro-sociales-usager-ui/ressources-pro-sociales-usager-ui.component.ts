import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ReferenceDTO } from '../../../models/reference-dto';
import { RessourceProfessionelleSocialeDTO } from '../../../models/ressource-pro-dto';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';




@Component({
  selector: 'app-ressources-pro-sociales-usager-ui',
  templateUrl: './ressources-pro-sociales-usager-ui.component.html',
  styleUrls: ['./ressources-pro-sociales-usager-ui.component.css']
})
export class RessourcesProSocialesUsagerUiComponent implements OnInit, OnDestroy {

  readonly displayedColumns: string[] = ['nom', 'lien', 'adresse', 'telephone1', 'telephone2', 'disponibilite', 'actions'];
  readonly ACTION_AJOUTER: string = 'Ajouter';

  private idxElementSelectionne: any;
  private action: string;

  public listeRessourceGenerale: Array<RessourceProfessionelleSocialeDTO> = [];
  //public listeRessourceSupprimee: Array<RessourceProfessionelleSocialeDTO> = [];
  public dataSource = new MatTableDataSource<any>([]);
  // message de l'action supprimmer une ressource
  public messageSupprimerRessource: string;

  public abonnement: Subscription;
  //public listeRessourcesSubject: Subject<any> = new Subject<any[]>();
  listeRessourcesSubject = new BehaviorSubject<RessourceProfessionelleSocialeDTO[]>([]);
  public changementDataSource: Observable<any> = this.listeRessourcesSubject.asObservable();

  @ViewChildren('ressource_nom') ressourcesNom : QueryList<InputTextComponent>;
  abonnementRessourcesNom: Subscription;

  //Conteneur pour la liste de valeurs
  public inputOptionsLienRessourcePro: InputOptionCollection = {
    name: 'lien',
    options: []
  };

  // action en cours
  @Input("actionEnCours")
  public set actionEnCours(valeur: string) {
    this.action = valeur;
  }

  /** Peuple la liste des liens de ressources professionel */
  @Input("listeOptionsLienRessourcePro")
  public set listeOptionsLienRessourcePro(values: ReferenceDTO[]) {
    let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");

    if (this.inputOptionsLienRessourcePro.options[0] === undefined) {
      this.inputOptionsLienRessourcePro.options.push({ label: valeurLibelleVide, value: null });
    }

    if (values) {
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsLienRessourcePro.options.push({ label: item.nom, value: item.code });
      });
    }
  }

  /** Peupler la liste des ressources professionelles et sociales */
  @Input("listData")
  public set listData(values: RessourceProfessionelleSocialeDTO[]) {
    this.listeRessourceGenerale = values;
    this.listeRessourcesSubject.next(this.listeRessourceGenerale);
    // si on est en mode ajout
    if (this.listeRessourceGenerale != undefined && this.listeRessourceGenerale.length == 0) {
      this.ajouterUneNouvelleRessource(false);
    }
  }

  constructor(private changeDetectorRefs: ChangeDetectorRef,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    // par defaut setter la datasource a la liste de données existante
    this.dataSource.data = this.listeRessourceGenerale;
    this.listeRessourcesSubject.next(this.listeRessourceGenerale);
    // abonnement aux changement de la liste
    this.abonnement = this.changementDataSource
      .subscribe(
        data => {
          this.refraichirListe(data);
        });

    this.changeDetectorRefs.detectChanges();
    // Initialiser le message de suppression
    let titreSection: string = this.translateService.instant('usager.enregistrement.sec.ress.prof.titre');
    this.messageSupprimerRessource = this.translateService.instant('sa-iu-a00001', { 0: titreSection });
  }


  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }

    if (this.abonnementRessourcesNom) {
      this.abonnementRessourcesNom.unsubscribe();
    }
  }

  /*
   Permet de supprimer une ressource vierge dans le data-table
 */
  supprimerRessource(idx?: number) {
    if (idx === undefined) {
      idx = this.idxElementSelectionne;
    }
    this.listeRessourceGenerale.splice(this.idxElementSelectionne, 1);
    this.listeRessourcesSubject.next(this.listeRessourceGenerale);
    this.closeModal('confirm_popup_supression_ressource');
  }

  /*
    Permet d'ajouter une ressource vierge dans le data-table
  */
  ajouterUneNouvelleRessource(avecFocus : boolean): void {
    // éviter le problème de disparition du bouton ajouter.
    this.refreshSize();

    if (this.listeRessourceGenerale){
      this.listeRessourceGenerale.push(new RessourceProfessionelleSocialeDTO());
      this.listeRessourcesSubject.next(this.listeRessourceGenerale);
      if (avecFocus && this.ressourcesNom) {
        this.abonnementRessourcesNom = this.ressourcesNom.changes.subscribe(() => {
          this.ressourcesNom.last.focus();
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

    if (this.abonnementRessourcesNom) {
      this.abonnementRessourcesNom.unsubscribe();
    }

  }
  /**
  * Ouvre la boite de dialogue pour confirmer la suppression.
  * @param elementId
  */
  confirmerSupprimerRessource(elementIdx: any) {
    this.idxElementSelectionne = elementIdx;
    this.openModal('confirm_popup_supression_ressource', 'ok_supression_button');
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
