import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ReferenceDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models';
import { SoinServiceDTO } from '../../../models/soin-service-dto';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';




@Component({
  selector: 'app-soins-service-ui',
  templateUrl: './soins-service-ui.component.html',
  styleUrls: ['./soins-service-ui.component.css']
})
export class SoinsServiceUiComponent implements OnInit, OnDestroy {

  radioSoinServiceStatut: string = '1';

  readonly displayedColumns: string[] = ['dateDebut', 'type', 'commentaires', 'actif', 'actions'];
  readonly ACTION_AJOUTER: string = 'Ajouter';

  private idxElementSelectionne: any;
  private action: string;

  public listeSoinService: Array<SoinServiceDTO> = [];
  public dataSource = new MatTableDataSource<any>([]);
  // message de l'action supprimmer une soinService
  public messageSupprimer: string;

  public abonnement: Subscription;
  listeSoinServiceSubject = new BehaviorSubject<SoinServiceDTO[]>([]);
  public changementDataSource: Observable<any> = this.listeSoinServiceSubject.asObservable();

  isAficherNonActif = false;

  @ViewChildren('soin_service_dateDebut') soinsServiceDateDebut : QueryList<SigctDatepickerComponent>;
  abonnementSoinsServiceDateDebut: Subscription;

  //Conteneur pour la liste de valeurs
  public inputOptionsTypeSoinsSecuriteSecurite: InputOptionCollection = {
    name: 'type',
    options: []
  };


  // action en cours
  @Input("actionEnCours")
  public set actionEnCours(valeur: string) {
    this.action = valeur;
  }

  /** Peuple la liste des types des soins et services */
  @Input("listeOptionsTypeSoinsSecurite")
  public set listeOptionsTypeSoinsSecurite(values: ReferenceDTO[]) {
    let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");

    if (this.inputOptionsTypeSoinsSecuriteSecurite.options[0] === undefined) {
      this.inputOptionsTypeSoinsSecuriteSecurite.options.push({ label: valeurLibelleVide, value: null });
    }

    if (values) {
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsTypeSoinsSecuriteSecurite.options.push({ label: item.nom, value: item.code });
      });
    }
  }

  /** Peupler la liste des soins et services */
  @Input("listData")
  public set listData(values: SoinServiceDTO[]) {

    this.listeSoinService = values;
    if (this.listeSoinService != null) {
     // if (!this.isAficherNonActif && this.listeSoinService.length > 0){
      //  this.listeSoinService = this.listeSoinService.filter(s => s.actif);
     // }
      this.listeSoinServiceSubject.next(this.listeSoinService);
      // si on est en mode ajout
      if (this.listeSoinService.length == 0) {
        this.ajouterUneNouvelle(false);
      }
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsSoinServiceStatut: InputOptionCollection = {
    name: "soinServiceStatus",
    options: []
  };

  public inputOptionSoinServiceActif: InputOptionCollection = {
    name: "soinServiceActifs",
    options: [{ label: "", value: "1" }]
  };

  constructor(private changeDetectorRefs: ChangeDetectorRef,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {

    this.inputOptionsSoinServiceStatut.options.push({ label: this.translateService.instant("usager.enregistrement.sec.soins.encours"), value: '1', description: this.translateService.instant("usager.enregistrement.sec.soins.encours")});
    this.inputOptionsSoinServiceStatut.options.push({ label: this.translateService.instant("usager.enregistrement.sec.soins.historique"), value: '0', description: this.translateService.instant("usager.enregistrement.sec.soins.historique")});

    // par defaut setter la datasource a la liste de données existante
    this.dataSource.data = this.listeSoinService;
    this.listeSoinServiceSubject.next(this.listeSoinService);
    // abonnement aux changement de la liste
    this.abonnement = this.changementDataSource
      .subscribe(
        data => {
          this.refraichirListe(data);
        });

    this.changeDetectorRefs.detectChanges();
    // Initialiser le message de suppression
    let titreSection: string = this.translateService.instant('usager.enregistrement.sec.soins.titre');
    this.messageSupprimer = this.translateService.instant('sa-iu-a00001', { 0: titreSection });

  }

  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }

    if (this.abonnementSoinsServiceDateDebut) {
      this.abonnementSoinsServiceDateDebut.unsubscribe();
    }
  }

  /*
   Permet de supprimir une soin service vierge dans le data-table
 */
  supprimer(idx?: number) {
    if (idx === undefined) {
      idx = this.idxElementSelectionne;
    }
    this.listeSoinService.splice(this.idxElementSelectionne, 1);
    this.listeSoinServiceSubject.next(this.listeSoinService);
    this.closeModal('confirm_popup_supression');
  }

  /*
    Permet d'ajouter une soin vierge dans le data-table
  */
  ajouterUneNouvelle(avecFocus : boolean): void {

    this.refreshSize();

    if (this.listeSoinService) {
      let soinsService = new SoinServiceDTO();
      if (this.radioSoinServiceStatut === '0') {
        soinsService.actif=false;
        soinsService.visible=false;
      }
      this.listeSoinService.push(soinsService);
      this.listeSoinServiceSubject.next(this.listeSoinService);

      if (avecFocus && this.soinsServiceDateDebut) {
        this.abonnementSoinsServiceDateDebut = this.soinsServiceDateDebut.changes.subscribe(() => {
          this.soinsServiceDateDebut.last.focus();
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

    if (this.abonnementSoinsServiceDateDebut) {
      this.abonnementSoinsServiceDateDebut.unsubscribe();
    }
  }


  /**
  * Ouvre la boite de dialogue pour confirmer la suppression.
  * @param elementId
  */
  confirmerSupprimer(elementIdx: any) {
    this.idxElementSelectionne = elementIdx;
    this.openModal('confirm_popup_supression', 'ok_supression_button');
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

  isHidden(medication: SoinServiceDTO){
    if (this.radioSoinServiceStatut === '0')
      return medication.visible;
    else
      return !medication.visible;
  }

  onRedioSoinsServiceChange() {
    this.listeSoinService.forEach( m =>{
      if (m.actif)
        m.visible=true;
      else {
        m.visible = false;
      }
    })
  }
}
