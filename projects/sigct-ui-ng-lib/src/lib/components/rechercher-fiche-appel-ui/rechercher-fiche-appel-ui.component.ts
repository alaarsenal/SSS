import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { RechercheFicheAppelCollectionsDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-collections-dto';
import { NB_CAR_MIN_CRITERES, NB_ITEM_PAR_PAGE, RechercheFicheAppelCriteresDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import { AppelAnterieurDTO } from 'projects/usager-ng-core/src/lib/models';
import { Subscription } from 'rxjs';
import { User } from '../../../../../sigct-service-ng-lib/src/lib/auth/user';
import { InputOption } from '../../utils/input-option';
import { RechercheAppelantCriteresComponent } from '../recherche-appelant-criteres/recherche-appelant-criteres.component';
import { RechercheFicheAppelCriteresComponent } from '../recherche-fiche-appel-criteres/recherche-fiche-appel-criteres.component';
import { RechercheNoteComplementaireCriteresComponent } from '../recherche-note-complementaire-criteres/recherche-note-complementaire-criteres.component';
import { RechercheUsagerCriteresComponent } from '../recherche-usager-criteres/recherche-usager-criteres.component';

@Component({
  selector: 'app-rechercher-fiche-appel-ui',
  templateUrl: './rechercher-fiche-appel-ui.component.html',
  styleUrls: ['./rechercher-fiche-appel-ui.component.css'],
  providers: [DatePipe]
})
export class RechercherFicheAppelUiComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  nbItems: number = 0;    // Nombre total d'items trouvés
  pageIndex: number = 0;  // Index de la page affichée
  pageSize: number = NB_ITEM_PAR_PAGE;   // Nombre d'items par page

  resultats: AppelAnterieurDTO[] = [];
  resultatsAffiches: AppelAnterieurDTO[] = [];

  displayedColumns: string[] = ['dtDebutFicheAppel', 'sis', 'nom', 'prenom', 'sexe', 'telephoneAffiche', 'codeNomRegion', 'codePostalAffiche', 'actions'];

  idStOrganismeCourant: number = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;
  collapsedSectionNoteComplementaire: boolean = true;

  @Input()
  labelSectionCriteresFicheAppel: string;

  @Input()
  domaine: string;

  isStandardResearch: boolean = false; // True si l'usager a comme rôle ROLE_SA_APPEL_RECH ou ROLE_SO_APPEL_RECH uniquement

  _inputOptionCollections: RechercheFicheAppelCollectionsDTO;

  @Input()
  set inputOptionCollections(value: RechercheFicheAppelCollectionsDTO) {
    this.isStandardResearch = false;
    this._inputOptionCollections = value;
    if (this.domaine == 'SO') {
      this.isStandardResearch = !AuthenticationUtils.hasRole("ROLE_SO_APPEL_RECH_TOUS") && AuthenticationUtils.hasRole("ROLE_SO_APPEL_RECH");
    } else if (this.domaine == 'SA') {
      this.isStandardResearch = !AuthenticationUtils.hasRole("ROLE_SA_APPEL_RECH_TOUS") && AuthenticationUtils.hasRole("ROLE_SA_APPEL_RECH");
    }
    if (this.isStandardResearch && this._inputOptionCollections && this._inputOptionCollections.listeOrganisme && this._inputOptionCollections.listeIntervenant && this._inputOptionCollections.listeIntervenantNote) {
      const user: User = AuthenticationUtils.getUserFromStorage();
      let _optionsOrg: Array<InputOption> = [{ label: this.translateService.instant("option.select.message"), value: null }];
      _optionsOrg.push(...value?.listeOrganisme?.options?.filter((option: InputOption) => option.label == user?.nomOrganismeCourant));

      let _optionsInterv: Array<InputOption> = [{ label: this.translateService.instant("option.select.message"), value: null }];
      _optionsInterv.push(...value?.listeIntervenant.options?.filter((option: InputOption) => option.label.indexOf(user.nomFamille) !== -1 && option.label.indexOf(user.prenom) !== -1 && option.label.indexOf(user.name) !== -1));

      let _optionsIntervNote: Array<InputOption> = [{ label: this.translateService.instant("option.select.message"), value: null }];
      _optionsIntervNote.push(...value?.listeIntervenantNote.options?.filter((option: InputOption) => option.label.indexOf(user.nomFamille) !== -1 && option.label.indexOf(user.prenom) !== -1 && option.label.indexOf(user.name) !== -1));

      this._inputOptionCollections.listeOrganisme.options = _optionsOrg;
      this._inputOptionCollections.listeIntervenant.options = _optionsInterv;
      this._inputOptionCollections.listeIntervenantNote.options = _optionsIntervNote;
    }
  }

  @Input()
  criteresRecherche: RechercheFicheAppelCriteresDTO;

  @Output("consulterFicheAppel")
  consulterFicheAppelEvent: EventEmitter<AppelAnterieurDTO> = new EventEmitter();

  @Output("rechercherFicheAppel")
  rechercherFicheAppelEvent: EventEmitter<RechercheFicheAppelCriteresDTO> = new EventEmitter();

  @Output("exporterFicheAppel")
  exporterFicheAppelEvent: EventEmitter<RechercheFicheAppelCriteresDTO> = new EventEmitter();

  @Output("majListeIntervenant")
  majListeIntervenantEvent: EventEmitter<number> = new EventEmitter();

  @ViewChild("appRechercheFicheAppelCriteres", { static: true })
  appRechercheFicheAppelCriteres: RechercheFicheAppelCriteresComponent;

  @ViewChild("appRechercheUsagerCriteres")
  appRechercheUsagerCriteres: RechercheUsagerCriteresComponent;

  @ViewChild("appRechercheAppelantCriteres")
  appRechercheAppelantCriteres: RechercheAppelantCriteresComponent;

  @ViewChild("appRechercheNoteComplementaireCriteres")
  appRechercheNoteComplementaireCriteres: RechercheNoteComplementaireCriteresComponent;

  @ViewChild(MatTable, { static: true })
  table: MatTable<any>;

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService) {
  }

  ngOnInit(): void {
    this.alertStore.resetAlert();

    // Met le focus sur le premier champ de saisi.
    this.appRechercheFicheAppelCriteres.resetFocus();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Initialise les critères de recherche à partir des critères reçus en paramètre.
   */
  public initCritereRecherche(criteresRecherche: RechercheFicheAppelCriteresDTO, doRechercher: boolean) {
    if (criteresRecherche) {
      // Assigner les critères de recherches
      this.criteresRecherche = criteresRecherche;

      this.setPaginator(this.criteresRecherche.pageSize, this.criteresRecherche.pageIndex);

      this.setSort(this.criteresRecherche.champTri, (this.criteresRecherche.ordreTri == "desc" ? "desc" : "asc"))

      if (doRechercher) {
        this.rechercherFicheAppelEvent.emit(this.criteresRecherche);
      }
    }
  }

  /**
   * Pagination des résultats en mémoire après les avoir triés.
   */
  private paginerResultats() {
    this.resultatsAffiches = [];

    this.nbItems = 0;
    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize;

    if (this.resultats) {
      this.nbItems = this.resultats.length;

      let itemStart = this.paginator.pageIndex * this.paginator.pageSize;
      let itemEnd = itemStart + this.paginator.pageSize;

      if (this.nbItems < itemEnd) {
        itemEnd = this.nbItems;
      }

      this.trierResultats(this.sort);

      for (let i = itemStart; i < itemEnd; i++) {
        this.resultatsAffiches.push(this.resultats[i]);
      }
    }

    this.table.renderRows();
  }

  /**
   * Sauvegarde dans la session les critères de recherche.
   * @param critereRecherche 
   */
  private sauvegarderCritereRechercheAppel(critereRecherche: RechercheFicheAppelCriteresDTO) {
    sessionStorage.setItem("critereRechercheAppel" + this.domaine, JSON.stringify(critereRecherche));
  }

  /**
   * Permet de redéfinir la pagination.
   * @param pageSize 
   * @param pageIndex 
   */
  private setPaginator(pageSize: number, pageIndex: number): void {
    this.paginator._changePageSize(this.criteresRecherche.pageSize);

    this.paginator.pageIndex = this.criteresRecherche.pageIndex;
    this.paginator.page.next({
      pageIndex: pageIndex,
      pageSize: pageSize,
      length: this.paginator.length
    });

    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize;
  }

  /**
   * Permet de définir un nouveau tri.
   * Patch qui permet de contourner un problème avec Material. Lorsqu'on change le tri par programmation, 
   * le UI ne se met pas à jour automatiquement. Il faut effectuer la manipulation suivante et faire un appel 
   * à _setAnimationTransitionState() pour voir le nouveau tri apparaitre dans le header de la table.
   * REF: https://github.com/angular/components/issues/10242
   * @param id 
   * @param start 
   */
  private setSort(id: string, start?: 'asc' | 'desc') {
    start = start || 'asc';
    const toState = 'active';
    const disableClear = false;

    //reset state so that start is the first sort direction that you will see
    this.sort.sort({ id: null, start, disableClear });
    this.sort.sort({ id, start, disableClear });

    //ugly hack
    (this.sort.sortables.get(id) as MatSortHeader)._setAnimationTransitionState({ toState });
  }

  /**
   * Tri les résultats selon la valeur de "sort".
   * @param sort tri à appliquer
   */
  private trierResultats(sort: Sort): any {
    if (this.resultats) {
      this.resultats.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'dtDebutFicheAppel': return this.compare(a.dtDebutFicheAppel, b.dtDebutFicheAppel, isAsc);
          case 'sis': return this.compare(a.sis?.toLowerCase(), b.sis?.toLowerCase(), isAsc);
          case 'nom': return this.compare(a.nom?.toLowerCase(), b.nom?.toLowerCase(), isAsc);
          case 'prenom': return this.compare(a.prenom?.toLowerCase(), b.prenom?.toLowerCase(), isAsc);
          case 'sexe': return this.compare(a.sexe?.toLowerCase(), b.sexe?.toLowerCase(), isAsc);
          case 'telephoneAffiche': return this.compare(a.telephoneAffiche?.toLowerCase(), b.telephoneAffiche?.toLowerCase(), isAsc);
          case 'codeNomRegion': return this.compare(a.codeNomRegion?.toLowerCase(), b.codeNomRegion?.toLowerCase(), isAsc);
          case 'codePostalAffiche': return this.compare(a.codePostalAffiche?.toLowerCase(), b.codePostalAffiche?.toLowerCase(), isAsc);
          default: return 0;
        }
      });
    }
  }

  /**
   * Comparateur pour trier des appels antérieurs.
   * @param a 
   * @param b 
   * @param isAsc 
   */
  private compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    if (!a && !b) {
      return 0;
    }

    if (a && !b) {
      return -1;
    }

    if (!a && b) {
      return 1;
    }

    if (a === b) {
      return 0;
    }

    const result: number = (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    return result;
  }

  /**
   * Retourne true si aucun critère de recherche est saisi.
   */
  isCriteresEmpty(): boolean {
    return this.appRechercheFicheAppelCriteres.isEmpty() &&
      this.appRechercheUsagerCriteres.isEmpty() &&
      this.appRechercheAppelantCriteres.isEmpty() &&
      this.appRechercheNoteComplementaireCriteres.isEmpty();
  }

  /**
   * Notifie le parent qu'une consultation de fiche d'appel est demandée.
   * @param appelAnterieur appel antérieur à consulter
   */
  onConsulterFicheAppel(appelAnterieur: AppelAnterieurDTO): void {
    this.consulterFicheAppelEvent.emit(appelAnterieur);
  }

  /**
   * Lorsque l'utilisateur clique sur un header de colonne.
   */
  onHeaderClick() {
    // Si jamais on a des soucis de performance avec le tri en mémoire. 
    // On pourra faire une recherche sur le serveur avec le tri demandé et retirer le tri dans paginerResultats().
    //this.rechercherFicheAppelEvent.emit(this.criteresRecherche);
  }

  /**
   * Demande au parent de mettre à jour la liste des intervenants selon l'organisme idOrganisme.
   * @param idOrganisme 
   */
  onMajListeIntervenant(idOrganisme: number) {
    this.majProfessionalListNote();
    this.majListeIntervenantEvent.emit(idOrganisme);
  }

  onProfessionalChange(usernameIntervenant: string) {
    this.majProfessionalListNote();
  }

  private majProfessionalListNote(): void {
    if (this.isStandardResearch) {
      const user: User = AuthenticationUtils.getUserFromStorage();
      if (this.criteresRecherche.criteresAppel.idStOrganismes && this.criteresRecherche.criteresAppel.usernameIntervenant) {
        let _optionsIntervNote: Array<InputOption> = [{ label: this.translateService.instant("option.select.message"), value: null }];
        _optionsIntervNote.push(...this._inputOptionCollections?.listeIntervenantNote.options?.filter((option: InputOption) => option.label.indexOf(user.nomFamille) !== -1 && option.label.indexOf(user.prenom) !== -1 && option.label.indexOf(user.name) !== -1));
        this._inputOptionCollections.listeIntervenantNote.options = _optionsIntervNote;
        this.criteresRecherche.criteresNoteComplementaire.usernameIntervenantNote = _optionsIntervNote[1]?.value;
      } else {
        let _optionsIntervNote: Array<InputOption> = this._inputOptionCollections?.listeIntervenantNote.options?.filter((option: InputOption) => option.label.indexOf(user.nomFamille) !== -1 && option.label.indexOf(user.prenom) !== -1 && option.label.indexOf(user.name) !== -1);
        this._inputOptionCollections.listeIntervenantNote.options = _optionsIntervNote;
        this.criteresRecherche.criteresNoteComplementaire.usernameIntervenantNote = _optionsIntervNote[0]?.value;
      }
      this.collapsedSectionNoteComplementaire = false;
    }
  }

  /**
   * Lance la recherche après validation des critères.
   */
  onRechercher(): void {
    if (this.isCriteresEmpty()) {
      // Recherche: au moins un critère de recherche doit être saisi.
      this.subscriptions.add(
        this.materialModalDialogService.popupAvertissement("us-iu-e00019").subscribe()
      );
    } else {
      const ficheAppelValide: boolean = this.appRechercheFicheAppelCriteres.validerCriteres();
      const usagerValide: boolean = this.appRechercheUsagerCriteres.validerNbCarMinCriteres(NB_CAR_MIN_CRITERES);
      const appelantValide: boolean = this.appRechercheAppelantCriteres.validerCriteres(NB_CAR_MIN_CRITERES);
      const noteComplValide: boolean = this.appRechercheNoteComplementaireCriteres.validerCriteres();

      if (ficheAppelValide && usagerValide && appelantValide && noteComplValide) {
        this.alertStore.resetAlert();
        this.paginator.firstPage();

        this.sauvegarderCritereRechercheAppel(this.criteresRecherche);

        // Lancer la recherche.
        this.updateCriteresRechercheWithExportationData();
        this.rechercherFicheAppelEvent.emit(this.criteresRecherche);
      } else {
        // Si des critères sont non valides, ils sont allumés en rouge lors de la validation.
        // On ne fait pas la recherche.
      }
    }
  }

  private updateCriteresRechercheWithExportationData(): void {
    if (this.criteresRecherche?.criteresAppel?.idRfRoleAction) {
      let idRfRoleAction = this.criteresRecherche.criteresAppel.idRfRoleAction;
      let roleActionText = this._inputOptionCollections.listeRoleAction.options.find(e => e.value == String(idRfRoleAction))?.label;
      this.criteresRecherche.criteresAppel.roleActionText = roleActionText;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfRaisonAppels) {
      let idRfRaisonAppels = this.criteresRecherche.criteresAppel.idRfRaisonAppels;
      let raisonAppelTexts: string[] = [];
      if (idRfRaisonAppels && idRfRaisonAppels.length > 0) {
        idRfRaisonAppels.forEach((idRfRaisonAppel: any) => {
          let raisonAppelText = this._inputOptionCollections.listeRaisonAppel.options.find(e => e.value == String(idRfRaisonAppel))?.label;
          raisonAppelTexts.push(raisonAppelText);
        });
      }
      this.criteresRecherche.criteresAppel.raisonAppelTexts = raisonAppelTexts;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfReference) {
      let idRfReference = this.criteresRecherche.criteresAppel.idRfReference;
      let referenceText = this._inputOptionCollections.listeReference.options.find(e => e.value == String(idRfReference))?.label;
      this.criteresRecherche.criteresAppel.referenceText = referenceText;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfLangueAppel) {
      let idRfLangueAppel = this.criteresRecherche.criteresAppel.idRfLangueAppel;
      let langueAppelText = this._inputOptionCollections.listeLangueAppel.options.find(e => e.value == String(idRfLangueAppel))?.label;
      this.criteresRecherche.criteresAppel.langueAppelText = langueAppelText;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfNivUrgence) {
      let idRfNivUrgence = this.criteresRecherche.criteresAppel.idRfNivUrgence;
      let nivUrgenceText = this._inputOptionCollections.listeNiveauUrgence.options.find(e => e.value == String(idRfNivUrgence))?.label;
      this.criteresRecherche.criteresAppel.nivUrgenceText = nivUrgenceText;
    }

    if (this.criteresRecherche?.criteresAppel?.usernameIntervenant) {
      let usernameIntervenant = this.criteresRecherche.criteresAppel.usernameIntervenant;
      let intervenantText = this._inputOptionCollections.listeIntervenant.options.find(e => e.value == String(usernameIntervenant))?.label;
      this.criteresRecherche.criteresAppel.intervenantText = intervenantText;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfOrientation) {
      let idRfOrientation = this.criteresRecherche.criteresAppel.idRfOrientation;
      let orientationText = this._inputOptionCollections.listeOrientation.options.find(e => e.value == String(idRfOrientation))?.label;
      this.criteresRecherche.criteresAppel.orientationText = orientationText;
    }

    if (this.criteresRecherche?.criteresAppel?.idStOrganismes) {
      let idStOrganismes = this.criteresRecherche.criteresAppel.idStOrganismes;
      let organismeText = this._inputOptionCollections.listeOrganisme.options.find(e => e.value == String(idStOrganismes))?.label;
      this.criteresRecherche.criteresAppel.organismeText = organismeText;
    }

    if (this.criteresRecherche?.criteresAppel?.idRfCentreActivite) {
      let idRfCentreActivite = this.criteresRecherche.criteresAppel.idRfCentreActivite;
      let centreActiviteText = this._inputOptionCollections.listeCentreActivite.options.find(e => e.value == String(idRfCentreActivite))?.label;
      this.criteresRecherche.criteresAppel.centreActiviteText = centreActiviteText;
    }

    if (this.criteresRecherche?.criteresUsager?.langueCode) {
      let langueCode = this.criteresRecherche.criteresUsager.langueCode;
      let langueUsagerText = this._inputOptionCollections.listeLangueUsage.options.find(e => e.value == String(langueCode))?.label;
      this.criteresRecherche.criteresUsager.langueUsagerText = langueUsagerText;
    }

    if (this.criteresRecherche?.criteresUsager?.sexeCode) {
      let sexeCode = this.criteresRecherche.criteresUsager.sexeCode;
      let sexeUsagerText = this._inputOptionCollections.listeSexe.options.find(e => e.value == String(sexeCode))?.label;
      this.criteresRecherche.criteresUsager.sexeUsagerText = sexeUsagerText;
    }

    if (this.criteresRecherche?.criteresUsager?.regionCode) {
      let regionCode = this.criteresRecherche.criteresUsager.regionCode;
      let regionUsagerText = this._inputOptionCollections.listeRegion.options.find(e => e.value == String(regionCode))?.label;
      this.criteresRecherche.criteresUsager.regionUsagerText = regionUsagerText;
    }

    if (this.criteresRecherche?.criteresUsager?.idRfGroupeAge) {
      let groupeAge = this.criteresRecherche.criteresUsager.idRfGroupeAge;
      let groupeAgeText = this._inputOptionCollections.listeGroupeAge.options.find(e => e.value == String(groupeAge))?.label;
      this.criteresRecherche.criteresUsager.groupeAgeText = groupeAgeText;
    }

    if (this.criteresRecherche?.criteresAppelant?.idRfCatgrAppelant) {
      let idRfCatgrAppelant = this.criteresRecherche.criteresAppelant.idRfCatgrAppelant;
      let catgrAppelantText = this._inputOptionCollections.listeCategorieAppelant.options.find(e => e.value == String(idRfCatgrAppelant))?.label;
      this.criteresRecherche.criteresAppelant.catgrAppelantText = catgrAppelantText;
    }

    if (this.criteresRecherche?.criteresNoteComplementaire?.usernameIntervenantNote) {
      let usernameIntervenantNote = this.criteresRecherche.criteresNoteComplementaire?.usernameIntervenantNote;
      let intervenantNoteText = this._inputOptionCollections.listeIntervenantNote.options.find(e => e.value == String(usernameIntervenantNote))?.label;
      this.criteresRecherche.criteresNoteComplementaire.intervenantNoteText = intervenantNoteText;
    }

    if (this.criteresRecherche?.criteresNoteComplementaire?.idRfTypeNote) {
      let idRfTypeNote = this.criteresRecherche.criteresNoteComplementaire?.idRfTypeNote;
      let typeNoteTexte = this._inputOptionCollections.listeTypeNote.options.find(e => e.value == String(idRfTypeNote))?.label;
      this.criteresRecherche.criteresNoteComplementaire.typeNoteTexte = typeNoteTexte;
    }

  }

  /**
   * Réinitialise les critères de recherche de toutes les sections. Vide les résultats de recherche.
   */
  onReinitialiser(): void {
    // Vide les messages affichés.
    this.alertStore.resetAlert();

    // Vide les critères.
    this.appRechercheFicheAppelCriteres.viderCriteres();
    this.appRechercheUsagerCriteres.viderCriteres();
    this.appRechercheAppelantCriteres.viderCriteres();
    if (this.isStandardResearch) {
      this.collapsedSectionNoteComplementaire = true;
    }
    this.appRechercheNoteComplementaireCriteres.viderCriteres();

    // Met le focus sur le premier champ de saisi.
    this.appRechercheFicheAppelCriteres.resetFocus();

    // Vide les résultats.
    this.resultats = [];
    this.paginator.firstPage();
    this.paginerResultats();
  }

  /**
   * Lorsque la pagination change. On rafraichit le contenu de la table.
   * @param event 
   */
  onPageChange(event: PageEvent) {
    this.criteresRecherche.pageIndex = event.pageIndex;
    this.criteresRecherche.pageSize = event.pageSize;
    this.sauvegarderCritereRechercheAppel(this.criteresRecherche);

    this.paginerResultats();
  }

  /**
   * Lorsque la colonne triée change. 
   * @param event 
   */
  onSortChange(event: Sort) {
    // Si "active" est null, c'est que l'appel provient de la patch this.setSort(). 
    // Il s'agit d'un sort transitoire qui permet de retirer l'ancien tri dans le header. 
    // On ne sauvegarde pas et on ne trie pas les résultats dans ce cas précis.
    if (event?.active) {
      this.criteresRecherche.champTri = event.active;
      this.criteresRecherche.ordreTri = event.direction;
      this.sauvegarderCritereRechercheAppel(this.criteresRecherche);

      this.paginerResultats();
    }
  }

  /**
   * Met à jour les résultats de recherche.
   * @param resultatsRecherche 
   */
  public setResultatsRecherche(resultatsRecherche: AppelAnterieurDTO[]) {
    if (resultatsRecherche) {
      if (resultatsRecherche.length > this.criteresRecherche.nbResultatMax) {
        this.subscriptions.add(
          // Recherche: le nombre de résultats dépasse la limite permise.
          this.materialModalDialogService.popupAvertissement("us-iu-e00018").subscribe()
        );
      } else {
        this.resultats = resultatsRecherche;
        this.paginerResultats();
      }
    }
  }

  /**
   *  Lancer l'exportation du contenu de la recherche vers un Excel fichier
   */
  onExporter() {
    this.exporterFicheAppelEvent.emit(this.criteresRecherche);
  }
}
