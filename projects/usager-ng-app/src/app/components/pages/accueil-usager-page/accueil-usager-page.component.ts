import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { Version } from 'projects/sigct-service-ng-lib/src/lib/version/version';
import { VersionService } from 'projects/sigct-service-ng-lib/src/lib/version/version.service';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import {forkJoin, Subscription} from 'rxjs';
import { getMenus } from '../../layouts/app-layout/menu';
import {InformationUtileDTO} from '../../../../../../sigct-service-ng-lib/src/lib/models/information-utile-dto';
import {ReferenceDTO} from '../../../../../../sigct-service-ng-lib/src/lib/models/reference-dto';
import {
  TableInformationsUtilesService
} from '../../../../../../sigct-service-ng-lib/src/lib/services/table-informations-utiles/table-informations-utiles-service';
import {ReferencesApiService} from '../../../../../../infosante-ng-core/src/lib/services/references-api.service';
import {FichiersApiService} from '../../../../../../sigct-service-ng-lib/src/lib/services/fichiers-api.service';

@Component({
  selector: 'app-accueil-usager-page',
  templateUrl: './accueil-usager-page.component.html',
  styleUrls: ['./accueil-usager-page.component.css']
})
export class AccueilUsagerPageComponent implements OnInit {

  /** Liste des imformations utiles */
  listeInformationsUtiles: InformationUtileDTO[];
  listeCategorie: ReferenceDTO[];

  nomEnvironnement: string;
  prenomNomUtilisateur: string;
  nomOrganismeCourant: string;
  nomRegionOrganismeCourant: string;
  topRightMenuItems: MenuItem[] = getMenus(window['env']).topRightMenuItems;
  urlUsagerApi: string = window['env'].urlUsager + '/api';
  version: Version;
  subscriptions: Subscription = new Subscription();

  constructor(private authenticationService: AuthenticationService,
    private versionService: VersionService,
    private tableInfoService: TableInformationsUtilesService,
    private referencesService: ReferencesApiService,
    private fichiersService: FichiersApiService,
    private router: Router) { }

  ngOnInit(): void {
    this.nomEnvironnement = window['env'].name;
    this.prenomNomUtilisateur = this.authenticationService.getAuthenticatedUser().prenom + ' ' + this.authenticationService.getAuthenticatedUser().nomFamille;
    this.nomOrganismeCourant = this.authenticationService.getAuthenticatedUser().nomOrganismeCourant;
    this.nomRegionOrganismeCourant = this.authenticationService.getAuthenticatedUser().nomRegionOrganismeCourant;
    this.subscriptions.add(
      forkJoin([
        this.tableInfoService.afficherLiensUtiles(),
        this.referencesService.getListeCategorieInforUtile(),
        this.versionService.loadVersion()
      ]).subscribe(result => {
        this.listeInformationsUtiles = result[0] as InformationUtileDTO[];
        this.listeCategorie = result[1] as ReferenceDTO[];
        this.version = result[2] as Version;
        if (this.listeInformationsUtiles.length == 0) {
          this.listeCategorie = undefined;
        }
      })
    );
  }

  rechercherUsager() {
    this.router.navigate(['recherche']);
  }

  suiviEnregistrementsUsager() {
    this.router.navigate(['suivi-enregistrements']);
  }

  consulterAlertesUsager() {
    this.router.navigate(['consulter-alertes']);
  }

  onTelechargerFichier(fichier: InformationUtileDTO) {
    const anchorElement = document.createElement('a');
    anchorElement.id = 'onTelechargerFichier' + fichier.fichierId;
    anchorElement.target = '_blank';
    anchorElement.href = this.fichiersService.getUrlBaseTelechargeAvecParametre(fichier.fichierId);
    anchorElement.click();
    anchorElement.remove();
  }
}
