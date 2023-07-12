import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services/references-api.service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { RechercheFicheAppelCollectionsDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-collections-dto';
import { RechercheFicheAppelCriteresDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { RechercherFicheAppelUiComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/rechercher-fiche-appel-ui/rechercher-fiche-appel-ui.component';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { AppelAnterieurDTO, ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExportationExcelDTO } from 'projects/usager-ng-core/src/lib/models/exportation-excel-dto';

/** "critereRechercheAppelSO" */
const CRITERE_RECHERCHE_STORAGE: string = "critereRechercheAppelSO";
/** "SO" */
const DOMAINE_SO: string = "SO";

@Component({
  selector: 'app-rechercher-fiche-appel-page',
  templateUrl: './rechercher-fiche-appel-page.component.html',
  styleUrls: ['./rechercher-fiche-appel-page.component.css']
})
export class RechercherFicheAppelPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-search fa-lg" },
    actions: []
  };

  leftMenuItems: MenuItem[] = [
    {
      id: "menuItemRechercherFicheAppelPageComponentRechercherId",
      title: "sigct.so.r_appels.titre",
      link: "/rechercher",
      icon: "fa fa-search",
      disabled: false,
      visible: true
    },
  ];

  // Contenu des listes déroulantes
  rechercheFicheAppelCollections: RechercheFicheAppelCollectionsDTO = new RechercheFicheAppelCollectionsDTO();

  // Critères de recherche
  rechercheFicheAppelCriteres: RechercheFicheAppelCriteresDTO = new RechercheFicheAppelCriteresDTO();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  @ViewChild("appRechercherFicheAppelUi", { static: true })
  rechercherFicheAppelUiComponent: RechercherFicheAppelUiComponent;

  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private router: Router,
    private translateService: TranslateService,
    private referencesApiService: ReferencesApiService,
    private referencesUsagerApiService: ReferencesService,
    private ficheAppelApiService: FicheAppelApiService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );

    // Récupère l'id de l'organisme de l'utilsateur connecté.
    const idStOrganismeCourant: number = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;
    const intervenantCourant: string = AuthenticationUtils.getUserFromStorage()?.name;

    // Dans un forkjoin, il faut ajouter .pipe(catchError(e => of(null))) à chaque observable appelé,
    // sinon une erreur dans un de ceux-ci annule l'exécution de tous les autres.
    // catchError(e => of(null)) permet de retourner un observable null plutôt qu'une erreur qui arrête tout.
    this.subscriptions.add(
      forkJoin([
        this.referencesApiService.getListeRoleAction(true).pipe(catchError(e => of(null))),   // 0
        this.referencesApiService.getListeRaisonAppel(true).pipe(catchError(e => of(null))),  // 1
        this.referencesApiService.getListeLangueAppel(true).pipe(catchError(e => of(null))),  // 2
        this.referencesApiService.getListeOrientation(true).pipe(catchError(e => of(null))),  // 3
        this.referencesApiService.getListeIntervenantOrganismeWithRole(idStOrganismeCourant, "SO_APPEL_MODIF", true).pipe(catchError(e => of(null))), // 4
        this.referencesApiService.getListeReference(true).pipe(catchError(e => of(null))),    // 5
        this.referencesApiService.getListeOrganisme().pipe(catchError(e => of(null))),        // 6

        this.referencesUsagerApiService.getListeLangue(true).pipe(catchError(e => of(null))), // 7
        this.referencesUsagerApiService.getListeRegion(true).pipe(catchError(e => of(null))), // 8
        this.referencesUsagerApiService.getListeSexe(true).pipe(catchError(e => of(null))),   // 9

        this.referencesApiService.getListeCategorieAppelant(true).pipe(catchError(e => of(null))),  // 10

        this.referencesApiService.getListeTypeNote(true).pipe(catchError(e => of(null))),           // 11
        this.referencesApiService.getListeIntervenantOrganismeWithRole(idStOrganismeCourant, "SO_APPEL_NOTE", true).pipe(catchError(e => of(null))), // 12
        this.referencesApiService.getListeCentreActivite().pipe(catchError(e => of(null))),  // 13

        this.referencesUsagerApiService.getListeGroupeDAge().pipe(catchError(e => of(null))) // 14

      ]).subscribe((results) => {
        const userHasRoleRechTous: boolean = AuthenticationUtils.hasRole("ROLE_SO_APPEL_RECH_TOUS");

        this.rechercheFicheAppelCollections = new RechercheFicheAppelCollectionsDTO();
        // Consultation
        this.rechercheFicheAppelCollections.listeRoleAction = this.referencesToInputOptionCollection("roles-action", results[0] as ReferenceDTO[], true);
        this.rechercheFicheAppelCollections.listeRaisonAppel = this.referencesToInputOptionCollection("raisons-appel", results[1] as ReferenceDTO[], false);
        this.rechercheFicheAppelCollections.listeLangueAppel = this.referencesToInputOptionCollection("langues-appel", results[2] as ReferenceDTO[], true);
        this.rechercheFicheAppelCollections.listeOrientation = this.referencesToInputOptionCollection("orientations", results[3] as ReferenceDTO[], true, true);
        let listeIntervenant: ReferenceDTO[] = results[4] as ReferenceDTO[];
        this.ajouterNomOrganismeAuxNomIntervenant(listeIntervenant);
        // Ajoute l'option "Sélectionnez..." uniquement si l'utilisateur possède le rôle SO_APPEL_RECH_TOUS
        this.rechercheFicheAppelCollections.listeIntervenant = this.referencesToInputOptionCollection("intervenant", listeIntervenant, userHasRoleRechTous);
        this.rechercheFicheAppelCollections.listeReference = this.referencesToInputOptionCollection("reference", results[5] as ReferenceDTO[], true, true);
        // Ajoute l'option "Sélectionnez..." uniquement si l'utilisateur possède le rôle SO_APPEL_RECH_TOUS
        this.rechercheFicheAppelCollections.listeOrganisme = this.referencesToInputOptionCollection("organisme", results[6] as ReferenceDTO[], userHasRoleRechTous);

        this.rechercheFicheAppelCollections.listeAucuneSuite = {
          name: "aucune-suite",
          options: [{ label: "sigct.ss.r_appels.sctn_criteres_consultation.aucunesuite", value: "false" }]
        };
        this.rechercheFicheAppelCollections.listeAucuneInteraction = {
          name: "aucune-interaction",
          options: [{ label: "sigct.ss.r_appels.sctn_criteres_consultation.aucuninteraction", value: "false" }]
        };
        this.rechercheFicheAppelCollections.listeCentreActivite = this.referencesToInputOptionCollection("centre-activite", results[13] as ReferenceDTO[], userHasRoleRechTous);


        // Usager
        this.rechercheFicheAppelCollections.listeLangueUsage = this.referencesToInputOptionCollection("langue-usage", results[7] as ReferenceDTO[], true);
        this.rechercheFicheAppelCollections.listeRegion = this.referencesToInputOptionCollection("region", results[8] as ReferenceDTO[], true);
        this.rechercheFicheAppelCollections.listeSexe = this.referencesToInputOptionCollection("sexe", results[9] as ReferenceDTO[], true);
        this.rechercheFicheAppelCollections.listeGroupeAge = this.referencesToInputOptionCollection("groupe-age", results[14] as ReferenceDTO[], true);

        const lblMalentendant: string = this.translateService.instant("usager.recherche.chkmalentendant");
        this.rechercheFicheAppelCollections.listeMalentendant = {
          name: "malentendant",
          options: [{ label: lblMalentendant, value: "false" }]
        };

        // Appelant
        this.rechercheFicheAppelCollections.listeCategorieAppelant = this.referencesToInputOptionCollection("categorie-appelant", results[10] as ReferenceDTO[], true);

        // Note complémentaire
        this.rechercheFicheAppelCollections.listeTypeNote = this.referencesToInputOptionCollection("type-note", results[11] as ReferenceDTO[], true);
        let listeIntervenantNote: ReferenceDTO[] = results[12] as ReferenceDTO[];
        this.ajouterNomOrganismeAuxNomIntervenant(listeIntervenantNote);
        this.rechercheFicheAppelCollections.listeIntervenantNote = this.referencesToInputOptionCollection("intervenant-note", listeIntervenantNote, true);

        // Récupère les derniers critères de recherche utilisés dans la session.
        this.rechercheFicheAppelCriteres = this.getLastCritereRechercheAppel();
        if (this.rechercheFicheAppelCriteres?.domaine == DOMAINE_SO) {
          // Initialise les critères avec ceux récupérés de la session et lance une recherche avec ceux-ci.
          this.rechercherFicheAppelUiComponent.initCritereRecherche(this.rechercheFicheAppelCriteres, true);
        } else {
          // Aucun critère dans la session, on en crée avec des valeurs par défaut.
          this.rechercheFicheAppelCriteres = new RechercheFicheAppelCriteresDTO();
          this.rechercheFicheAppelCriteres.domaine = DOMAINE_SO;
          this.rechercheFicheAppelCriteres.criteresAppel.idStOrganismes = idStOrganismeCourant;
          this.rechercheFicheAppelCriteres.criteresAppel.usernameIntervenant = intervenantCourant;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
    this.subscriptions.unsubscribe();
  }

  /**
   * Lorsqu'une consultation de fiche est demadée, on navigue vers la consultation.
   * @param appelAnterieur
   */
  onConsulterFicheAppel(appelAnterieur: AppelAnterieurDTO): void {
    this.router.navigate(["/consulter", "appel", appelAnterieur.idAppel, "fiche", appelAnterieur.idFicheAppel]);
  }

  onMajListeIntervenant(idStOrganisme: number) {
    // #5755 : listeIntervenant contient toujours la liste des intervenants de l'organisme connecté
    // this.subscriptions.add(
    //   this.referencesApiService.getListeIntervenantOrganismeWithRole(idStOrganisme, "SO_APPEL_MODIF", true).subscribe((result: ReferenceDTO[]) => {
    //     const userHasRoleRechTous: boolean = AuthenticationUtils.hasRole("ROLE_SO_APPEL_RECH_TOUS");
    //     // Ajoute l'option "Sélectionnez..." uniquement si l'utilisateur possède le rôle SO_APPEL_RECH_TOUS
    //     this.rechercheFicheAppelCollections.listeIntervenant = this.referencesToInputOptionCollection("intervenant", result, true);
    //   })
    // );
  }

  /**
   * Lance la recherche des appels entérieurs selon les critères reçus en paramètre.
   * @param criteresRechercheFicheAppel
   */
  onRechercherFicheAppel(criteresRechercheFicheAppel: RechercheFicheAppelCriteresDTO): void {
    this.subscriptions.add(
      this.ficheAppelApiService.rechercherAppelAnterieur(criteresRechercheFicheAppel)
        .subscribe((appels: AppelAnterieurDTO[]) => {
          this.rechercherFicheAppelUiComponent.setResultatsRecherche(appels);
        })
    );
  }

  /**
   * Lancer l'exportation du contenu de la table de recherche des fiches en Excel fichier
   * @param criteresRechercheFicheAppel
   */
  exporter(criteresRecherche: RechercheFicheAppelCriteresDTO): void {
    this.subscriptions.add(
      this.ficheAppelApiService.genererExcelAppelAnterieur(criteresRecherche)
        .subscribe((result: ExportationExcelDTO) => {
          if (result) {
            this.ficheAppelApiService.convertByteDataToExcelAndMakeDownload(result.fileContent, result.fileName);
          }
        })
    );
  }

  /**
   * Ajoute le numéro et le nom de l'organisme connecté dans le nom de chacun des intervenant de la liste. 
   * @param listeIntervenant 
   */
  private ajouterNomOrganismeAuxNomIntervenant(listeIntervenant: ReferenceDTO[]): void {
    if (CollectionUtils.isNotBlank(listeIntervenant)) {
      const utilisateurConnecte: User = AuthenticationUtils.getUserFromStorage();
      const nomOrganismeCourant: string = utilisateurConnecte?.codRegionOrganismeCourant + " - " + utilisateurConnecte?.nomOrganismeCourant;

      listeIntervenant.forEach((intervenant: ReferenceDTO) => {
        intervenant.nom = intervenant.nom + " " + nomOrganismeCourant;
      });
    }
  }

  /**
   * Récupère les derniers critères de recherche sauvegarés en session.
   */
  private getLastCritereRechercheAppel(): RechercheFicheAppelCriteresDTO | null {
    const critereRechercheAppel: string = sessionStorage.getItem(CRITERE_RECHERCHE_STORAGE);
    if (critereRechercheAppel) {
      return <RechercheFicheAppelCriteresDTO>JSON.parse(critereRechercheAppel);
    }
    return null;
  }

  /**
   * Transform une liste de ReferenceDTO en un InputOptionCollection.
   * @param nomCollection nom de la collection
   * @param values liste de ReferenceDTO à inclure dans la collection
   * @param ajouterNull indique si on ajoute une valeur null à la collection
   * @param afficherCodeCN indique si le code CN doit être ajouté au libellé. "false" par défaut
   */
  private referencesToInputOptionCollection(nomCollection: string, values: ReferenceDTO[], ajouterNull: boolean, afficherCodeCN: boolean = false): InputOptionCollection {
    let inputOptionCollection: InputOptionCollection = {
      name: nomCollection,
      options: []
    }

    if (ajouterNull) {
      const selectMsg: string = this.translateService.instant("option.select.message");
      inputOptionCollection.options.push({ label: selectMsg, value: null });
    }

    if (values) {
      values.forEach(item => {
        inputOptionCollection.options.push({
          label: (afficherCodeCN ? item.codeCn + " - " + item.nom : item.nom),
          value: (item.id || item.id == 0 ? '' + item.id : item.code),
          description: item.description,
          actif: item.actif
        });
      });
    }

    return inputOptionCollection;
  }
}
