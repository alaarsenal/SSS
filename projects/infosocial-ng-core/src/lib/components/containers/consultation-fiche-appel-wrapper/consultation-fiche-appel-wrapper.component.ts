import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheAppelDataService, SectionFicheAppelEnum } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { ConsultationAppelantDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-appelant-dto';
import { ConsultationFichiersDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-fichiers-dto';
import { ConsultationNoteComplDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-note-compl-dto';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { ImpressionFicheDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-fiche-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { BandeFlottanteComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/bande-flottante/bande-flottante.component';
import { ConsultationFicheSectionAppelantComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-appelant/consultation-fiche-section-appelant.component';
import { ConsultationFicheSectionFichiersComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-fichiers/consultation-fiche-section-fichiers.component';
import { ConsultationFicheSectionIdentifiantComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-identifiant/consultation-fiche-section-identifiant.component';
import { IdentifiantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-identifiant/identifiant-dto';
import { ConsultationFicheSectionNoteComplComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-note-compl/consultation-fiche-section-note-compl.component';
import { ConsultationFicheSectionRelanceComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-relance/consultation-fiche-section-relance.component';
import { ConsultationFicheSectionSignatureComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-signature/consultation-fiche-section-signature.component';
import { SignatureDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-signature/signature-dto';
import { ConsultationFicheSectionTerminaisonComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.component';
import { ConsultationFicheSectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.dto';
import { ConsultationFicheSectionUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
import { ConsultationFicheSectionUsagerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager.component';
import { EnumReponseValidation } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/enum-reponse-validation';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { RelanceService } from 'projects/sigct-ui-ng-lib/src/lib/components/relance/relance-api.service';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { RelanceDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/relance-dto';
import { ConsultationInteractionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-interaction-dto';
import { EMPTY, Subscription, forkJoin, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FicheAppelSocialDTO, ReferenceDTO, ValidationFinInterventionDTO } from '../../../models';
import { ImpressionFicheSocialDTO } from '../../../models/impression-fiche-social-dto';
import { ReferencesApiService, StatistiquesService, ValidationService } from '../../../services';
import { AppelApiService } from '../../../services/appel-api.service';
import { CorrectionFicheAppelService } from '../../../services/correction-fiche-appel.service';
import { FicheAppelApiService } from '../../../services/fiche-appel-api.service';
import { NoteComplementaireService } from '../../../services/note-complementaire.service';
import { ConsultationFicheSectionDemandeAnalyseComponent } from '../../ui/consultation-fiche-section-demande-analyse/consultation-fiche-section-demande-analyse.component';
import { ConsultationFicheSectionPlanActionComponent } from '../../ui/consultation-fiche-section-plan-action/consultation-fiche-section-plan-action.component';
import { AppelDTO } from 'projects/infosocial-ng-app/src/app/modules/fiche-appel/models';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';



const DEFAULT_LABEL_REPONSE_OUI: string = "Oui";
const DEFAULT_LABEL_REPONSE_NON: string = "Non";
const DEFAULT_LABEL_REPONSE_SO: string = "S.O.";

@Component({
  selector: 'so-consultation-fiche-appel-wrapper',
  templateUrl: './consultation-fiche-appel-wrapper.component.html',
  styleUrls: ['./consultation-fiche-appel-wrapper.component.css']
})
export class ConsultationFicheAppelWrapperComponent implements OnInit, OnDestroy {

  @Input("idAppel")
  set idAppel(value: number) {
    this._idAppel = value;
  }

  @Input("statutFiche")
  set statutFiche(value: string) {
    this._statutFiche = value;
  }

  @Input("ficheAppelId")
  set idFicheAppel(idFicheAppel: number) {
    // Alimente les différentes section avec les données de la fiche d'appel
    this.chargerDonnees(idFicheAppel);
    this._ficheAppelId = idFicheAppel;
  }

  @Input("showTitleVisualisation")
  set showTitleVisualisation(value: boolean) {
    if (value) {
      this._showTitleVisualisation = value;
    }
  }

  @Input()
  afficherBoutonCorrigerFicheAppel: boolean;

  @Input()
  afficherBoutonConvertirFicheAppelEnNoteCompl: boolean = false;

  _idAppel: number;
  _statutFiche: string;
  _ficheAppelId;
  _showTitleVisualisation: boolean = false;
  user: User;

  @Output()
  supprimerFicheApple: EventEmitter<any> = new EventEmitter();

  @Output()
  corrigerFicheEvent: EventEmitter<void> = new EventEmitter();

  @ViewChild('consultationFicheSectionUsager', { static: true })
  consultationFicheSectionUsager: ConsultationFicheSectionUsagerComponent;

  @ViewChild('consultationFicheSectionSignature', { static: true })
  consultationFicheSectionSignature: ConsultationFicheSectionSignatureComponent;

  @ViewChild('consultationFicheSectionDemandeAnalyse', { static: true })
  consultationFicheSectionDemandeAnalyse: ConsultationFicheSectionDemandeAnalyseComponent;

  @ViewChild('consultationFicheSectionPlanAction', { static: true })
  consultationFicheSectionPlanAction: ConsultationFicheSectionPlanActionComponent;

  @ViewChild('consultationFicheSectionTerminaison', { static: true })
  consultationFicheSectionTerminaison: ConsultationFicheSectionTerminaisonComponent;

  @ViewChild('consultationFicheSectionNoteCompl', { static: true })
  consultatuionFicheSectionNoteCompl: ConsultationFicheSectionNoteComplComponent;

  @ViewChild('consultationFicheSectionFichiers', { static: true })
  consultatuionFicheSectionFichiers: ConsultationFicheSectionFichiersComponent;

  @ViewChild('consultationFicheSectionIdentifiant', { static: true })
  consultationFicheSectionIdentifiant: ConsultationFicheSectionIdentifiantComponent;

  @ViewChild('bandeflottante', { static: true })
  bandeFlottante: BandeFlottanteComponent;

  @ViewChild('consultationFicheSectionAppelant', { static: true })
  consultatuionFicheSectionAppelant: ConsultationFicheSectionAppelantComponent;

  @ViewChild('consultationFicheSectionRelance', { static: true })
  consultationFicheSectionRelance: ConsultationFicheSectionRelanceComponent;

  sectionsContentZones: SigctContentZoneComponent[];
  ficheAppelSocialDto: FicheAppelSocialDTO;
  consultationFicheSectionUsagerDTO: ConsultationFicheSectionUsagerDTO;
  consultationFicheSectionTerminaisonDTO: ConsultationFicheSectionTerminaisonDTO;
  validationFinInterventionDTO: ValidationFinInterventionDTO;
  consultationNoteComplDTO: ConsultationNoteComplDTO;
  consultationFIchiersDTO: ConsultationFichiersDTO;
  signatureDTO: SignatureDTO;
  identifiantDTO: IdentifiantDTO;

  consultationAppelantDTO: ConsultationAppelantDTO;

  isBtnAjouterNoteVisible: boolean = false;
  isBtnSupppFicheVisible: boolean = false;
  isBtnImprimerFicheVisible: boolean = false;
  isBtnCorrigerFicheVisible: boolean = false;
  isBtnConvertirFicheEnNoteComplVisible: boolean = false;

  isBtnAjouterRelanceVisible: boolean = false;
  isBtnModifierRelanceVisible: boolean = false;
  isBtnAjouterRelanceDisabled: boolean = false;
  isBtnModifierRelanceDisabled: boolean = false;

  infobulleAjouterRelance: string;
  infobulleModifierRelance: string;
  relanceARealiser: RelanceDTO;

  listeCorrectionFicheAppel: FicheAppelCorrectionDTO[];

  protected subscriptions: Subscription = new Subscription();

  @Output()
  ajouterNoteComplementaire: EventEmitter<void> = new EventEmitter();

  @Output()
  convertirFicheAppelEnNoteCompl: EventEmitter<void> = new EventEmitter();

  @Output()
  editionRelanceEvent: EventEmitter<void> = new EventEmitter();

  private readonly REF_TABLE: string = "SO_FICHE_APPEL";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheAppelApiService: FicheAppelApiService,
    private validationService: ValidationService,
    private statistiqueService: StatistiquesService,
    private referenceService: ReferencesApiService,
    private noteComplementaireService: NoteComplementaireService,
    private appelApiService: AppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private authenticationService: AuthenticationService,
    private fichierService: FichiersApiService,
    private relanceService: RelanceService,
    private correctionFicheAppelService: CorrectionFicheAppelService) {

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Le setTimeout evite l`erreur ExpressionChangedAfterItHasBeenCheckedError d`arriver.
    // voir article: https://blog.angular-university.io/angular-debugging/ pour comprendre.
    setTimeout(() => {
      this.chargerContentZonesSectionUsager();
      this.chargerContentZonesSectionAppelant();
      this.chargerContentZonesSectionDemandeEtAnalyse();
      this.chargerContentZonesSectionPlanAction();
      this.chargerContentZonesSectionTerminaison();
      this.chargerContentZonesSectionSignature();
      this.chargerContentZonesSectionIdentifiant();
      this.chargerContentZonesSectionNoteCompl();
      this.chargerContentZonesSectionFichiers();
      this.chargerContentZonesSectionRelance();
      this.bandeFlottante.setFocusOnOuvrirTout();
    }, 0);
  }

  ngOnDestroy() {
    if (this.subscriptions) this.subscriptions.unsubscribe();
  }

  /**
   * Alimente les différentes section avec les données d'une fiche d'appel.
   * @param idFicheAppel
   */
  private chargerDonnees(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.user = this.authenticationService.getAuthenticatedUser();
      this.chargerFicheAppelSocial(idFicheAppel);
    }
  }

  private chargerFicheAppelSocial(idFicheAppel: number): void {
    this.subscriptions.add(
      this.ficheAppelApiService.getFicheAppelAvecMoyens(idFicheAppel)
        .subscribe((ficheAppelDTO: FicheAppelSocialDTO) => {
          this.ficheAppelSocialDto = ficheAppelDTO;
          this.auditConsultation(idFicheAppel);
          this.actualiserVisibiliteActions(ficheAppelDTO);
          //Le bouton ajouter une relance est visible dans les conditions si dessous:
          this.validerAffichageActionsRelances(ficheAppelDTO);
          this.chargerSectionSignature(idFicheAppel);
          this.chargerSectionIdentifiant(this.ficheAppelSocialDto);
          this.chargerSectionUsager();
          this.chargerSectionTerminaison();
          this.chargerSectionInteraction(ficheAppelDTO.idAppel);
          this.chargerSectionNoteCompl(ficheAppelDTO.id);
          this.chargerSectionFichiers(ficheAppelDTO.id);
          this.ficheAppelDataService.doRefreshListeFicheAppel();
          this.chargerSectionAppelant(ficheAppelDTO.idAppel, idFicheAppel);
          this.bandeFlottante.setFocusOnOuvrirTout();
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
          if (error.status == 200) {
            this.chargerFicheAppelSocial(idFicheAppel);
          }
        })
    );
  }

  private validerAffichageActionsRelances(ficheAppelDTO: FicheAppelSocialDTO) {
    this.isBtnAjouterRelanceVisible = false;
    this.isBtnModifierRelanceVisible = false;
    this.isBtnAjouterRelanceDisabled = false;
    this.isBtnModifierRelanceDisabled = false;
    if (AuthenticationUtils.hasAnyRole(['ROLE_SO_APPEL_RELANCE', 'ROLE_SO_APPEL_RELANCE_TOUS'])) {
      this.infobulleAjouterRelance = 'sigct.ss.f_appel.consultation.ajouterrelanceinfobulle';
      this.infobulleModifierRelance = 'sigct.ss.f_appel.consultation.modifierrelanceinfobulle';
      this.subscriptions.add(
        forkJoin([
          this.relanceService.isAfficherActionRelance(ficheAppelDTO.id, "SO"),
          this.relanceService.isActiverActionRelance(ficheAppelDTO.id, "SO"),
          this.relanceService.getRelanceARealiser(ficheAppelDTO.id, "SO")
        ]).subscribe(results => {
          const afficherRelance: boolean = results[0] as boolean;
          const activerRelance: boolean = results[1] as boolean || AuthenticationUtils.hasRole('ROLE_SO_APPEL_RELANCE_TOUS');
          this.relanceARealiser = results[2];
          if (afficherRelance) {
            if (this.relanceARealiser) {
              this.isBtnModifierRelanceVisible = true;
              if (!activerRelance) {
                this.isBtnModifierRelanceDisabled = true;
                this.infobulleAjouterRelance = 'sigct.ss.f_appel.consultation.accesajoutrelanceinfobulle';
              }
            } else {
              this.isBtnAjouterRelanceVisible = true;
              this.isBtnAjouterRelanceDisabled = !activerRelance;
              this.infobulleModifierRelance = 'sigct.ss.f_appel.consultation.accesamodificationrelanceinfobulle';
            }
          }
        })
      );
    }
  }

  private actualiserVisibiliteActions(ficheAppelDTO: FicheAppelSocialDTO): void {
    this.isBtnAjouterNoteVisible == false;
    this.isBtnImprimerFicheVisible = false;
    this.isBtnCorrigerFicheVisible = false;
    this.isBtnConvertirFicheEnNoteComplVisible = false;
    this.isBtnSupppFicheVisible = false;
    // Les boutons suivants sont visibles si le statut de la fiche est fermé 'F'
    if (StatutFicheAppelEnum.FERME == ficheAppelDTO.statut) {
      this.isBtnAjouterNoteVisible = true;
      this.isBtnImprimerFicheVisible = true;
      this.isBtnCorrigerFicheVisible = this.afficherBoutonCorrigerFicheAppel
        && ficheAppelDTO.idOrganismeCreation == AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant
        && AuthenticationUtils.hasRole('ROLE_SO_APPEL_MODIF_ADM');
      this.isBtnConvertirFicheEnNoteComplVisible = this.afficherBoutonConvertirFicheAppelEnNoteCompl
        && AuthenticationUtils.hasRole('ROLE_SO_APPEL_NOTE');
    } else if (StatutFicheAppelEnum.OUVERT == ficheAppelDTO?.statut) {
      // Le bouton "Supprimer" visible si le statut de la fiche est 'O' et l'usager connecté est lui-même le créateur.
      this.isBtnSupppFicheVisible = this.user?.name == ficheAppelDTO?.usernameCreation;
    }
  }

  private chargerSectionUsager(): void {
    if (this.ficheAppelSocialDto) {
      const ficheAppelTerminee: boolean = this.ficheAppelSocialDto.statut == StatutFicheAppelEnum.FERME;
      this.consultationFicheSectionUsagerDTO = this.ficheAppelSocialDto.usager
        ? {
          idUsager: !ficheAppelTerminee
            ? this.ficheAppelSocialDto.usager.usagerIdentification?.id
            : null,
          idUsagerHisto: ficheAppelTerminee
            ? this.ficheAppelSocialDto.usager.idUsagerIdentHisto
            : null,
          ageAnnees: this.ficheAppelSocialDto.usager.ageAnnees,
          ageMois: this.ficheAppelSocialDto.usager.ageMois,
          ageJours: this.ficheAppelSocialDto.usager.ageJours
        }
        : null;
    } else {
      this.consultationFicheSectionUsagerDTO = null;
    }
  }

  private chargerSectionTerminaison(): void {
    this.consultationFicheSectionTerminaisonDTO = new ConsultationFicheSectionTerminaisonDTO();
    this.validationFinInterventionDTO = null;
    if (this.ficheAppelSocialDto) {
      this.consultationFicheSectionTerminaisonDTO.saisieDifferee = this.ficheAppelSocialDto.saisieDifferee;
      this.chargerSectionValidationFinIntervention();
      this.chargerSectionResumeIntervention();
      this.chargerSectionServicesUtilises();
      this.chargerSectionDureeFiche();
    }
  }

  private chargerSectionInteraction(idAppel: number): void {
    this.subscriptions.add(
      this.appelApiService.getConsultationInteraction(idAppel).subscribe((dto: ConsultationInteractionDTO) => {
        this.consultationFicheSectionTerminaisonDTO.interaction = dto;
      })
    );
  }

  private chargerSectionValidationFinIntervention(): void {
    this.subscriptions.add(
      forkJoin([
        this.validationService.findAllByIdFicheAppel(this.ficheAppelSocialDto.id),
        this.referenceService.getListeValidation()
      ]).subscribe((results) => {
        const referencesValidation = results[1] as ReferenceDTO[];
        let indicateurs: ValidationDTO[] = [];
        if (CollectionUtils.isNotBlank(results[0]) && CollectionUtils.isNotBlank(referencesValidation)) {
          const validations = CollectionUtils.sortByKey(results[0], "idReferenceValidation");
          validations
            .filter(validation => validation.reponse)
            .forEach((validation: ValidationDTO) => {
              const referenceValidation: ReferenceDTO = referencesValidation.find(item => item.id == validation.idReferenceValidation);
              validation.nomReferenceValidation = referenceValidation.nom;
              validation.reponse = this.getLabelNomReferenceValidation(validation.reponse);
              indicateurs.push({ ...validation });
            });
        }
        this.validationFinInterventionDTO = {
          validations: indicateurs,
          details: this.ficheAppelSocialDto.detailsValidation,
          opinionProf: this.ficheAppelSocialDto.opinionProf
        };
      }, (error: HttpErrorResponse) => {
        console.log(error.message);
      })
    );
  }

  private chargerSectionResumeIntervention(): void {
    this.consultationFicheSectionTerminaisonDTO.raisonsIntervention = null;
    this.consultationFicheSectionTerminaisonDTO.rolesAction = null;
    this.consultationFicheSectionTerminaisonDTO.centreActivite = null;
    this.consultationFicheSectionTerminaisonDTO.langueIntervention = null;
    this.subscriptions.add(
      forkJoin([
        this.statistiqueService.getListeRaisonAppel(this.ficheAppelSocialDto.id),
        this.statistiqueService.getListeRoleAction(this.ficheAppelSocialDto.id),
        this.referenceService.getListeCentreActivite(),
        this.referenceService.getListeLangueAppel(),
      ]).subscribe((results) => {
        this.consultationFicheSectionTerminaisonDTO.raisonsIntervention = results[0];
        this.consultationFicheSectionTerminaisonDTO.rolesAction = results[1];
        const referencesCentreActivites = results[2] as ReferenceDTO[];
        if (referencesCentreActivites) {
          this.consultationFicheSectionTerminaisonDTO.centreActivite = referencesCentreActivites.find(item => item.code == this.ficheAppelSocialDto.referenceCentreActiviteCode);
        }
        const referencesLangueAppel = results[3] as ReferenceDTO[];
        if (referencesLangueAppel) {
          this.consultationFicheSectionTerminaisonDTO.langueIntervention = referencesLangueAppel.find(item => item.code == this.ficheAppelSocialDto.referenceLangueAppelCode);
        }
      }, (error: HttpErrorResponse) => {
        console.log(error.message);
      })
    );
  }

  private chargerSectionServicesUtilises(): void {
    this.consultationFicheSectionTerminaisonDTO.servicesInterprete = this.ficheAppelSocialDto.servicesInterprete;
    this.consultationFicheSectionTerminaisonDTO.servicesRelaisBell = this.ficheAppelSocialDto.servicesRelaisBell;
    this.consultationFicheSectionTerminaisonDTO.detailsInterprete = this.ficheAppelSocialDto.detailsInterprete;
    this.consultationFicheSectionTerminaisonDTO.detailsRelaisBell = this.ficheAppelSocialDto.detailsRelaisBell;
  }

  private chargerSectionDureeFiche(): void {
    let isDureeVisible: boolean = false;

    this.subscriptions.add(
      this.appelApiService.obtenirNbFicheAppelStatutOuvert(this._idAppel).pipe(
        concatMap((nbFicheOuverte: number) => {
          if (nbFicheOuverte == 0) {
            isDureeVisible = true;

            return this.ficheAppelApiService.getSommeDureesFichesAppel(this.ficheAppelSocialDto.id);
          }
          return of(null);
        }),
        concatMap((sommeDurees: number) => {
          this.consultationFicheSectionTerminaisonDTO.dureeFiche = <DureeFicheAppelDTO>{
            dateDebut: this.ficheAppelSocialDto.dateDebut,
            dateFin: this.ficheAppelSocialDto.dateFin,
            dureeCorrigee: this.ficheAppelSocialDto.dureeCorrigee,
            dureeCumulee: sommeDurees,
            detailsDureeCorrigee: this.ficheAppelSocialDto.detailsDureeCorrigee,
            dateCreation: this.ficheAppelSocialDto.dateCreation,
            dateFinSaisieDifferee: this.ficheAppelSocialDto.dateFinSaisieDifferee,
            isDureeVisible: isDureeVisible,
          };

          return EMPTY;
        }),
      ).subscribe()
    );
  }

  private chargerContentZonesSectionUsager(): void {
    if (this.consultationFicheSectionUsager.contentZones) {
      this.sectionsContentZones = this.consultationFicheSectionUsager.contentZones.toArray();
    }
  }

  private chargerContentZonesSectionSignature(): void {
    if (this.consultationFicheSectionSignature && this.consultationFicheSectionSignature.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionSignature.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionPlanAction(): void {
    if (this.consultationFicheSectionPlanAction && this.consultationFicheSectionPlanAction.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionPlanAction.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionDemandeEtAnalyse(): void {
    if (this.consultationFicheSectionDemandeAnalyse && this.consultationFicheSectionDemandeAnalyse.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionDemandeAnalyse.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionNoteCompl(): void {
    if (this.consultatuionFicheSectionNoteCompl.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionNoteCompl.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionFichiers(): void {
    if (this.consultatuionFicheSectionFichiers.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionFichiers.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionTerminaison(): void {
    if (this.consultationFicheSectionTerminaison && this.consultationFicheSectionTerminaison.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionTerminaison.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionIdentifiant(): void {
    if (this.consultationFicheSectionIdentifiant && this.consultationFicheSectionIdentifiant.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionIdentifiant.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionRelance(): void {
    if (this.consultationFicheSectionRelance.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionRelance.contentZones.toArray());
    }
  }

  public chargerSectionAppelant(idAppel, idFicheAppel) {

    this.subscriptions.add(
      this.appelApiService.consulterAppelantByIdAppel(idAppel, idFicheAppel).subscribe(result => {
        if (result) {
          this.consultationAppelantDTO = result;
        }

      }
      ));

  }

  private getLabelNomReferenceValidation(nom: string): string {
    switch (nom) {
      case EnumReponseValidation.OUI:
        return DEFAULT_LABEL_REPONSE_OUI;
      case EnumReponseValidation.NON:
        return DEFAULT_LABEL_REPONSE_NON;
      case EnumReponseValidation.SO:
        return DEFAULT_LABEL_REPONSE_SO;
      default: return null;
    }
  }

  onBtnAjouterNoteClick() {
    this.ajouterNoteComplementaire.emit();
  }

  onBtnAjouterRelanceClick(): void {
    this.editionRelanceEvent.emit(null);
  }

  onBtnConvertirFicheEnNoteComplClick(): void {
    this.convertirFicheAppelEnNoteCompl.emit();
  }

  onBtnModifierRelanceClick(): void {
    this.editionRelanceEvent.emit();
  }

  onBtnSupprimerFicheAppelClick() {
    let dataFicheASupp = {
      idFicheAppel: this._ficheAppelId,
      idAppel: this._idAppel
    }
    this.supprimerFicheApple.emit(dataFicheASupp);
  }

  onConsulterAvis(idAvis: number) {
    this.router.navigate(["../" + SectionFicheAppelEnum.AVIS], { relativeTo: this.route, queryParams: { idAvis: idAvis } });
  }

  chargerSectionNoteCompl(idFicheAppel: number) {

    this.subscriptions.add(this.noteComplementaireService.obtainNotesAndTheirAttachedFiles(idFicheAppel).subscribe((result: ConsultationNoteComplDTO) => {
      if (result) {
        this.consultationNoteComplDTO = result;
      }
    }));
  }

  chargerSectionFichiers(idFicheAppel: number) {

    let dto = new ConsultationFichiersDTO();

    this.subscriptions.add(
      this.fichierService.liste(idFicheAppel, this.REF_TABLE, "SO").subscribe(results => {
        if (results) {
          dto.listeFichiers = results;

          dto.listeFichiers.forEach(item => {
            const linkTelechargement = this.fichierService.getLinktelechargement(idFicheAppel, item.id, "SO");
            item.linkTelechargement = linkTelechargement;
          });

          this.consultationFIchiersDTO = dto;
        }

      })
    );


  }

  private chargerSectionSignature(idFicheAppel: number) {
    this.subscriptions.add(
      forkJoin([
        this.ficheAppelApiService.getSignatureData(idFicheAppel),
        this.correctionFicheAppelService.findAllByIdFicheAppel(idFicheAppel)
      ]).subscribe(results => {
        if (results) {
          this.signatureDTO = results[0][0] as SignatureDTO;
          this.listeCorrectionFicheAppel = results[1] as FicheAppelCorrectionDTO[];
        }
      })
    );
  }

  private chargerSectionIdentifiant(ficheAppelSocialDto: FicheAppelSocialDTO): void {
    this.identifiantDTO = new IdentifiantDTO();
    if (ficheAppelSocialDto) {
      this.identifiantDTO.idFicheAppel = ficheAppelSocialDto.id;
      if (ficheAppelSocialDto.usager?.usagerIdentification?.id) {
        this.identifiantDTO.idUsagerIdent = ficheAppelSocialDto.usager.usagerIdentification.id;
      }
      if (ficheAppelSocialDto.idAppel) {
        this.subscriptions.add(
          forkJoin([
            this.appelApiService.obtenirAppel(ficheAppelSocialDto.idAppel),
            this.appelApiService.obtenirFicheAppels(ficheAppelSocialDto.idAppel)]).subscribe((results) => {
              if (results[0]) {
                const appelDto: AppelDTO = results[0] as AppelDTO;
                this.identifiantDTO.dureeCompleteAppel = appelDto.dureeComplete ? DateUtils.secondesToHHMMSS(appelDto.dureeComplete) : "";
              }

              if (results[1]) {
                const listeFicheAppel: FicheAppelSocialDTO[] = results[1] as FicheAppelSocialDTO[];
                if (listeFicheAppel?.length > 0) {
                  let fichesRelieesNonSupp = listeFicheAppel.filter(dto => dto.statut != StatutFicheAppelEnum.SUPPRIMER && dto.id != ficheAppelSocialDto.id);
                  if (fichesRelieesNonSupp?.length > 0) {
                    this.identifiantDTO.autresFichesReliees = fichesRelieesNonSupp.map(dto => dto.id).join(", ");
                  }
                }
              }
            })
        );
      }
    }
  }

  private chargerContentZonesSectionAppelant(): void {
    if (this.consultatuionFicheSectionAppelant.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionAppelant.contentZones.toArray());
    }
  }

  onBtnImprimerClick(): void {
    let impressionFiche = new ImpressionFicheSocialDTO();
    impressionFiche.idFicheAppel = this._ficheAppelId;
    impressionFiche.idAppel = this._idAppel;
    this.loadSectionIdentificationUsager(impressionFiche);
    this.loadSectionInformationSuppUsager(impressionFiche);
    this.loadSectionCommunicationUsager(impressionFiche);
    this.loadSectionAdresseUsager(impressionFiche);
    this.loadSectionAppelantInitial(impressionFiche);
    this.loadSectionRelance(impressionFiche);
    this.loadSectionDemandeAnalyse(impressionFiche);
    this.loadSectionPlanAction(impressionFiche);
    this.loadSectionTerminaison(impressionFiche);
    this.loadSectionSignature(impressionFiche);
    this.loadSectionIdentifiant(impressionFiche);
    this.loadSectionNoteComplementaire(impressionFiche);
    this.loadSectionFichiers(impressionFiche);
    this.genererPdf(impressionFiche);
  }

  private genererPdf(impressionFiche: ImpressionFicheSocialDTO) {
    this.subscriptions.add(
      this.ficheAppelApiService.genererPdf(impressionFiche)
        .subscribe((dto: ImpressionFicheDTO) => {
          const data: any = dto.fileContent;
          const byteCharacters = atob(data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          let blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
    );
  }

  private loadSectionIdentificationUsager(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-identification-usager", impression.sectionIdentificationUsager);
    this.consultationFicheSectionUsager.loadSectionIdentificationUsager(impression.sectionIdentificationUsager);
  }

  private loadSectionInformationSuppUsager(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-informations-supp-usager", impression.sectionInformationsSupp);
    this.consultationFicheSectionUsager.loadSectionInformationSupp(impression.sectionInformationsSupp);
  }

  private loadSectionCommunicationUsager(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-communications-usager", impression.sectionCommunicationUsager);
    this.consultationFicheSectionUsager.loadSectionCommunicationUsager(impression.sectionCommunicationUsager);
  }

  private loadSectionRelance(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-relance", impression.sectionRelance);
    this.consultationFicheSectionRelance.loadDonneesImpression(impression.sectionRelance);
  }

  private loadSectionAdresseUsager(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-adresses-usager", impression.sectionAdresseUsager);
    this.consultationFicheSectionUsager.loadSectionAdresseUsager(impression.sectionAdresseUsager);
  }

  private loadSectionAppelantInitial(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-appelant-initial", impression.sectionAppelantInitial);
    this.consultatuionFicheSectionAppelant.loadDonneesImpression(impression.sectionAppelantInitial);
  }

  private loadSectionDemandeAnalyse(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("demandeAnalyse", impression.sectionDemandeAnalyse);
    this.consultationFicheSectionDemandeAnalyse.loadDonneesImpression(impression.sectionDemandeAnalyse);
  }

  private loadSectionPlanAction(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("planAction", impression.sectionPlanAction);
    this.consultationFicheSectionPlanAction.loadDonneesImpression(impression.sectionPlanAction);
  }

  private loadSectionTerminaison(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-terminaison", impression.sectionTerminaison);
    this.consultationFicheSectionTerminaison.loadDonneesImpression(impression.sectionTerminaison, this.validationFinInterventionDTO);
  }

  private loadSectionSignature(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-signature", impression.sectionSignature);
    this.consultationFicheSectionSignature.loadDonneesImpression(impression.sectionSignature);
  }

  private loadSectionIdentifiant(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-identifiant", impression.sectionIdentifiant);
    this.consultationFicheSectionIdentifiant.loadDonneesImpression(impression.sectionIdentifiant);
  }

  private loadSectionNoteComplementaire(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-notes-complementaires", impression.sectionNoteComplementaire);
    this.consultatuionFicheSectionNoteCompl.loadDonneesImpression(impression.sectionNoteComplementaire);
  }

  private loadSectionFichiers(impression: ImpressionFicheSocialDTO): void {
    this.loadGenericSection("section-fichiers", impression.sectionFichier);
    this.consultatuionFicheSectionFichiers.loadDonneesImpression(impression.sectionFichier);
  }

  private loadGenericSection(id: string, section: GenericSectionImpressionDTO): void {
    const wrapper: SigctContentZoneComponent = this.sectionsContentZones.find(section => section.id == id);
    if (wrapper) {
      section.id = wrapper.id;
      section.title = wrapper.title;
      section.visible = !wrapper.collapsed;
    }
  }

  /** Journaliser l'accès à la consultation */
  private auditConsultation(idFicheAppel: number): void {
    this.subscriptions.add(
      this.ficheAppelApiService.auditConsultation(idFicheAppel).subscribe()
    );
  }

  onTelechargerFichier(idFichier: number) {
    let href = this.fichierService.getUrlBaseTelechargementAvecParametre(idFichier, "SO");
    let a = document.createElement('a');
    a.target = '_blank';
    a.href = href;
    a.click();
  }

  /**Corriger une fiche d'appel */
  onBtnCorrigerFicheClick(): void {
    this.corrigerFicheEvent.emit();
  }

  downloadFile(fileId: number): void {
    let href = this.noteComplementaireService.getLinktelechargement(this._ficheAppelId, fileId);
    let a = document.createElement('a');
    a.target = '_blank';
    a.href = href;
    a.click();
  }
}
