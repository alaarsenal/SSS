import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { EnregistrementsUsagerResultatDTO } from '../../../models/enregistrements-usager-resultat-dto';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { MedicationDTO } from '../../../models/medication-dto';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';




@Component({
  selector: 'app-medications-enregistrement-usager-ui',
  templateUrl: './medications-enregistrement-usager-ui.component.html',
  styleUrls: ['./medications-enregistrement-usager-ui.component.css']
})
export class MedicationsEnregistrementUsagerUiComponent implements OnInit, OnDestroy {

  @Input("enregistrement")
  enregistrement : EnregistrementsUsagerResultatDTO;

  radioMedicationStatut: string = '1';

  readonly displayedColumns: string[] = ['dateDebut', 'nom', 'actif', 'actions'];
  readonly ACTION_AJOUTER: string = 'Ajouter';

  private idxElementSelectionne: any;
  private action: string;

  public listeMedication: Array<MedicationDTO> = [];
  public dataSource = new MatTableDataSource<any>([]);
  // message de l'action supprimmer une medication
  public messageSupprimerMedication: string;

  public abonnement: Subscription;
  listeMedicationSubject = new BehaviorSubject<MedicationDTO[]>([]);
  public changementDataSource: Observable<any> = this.listeMedicationSubject.asObservable();

  @ViewChildren('medication_dateDebut') medicationsDateDebut : QueryList<SigctDatepickerComponent>;
  abonnementMedicationsDateDebut: Subscription;

  // action en cours
  @Input("actionEnCours")
  public set actionEnCours(valeur: string) {
    this.action = valeur;
  }


  /** Peupler la liste des medications */
  @Input("listData")
  public set listData(values: MedicationDTO[]) {
    this.listeMedication = values;
    if (this.listeMedication !=null){
      this.listeMedicationSubject.next(this.listeMedication);
      // si on est en mode ajout
      if (this.listeMedication.length == 0) {
        this.ajouterUneNouvelleMedication(false);
      }
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsMedicationStatut: InputOptionCollection = {
    name: "medicationStatuts",
    options: []
  };

  public inputOptionMedicationActif: InputOptionCollection = {
    name: "medicationActifs",
    options: [{ label: "", value: "1" }]
  };

  constructor(private changeDetectorRefs: ChangeDetectorRef,
    private modalConfirmService: ConfirmationDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {

    this.inputOptionsMedicationStatut.options.push({ label: this.translateService.instant("usager.enregistrement.sec.medication.encours"), value: '1', description: this.translateService.instant("usager.enregistrement.sec.medication.encours") });
    this.inputOptionsMedicationStatut.options.push({ label: this.translateService.instant("usager.enregistrement.sec.medication.historique"), value: '0', description:  this.translateService.instant("usager.enregistrement.sec.medication.historique")});
    // this.inputOptionMedicationActif.options.push({ label: '', value: '1' });
    // document.querySelector(".mat-checkbox-input").setAttribute('value', 'true');

    // par defaut setter la datasource a la liste de données existante
    this.dataSource.data = this.listeMedication;
    this.listeMedicationSubject.next(this.listeMedication);
    // abonnement aux changement de la liste
    this.abonnement = this.changementDataSource
      .subscribe(
        data => {
          this.refraichirListe(data);
        });

    this.changeDetectorRefs.detectChanges();
    // Initialiser le message de suppression
    let titreSection: string = this.translateService.instant('usager.enregistrement.sec.medication.titre');
    this.messageSupprimerMedication = this.translateService.instant('sa-iu-a00001', { 0: titreSection });
  }

  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }

    if (this.abonnementMedicationsDateDebut) {
      this.abonnementMedicationsDateDebut.unsubscribe();
    }
  }

  /*
   Permet d'ajouter une medication vierge dans le data-table
 */
  supprimerMedication(idx?: number) {
    if (idx === undefined) {
      idx = this.idxElementSelectionne;
    }
    this.listeMedication.splice(this.idxElementSelectionne, 1);
    this.listeMedicationSubject.next(this.listeMedication);
    this.closeModal('confirm_popup_supression_medication');
  }

  /*
    Permet d'ajouter une médication vierge dans le data-table
  */
  ajouterUneNouvelleMedication(avecFocus : boolean): void {

    this.refreshSize();

    if (this.listeMedication) {
      let medication = new MedicationDTO();
      if (this.radioMedicationStatut === '0') {
        medication.actif=false;
        medication.visible=false;
      }
      this.listeMedication.push(medication);
      this.listeMedicationSubject.next(this.listeMedication);

      if (avecFocus && this.medicationsDateDebut) {
        this.abonnementMedicationsDateDebut = this.medicationsDateDebut.changes.subscribe(() => {
          this.medicationsDateDebut.last.focus();
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

    if (this.abonnementMedicationsDateDebut) {
      this.abonnementMedicationsDateDebut.unsubscribe();
    }
  }

  /**
  * Ouvre la boite de dialogue pour confirmer la suppression.
  * @param elementId
  */
  confirmerSupprimerMedication(elementIdx: any) {
    this.idxElementSelectionne = elementIdx;
    this.openModal('confirm_popup_supression_medication', 'ok_supression_medication_button');
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


  isHidden(medication: MedicationDTO){
    if (this.radioMedicationStatut === '0')
      return medication.visible;
    else
      return !medication.visible;
  }

  onRedioMedicationChange() {
    this.listeMedication.forEach( m =>{
      if (m.actif)
        m.visible=true;
      else {
        m.visible = false;
      }
    })
  }

}
