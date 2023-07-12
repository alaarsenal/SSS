import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppelRechDTO } from 'projects/isiswhisto-ng-core/src/lib/models';
import { ClientDTO } from 'projects/isiswhisto-ng-core/src/lib/models/client-dto';
import { CritereRechercheDTO } from 'projects/isiswhisto-ng-core/src/lib/models/critere-recherche-dto';
import { GenderDTO } from 'projects/isiswhisto-ng-core/src/lib/models/gender-dto';
import { RechercheIsiswCollectionsDTO } from 'projects/isiswhisto-ng-core/src/lib/models/recherche-isisw-collections-dto';
import { RegionDTO } from 'projects/isiswhisto-ng-core/src/lib/models/region-dto';
import { ResultatRechercheDTO } from 'projects/isiswhisto-ng-core/src/lib/models/resultat-recherche-dto';
import { UserDTO } from 'projects/isiswhisto-ng-core/src/lib/models/user-dto';
import { IsiswApiService } from 'projects/isiswhisto-ng-core/src/lib/services/isiswhisto-api.service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { forkJoin, Subscription } from 'rxjs';

const NB_MAX_ROWS: number = 1000;
const DEFAULT_PAGE_SIZE: number = 50;
const DEFAULT_SORT_FIELD: string = "sortField";
const DEFAULT_SORT_DIRECTION: string = "desc";
/** "critereRechercheAppelSA" */
const CRITERE_RECHERCHE_STORAGE: string = "critereRechercheAppelISISW";

@Component({
  selector: 'app-rechercher-isisw-page',
  templateUrl: './rechercher-isisw-page.component.html',
  styleUrls: ['./rechercher-isisw-page.component.css']
})
export class RechercherIsiswPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  leftMenuItems: MenuItem[] = [
    {
      id: "left-menu-item-rechercher",
      title: "sigct.ss.r_appelsisisw.menuvert.btnrechercherinfobulle",
      link: "/rechercher",
      icon: "fa fa-search",
      disabled: false,
      visible: true
    },
  ];

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-search fa-lg" },
    actions: []
  };

  critereRechercheDto: CritereRechercheDTO = new CritereRechercheDTO(); // Criterias object
  rechercheIsiswCollectionsDto: RechercheIsiswCollectionsDTO = new RechercheIsiswCollectionsDTO(); // Dropdown lists contents
  resultatRechercheDto: ResultatRechercheDTO = new ResultatRechercheDTO(); // Search results

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private router: Router,
    private translateService: TranslateService,
    private isiswApiService: IsiswApiService,
    private materialModalDialogService: MaterialModalDialogService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );

    this.initTopBar();
    this.initDropDownCollections();
    this.initResultatRecherche();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Envoie un message de fermeture au iFrame.
   */
  close = (): void => {
    sessionStorage.clear();
    window.parent.postMessage("close", '*')
  }

  /**
   * Lorsqu'une consultation de fiche est demadée, on navigue vers la consultation.
   * @param appel
   */
  onConsulterAppel(appel: AppelRechDTO): void {
    this.router.navigate(["/consulter", appel.callId]);
  }

  /**
   * Lorsqu'une recherche d'appels est demandé.
   * @param criteres
   */
  onRechercher(criteres: CritereRechercheDTO): void {
    // Sauvegarde les critères en session
    this.setCritereRechercheEnSession(criteres);

    // Lance la recherche
    this.rechercher(criteres);
  }

  /**
   * Réinitialise les critères de recherche.
   */
  onReinitialiserCriteres(): void {
    sessionStorage.removeItem(CRITERE_RECHERCHE_STORAGE);
    this.initDropDownCollections();
    this.initResultatRecherche();
  }

  /**
   * Lorsque le service change, on met à jour la liste des professionnels.
   * @param clientId identifiant du service sélectionné
   */
  onServiceChange(clientId: string): void {
    if (clientId) {
      this.isiswApiService.getAllUserByClientId(+clientId).subscribe((listeUser: UserDTO[]) => {
        this.rechercheIsiswCollectionsDto.listeProfessionnel = this.listeUserToProfessionnelInputOptionCollection(listeUser);
      });
    } else {
      // Vide la liste des professionnels si aucun service n'est sélectionné.
      this.rechercheIsiswCollectionsDto.listeProfessionnel = this.listeUserToProfessionnelInputOptionCollection([]);
    }
  }

  /**
   * Recherche les appels.
   * @param criteres
   */
  rechercher(criteres: CritereRechercheDTO): void {
    this.subscriptions.add(
      this.isiswApiService.rechercherAppels(criteres).subscribe((resultat: ResultatRechercheDTO) => {
        if (resultat.nbTotalElements >= NB_MAX_ROWS) {
          // Recherche: le nombre de résultats dépasse la limite permise.
          this.subscriptions.add(
            this.materialModalDialogService.popupErreur("ss-iu-e11075").subscribe()
          );

          this.initResultatRecherche();
        } else {
          this.resultatRechercheDto = resultat;
        }
      })
    );
  }

  /**
   * Récupère les derniers critères de recherche sauvegarés en session.
   */
  private getCritereRechercheEnSession(): CritereRechercheDTO | null {
    const critereRecherche: string = sessionStorage.getItem(CRITERE_RECHERCHE_STORAGE);
    if (critereRecherche) {
      return <CritereRechercheDTO>JSON.parse(critereRecherche);
    }
    return null;
  }

  /**
   * Sauvegarde les critères de recherche en session.
   * @param critereRecherche
   */
  private setCritereRechercheEnSession(critereRecherche: CritereRechercheDTO): void {
    sessionStorage.setItem(CRITERE_RECHERCHE_STORAGE, JSON.stringify(critereRecherche));
  }

  /**
   * Vérifie si l'application s'exécute dans un iFrame.
   * @returns
   */
  private isInFrame(): boolean {
    return window !== window.parent;
  }

  private initDropDownCollections(): void {
    const codeRegionOrganismeCourant: string = AuthenticationUtils.getUserFromStorage()?.codRegionOrganismeCourant;
    const isRechercheTous: boolean = AuthenticationUtils.hasAnyRole(['ROLE_SA_APPEL_RECH_ISISW_TOUS', 'ROLE_SO_APPEL_RECH_ISISW_TOUS']);

    let regionId: number = null;
    if (!isRechercheTous) {
      // Si pas recherche TOUS, on récupère les services (clients) de la région de l'utilisateur connecté. Une région = un service.
      regionId = +codeRegionOrganismeCourant;
    }

    // IMPORTANT: On utilise le codeRegionOrganismeCourant en lieu de regionId. C'est voulu, il a été convenu
    // que le region_id dans ISISW correspondra toujours au code_region de SIGCT.
    this.isiswApiService.getAllClientByRegionId(regionId).subscribe((listeClient: ClientDTO[]) => {
      const lastCritereRecherche: CritereRechercheDTO = this.getCritereRechercheEnSession();

      let clientId: number = null;
      if (lastCritereRecherche) {
        clientId = lastCritereRecherche.idRegionTraitAppel;
      } else if (codeRegionOrganismeCourant) {
        // Recherche le service de l'utilisateur connecté pour obtenir son id.
        const clientDto: ClientDTO = listeClient.find((client: ClientDTO) => client.regionId == +codeRegionOrganismeCourant);
        clientId = clientDto?.clientId;
      }

      this.rechercheIsiswCollectionsDto.listeService = this.listeClientToServiceInputOptionCollection(listeClient);

      forkJoin([
        this.isiswApiService.getAllGender(), // 0
        this.isiswApiService.getAllRegion(), // 1
        this.isiswApiService.getAllUserByClientId(clientId), // 2
      ]).subscribe((results) => {
        this.rechercheIsiswCollectionsDto.listeSexe = this.listeGenderToSexeInputOptionCollection(results[0] as GenderDTO[]);
        this.rechercheIsiswCollectionsDto.listeRegionResidence = this.listeRegionToRegionInputOptionCollection(results[1] as RegionDTO[]);
        this.rechercheIsiswCollectionsDto.listeProfessionnel = this.listeUserToProfessionnelInputOptionCollection(results[2] as UserDTO[]);

        if (lastCritereRecherche) {
          this.critereRechercheDto = lastCritereRecherche;

          this.rechercher(lastCritereRecherche);
        } else {
          this.critereRechercheDto = new CritereRechercheDTO();
          this.critereRechercheDto.page = 0;
          this.critereRechercheDto.pageSize = DEFAULT_PAGE_SIZE;
          this.critereRechercheDto.sortDirection = DEFAULT_SORT_DIRECTION;
          this.critereRechercheDto.sortField = DEFAULT_SORT_FIELD;
          this.critereRechercheDto.nbMaxRows = NB_MAX_ROWS;

          // Sélectionne par défaut dans les critères la région de l'utilisateur connecté.
          this.critereRechercheDto.idRegionTraitAppel = clientId;
        }
      });
    });
  }

  /**
   * Initialise le résultat de la recherche avec une liste vide.
   */
  private initResultatRecherche(): void {
    this.resultatRechercheDto.listeAppel = [];
    this.resultatRechercheDto.nbTotalElements = 0;
  }

  /**
   * Initialise le contenu de la barre de titre.
   */
  private initTopBar() {
    let topBarActions: Action[] = [];
    // Affiche le bouton Retour uniquement lorsque l'application est ouverte dans un iFrame.
    if (this.isInFrame()) {
      let actionReturn: Action = {
        tooltip: this.translateService.instant("sigct.ss.r_appelsisisw.btnrevenir.infobulle"),
        actionFunction: this.close,
        icon: "fa fa-times fa-lg",
        compId: 'btn-retour',
        extraClass: "btn-default btn-auto-disabled"
      };
      topBarActions.push(actionReturn);
    }
    this.formTopBarOptions.actions = topBarActions;
  }

  private listeGenderToSexeInputOptionCollection(listeGender: GenderDTO[]): InputOptionCollection {
    let inputOptionCollection: InputOptionCollection = {
      name: "sexe",
      options: [{ label: this.translateService.instant("sigct.ss.label.selectionnez"), value: null }]
    };

    if (CollectionUtils.isNotBlank(listeGender)) {
      listeGender.forEach((gender: GenderDTO) => {
        inputOptionCollection.options.push({
          label: gender.genderNom,
          value: gender.genderCode,
          description: "",
          actif: gender.actif
        });
      });
    }
    return inputOptionCollection;
  }

  private listeRegionToRegionInputOptionCollection(listeRegion: RegionDTO[]): InputOptionCollection {
    let inputOptionCollection: InputOptionCollection = {
      name: "region",
      options: [{ label: this.translateService.instant("sigct.ss.label.selectionnez"), value: null }]
    };

    if (CollectionUtils.isNotBlank(listeRegion)) {
      listeRegion.forEach((region: RegionDTO) => {
        const nomRegion = StringUtils.padLeftZeros(region.regionId, 2) + ' - ' + region.name;

        inputOptionCollection.options.push({
          label: nomRegion,
          value: "" + region.regionId,
          description: "",
          actif: true
        });
      });
    }
    return inputOptionCollection;
  }

  private listeUserToProfessionnelInputOptionCollection(listeUser: UserDTO[]): InputOptionCollection {
    let inputOptionCollection: InputOptionCollection = {
      name: "professionnel",
      options: [{ label: this.translateService.instant("sigct.ss.label.selectionnez"), value: null }]
    };

    if (CollectionUtils.isNotBlank(listeUser)) {
      listeUser.forEach((user: UserDTO) => {
        const name: string = (user.lastname ? user.lastname + ", " : "") + (user.firstname ? user.firstname : "") + " (" + user.username + ") " + user.clientName;
        inputOptionCollection.options.push({
          label: name,
          value: user.username,
          description: "",
          actif: true
        });
      });
    }
    return inputOptionCollection;
  }

  private listeClientToServiceInputOptionCollection(listeClient: ClientDTO[]): InputOptionCollection {
    let inputOptionCollection: InputOptionCollection = {
      name: "service",
      options: [{ label: this.translateService.instant("sigct.ss.label.selectionnez"), value: null }]
    };

    if (CollectionUtils.isNotBlank(listeClient)) {
      listeClient.forEach((client: ClientDTO) => {
        inputOptionCollection.options.push({
          label: client.name,
          value: "" + client.clientId,
          description: "",
          actif: true
        });
      });
    }
    return inputOptionCollection;
  }
}
