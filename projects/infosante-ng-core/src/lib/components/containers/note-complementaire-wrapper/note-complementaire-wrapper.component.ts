import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { NoteComplementaireComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/note-complementaire/note-complementaire.component';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { StripHtmlPipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/strip-html/strip-html.pipe';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { GenererAlerteFicheDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerAlerteFicheApiService } from 'projects/usager-ng-core/src/lib/services/usager-alerte-fiche-api.service';
import { UsagerInfoSanteService } from 'projects/usager-ng-core/src/lib/services/usager-info-sante.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, concatMap, finalize, map } from 'rxjs/operators';
import { FicheAppelDTO } from '../../../models/fiche-appel-dto';
import { EnumRaisonTypeFicheAppel } from '../../../models/raison-type-fiche-appel-enum';
import { EnumTypeFicheAppel } from '../../../models/type-fiche-appel-enum';
import { FicheAppelApiService } from '../../../services/fiche-appel-api.service';
import { NoteComplementaireService } from '../../../services/note-complementaire.service';
import { ReferencesApiService } from '../../../services/references-api.service';

/** FRA */
const CODE_LANGUE_DEFAUT: string = "FRA";

@Component({
  selector: 'sa-note-complementaire-wrapper',
  templateUrl: './note-complementaire-wrapper.component.html',
  styleUrls: ['./note-complementaire-wrapper.component.css'],
  providers: [StripHtmlPipe]
})
export class NoteComplementaireWrapperComponent implements OnInit, OnDestroy {

  @ViewChild("notecomplementaire", { static: true })
  appNoteComplementaire: NoteComplementaireComponent;

  @Input("conversionFicheEnNoteCompl")
  isConversionFicheEnNoteCompl: boolean = false;

  @Input()
  idAppel: number;

  @Input()
  idFicheAppel: number;

  @Output()
  noteComplementaireTerminerEvent: EventEmitter<UrlTree> = new EventEmitter();

  //Conteneur pour la liste de valeurs
  inputOptionsTypeNotes: InputOptionCollection = {
    name: "typesnotes",
    options: []
  };

  inputOptionsLangues: InputOptionCollection = {
    name: "langues",
    options: []
  };

  inputOptionsInterlocuteurs: InputOptionCollection = {
    name: "interlocuteurs",
    options: []
  };

  inputOptionConsentementenFicheEnregistreur: InputOptionCollection = {
    name: "consentementenOrganismesEnregistreurs",
    options: [{ label: 'sigct.ss.f_appel.notecompl.consentementenregistreurs', value: 'false' }]
  };

  noteComplementaireDTO: NoteComplementaireDTO = new NoteComplementaireDTO();

  dureeFicheAppelDto: DureeFicheAppelDTO = new DureeFicheAppelDTO();

  msgConfirmerDureePopup: string = ""; // Message affiché dans le popup de confirmation

  isReadonly: boolean = false;

  private urlBase: string;
  private abonnements: Subscription = new Subscription();

  // Variables of file component 
  listeFichiers: UsagerSanterSocialFichierDTO[];
  batchFilesToDelete: UsagerSanterSocialFichierDTO[] = [];
  public eventData: any;

  constructor(
    private appContextStore: AppContextStore,
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private noteComplementaireService: NoteComplementaireService,
    private referencesService: ReferencesApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private usagerAlerteFicheApiService: UsagerAlerteFicheApiService,
    private usagerInfoSanteService: UsagerInfoSanteService,
    private usagerService: UsagerService,
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private confirmationDialogService: ConfirmationDialogService,
    private parametreService: AppelAdmParameterService,
    private materialModalDialogService: MaterialModalDialogService,
    private stripHtmlPipe: StripHtmlPipe) {
    this.urlBase = window["env"].urlSanteApi;
  }

  ngOnInit(): void {
    this.alertStore.resetAlert();

    this.chargerListeDeValeurs();

    this.chargementNoteComplementaire();

    this.loadAttachedFilesToNote();
  }

  ngOnDestroy(): void {
    if (this.abonnements) this.abonnements.unsubscribe();
    this.alertStore.resetAlert();
  }

  /**
   * Crée une nouvelle note complémentaire.
   */
  private chargementNoteComplementaire(): void {
    this.isReadonly = false;

    this.noteComplementaireDTO = new NoteComplementaireDTO();

    this.dureeFicheAppelDto = new DureeFicheAppelDTO();
    this.dureeFicheAppelDto.dateDebut = new Date();
    this.dureeFicheAppelDto.detailsDureeCorrigee = null;

    if (this.appContextStore.state.contexteDetailUsagerPage) {
      // Récupère la fiche en cours de l'appel.
      const idFicheAppel: number = this.appContextStore.state.contexteDetailUsagerPage.idFicheAppel;
      this.abonnements.add(
        this.ficheAppelApiService.getFicheAppel(idFicheAppel).subscribe((ficheAppelDto: FicheAppelDTO) => {
          let noteCompl: string = "";

          // Si l'usager a donné sont consentement pour accéder à ses fiches antérieures
          if (ficheAppelDto?.usager?.consentementFichesAnterieures) {
            // Ajoute au début de la note le message : L'usager autorise l'accès à la consultation de ses fiches d'appel antérieures
            const msgConsentement: string = this.translateService.instant("sigct.sa.f_appel.consultevaluation.consentementfichesant");
            noteCompl += msgConsentement + "\n\n";
          }

          if (this.isConversionFicheEnNoteCompl) {
            noteCompl += ficheAppelDto.demandeInitiale ? ficheAppelDto.demandeInitiale + "\n\n" : "";
            if (ficheAppelDto.donneesPertinentes) {
              noteCompl += this.stripHtmlPipe.transform(ficheAppelDto.donneesPertinentes);
            }

            if (ficheAppelDto.dateDebut) {
              if (typeof ficheAppelDto.dateDebut == "number") {
                this.dureeFicheAppelDto.dateDebut = new Date(ficheAppelDto.dateDebut);
              } else {
                this.dureeFicheAppelDto.dateDebut = ficheAppelDto.dateDebut;
              }
            }
            this.dureeFicheAppelDto.detailsDureeCorrigee = this.translateService.instant("sigct.ss.f_appel.consultation.convertirnotecomp.detail", [ficheAppelDto.id]);
          }

          this.noteComplementaireDTO.notecompl = noteCompl;
          this.noteComplementaireDTO.langueAppelCode = ficheAppelDto.referenceLangueAppelCode;

          // Rafraichit la durée calculée
          this.appNoteComplementaire.resetDureeFicheAppel(this.dureeFicheAppelDto.detailsDureeCorrigee);
        })
      );
    }
  }

  /**
   * Enregistre la note complémentaire dans la base de donnée.
   * @param event
   */
  onTerminerClick(event: any): void {
    this.alertStore.resetAlert(); //Vide les anciens messages d'erreur
    this.eventData = event;
    this.noteComplementaireDTO = event.note; //Objet de transfert passé par événement
    if (this.validerDuree(this.appNoteComplementaire.getDureeFicheAppel())) {
      this.terminerNote();
    }
  }

  /**
   * Retour à l'écran précédent.
   */
  onRetourClick(): void {
    this.alertStore.resetAlert(); //Vide les anciens messages d'erreur
    if (this.appNoteComplementaire.isNotVide()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.abonnements.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.noteComplementaireTerminerEvent.emit();
            }
          }
        )
      );
    } else {
      this.noteComplementaireTerminerEvent.emit();
    }
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Oui de la fenêtre de confirmation confirmer-duree-popup.
   */
  onBtnConfirmerDureeClick() {
    this.terminerNote();
  }

  canLeavePage(): boolean {
    return !this.appNoteComplementaire.isNotVide();
  }

  /**
   * Affiche un popup de confirmation selon les paramètres d'environnement
   * @param dto l'Objet de transfert du calcul
   */
  private validerDuree(dto: DureeFicheAppelDTO): boolean {
    this.abonnements.add(
      this.parametreService.obtenirAdmParameter(this.urlBase, 'DUREE_MAX').subscribe((admParameter: any) => {
        const max: number = +admParameter?.valeurParametre;
        if (max) {
          this.noteComplementaireDTO.dateDebut = dto.dateDebut;
          this.noteComplementaireDTO.dateFin = new Date();

          let dureeMax: number;
          let dureeAvertissement: number;
          //La duree minimum avant d'afficher le popup d'avertissement, valeur codé en dur pour l'instant, voir avec Philippe
          dureeAvertissement = 3600;
          //Déterminer la valeur maximum de la durée pour créer une erreur sans popup
          dureeMax = 3600 * max;

          if (dto.dureeCorrigee) {
            this.noteComplementaireDTO.dureeCorrigee = dto.dureeCorrigee;

            if (dto.dureeCorrigee > dureeAvertissement && dto.dureeCorrigee <= dureeMax) {
              // Durée corrigée : la durée corrigée est supérieure à 1 heure. Désirez-vous continuer?
              this.msgConfirmerDureePopup = this.translateService.instant("ss-iu-c00003");
              this.confirmationDialogService.openAndFocus("confirmer-duree-popup", "confirmer-duree-btn-oui");
              return false;
            }
          } else {
            let dureeCalculee: number = DateUtils.calculerNbSecondesBetween(dto.dateDebut, new Date());
            if (dureeCalculee > dureeAvertissement && dureeCalculee <= dureeMax) {
              // Durée calculée : la durée calculée est supérieure à 1 heure. Désirez-vous continuer?
              this.msgConfirmerDureePopup = this.translateService.instant("ss-iu-c00004");
              this.confirmationDialogService.openAndFocus("confirmer-duree-popup", "confirmer-duree-btn-oui");
              return false;
            }
          }
          //Si le popup n'est pas levé et que la durée plus grande que dureeMax
          this.terminerNote();
        }
      })
    );
    return undefined;
  }

  private terminerNote() {
    if (this.noteComplementaireDTO) {
      this.noteComplementaireDTO.idFicheAppel = this.idFicheAppel;
      this.noteComplementaireDTO.details = this.appNoteComplementaire.getDureeFicheAppel().detailsDureeCorrigee; //Le détail peut exister sans durée corrigée
      this.noteComplementaireDTO.dureeCorrigee = this.appNoteComplementaire.getDureeFicheAppel().dureeCorrigee;

      this.addNoteAndAttachedFiles();
    }
  }

  private addNoteAndAttachedFiles(): void {
    this.abonnements.add(
      this.noteComplementaireService.saveNoteAndboundFiles(this.noteComplementaireDTO, this.eventData.files, this.eventData.detailsFiles, this.idFicheAppel, this.batchFilesToDelete.map(dto => dto.id)).pipe(
        catchError((e) => of(null))
      ).subscribe((result: NoteComplementaireDTO) => {
        if (result) {
          // Une fois la note sauvegardée avec succès, on redirige vers la page de consultation
          this.noteComplementaireDTO = result;
          // Si l'usager a donné son consentement à aviser les organismes enregistreurs. On lance le traitement
          // pour générer des alertes aux organismes.
          if (result?.consentementenFicheEnregistreur) {
            this.genererAlertes(this.idFicheAppel);
          }

          if (this.isConversionFicheEnNoteCompl && this.appContextStore.state.contexteDetailUsagerPage) {
            // Termine la fiche d'appel convertie en note complémentaire.
            this.terminerFicheAppelConvertie(this.appContextStore.state.contexteDetailUsagerPage.idFicheAppel);
          } else {
            this.noteComplementaireTerminerEvent.emit();
          }
        }
      })
    );
  }

  /**
   * S'assure que la fiche d'appel à convertir ne possède pas une durée plus grande que la durée maximale
   * définie dans la table des paramètres. Si c'est le cas, la durée maximale est inscrite dans la durée 
   * corrigée de la fiche d'appel.
   * @param ficheAppelDto fiche d'appel à convertir
   */
  private calculerDureeFicheConvertie(ficheAppelDto: FicheAppelDTO): Observable<FicheAppelDTO> {
    return this.parametreService.obtenirAdmParameter(this.urlBase, 'DUREE_MAX').pipe(map((admParameter: any) => {
      const nbHeuresMax: number = +admParameter?.valeurParametre;
      if (nbHeuresMax && !ficheAppelDto.dureeCorrigee && ficheAppelDto?.dateDebut) {
        const dateFin: Date = ficheAppelDto.dateFin ? ficheAppelDto.dateFin : new Date();
        const dureeFiche: number = DateUtils.calculerNbSecondesBetween(ficheAppelDto.dateDebut, dateFin);
        const dureeMax: number = 3600 * nbHeuresMax;
        if (dureeFiche > dureeMax) {
          ficheAppelDto.dureeCorrigee = dureeMax;
        }
      }
      return ficheAppelDto;
    }));
  }

  /**
   * Transforme la fiche d'appel convertie en note compléemntaire en une fiche non pertinent et la termine.
   * Redirige vers la fiche d'appel de la note complémentaire.
   * @param idFicheAppel
   */
  private terminerFicheAppelConvertie(idFicheAppel: number): void {
    this.spinnerService.show("spinner-note-compl");

    this.abonnements.add(
      this.ficheAppelApiService.getFicheAppel(idFicheAppel).pipe(
        concatMap((ficheAppelDto: FicheAppelDTO) => {
          // Prépare la fiche d'appel en cours dans le but de la fermer. 
          // Fiche convertie en note complémentaire de la fiche : {0}
          let demandeInitiale: string = ficheAppelDto.demandeInitiale ? ficheAppelDto.demandeInitiale + "\n\n" : "";
          demandeInitiale += this.translateService.instant("sigct.ss.f_appel.consultation.convertirnotecomp.demandeInitiale", [this.idFicheAppel]);
          demandeInitiale = demandeInitiale.substring(0, 1000);

          ficheAppelDto.demandeInitiale = demandeInitiale;
          ficheAppelDto.typeConsultation = EnumTypeFicheAppel.NONPERT;  // Fiche non pertinente
          ficheAppelDto.referenceRaisonTypeFicheCode = EnumRaisonTypeFicheAppel.NP50; // Fiche convertie en note complémentaire
          if (!ficheAppelDto.referenceLangueAppelCode) {
            ficheAppelDto.referenceLangueAppelCode = CODE_LANGUE_DEFAUT;
          }
          // S'assure que la fiche d'appel à convertir ne possède pas une durée plus grande que la durée maximale définie dans 
          // la table des paramètres. Si c'est le cas, la durée maximale est inscrite dans la durée corrigée de la fiche d'appel.
          return this.calculerDureeFicheConvertie(ficheAppelDto);
        }),
        concatMap((ficheAppelDto: FicheAppelDTO) => {
          return this.ficheAppelApiService.updateFicheAppel(ficheAppelDto, null);
        }),
        concatMap((ficheAppelDto: FicheAppelDTO) => {
          return this.usagerInfoSanteService.creerHistoriqueUsagerIdent(ficheAppelDto.usager?.usagerIdentification?.id).pipe(map((usagerIdentHistoDto: UsagerIdentHistoDTO) => {
            // Inscrit l'id de l'historique dans l'usager pour le sauvegarder .
            if (usagerIdentHistoDto) {
              ficheAppelDto.usager.idUsagerIdentHisto = usagerIdentHistoDto?.id;
            }
            return ficheAppelDto;
          }));
        }),
        concatMap((ficheAppelDto: FicheAppelDTO) => {
          // Fermeture de la fiche d'appel en cours.
          return this.ficheAppelApiService.terminerFicheAppel(ficheAppelDto);
        }),
        concatMap((ficheAppelDto: FicheAppelDTO) => {
          // On vient de fermer une fiche d'appel, on demande d'interroger le nombre de fiches d'appel non terminées
          // afin de mettre à jour le "badge" dans le menu du haut.
          this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlSanteApi);

          // Si l'usager a donné son consentement à aviser les organismes enregistreurs.
          if (ficheAppelDto.usager?.usagerIdentification?.id && ficheAppelDto.consentementenFicheEnregistreur) {
            const genererAlertFicheDto: GenererAlerteFicheDTO = {
              dtAppel: ficheAppelDto.dateDebut,
              idUsagerIdent: ficheAppelDto.usager.usagerIdentification.id,
              idFicheAppelSante: ficheAppelDto.id,
              idFicheAppelSocial: null
            };

            // On lance la création (au besoin) des alertes pour aviser les organismes enregistreurs.
            this.usagerAlerteFicheApiService.genererAlertes(genererAlertFicheDto).subscribe();
          }

          if (ficheAppelDto?.usager?.usagerIdentification?.id) {
            this.usagerService.solrIndexUsagers([ficheAppelDto.usager.usagerIdentification.id]).subscribe();
          }

          return of(ficheAppelDto);
        }),
        catchError((e) => of(null)),
        finalize(() => this.spinnerService.hide("spinner-note-compl"))
      ).subscribe((ficheAppelDto: FicheAppelDTO) => {
        if (ficheAppelDto) {
          // Construit l'url pour naviguer vers la consultation de la fiche d'appel contenant la note complémentaire
          // ss-iu-c00001=La fiche en cours a été convertie en note complémentaire avec succès!
          const urlRedirection: UrlTree = this.router.createUrlTree(["/consulter", "appel", this.idAppel, "fiche", this.idFicheAppel], { queryParams: { "alert": "ss-iu-c00001" } });
          this.noteComplementaireTerminerEvent.emit(urlRedirection);
        }
      })
    );
  }

  /**
   * Génère des alertes aux organismes enregistreurs pour la fiche d'appel idFicheAppel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  private genererAlertes(idFicheAppel: number): void {
    // Récupère les informations sur la fiche d'appel.
    this.ficheAppelApiService.getFicheAppel(idFicheAppel).subscribe((ficheAppelDto: FicheAppelDTO) => {
      // Informations nécessaires à la création des alertes pour les organismes enregistreurs.
      const genererAlertFicheDto: GenererAlerteFicheDTO = {
        dtAppel: ficheAppelDto.dateDebut,
        idUsagerIdent: ficheAppelDto.usager.usagerIdentification.id,
        idFicheAppelSante: ficheAppelDto.id,
        idFicheAppelSocial: null
      };
      // Lance la création des alertes pour les organismes enregistreurs.
      this.usagerAlerteFicheApiService.genererAlertes(genererAlertFicheDto).subscribe();
    });
  }

  /**
   * Extraction des liestes de valeurs
   * @param resultLangue
   */
  private populateListe(list: ReferenceDTO[]): InputOptionCollection {

    let inputOption: InputOptionCollection = {
      name: "listes",
      options: []
    };
    if (list) {
      const labelSelectionner = this.translateService.instant("option.select.message");
      inputOption.options.push({ label: labelSelectionner, value: null, description: labelSelectionner });

      list.forEach((item: any) => {
        inputOption.options.push({ label: item.nom, value: item.code, description: item.description });
      });
    }
    return inputOption;
  }

  /**
   * Charge toutes les liste de valeurs avec un ForkJoin pour réduire les bugs d'affichage de certaines
   * valeurs dans les Chosen.
   */
  private chargerListeDeValeurs(): void {
    this.abonnements.add(
      forkJoin([
        this.referencesService.getListeLangueAppel(),
        this.referencesService.getListeTypeNote(),
        this.referencesService.getListeCategorieAppelant()
      ]).subscribe(results => {
        this.inputOptionsLangues.options = this.populateListe(results[0] as ReferenceDTO[]).options;
        this.inputOptionsTypeNotes.options = this.populateListe(results[1] as ReferenceDTO[]).options;
        this.inputOptionsInterlocuteurs.options = this.populateListe(results[2] as ReferenceDTO[]).options;
      })
    );
  }

  // Functions's section of file component

  loadAttachedFilesToNote() {
    this.listeFichiers = [];
    if (this.noteComplementaireDTO?.id) {
      this.abonnements.add(this.noteComplementaireService.getAttachedFilesToNote(this.idFicheAppel, this.noteComplementaireDTO.id).subscribe((dtos: TableFichierDTO[]) => {
        if (dtos) {
          dtos.forEach((item: TableFichierDTO) => {
            let document: UsagerSanterSocialFichierDTO = this.setContenu(item);
            this.listeFichiers.push(document);
          });
        }
      }));
    }
  }

  private setContenu(data: TableFichierDTO): UsagerSanterSocialFichierDTO {
    let document: UsagerSanterSocialFichierDTO = new UsagerSanterSocialFichierDTO();

    document.idEnregistrement = data?.id;
    document.id = data?.id;
    document.nom = data?.nom;
    document.description = "";
    document.titre = "";
    document.typeContenu = data?.typeContenu;

    if (data?.description) {
      document.description = data?.description;
    }
    if (data.titre) {
      document.titre = data?.titre;
    }
    document.file = data?.file;

    return document;
  }

  public addFile(event: any) {
    this.alertStore.resetAlert();

    const msgs = this.validerFichier(event);
    if (msgs.length > 0) {
      this.populateAlertErreur(msgs);
    } else {
      this.enregister(event);
    }
  }

  private validerFichier(event: any) {
    let msgs: string[] = [];
    let fl: UsagerSanterSocialFichierDTO = event.fichier;
    if (!fl.nom) {
      msgs.push(this.translateService.instant('ss-iu-e50104'));
      return msgs;
    }
    if (event.fichier.file == null) {
      const msg = this.translateService.instant('ss-iu-e50104');
      msgs.push(msg);
    }

    return msgs;
  }

  private enregister(event: any): void {
    if (event) {
      let fichier: UsagerSanterSocialFichierDTO = event.fichier;
      this.noteComplementaireService.validateFile(this.idFicheAppel, fichier?.file).subscribe(rs => {
        if (rs) {
          this.listeFichiers.push(fichier);
          event.informeAjoute(this.listeFichiers);
        }
      })
    }
  }

  deleteFile(event: any): void {
    if (event) {
      if (event.fichier?.id) {
        let fileToDelete = this.listeFichiers.filter(f => f.id == event?.fichier?.id);
        if (fileToDelete?.length > 0) {
          this.listeFichiers = this.listeFichiers.filter(f => f.id != fileToDelete[0].id);
          this.batchFilesToDelete.push(fileToDelete[0]);
        }
      } else {
        this.listeFichiers = this.listeFichiers.filter(f => f.nom != event?.fichier.nom);
      }
      event.subject.next(this.listeFichiers);
    }
  }

  private populateAlertErreur(messages) {
    let alertM: AlertModel = new AlertModel();
    alertM.title = "Message d'erreur :";
    alertM.messages = messages;
    alertM.type = AlertType.ERROR;
    this.alertStore.addAlert(alertM);
  }

  cancelModif(): void {
    this.chargementNoteComplementaire();
    this.appNoteComplementaire.initialiserNoteComplementaire(this.noteComplementaireDTO);
    this.appNoteComplementaire.resetDureeFicheAppel(this.dureeFicheAppelDto.detailsDureeCorrigee);
    this.listeFichiers = this.listeFichiers.map(list_item => {
      list_item.titre = null;
      list_item.description = null;

      return list_item;
    })
    this.appNoteComplementaire.resetFileComponent();
  }
}
