import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AvisDTO } from 'projects/infosocial-ng-app/src/app/modules/fiche-appel/models/avis-dto';
import { AvisService } from 'projects/infosocial-ng-app/src/app/modules/fiche-appel/services/avis.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { CadreTextDto, TypeCadre } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';
import { ImpressionAvisDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-avis-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ConsultationFicheSectionSuiteInterventionDto } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-suite-intervention/consultation-fiche-section-suite-intervention-dto';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { forkJoin, Subscription } from 'rxjs';
import { FicheAppelSocialDTO } from '../../../models';
import { SectionPlanActionDTO } from '../../../models/section-plan-action-dto';
import { FicheAppelDataService } from '../../../services/fiche-appel-data.service';

@Component({
  selector: 'app-consultation-fiche-section-plan-action',
  templateUrl: './consultation-fiche-section-plan-action.component.html',
  styleUrls: ['./consultation-fiche-section-plan-action.component.css']
})
export class ConsultationFicheSectionPlanActionComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input("ficheAppelSocialDto")
  set ficheAppelSocialDto(value: FicheAppelSocialDTO) {
    this.buildConsultationDataSectionPlanAction(value);
  }

  @Output()
  consulterAvis: EventEmitter<number> = new EventEmitter();

  public avisDTOs: AvisDTO[] = [];

  public orientations: OrientationSuitesInterventionDTO[];

  idFicheAppel: number;
  statutFicheAppel: StatutFicheAppelEnum;

  cadreTextDtosSectionPlanAction: CadreTextDto[] = [];

  consultationFicheSectionSuiteInterventionDto: ConsultationFicheSectionSuiteInterventionDto;

  private urlApi: string;
  private urlGippConsultation: string;

  private subscription: Subscription = new Subscription();

  constructor(private ficheAppelDataService: FicheAppelDataService,
    private translateService: TranslateService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private avisService: AvisService,
    private router: Router,
    private appContextStore: AppContextStore,
    private authService: AuthenticationService,
    private modalConfirmService: ConfirmationDialogService) {
    this.urlApi = window["env"].urlInfoSocial + '/api';
    this.urlGippConsultation = window["env"].urlGippConsultation;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }

  }

  loadDonneesImpression(section: SectionPlanActionDTO) {
    if (section) {
      section.cadresTexts = [];
      let cadreTextDtosSectionPlanAction: CadreTextDto[] = JSON.parse(localStorage.getItem('cadreTextDtosSectionPlanAction'));
      cadreTextDtosSectionPlanAction.forEach(elemt => {
        if (elemt.typeCadre == 1) {
          section.moyenModalites = elemt.plainText;
          if (CollectionUtils.isNotBlank(elemt.infoList)) {
            section.referentiels = [];
            elemt.infoList?.forEach(subItem => {
              section.referentiels.push({ key: null, value: subItem });
            });
          }
        } else {
          section.cadresTexts.push({ key: elemt.titleLabel, value: elemt.plainText });
        }
      });

      section.aucuneSuite = this.consultationFicheSectionSuiteInterventionDto.aucuneSuite;
      section.autorisationTransmission = this.consultationFicheSectionSuiteInterventionDto.autorisationTransmission;
      section.orientations = this.consultationFicheSectionSuiteInterventionDto.orientations;
      section.references = this.consultationFicheSectionSuiteInterventionDto.references;
      section.avis = this.avisDTOs;
      section.consentementenFicheEnregistreur = this.consultationFicheSectionSuiteInterventionDto.consentementenFicheEnregistreur;
    }
  }

  private buildConsultationDataSectionPlanAction(ficheAppelSocialDTO: FicheAppelSocialDTO): void {
    if (!ficheAppelSocialDTO) {
      ficheAppelSocialDTO = new FicheAppelSocialDTO();
    }
    this.cadreTextDtosSectionPlanAction = [];
    this.cadreTextDtosSectionPlanAction.push(this.difficultePriorisee(ficheAppelSocialDTO));
    this.cadreTextDtosSectionPlanAction.push(this.objectifAtteindreCourtTerme(ficheAppelSocialDTO));
    this.cadreTextDtosSectionPlanAction.push(this.moyenModalite(ficheAppelSocialDTO));
    this.suiteIntervention(ficheAppelSocialDTO);
    this.avisCommuniques(ficheAppelSocialDTO);
    localStorage.setItem('cadreTextDtosSectionPlanAction', JSON.stringify(this.cadreTextDtosSectionPlanAction));
  }

  private difficultePriorisee = (ficheAppelSocialDTO: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDTO) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.planaction.difficultepriorisee');
      cadreTextDto.plainText = ficheAppelSocialDTO.difficultePriorisee;
    }

    return cadreTextDto;
  }

  private objectifAtteindreCourtTerme = (ficheAppelSocialDTO: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDTO) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.planaction.objectif');
      cadreTextDto.plainText = ficheAppelSocialDTO.objectif;
    }

    return cadreTextDto;
  }

  private moyenModalite = (ficheAppelSocialDTO: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDTO) {
      cadreTextDto.titleFieldset = this.translateService.instant('sigct.so.f_appel.consultation.planaction.moyensmodalites');
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.planaction.moyensmodalites.referentiels');

      cadreTextDto.datas = ficheAppelSocialDTO.moyensSocialDTOByDocName;
      cadreTextDto.isFicheAppelOuvert = ficheAppelSocialDTO?.statut == StatutFicheAppelEnum.OUVERT;
      cadreTextDto.plainText = ficheAppelSocialDTO.intervention;
      cadreTextDto.typeCadre = TypeCadre.Fieldset;
      cadreTextDto.infoList = [];
      if (ficheAppelSocialDTO.nomDocumentIdentifications && ficheAppelSocialDTO.nomDocumentIdentifications.length > 0) {
        cadreTextDto.infoList = ficheAppelSocialDTO.nomDocumentIdentifications;
      }
    }

    return cadreTextDto;
  }

  private suiteIntervention(ficheAppelSocialDTO: FicheAppelSocialDTO): void {
    this.consultationFicheSectionSuiteInterventionDto = new ConsultationFicheSectionSuiteInterventionDto();
    if (ficheAppelSocialDTO && ficheAppelSocialDTO.id) {
      forkJoin([this.orientationSuitesInterventionService.getListOrientations(this.urlApi, ficheAppelSocialDTO.id),
      this.referenceSuitesInterventionService.findAll(this.urlApi, ficheAppelSocialDTO.id)]).subscribe(result => {
        this.consultationFicheSectionSuiteInterventionDto.orientations = result[0] as OrientationSuitesInterventionDTO[];
        this.consultationFicheSectionSuiteInterventionDto.references = result[1] as ReferenceSuitesInterventionDTO[];
        this.consultationFicheSectionSuiteInterventionDto.aucuneSuite = ficheAppelSocialDTO.aucuneSuite;
        this.consultationFicheSectionSuiteInterventionDto.autorisationTransmission = ficheAppelSocialDTO.autorisationTransmission;
        this.consultationFicheSectionSuiteInterventionDto.consentementenFicheEnregistreur = ficheAppelSocialDTO.consentementenFicheEnregistreur;
      })
    }
  }

  private avisCommuniques(ficheAppelSocialDTO: FicheAppelSocialDTO): void {
    this.idFicheAppel = ficheAppelSocialDTO.id;
    this.statutFicheAppel = ficheAppelSocialDTO.statut;
    if (this.idFicheAppel) {
      this.subscription.add(this.avisService.getListeAvis(this.idFicheAppel).subscribe(result => {
        if (result) {
          this.avisDTOs = result;
        }
      }));
    }
  }

  afficherAvis(idAvis: number) {
    if (this.statutFicheAppel == StatutFicheAppelEnum.OUVERT) {
      this.consulterAvis.emit(idAvis);
    } else {
      this.genererPdf(idAvis);
    }
  }

  private genererPdf(idAvis: number) {
    if (this.idFicheAppel) {
      this.subscription.add(
        this.avisService.genererPdfAvis(this.idFicheAppel, idAvis)
          .subscribe((dto: ImpressionAvisDTO) => {
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
  }

  //Consulter un référentiel en PDF format
  consultReferentielPDF(consultPdfData: any): void {
    if (this.authService.hasAllRoles(['ROLE_SO_GIPP_CONSULT'])) {
      let target = this.urlGippConsultation + "/" + consultPdfData.codeDocumentIdentificationReferenceDocumentTypeSocial + "/" + consultPdfData.idDocumentIdentificationSocial + "/identification/pdf"
      window.open(target, "_blank");
    } else {
      this.openModal('confirm_popup_doc_ref_or_pdf_non_access');
    }
  }

  //Consulter un référentiel
  consultReferentiel(consultData: any): void {
    if (this.authService.hasAllRoles(['ROLE_SO_GIPP_CONSULT'])) {
      let ficheAppelSocialDto: FicheAppelSocialDTO = this.ficheAppelDataService.getFicheAppelActive();
      this.appContextStore.setvalue("contextConsultationReferentiel", true);
      this.appContextStore.setvalue("consultData", { idDocumentIdentificationSocial: consultData.idDocumentIdentificationSocial, nomReferentiel: consultData.nomDocumentIdentificationSocial, codeTypeReferentiel: consultData.codeDocumentIdentificationReferenceDocumentTypeSocial });

      let target = "/editer/appel/" + ficheAppelSocialDto.idAppel + "/fiche/" + ficheAppelSocialDto.id + "/protocoles"
      this.router.navigate([target]);
    } else {
      this.openModal('confirm_popup_doc_ref_or_pdf_non_access');
    }
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  FermerModalNonAccessDoc() {
    this.closeModal('confirm_popup_doc_ref_or_pdf_non_access');
  }

}
