import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Inject, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { EnregistrementsUsagerResultatDTO } from 'projects/usager-ng-core/src/lib/models/enregistrements-usager-resultat-dto';
import { OrganismeDTO } from 'projects/usager-ng-core/src/lib/models/organisme-dto';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PopupOrganismeEnregistrementUsagerUiComponent } from '../popup-organisme-enregistrement-usager-ui/popup-organisme-enregistrement-usager-ui.component';
import { DialogUtilServiceService } from '../../../services/dialog-util-service.service';




@Component({
  selector: 'app-organismes-enregistrement-usager',
  templateUrl: './organismes-enregistrement-usager.component.html',
  styleUrls: ['./organismes-enregistrement-usager.component.css']
})
export class OrganismesEnregistrementUsagerComponent implements OnInit, OnDestroy {

  readonly displayedColumns: string[] = ['organisme_site', 'garde', 'type', 'nonGestionnaire', 'raison', 'numeroDossier', 'commentaires', 'date_debut', 'date_fermeture_prevue', 'fermeture', 'actions'];

  readonly ACTION_AJOUTER: string = 'Ajouter';
  readonly ACTION_MODIFIER: string = 'Modifier';

  private action: string;

  private organismePourAjout: OrganismeDTO;

  private indexOrganismePourModif : number;

    // identifiant de l'usager
  idUsager: number;
  enregistrementEnCours: EnregistrementsUsagerResultatDTO;

  @Input() @Output()
  isDialogOpened: boolean;

  public listeOrganismes: Array<OrganismeDTO> = [];
  public dataSource = new MatTableDataSource<any>([]);

  public abonnementDataSource: Subscription;
  public abonnementServices: Subscription;

  public listeOrganismesSubject = new BehaviorSubject<OrganismeDTO[]>([]);
  public changementDataSource: Observable<any> = this.listeOrganismesSubject.asObservable();

  // action en cours
  @Input("actionEnCours")
  public set actionEnCours(valeur: string) {
    this.action = valeur;
  }

  /** Peupler la liste des organsimes */
  @Input("listData")
  public set listData(values: OrganismeDTO[]) {
      this.listeOrganismes = values;
      this.listeOrganismesSubject.next(this.listeOrganismes);
  }

  setIdentificationUsager(idUsager: number): void {
    this.idUsager = idUsager;
  }

  constructor(private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogUtilServie: DialogUtilServiceService) { }

  ngOnInit(): void {
    // par defaut setter la datasource a la liste de données existante
    this.dataSource.data = this.listeOrganismes;
    this.listeOrganismesSubject.next(this.listeOrganismes);
    // abonnement aux changement de la liste
    this.abonnementDataSource = this.changementDataSource
      .subscribe(
        data => {
          this.updateListData(data);
        });

    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.abonnementDataSource) {
      this.abonnementDataSource.unsubscribe();
    }

    if (this.abonnementServices) {
      this.abonnementServices.unsubscribe();
    }
  }

  /* Permet de refraichir la datasource de mat-table */
  updateListData(data: any): void {
    this.dataSource.data = data;
  }


  modifierDetailsOrganisme(id: number, index: number): void {
    this.indexOrganismePourModif = index;
    const dialogRef = this.dialog.open(PopupOrganismeEnregistrementUsagerUiComponent, this.getdialogConfig());
    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpened = true;
      this.dialogUtilServie.informeOpenDialog();
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpened = false;
      this.dialogUtilServie.informeCloseDialog();
      this.updateListData(this.getdialogConfig().data.listeOrganismes);
    });
  }

  private getdialogConfig(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;

    if (window.innerWidth > 1440) {
      dialogConfig.width = "calc(45%)";
      dialogConfig.maxWidth = "calc(45%)";
      dialogConfig.height = "calc(100% - 225px)";
    } else {
      dialogConfig.width = "calc(60%)";
      dialogConfig.maxWidth = "calc(60%)";
      dialogConfig.height = "calc(100% - 100px)";
    }


    dialogConfig.data = { idUsager: this.idUsager, listeOrganismes: this.listeOrganismes, indexOrganismePourModif : this.indexOrganismePourModif}

    return dialogConfig
  }

  ajouterUnOrganisme(): void {
    this.isDialogOpened = true;
    this.indexOrganismePourModif = null;
    const dialogRef = this.dialog.open(PopupOrganismeEnregistrementUsagerUiComponent, this.getdialogConfig());
    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpened = true;
      this.dialogUtilServie.informeOpenDialog();
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpened = false;
      this.dialogUtilServie.informeCloseDialog();
      this.updateListData(this.getdialogConfig().data.listeOrganismes);
    });
  }

  getCodeMG(organismeEnregistreur : OrganismeDTO) : string {
    return organismeEnregistreur.codeSiteMG ? organismeEnregistreur.codeSiteMG : organismeEnregistreur.codeOrganismeMG;
  }

}
