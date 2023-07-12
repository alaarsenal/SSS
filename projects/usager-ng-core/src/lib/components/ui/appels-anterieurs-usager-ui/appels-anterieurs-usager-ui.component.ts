import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { Subscription } from 'rxjs';
import { AppelAnterieurDTO } from '../../../models/appel-anterieur-dto';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-appels-anterieurs-usager-ui',
  templateUrl: './appels-anterieurs-usager-ui.component.html',
  styleUrls: ['./appels-anterieurs-usager-ui.component.css'],
  providers: [DatePipe]
})
export class AppelsAnterieursUsagerUiComponent implements OnInit, OnDestroy {

  private idUsagerIdent: number;
  private subscriptions: Subscription = new Subscription();

  idOrganismeCourant: number;

  displayedColumns: string[] = ['dtDebutFicheAppel', 'sis', 'codeNomRegion', 'actions'];

  items: AppelAnterieurDTO[] = [];
  nbItems: number = 0; // Correspond au nombre d'items trouvés
  pageIndex: number = 0;
  pageSize: number = 0;

  @Input("usagerId")
  set idUsager(idUsagerIdent: number) {
    if (idUsagerIdent) {
      this.idUsagerIdent = idUsagerIdent;
      this.getListeAppelAnterieurUsager();
    }
  }

  @ViewChild(MatTable, { static: true })
  table: MatTable<any>;

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @Output()
  consulterFicheAppel = new EventEmitter<AppelAnterieurDTO>();

  //**Constructeur */
  constructor(private usagerService: UsagerService,
    public datePipe: DatePipe,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService) {

  }

  /**
   * Initialisation de la page
   */
  ngOnInit() {
    this.paginator._intl.firstPageLabel = this.translateService.instant("pagination.premierepage");
    this.paginator._intl.lastPageLabel = this.translateService.instant("pagination.dernierepage");

    const utilisateur: User = AuthenticationUtils.getUserFromStorage();
    //    this.idOrganismeCourant = this.authenticationService.getAuthenticatedUser().idOrganismeCourant;
    this.idOrganismeCourant = utilisateur?.idOrganismeCourant;
  }

  /**
   * Libérer le modèle.
   */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Recherche des usagers avec SOLR
   */
  getListeAppelAnterieurUsager() {
    this.subscriptions.add(
      this.usagerService.getAppelsAnterieursUsager(this.idUsagerIdent)
        .subscribe((appels: AppelAnterieurDTO[]) => {
          let appelsAffiches: AppelAnterieurDTO[] = [];

          this.nbItems = 0;
          this.pageIndex = this.paginator.pageIndex;
          this.pageSize = this.paginator.pageSize;

          if (appels) {
            this.nbItems = appels.length;

            let itemStart = this.paginator.pageIndex * this.paginator.pageSize;
            let itemEnd = itemStart + this.paginator.pageSize;

            if (this.nbItems < itemEnd) {
              itemEnd = this.nbItems;
            }

            for (let i = itemStart; i < itemEnd; i++) {
              appelsAffiches.push(appels[i]);
            }
          }

          this.items = appelsAffiches;
          this.table.renderRows();
        },
          (err) => {
            console.error(err);
            this.items = [];
          })
    );
  }

  /**
   * Lorsque le bouton Consulter fiche appel est cliqué. 
   * Notifie le parent que la consultation d'une fiche d'appel est demandé.
   * @param appelAnterieur appel antérieur à consulter
   */
  consulter(appelAnterieur:AppelAnterieurDTO) {
    this.consulterFicheAppel.emit(appelAnterieur);
  }

  /**
   * Lorsque la pagination change. On rafraichit le contenu de la table.
   * @param event 
   */
  onPageChange(event: PageEvent) {
    this.getListeAppelAnterieurUsager();
  }

}