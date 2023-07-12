import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { forkJoin, Subscription } from 'rxjs';
import { TypeficheSelectioneService } from '../grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { RrssDTO } from '../rrss/rrss-dto';
import { RrssParamsUrl } from '../rrss/rrss-params-url';
import { RRSSComponent } from '../rrss/rrss.component';
import { AppelantCommDTO } from '../sigct-appelant-communication/appelant-Comm-dto';
import { SigctAppelantCommunicationComponent } from '../sigct-appelant-communication/sigct-appelant-communication.component';
import { AppelantDTO } from './appelant-dto';

@Component({
  selector: 'msss-sigct-appelant-initial',
  templateUrl: './sigct-appelant-initial.component.html',
  styleUrls: ['./sigct-appelant-initial.component.css']
})
export class SigctAppelantInitialComponent implements OnInit, OnDestroy {
  readonly MAX_LENGTH_NOM: number = 50;
  readonly MAX_LENGTH_PRENOM: number = 50;

  @Input()
  public appelantDTO: AppelantDTO = new AppelantDTO();

  @Input()
  public rrssParamsUrl: RrssParamsUrl;

  @Input()
  public set idAppel(value: number) {
    if (value) {
      this.appelantDTO.idAppel = value.toString();
    }
  }

  @Input()
  infoAppelCti: InfoAppelCtiDTO = null;

  @Input()
  public isDisabled: boolean = false;


  public appelantCommunications: AppelantCommDTO[] = [];
  public nbCommsActif: number = 0;

  @ViewChild(SigctAppelantCommunicationComponent, { static: true })
  public appelantCommComponent: SigctAppelantCommunicationComponent;

  moyenCommunication: ReferenceDTO[];
  typeCoordMoyenCommunication: ReferenceDTO[];
  subscriptions: Subscription = new Subscription();
  isDialogOpened: boolean = false;
  rrssOrgLabel: string;
  injectHtmlLinkAfterLabel: string;

  @Input()
  public set appelService(value: any) {
    if (value) {
      this.appelApiService = value;
      this.getAllPlaylistOfCommunication();
    }
  }
  private appelApiService: any;

  constructor(
    private dialog: MatDialog,
    private materialModalDialogService: MaterialModalDialogService,
    private referencesService: ReferencesService,
    private translateService: TranslateService,
    private typeFicheSelectioneService: TypeficheSelectioneService,
  ) { }

  ngOnInit(): void {

  }

  public reinitializeAppelantInitial(): void {
    if (!this.typeFicheSelectioneService.isNomPert()) {
      this.appelantCommComponent.reinitializeCommunicationControls();
      this.chargerAppelantDataIfExist();
    }
  }

  resetChampsValides(): void {
    this.appelantCommComponent.resetChampsValides();
  }

  private chargerAppelantDataIfExist() {
    if (this.appelantDTO.idAppel) {
      this.subscriptions.add(
        this.appelApiService.selectAppelantByIdAppel(this.appelantDTO.idAppel).subscribe(result => {
          if (result) {
            this.appelantDTO = result;
          } else {
            this.appelantDTO.nom = "";
            this.appelantDTO.prenom = "";
            this.appelantDTO.details = "";
            this.appelantDTO.rrssDTO = new RrssDTO();
          }
          this.chargerAppelantCommDataIfExist();
        })
      )
    }
  }

  private getAllPlaylistOfCommunication() {
    this.subscriptions.add(
      forkJoin([this.referencesService.getListeTypeEquip(),
      this.referencesService.getListeCoord()]).subscribe(result => {
        this.moyenCommunication = result[0] as ReferenceDTO[];
        this.typeCoordMoyenCommunication = result[1] as ReferenceDTO[];
        this.chargerAppelantDataIfExist();
      })
    );
  }

  public chargerAppelantCommDataIfExist() {
    if (this.appelantDTO.id) {
      this.getAllAppelantCommunications();
    }
  }

  suppRrss() {
    this.appelantDTO.rrssDTO.id = null;
    this.appelantDTO.rrssDTO.rrssId = null;
    this.appelantDTO.rrssDTO.rrssNom = null;
  }

  openDialogRrss(): void {
    const dialogRef = this.dialog.open(RRSSComponent, this.getdialogConfig());
    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpened = true;
    });
    dialogRef.afterClosed().subscribe((message) => {
      this.isDialogOpened = false;
      this.traiterMessageRrss(message);
    });
  }

  private getdialogConfig(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    this.rrssParamsUrl.rrssDTO.rrssNom = this.appelantDTO.rrssDTO.rrssNom;

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;
    dialogConfig.width = "90vw";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.height = "calc(100% - 120px)";
    dialogConfig.data = this.rrssParamsUrl;

    return dialogConfig
  }

  private traiterMessageRrss(message: any) {
    if (message && message != undefined && message[0].data != "loaded") {
      this.appelantDTO.rrssDTO.rrssId = message[0].id;
      this.appelantDTO.rrssDTO.rrssNom = message[0].nom;
    }
  }

  onSubmitAppelantInitialCommunication() {
    this.createEmptyAppelantAndAssociateCommToIt();
    this.addCommToExistingAppelant();
  }

  private createEmptyAppelantAndAssociateCommToIt() {
    if (this.appelantDTO.id == null) {
      this.subscriptions.add(
        this.appelApiService.addAppelant(this.appelantDTO, true).subscribe(result => {
          this.appelantDTO.id = result.id;
          if (this.appelantDTO.id != null) {
            this.appelantCommComponent.appelantCommDTO.idAppelant = this.appelantDTO.id;
            this.subscriptions.add(
              this.appelApiService.addAppelantCommunication(this.appelantCommComponent.appelantCommDTO).subscribe(result => {
                this.getAllAppelantCommunications();
                this.appelantCommComponent.reinitializeCommunicationControls();
              })
            );
          }
        })
      );
    }
  }

  private addCommToExistingAppelant() {
    if (this.appelantDTO.id != null) {
      this.appelantCommComponent.appelantCommDTO.idAppelant = this.appelantDTO.id;
      this.subscriptions.add(
        this.appelApiService.addAppelantCommunication(this.appelantCommComponent.appelantCommDTO).subscribe(result => {
          this.getAllAppelantCommunications();
          this.appelantCommComponent.reinitializeCommunicationControls();
        })
      );
    }
  }

  onSubmitUpdateAppelantComm(event: any) {
    if (event) {
      this.appelantCommComponent.appelantCommDTO.id = event.id;
      this.addCommToExistingAppelant();
    }
  }

  public getAllAppelantCommunications() {
    this.subscriptions.add(
      this.appelApiService.obtainAppelantCommunicationsByIdAppelant(+this.appelantDTO.id).subscribe((result: AppelantCommDTO[]) => {
        let bruteAppelantCommunications: AppelantCommDTO[] = result;
        this.appelantCommunications = bruteAppelantCommunications
          .map((appelantComm: AppelantCommDTO) => {
            return AppelantCommDTO.fetchMissedPropertiesFromReferencesDto(this.moyenCommunication, this.typeCoordMoyenCommunication, appelantComm)
          });
        this.nbCommsActif = this.appelantCommunications.length;
      })
    );
  }

  public isAppelantCommDTODirty(): Boolean {
    return this.appelantCommComponent.appelantCommDTO.isDirty();
  }

  onKey(event: any): void {
    if (event.target.value.length >= 2) {
      event.target.value = StringUtils.convertFirstLetterToUpperCase(event.target.value);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au nom de l'appelant.
   * @param value valeur à ajouter au nom de l'appelant
   */
  onNomCtiSelected(value: string): void {
    if (value) {
      if (StringUtils.isEmpty(this.appelantDTO.nom)) {
        this.appelantDTO.nom = value.substring(0, this.MAX_LENGTH_NOM);
      } else {
        const tmp: string = this.appelantDTO.nom + " " + value;
        this.appelantDTO.nom = tmp.substring(0, this.MAX_LENGTH_NOM);
      }
    }
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au prénom de l'appelant.
   * @param value valeur à ajouter au prénom de l'appelant.
   */
  onPrenomCtiSelected(value: string): void {
    if (value) {
      if (StringUtils.isEmpty(this.appelantDTO.prenom)) {
        this.appelantDTO.prenom = value.substring(0, this.MAX_LENGTH_PRENOM);
      } else {
        const tmp: string = this.appelantDTO.prenom + " " + value;
        this.appelantDTO.prenom = tmp.substring(0, this.MAX_LENGTH_PRENOM);
      }
    }
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au téléphone de l'appelant.
   * @param value valeur à ajouter au téléphone de l'appelent
   */
  onTelephoneCtiSelected(value: string): void {
    if (value) {
      if (this.appelantCommComponent.isCommunicationVide()) {
        this.appelantCommComponent.reinitializeCommunicationControls();
        this.appelantCommComponent.appelantCommDTO.numero = value;
      } else {
        const titre: string = this.translateService.instant("sigct.ss.f_appel.aplntusag.titrecomm");
        //{0} : les informations saisies seront perdues. Désirez-vous continuer?
        const message = this.translateService.instant('ss-iu-a30004', { 0: titre });

        this.subscriptions.add(
          this.materialModalDialogService.popupConfirmer(message).subscribe((confirm: boolean) => {
            if (confirm) {
              this.appelantCommComponent.reinitializeCommunicationControls();
              this.appelantCommComponent.appelantCommDTO.numero = value;
            }
          })
        );
      }
    }
  }
}
