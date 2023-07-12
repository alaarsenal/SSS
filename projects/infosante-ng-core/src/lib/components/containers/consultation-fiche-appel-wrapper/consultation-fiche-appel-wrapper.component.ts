import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ValidationFinInterventionDTO } from 'projects/infosante-ng-core/src/lib/models/validation-fin-intervention-dto';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ProjetRechercheService } from 'projects/infosante-ng-core/src/lib/services/projet-recherche.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { StatistiquesService } from 'projects/infosante-ng-core/src/lib/services/statistiques.service';
import { ValidationService } from 'projects/infosante-ng-core/src/lib/services/validation.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { ConsultationFichiersDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-fichiers-dto';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { ImpressionFicheDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-fiche-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { BandeFlottanteComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/bande-flottante/bande-flottante.component';
import { ConsultationFicheSectionAppelantComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-appelant/consultation-fiche-section-appelant.component';
import { ConsultationFicheSectionFichiersComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-fichiers/consultation-fiche-section-fichiers.component';
import { ConsultationFicheSectionIdentifiantComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-identifiant/consultation-fiche-section-identifiant.component';
import { IdentifiantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-identifiant/identifiant-dto';
import { ConsultationFicheSectionNoteComplComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-note-compl/consultation-fiche-section-note-compl.component';
import { ConsultationFicheSectionSignatureComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-signature/consultation-fiche-section-signature.component';
import { SignatureDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-signature/signature-dto';
import { ConsultationFicheSectionTerminaisonComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.component';
import { ConsultationFicheSectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.dto';
import { ConsultationFicheSectionUsagerDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager-dto';
import { ConsultationFicheSectionUsagerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-usager/consultation-fiche-section-usager.component';
import { EnumReponseValidation } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/enum-reponse-validation';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { ConsultationInteractionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-interaction-dto';
import { EMPTY, Subscription, forkJoin, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ConsultationAppelantDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/consultation-appelant-dto';
import { ConsultationNoteComplDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/consultation-note-compl-dto';
import { ConsultationFicheSectionRelanceComponent } from '../../../../../../sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-relance/consultation-fiche-section-relance.component';
import { RelanceService } from '../../../../../../sigct-ui-ng-lib/src/lib/components/relance/relance-api.service';
import { RelanceDTO } from '../../../../../../sigct-ui-ng-lib/src/lib/model/relance-dto';
import { ConsultationDemandeEvaluationDTO, ConsultationFicheAppelDTO, ConsultationReferentielDTO, SectionFicheAppelEnum } from '../../../models';
import { AppelDTO } from '../../../models/appel-dto';
import { FicheAppelDTO } from '../../../models/fiche-appel-dto';
import { ImpressionFicheSanteDTO } from '../../../models/impression-fiche-sante-dto';
import { ProtocoleDTO } from '../../../models/protocole-dto';
import { ConsultationApiService } from '../../../services/consultation-api.service';
import { CorrectionFicheAppelService } from '../../../services/correction-fiche-appel.service';
import { FicheAppelApiService } from '../../../services/fiche-appel-api.service';
import { NoteComplementaireService } from '../../../services/note-complementaire.service';
import { ConsultationDemandeEvaluationComponent } from '../../ui/consultation-demande-evaluation/consultation-demande-evaluation.component';
import { ConsultationSectionReferencielsComponent } from '../../ui/consultation-sect-referenciels/consultation-sect-referenciels.component';
import { ConsultationSectionInterventionComponent } from '../../ui/consultation-section-intervention/consultation-section-intervention.component';

const DEFAULT_LABEL_REPONSE_OUI: string = "Oui";
const DEFAULT_LABEL_REPONSE_NON: string = "Non";
const DEFAULT_LABEL_REPONSE_SO: string = "S.O.";

@Component({
  selector: 'sa-consultation-fiche-appel-wrapper',
  templateUrl: './consultation-fiche-appel-wrapper.component.html',
  styleUrls: ['./consultation-fiche-appel-wrapper.component.css']
})
export class ConsultationFicheAppelWrapperComponent implements OnInit, OnDestroy, AfterViewInit {

  subscriptions: Subscription = new Subscription();

  sectionsContentZones: SigctContentZoneComponent[];

  //Valeurs codés en dur dans les interventions
  private nonAmeliorationStr: string;
  private consulterStr: string;

  @Input("idAppel")
  set idAppel(value: number) {
    this._idAppel = value;
  }

  @Input()
  saisieDifferee: boolean = false;

  @Input("statutFiche")
  set statutFiche(value: string) {
    this._statutFiche = value;
  }

  @Input("idFicheAppel")
  set idFicheAppel(idFicheAppel: number) {
    // Alimente les différentes section avec les données de la fiche d'appel
    this.chargerDonnees(idFicheAppel);
    this._idFicheAppel = idFicheAppel;
  }

  @Input()
  afficherBoutonCorrigerFicheAppel: boolean;

  @Input()
  afficherBoutonConvertirFicheAppelEnNoteCompl: boolean = false;

  @Output()
  corrigerFicheEvent: EventEmitter<void> = new EventEmitter();

  _idAppel: number;
  _statutFiche: string;
  _afficherBtnAjouterNote: boolean = true;
  _idFicheAppel: number;
  user: User;

  consultationDemandeEvaluationDto: ConsultationDemandeEvaluationDTO;
  consultationReferentielsDTO: ConsultationReferentielDTO;
  consultationNoteComplDTO: ConsultationNoteComplDTO = new ConsultationNoteComplDTO();
  consultationFicheSectionUsagerDTO: ConsultationFicheSectionUsagerDTO;

  consultationFicheAppelDTO: ConsultationFicheAppelDTO;
  signatureDTO: SignatureDTO;
  identifiantDTO: IdentifiantDTO;

  ficheAppelSanteDto: FicheAppelDTO;
  consultationAppelantDTO: ConsultationAppelantDTO;

  moyenCommunication: ReferenceDTO[];
  typeCoordMoyenCommunication: ReferenceDTO[];

  isBtnAjouterNoteVisible: boolean = false;
  isBtnSupppFicheVisible: boolean = false;
  isBtnImprimerFicheVisible: boolean = false;

  isBtnAjouterRelanceVisible: boolean = false;
  isBtnModifierRelanceVisible: boolean = false;
  isBtnAjouterRelanceDisabled: boolean = false;
  isBtnModifierRelanceDisabled: boolean = false;
  isBtnCorrigerFicheVisible: boolean = false;
  isBtnConvertirFicheEnNoteComplVisible: boolean = false;

  infobulleAjouterRelance: string;
  infobulleModifierRelance: string;
  relanceARealiser: RelanceDTO;

  @ViewChild('consultationFicheSectionUsager', { static: true })
  consultationFicheSectionUsager: ConsultationFicheSectionUsagerComponent;

  @ViewChild('consultatuionFicheSectionDemandeEvaluation', { static: true })
  consultationFicheSectionDemandeEvaluation: ConsultationDemandeEvaluationComponent;

  @ViewChild('consultatuionFicheSectionReferenciels', { static: true })
  consultatuionFicheSectionReferenciels: ConsultationSectionReferencielsComponent;

  @ViewChild('consultationFicheSectionTerminaison', { static: true })
  consultationFicheSectionTerminaison: ConsultationFicheSectionTerminaisonComponent;

  @ViewChild('consultationFicheSectionNoteCompl', { static: true })
  consultatuionFicheSectionNoteCompl: ConsultationFicheSectionNoteComplComponent;

  @ViewChild('consultationFicheSectionIntervention', { static: true })
  consultationSectionInterventionComponent: ConsultationSectionInterventionComponent;

  @ViewChild('consultationFicheSectionSignature', { static: true })
  consultationFicheSectionSignature: ConsultationFicheSectionSignatureComponent;

  @ViewChild('consultationFicheSectionIdentifiant', { static: true })
  consultationFicheSectionIdentifiant: ConsultationFicheSectionIdentifiantComponent;

  @ViewChild('consultationFicheSectionAppelant', { static: true })
  consultatuionFicheSectionAppelant: ConsultationFicheSectionAppelantComponent;

  @ViewChild('consultationFicheSectionFichiers', { static: true })
  consultatuionFicheSectionFichiers: ConsultationFicheSectionFichiersComponent;

  @ViewChild('consultationFicheSectionRelance', { static: true })
  consultationFicheSectionRelance: ConsultationFicheSectionRelanceComponent;

  @ViewChild('bandeflottante', { static: true })
  bandeFlottante: BandeFlottanteComponent;

  @Output()
  ajouterNoteComplementaire: EventEmitter<void> = new EventEmitter();

  @Output()
  convertirFicheAppelEnNoteCompl: EventEmitter<void> = new EventEmitter();

  @Output()
  supprimerFicheApple: EventEmitter<any> = new EventEmitter();

  @Output()
  editionRelanceEvent: EventEmitter<void> = new EventEmitter();

  consultationFicheSectionTerminaisonDTO: ConsultationFicheSectionTerminaisonDTO;
  consultationFIchiersDTO: ConsultationFichiersDTO;
  validationFinInterventionDTO: ValidationFinInterventionDTO;

  listeCorrectionFicheAppel: FicheAppelCorrectionDTO[];

  private readonly REF_TABLE: string = "SA_FICHE_APPEL";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheAppelApiService: FicheAppelApiService,
    private consultationApiService: ConsultationApiService,
    private noteComplementaireService: NoteComplementaireService,
    private validationService: ValidationService,
    private statistiqueService: StatistiquesService,
    private ficheAppelDataService: FicheAppelDataService,
    private projetRechercheService: ProjetRechercheService,
    private referenceService: ReferencesApiService,
    private appelApiService: AppelApiService,
    private authenticationService: AuthenticationService,
    private relanceService: RelanceService,
    private translateService: TranslateService,
    private correctionFicheAppelService: CorrectionFicheAppelService,
    private fichierService: FichiersApiService) {
  }

  ngOnInit() {
    //Chargement des libelles pour le suivi.  Codr en dur dans l'interface de consultation
    this.nonAmeliorationStr = this.translateService.instant('sigct.ss.f_appel.consultation.intervention.suivi.amelioration');
    this.consulterStr = this.translateService.instant('sigct.ss.f_appel.consultation.intervention.suivi.consulter');

  }

  ngAfterViewInit(): void {
    //Le setTimeout evite l`erreur ExpressionChangedAfterItHasBeenCheckedError d`arriver.
    // voir article: https://blog.angular-university.io/angular-debugging/ pour comprendre.
    setTimeout(() => {
      this.chargerContentZonesSectionUsager();
      this.chargerContentZonesSectionDemandeEvaluation();
      this.chargerContentZonesSectionDemandeReferenciels();
      this.chargerContentZonesSectionTerminaison();
      this.chargerContentZonesSectionNoteCompl();
      this.chargerContentZonesSectionAppelant();
      this.chargerContentZonesSectionIntervention();
      this.chargerContentZonesSectionSignature();
      this.chargerContentZonesSectionIdentifiant();
      this.chargerContentZonesSectionRelance();
      this.chargerContentZonesSectionFichiers();
      this.bandeFlottante.setFocusOnOuvrirTout();

    }, 0);

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Alimente les différentes section avec les données d'une fiche d'appel.
   * @param idFicheAppel
   */
  private chargerDonnees(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.user = this.authenticationService.getAuthenticatedUser();
      this.chargerFicheAppelSante(idFicheAppel);
    }
  }

  chargerFicheAppel(idFicheAppel: number) {
    this.subscriptions.add(
      this.consultationApiService.getConsultationFicheAppel(idFicheAppel).subscribe((dto: ConsultationFicheAppelDTO) => {
        // Le bouton "Ajouter note complémentaire" visible si le statut de la fiche est 'F'.
        this.isBtnAjouterNoteVisible = (dto.statut == StatutFicheAppelEnum.FERME) && this._afficherBtnAjouterNote;
        this.consultationFicheAppelDTO = dto;

        this.chargerSectionUsager();
      })
    );
  }

  chargerFicheAppelSante(idFicheAppel: number) {
    this.subscriptions.add(
      this.ficheAppelApiService.getFicheAppel(idFicheAppel)
        .subscribe((ficheAppelDTO: FicheAppelDTO) => {
          this.ficheAppelSanteDto = ficheAppelDTO;
          this.auditConsultation(idFicheAppel);
          this.actualiserVisibiliteActions(ficheAppelDTO);
          //Le bouton ajouter une relance est visible dans les conditions si dessous:
          this.validerAffichageActionsRelances(ficheAppelDTO);
          this.chargerSectionUsager();
          this.chargerFicheAppel(idFicheAppel);
          this.chargerSectionSignature(idFicheAppel);
          this.chargerSectionDemandeEvaluation(idFicheAppel);
          this.chargerSectionReferentiels(idFicheAppel);
          this.chargerSectionNoteCompl(idFicheAppel);
          this.ficheAppelDataService.doRefreshListeFicheAppel();
          this.chargerSectionFichiers(idFicheAppel);

          this.bandeFlottante.setFocusOnOuvrirTout();
          this.chargerSectionTerminaison();
          this.chargerSectionInteraction(ficheAppelDTO.idAppel);
          this.chargerSectionIdentifiant(ficheAppelDTO);
          this.chargerSectionAppelant(ficheAppelDTO.idAppel, idFicheAppel);
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
          if (error.status == 200) {
            this.chargerFicheAppelSante(idFicheAppel);
          }
        })
    );
  }

  private validerAffichageActionsRelances(ficheAppelDTO: FicheAppelDTO) {
    this.isBtnAjouterRelanceVisible = false;
    this.isBtnModifierRelanceVisible = false;
    this.isBtnAjouterRelanceDisabled = false;
    this.isBtnModifierRelanceDisabled = false;
    if (AuthenticationUtils.hasAnyRole(['ROLE_SA_APPEL_RELANCE', 'ROLE_SA_APPEL_RELANCE_TOUS'])) {
      this.infobulleAjouterRelance = 'sigct.ss.f_appel.consultation.ajouterrelanceinfobulle';
      this.infobulleModifierRelance = 'sigct.ss.f_appel.consultation.modifierrelanceinfobulle';
      this.subscriptions.add(
        forkJoin([
          this.relanceService.isAfficherActionRelance(ficheAppelDTO.id, "SA"),
          this.relanceService.isActiverActionRelance(ficheAppelDTO.id, "SA"),
          this.relanceService.getRelanceARealiser(ficheAppelDTO.id, "SA")
        ]).subscribe(results => {
          const afficherRelance: boolean = results[0] as boolean;
          const activerRelance: boolean = results[1] as boolean || AuthenticationUtils.hasRole('ROLE_SA_APPEL_RELANCE_TOUS');
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

  chargerSectionDemandeEvaluation(idFicheAppel: number) {
    this.subscriptions.add(
      this.consultationApiService.getConsultationDemandeEvaluation(idFicheAppel).subscribe((dto: ConsultationDemandeEvaluationDTO) => {
        if (dto) {
          this.consultationDemandeEvaluationDto = dto;
          this.consultationDemandeEvaluationDto.idFicheAppel = idFicheAppel;
        }

      })
    );
  }

  chargerSectionReferentiels(idFicheAppel: number) {
    this.subscriptions.add(
      this.consultationApiService.getConsultationReferentiel(idFicheAppel).subscribe((dto: ConsultationReferentielDTO) => {
        this.consultationReferentielsDTO = dto;
      })
    );
  }

  private chargerSectionTerminaison(): void {
    this.consultationFicheSectionTerminaisonDTO = new ConsultationFicheSectionTerminaisonDTO();
    this.validationFinInterventionDTO = null;
    if (this.ficheAppelSanteDto) {
      this.consultationFicheSectionTerminaisonDTO.saisieDifferee = this.ficheAppelSanteDto.saisieDifferee;
      this.chargerSectionValidationFinIntervention();
      this.chargerSectionResumeIntervention();
      this.chargerSectionServicesUtilises();
      this.chargerSectionDureeFiche();
    }
  }

  private chargerSectionInteraction(idAppel: number): void {
    this.subscriptions.add(
      this.consultationApiService.getConsultationInteraction(idAppel).subscribe((dto: ConsultationInteractionDTO) => {
        this.consultationFicheSectionTerminaisonDTO.interaction = dto;
      })
    );
  }

  chargerSectionNoteCompl(idFicheAppel: number) {

    this.subscriptions.add(this.noteComplementaireService.obtainNotesAndTheirAttachedFiles(idFicheAppel).subscribe((result: ConsultationNoteComplDTO) => {
      if (result) {
        this.consultationNoteComplDTO = result;
      }
    }));
  }

  private chargerSectionValidationFinIntervention(): void {
    this.subscriptions.add(
      forkJoin([
        this.validationService.findAllByIdFicheAppel(this.ficheAppelSanteDto.id),
        this.referenceService.getListeValidation(),
        this.referenceService.getListeRaisonCpInconnu(),
        this.referenceService.getListeCategorieAppelant(),
        this.projetRechercheService.getListeProjetRecherche(this.ficheAppelSanteDto.id),
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
        const refCategorieAppelants = results[3] as ReferenceDTO[];
        const refCategorieAppelant: ReferenceDTO = refCategorieAppelants
          ? refCategorieAppelants.find(item => item.code == this.ficheAppelSanteDto.referenceCatgrAppelantConclusionCode)
          : null;
        let nomRefCategorieAppelant: string;
        if (refCategorieAppelant) {
          nomRefCategorieAppelant = refCategorieAppelant.simpleNom;
          if (refCategorieAppelant.codeCn) {
            nomRefCategorieAppelant = refCategorieAppelant.codeCn + " - " + nomRefCategorieAppelant;
          }
        }
        const refRaisonCpInconnus = results[2] as ReferenceDTO[];
        const refRaisonCpInconnu: ReferenceDTO = refRaisonCpInconnus
          ? refRaisonCpInconnus.find(item => item.code == this.ficheAppelSanteDto.referenceRaisonCPInconnuCode)
          : null;
        this.validationFinInterventionDTO = {
          validations: indicateurs,
          codePostalUsagerInconnu: this.ficheAppelSanteDto.codePostalUsagerInconnu,
          codeRefCategorieAppelant: this.ficheAppelSanteDto.referenceCatgrAppelantConclusionCode,
          nomRefCategorieAppelant: nomRefCategorieAppelant,
          codeRefRaisonCpInconnu: this.ficheAppelSanteDto.referenceRaisonCPInconnuCode,
          nomRefRaisonCpInconnu: refRaisonCpInconnu ? refRaisonCpInconnu.nom : null,
          details: this.ficheAppelSanteDto.detailsValidation,
          projetRecherches: results[4],
          opinionProf: '',
          labelServicesInterprete: '',
          labelServicesRelaisBell: '',
          labelDateDebutFiche: '',
          dateDebutFiche: null,
          labelDateFinFiche: null,
          dateFinFiche: null,
          labelDureeCalculee: null,
          labelDureeCorrigee: null,
          detailsDureeCorrigee: null
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
        this.statistiqueService.getListeRaisonAppel(this.ficheAppelSanteDto.id),
        this.statistiqueService.getListeRoleAction(this.ficheAppelSanteDto.id),
        this.referenceService.getListeCentreActivite(),
        this.referenceService.getListeLangueAppel(),
      ]).subscribe((results) => {
        this.consultationFicheSectionTerminaisonDTO.raisonsIntervention = results[0];
        this.consultationFicheSectionTerminaisonDTO.rolesAction = results[1];
        const referencesCentreActivites = results[2] as ReferenceDTO[];
        if (referencesCentreActivites) {
          this.consultationFicheSectionTerminaisonDTO.centreActivite = referencesCentreActivites.find(item => item.code == this.ficheAppelSanteDto.referenceCentreActiviteCode);
        }
        const referencesLangueAppel = results[3] as ReferenceDTO[];
        if (referencesLangueAppel) {
          this.consultationFicheSectionTerminaisonDTO.langueIntervention = referencesLangueAppel.find(item => item.code == this.ficheAppelSanteDto.referenceLangueAppelCode);
        }
      }, (error: HttpErrorResponse) => {
        console.log(error.message);
      })
    );
  }

  private chargerSectionServicesUtilises(): void {
    this.consultationFicheSectionTerminaisonDTO.servicesInterprete = this.ficheAppelSanteDto.servicesInterprete;
    this.consultationFicheSectionTerminaisonDTO.servicesRelaisBell = this.ficheAppelSanteDto.servicesRelaisBell;
    this.consultationFicheSectionTerminaisonDTO.detailsInterprete = this.ficheAppelSanteDto.detailsInterprete;
    this.consultationFicheSectionTerminaisonDTO.detailsRelaisBell = this.ficheAppelSanteDto.detailsRelaisBell;
  }

  private chargerSectionDureeFiche(): void {
    let isDureeVisible: boolean = false;

    this.subscriptions.add(
      this.appelApiService.obtenirNbFicheAppelStatutOuvert(this._idAppel).pipe(
        concatMap((nbFicheOuverte: number) => {
          if (nbFicheOuverte == 0) {
            isDureeVisible = true;

            return this.ficheAppelApiService.getSommeDureesFichesAppel(this.ficheAppelSanteDto.id);
          }
          return of(null);
        }),
        concatMap((sommeDurees: number) => {
          this.consultationFicheSectionTerminaisonDTO.dureeFiche = <DureeFicheAppelDTO>{
            dateDebut: this.ficheAppelSanteDto.dateDebut,
            dateFin: this.ficheAppelSanteDto.dateFin,
            dureeCorrigee: this.ficheAppelSanteDto.dureeCorrigee,
            dureeCumulee: sommeDurees,
            detailsDureeCorrigee: this.ficheAppelSanteDto.detailsDureeCorrigee,
            dateCreation: this.ficheAppelSanteDto.dateCreation,
            dateFinSaisieDifferee: this.ficheAppelSanteDto.dateFinSaisieDifferee,
            isDureeVisible: isDureeVisible,
          };

          return EMPTY;
        }),
      ).subscribe()
    );
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

  public chargerSectionAppelant(idAppel, idFicheAppel) {

    this.subscriptions.add(
      this.appelApiService.consulterAppelantByIdAppel(idAppel, idFicheAppel).subscribe(result => {
        if (result) {
          this.consultationAppelantDTO = result;
        }

      }
      ));

  }


  private chargerContentZonesSectionUsager(): void {
    if (this.consultationFicheSectionUsager.contentZones) {
      this.sectionsContentZones = this.consultationFicheSectionUsager.contentZones.toArray();
    }
  }

  private chargerContentZonesSectionDemandeEvaluation(): void {
    if (this.consultationFicheSectionDemandeEvaluation.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionDemandeEvaluation.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionDemandeReferenciels(): void {
    if (this.consultatuionFicheSectionReferenciels.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionReferenciels.contentZones.toArray());
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

  private chargerContentZonesSectionNoteCompl(): void {
    if (this.consultatuionFicheSectionNoteCompl.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionNoteCompl.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionAppelant(): void {
    if (this.consultatuionFicheSectionAppelant.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionAppelant.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionSignature(): void {
    if (this.consultationFicheSectionSignature && this.consultationFicheSectionSignature.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionSignature.contentZones.toArray())
    }
  }

  private chargerContentZonesSectionIntervention(): void {
    if (this.consultationSectionInterventionComponent.contentZones) {
      this.sectionsContentZones.push(...this.consultationSectionInterventionComponent.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionRelance(): void {
    if (this.consultationFicheSectionRelance.contentZones) {
      this.sectionsContentZones.push(...this.consultationFicheSectionRelance.contentZones.toArray());
    }
  }

  private chargerContentZonesSectionFichiers(): void {
    if (this.consultatuionFicheSectionFichiers.contentZones) {
      this.sectionsContentZones.push(...this.consultatuionFicheSectionFichiers.contentZones.toArray());
    }
  }

  chargerSectionUsager() {

    if (this.ficheAppelSanteDto) {

      const ficheAppelTerminee: boolean = this.ficheAppelSanteDto.statut == StatutFicheAppelEnum.FERME;
      this.consultationFicheSectionUsagerDTO = this.ficheAppelSanteDto.usager
        ? {
          idUsager: !ficheAppelTerminee
            ? this.ficheAppelSanteDto.usager.usagerIdentification?.id
            : null,
          idUsagerHisto: ficheAppelTerminee
            ? this.ficheAppelSanteDto.usager.idUsagerIdentHisto
            : null,
          ageAnnees: this.ficheAppelSanteDto.usager.ageAnnees,
          ageMois: this.ficheAppelSanteDto.usager.ageMois,
          ageJours: this.ficheAppelSanteDto.usager.ageJours
        }
        : null;
    }
  }

  private actualiserVisibiliteActions(ficheAppelDTO: FicheAppelDTO): void {
    this.isBtnAjouterNoteVisible = false;
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
        && AuthenticationUtils.hasRole('ROLE_SA_APPEL_MODIF_ADM');
      this.isBtnConvertirFicheEnNoteComplVisible = this.afficherBoutonConvertirFicheAppelEnNoteCompl
        && AuthenticationUtils.hasRole('ROLE_SA_APPEL_NOTE');
    } else if (StatutFicheAppelEnum.OUVERT == ficheAppelDTO?.statut) {
      // Le bouton "Supprimer" visible si le statut de la fiche est 'O' et l'usager connecté est lui-même le créateur.
      this.isBtnSupppFicheVisible = this.user?.name == ficheAppelDTO?.usernameCreation;
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

  scrollToElement(element) {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }

  onBtnSupprimerFicheAppelClick() {
    let dataFicheASupp = {
      idFicheAppel: this._idFicheAppel,
      idAppel: this._idAppel
    }
    this.supprimerFicheApple.emit(dataFicheASupp);
  }

  onConsulterAvis(idAvis: number) {
    this.router.navigate(["../" + SectionFicheAppelEnum.AVIS], { relativeTo: this.route, queryParams: { idAvis: idAvis } });
  }

  onConsulterProtocole(protocole: ProtocoleDTO): void {
    // Accède au protocole du menu vertical si la fiche est ouverte et qu'il s'agit d'une fiche GIEA
    if (this.ficheAppelDataService.getStatutFicheAppelActive() == StatutFicheAppelEnum.OUVERT && protocole.idFicheAppel) {
      this.router.navigate(["../" + SectionFicheAppelEnum.PROTOCOLES], { relativeTo: this.route, queryParams: { idProtocole: protocole.idFicheAppel } });
    }
  }

  chargerSectionFichiers(idFicheAppel: number) {

    let dto = new ConsultationFichiersDTO();

    this.subscriptions.add(
      this.fichierService.liste(idFicheAppel, this.REF_TABLE, "SA").subscribe(results => {
        if (results) {
          dto.listeFichiers = results;

          dto.listeFichiers.forEach(item => {
            const linkTelechargement = this.fichierService.getLinktelechargement(idFicheAppel, item.id, "SA");
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

  public chargerSectionIdentifiant(ficheAppelDTO: FicheAppelDTO): void {
    this.identifiantDTO = new IdentifiantDTO();
    if (ficheAppelDTO) {
      this.identifiantDTO.idFicheAppel = ficheAppelDTO.id;
      if (ficheAppelDTO.usager?.usagerIdentification?.id) {
        this.identifiantDTO.idUsagerIdent = ficheAppelDTO.usager.usagerIdentification.id;
      }
      if (ficheAppelDTO.idAppel) {
        this.subscriptions.add(
          forkJoin([
            this.appelApiService.obtenirAppel(ficheAppelDTO.idAppel),
            this.appelApiService.obtenirFicheAppels(ficheAppelDTO.idAppel)]).subscribe((results) => {
              if (results[0]) {
                const appelDto: AppelDTO = results[0] as AppelDTO;
                this.identifiantDTO.dureeCompleteAppel = appelDto.dureeComplete ? DateUtils.secondesToHHMMSS(appelDto.dureeComplete) : "";
              }

              if (results[1]) {
                const listeFicheAppel: FicheAppelDTO[] = results[1] as FicheAppelDTO[];
                if (listeFicheAppel?.length > 0) {
                  let fichesRelieesNonSupp = listeFicheAppel.filter(dto => dto.statut != StatutFicheAppelEnum.SUPPRIMER && dto.id != ficheAppelDTO.id);
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


  /** Charge les données des composants dans la fiche d'impression */
  onBtnImprimerClick(): void {
    let impressionFiche = new ImpressionFicheSanteDTO();
    impressionFiche.idFicheAppel = this._idFicheAppel;
    impressionFiche.idAppel = this._idAppel;
    this.loadSectionIntervention(impressionFiche);
    this.loadSectionIdentificationUsager(impressionFiche);
    this.loadSectionInformationSuppUsager(impressionFiche);
    this.loadSectionCommunicationUsager(impressionFiche);
    this.loadSectionAdresseUsager(impressionFiche);
    this.loadSectionAppelantInitial(impressionFiche);
    this.loadSectionDemandeAnalyse(impressionFiche);
    this.loadSectionTerminaison(impressionFiche);
    this.loadSectionFichiers(impressionFiche);
    this.loadSectionSignature(impressionFiche);
    this.loadSectionIdentifiant(impressionFiche);
    this.loadSectionRelance(impressionFiche);
    this.loadSectionNoteComplementaire(impressionFiche);
    this.loadSectionReferentiels(impressionFiche);
    this.genererPdf(impressionFiche);
  }

  /** Envoi du formulaire vers le service d'impression et télécharge le document */
  private genererPdf(impressionFiche: ImpressionFicheSanteDTO) {
    this.subscriptions.add(
      this.ficheAppelApiService.genererPdf(impressionFiche)
        .subscribe((dto: ImpressionFicheDTO) => {
          if (dto) {

            const data: any = dto.fileContent;
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          }

        })
    );
  }

  private loadSectionIdentificationUsager(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-identification-usager", impression.sectionIdentificationUsager);
    this.consultationFicheSectionUsager.loadSectionIdentificationUsager(impression.sectionIdentificationUsager);
  }

  private loadSectionInformationSuppUsager(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-informations-supp-usager", impression.sectionInformationsSupp);
    this.consultationFicheSectionUsager.loadSectionInformationSupp(impression.sectionInformationsSupp);
  }

  private loadSectionCommunicationUsager(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-communications-usager", impression.sectionCommunicationUsager);
    this.consultationFicheSectionUsager.loadSectionCommunicationUsager(impression.sectionCommunicationUsager);
  }

  private loadSectionAdresseUsager(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-adresses-usager", impression.sectionAdresseUsager);
    this.consultationFicheSectionUsager.loadSectionAdresseUsager(impression.sectionAdresseUsager);
  }

  private loadSectionAppelantInitial(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-appelant-initial", impression.sectionAppelantInitial);
    this.consultatuionFicheSectionAppelant.loadDonneesImpression(impression.sectionAppelantInitial);
  }

  private loadSectionDemandeAnalyse(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-demande-evaluation", impression.sectionDemandeAnalyseDto);
    this.consultationFicheSectionDemandeEvaluation.loadDonneesImpression(impression.sectionDemandeAnalyseDto);
    impression.consultationDemandeEvaluationDto = this.consultationDemandeEvaluationDto;
  }

  private loadSectionTerminaison(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-terminaison", impression.sectionTerminaisonDto);
    this.consultationFicheSectionTerminaison.loadDonneesImpressionSante(impression, this.validationFinInterventionDTO);
    //Parce que ValidationFinInterventionDTO est différent d'un environnement à l'autre, il ne peut être
    //chargé dans la fonction de chargement du composant commun
    impression.validationFinInterventionDTO = this.validationFinInterventionDTO;
  }

  private loadSectionSignature(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-signature", impression.sectionSignature);
    this.consultationFicheSectionSignature.loadDonneesImpression(impression.sectionSignature);
  }

  private loadSectionIdentifiant(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-identifiant", impression.sectionIdentifiant);
    this.consultationFicheSectionIdentifiant.loadDonneesImpression(impression.sectionIdentifiant);
  }

  private loadSectionRelance(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-relance", impression.sectionRelance);
    this.consultationFicheSectionRelance.loadDonneesImpression(impression.sectionRelance);
  }

  private loadSectionNoteComplementaire(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-notes-complementaires", impression.sectionNoteComplementaire);
    this.consultatuionFicheSectionNoteCompl.loadDonneesImpression(impression.sectionNoteComplementaire);
  }

  private loadSectionReferentiels(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-referentiels", impression.sectionConsultationReferentielsDTO);
    let visible = impression.sectionConsultationReferentielsDTO.visible;
    this.consultationReferentielsDTO.visible = visible;
    impression.sectionConsultationReferentielsDTO = this.consultationReferentielsDTO;
  }

  private loadSectionFichiers(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-fichiers", impression.sectionFichier);
    this.consultatuionFicheSectionFichiers.loadDonneesImpression(impression.sectionFichier);
  }

  private loadSectionIntervention(impression: ImpressionFicheSanteDTO): void {
    this.loadGenericSection("section-intervention", impression.consultationFicheSectionSuiteInterventionDto);
    let visible = impression.consultationFicheSectionSuiteInterventionDto.visible;
    impression.sectionPlanAction.avis = this.consultationSectionInterventionComponent.avisDTOs;
    impression.consultationFicheSectionSuiteInterventionDto = this.consultationSectionInterventionComponent.consultationFicheSectionSuiteInterventionDto;
    impression.consultationFicheSectionSuiteInterventionDto.sourcesInformationDTOs = this.consultationSectionInterventionComponent.sourcesInformationDTOs;
    impression.consultationFicheSectionSuiteInterventionDto.verticalListByTitleDTO = this.consultationSectionInterventionComponent.verticalListByTitleDTO;
    impression.consultationFicheSectionSuiteInterventionDto.visible = visible;
    impression.consultationFicheSectionSuiteInterventionDto.suivi = this.buildSuiviData(this.ficheAppelSanteDto);
  }


  /** Indique si la section sera visible dans la fiche d'impression */
  private loadGenericSection(id: string, section: GenericSectionImpressionDTO): void {
    const wrapper: SigctContentZoneComponent = this.sectionsContentZones.find(section => section.id == id);
    if (wrapper) {
      section.id = wrapper.id;
      section.title = wrapper.title;
      section.visible = !wrapper.collapsed;
    }
  }

  /** Construit le message de suivi pour la section d'intervention */
  private buildSuiviData(ficheAppelDTO: FicheAppelDTO): string {
    if (ficheAppelDTO && ficheAppelDTO.id && ficheAppelDTO.delaiAmelioration && ficheAppelDTO.referenceRessourceSuiviNom) {
      return this.nonAmeliorationStr + ficheAppelDTO.delaiAmelioration + this.consulterStr + ficheAppelDTO.referenceRessourceSuiviNom;
    }
  }

  /** Journaliser l'accès à la consultation */
  private auditConsultation(idFicheAppel: number): void {
    this.subscriptions.add(
      this.ficheAppelApiService.auditConsultation(idFicheAppel).subscribe()
    );
  }

  onTelechargerFichier(idFichier: number) {
    let href = this.fichierService.getUrlBaseTelechargementAvecParametre(idFichier, "SA");
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
    let href = this.noteComplementaireService.getLinktelechargement(this._idFicheAppel, fileId);
    let a = document.createElement('a');
    a.target = '_blank';
    a.href = href;
    a.click();
  }
}
