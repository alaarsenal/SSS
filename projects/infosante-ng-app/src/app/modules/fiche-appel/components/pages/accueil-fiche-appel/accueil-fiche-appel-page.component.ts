import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { InformationUtileDTO } from 'projects/sigct-service-ng-lib/src/lib/models/information-utile-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { TableInformationsUtilesService } from 'projects/sigct-service-ng-lib/src/lib/services/table-informations-utiles/table-informations-utiles-service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { Version } from 'projects/sigct-service-ng-lib/src/lib/version/version';
import { VersionService } from 'projects/sigct-service-ng-lib/src/lib/version/version.service';
import { MatIframeDialogComponent } from 'projects/sigct-ui-ng-lib/src/lib/dialogs/mat-iframe-dialog/mat-iframe-dialog.component';
import { DialogueUsagerComponent } from 'projects/usager-ng-core/src/lib/components/uis';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-accueil-fiche-appel-page',
  templateUrl: './accueil-fiche-appel-page.component.html',
  providers: [AppelApiService],
  styleUrls: ['./accueil-fiche-appel-page.component.css']
})
export class AccueilFicheAppelPageComponent implements OnInit, OnDestroy {
  nomEnvironnement: string;
  prenomNomUtilisateur: string;
  nomOrganismeCourant: string;
  nomRegionOrganismeCourant: string;
  version: Version;

  /** Indique si une fenêtre de dialogue est ouverte. */
  isDialogOpened: boolean = false;

  /** Liste des imformations utiles */
  listeInformationsUtiles: InformationUtileDTO[];
  listeCategorie: ReferenceDTO[];

  subscriptions: Subscription = new Subscription();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  constructor(private authenticationService: AuthenticationService,
    private versionService: VersionService,
    private router: Router,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private ficheAppelApiService: AppelApiService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private appContextStore: AppContextStore,
    private tableInfoService: TableInformationsUtilesService,
    private referencesService: ReferencesApiService,
    private fichiersService: FichiersApiService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        if (!this.isDialogOpened) {
          this.alertService.show(this.alertContainer, state);
        }
      })
    );
    this.subscriptions.add(
      forkJoin([
        this.tableInfoService.afficherLiensUtiles(),
        this.referencesService.getListeCategorieInforUtile(),
        this.versionService.loadVersion()
      ]).subscribe(result => {
        this.listeInformationsUtiles = result[0] as InformationUtileDTO[];
        this.listeCategorie = result[1] as ReferenceDTO[];
        this.version = result[2] as Version;
        //S'il n'y a pas de lien utile, on vide les catégories pour ne pas afficher les catégories vides.
        if (this.listeInformationsUtiles.length == 0) {
          this.listeCategorie = undefined;
        }
      })
    );


    this.nomEnvironnement = window["env"].name;

    const user = this.authenticationService.getAuthenticatedUser();
    this.prenomNomUtilisateur = user.prenom + " " + user.nomFamille;
    this.nomOrganismeCourant = user.nomOrganismeCourant;
    this.nomRegionOrganismeCourant = user.nomRegionOrganismeCourant;
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }


  onAjoutConsultationBtnClick(): void {
    this.subscriptions.add(
      this.validerFicheAppelNonTerminee().subscribe((valide: boolean) => {
        if (valide) {
    this.creerAppel(false);
  }
      })
    );
  }

  onAjoutConsultationSaisieDiffereeBtnClick(): void {
    this.creerAppel(true);
  }

  onRechercherEnregistrementsBtnClick() {
    this.router.navigate(['usager/enregistrements/rechercher'])
  }

  /**
   * Vérifie si des fiches d'appels sont non terminées. 
   * Retourne true si toutes les fiches sont terminées ou si l'utilisateur confirme de poursuivre malgré la présence de fiches non terminées.
   * @returns 
   */
  private validerFicheAppelNonTerminee(): Observable<boolean> {
    return this.ficheAppelNonTermineService.getNbFicheAppelNonTermine(window["env"].urlSante + "/api/").pipe(concatMap((objJson: any) => {
      let nb: string = objJson.nbFicheOuverte;
      if (nb && nb !== "0") {
        // sa-iu-c70012=Vous avez au moins une consultation en cours dans la liste des fiches non terminées, désirez-vous quand même ajouter une nouvelle consultation manuellement?
        const msgConfirmation: string = this.translateService.instant("sa-iu-c70012")
        return this.materialModalDialogService.popupConfirmer(msgConfirmation);
      } else {
        return of(true);
      }
    }));
  }

  /**
 * Crée un nouvel appel dans la BD et navigue vers celui-ci.
   * @param saisieDifferee indique s'il s'agit d'une saisie différée
 */
  private creerAppel(saisieDifferee: boolean) {
    // Crée l'appel dans la BD.
    this.subscriptions.add(
      this.ficheAppelApiService.ajouterAppel(saisieDifferee).subscribe((idAppel: number) => {
        // Accède à la consultation (appel) créée.
        this.router.navigate(["/editer", "appel", idAppel]);
      },
        () => {
          let alert: AlertModel = new AlertModel();
          alert.messages = ["Erreur de création de la consultation"];
          alert.title = "usager.msg.erreur";
          alert.type = AlertType.ERROR;
          this.alertStore.setAlerts([alert]);
        })
    );
  }

  rechercherUsager() {
    this.appContextStore.setvalue('isContextAppel', false);
    this.alertStore.resetAlert();

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.restoreFocus = true;
    dialogConfig.width = "90vw";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.height = "calc(100% - 120px)";

    const dialogRef = this.dialog.open(DialogueUsagerComponent, dialogConfig);

    dialogRef.afterOpened().subscribe(() => {
      // Indique l'ouverture du popup.
      this.isDialogOpened = true;
    });

    dialogRef.afterClosed().subscribe(() => {
      // Indique la fermeture du popup.
      this.isDialogOpened = false;
    });
  }

  /**
   * Navigue vers la rechercge des fiches d'appel.
   */
  rechercherFicheAppel() {
    this.router.navigate(["/rechercher"]);
  }

  onBtnRechercherIsiswClick() {
    const matDialogConfig = new MatDialogConfig();

    matDialogConfig.disableClose = false;
    matDialogConfig.autoFocus = false;
    matDialogConfig.restoreFocus = true;
    matDialogConfig.width = "90vw";
    matDialogConfig.maxWidth = "90vw";
    matDialogConfig.height = "calc(100% - 120px)";
    matDialogConfig.data = {
      url: this.sanitizer.bypassSecurityTrustResourceUrl(window["env"].urlIsiswHistoRecherche)
    };

    this.dialog.open(MatIframeDialogComponent, matDialogConfig);
  }


  /**
   * Permet de télécharger un fichier dans la table des fichiers SX_FICHIERS.
   * @param fichier
   */
  onTelechargerFichier(fichier: InformationUtileDTO) {
    let a = document.createElement('a');
    a.id = 'onTelechargerFichier' + fichier.fichierId
    a.target = '_blank';
    a.href = this.fichiersService.getUrlBaseTelechargeAvecParametre(fichier.fichierId);
    a.click();
    a.remove();
  }

}
