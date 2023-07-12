import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AvisDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models/avis-dto';
import { AvisService } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/services/avis.service';
import { AutresSourcesInformationApiService } from 'projects/infosante-ng-core/src/lib/services/autres-sources-information-api.service';
import { ImpressionAvisDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-avis-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import { ConsultationFicheSectionSuiteInterventionDto } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-suite-intervention/consultation-fiche-section-suite-intervention-dto';
import { ListObject } from 'projects/sigct-ui-ng-lib/src/lib/components/display-vertical-list-by-title/list-object';
import { VerticalListByTitleDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/display-vertical-list-by-title/vertical-list-by-title-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { forkJoin, Subscription } from 'rxjs';
import { FicheAppelDTO } from '../../../models/fiche-appel-dto';
import { SourcesInformationDTO } from '../../../models/sources-information-dto';

@Component({
  selector: 'app-consultation-section-intervention',
  templateUrl: './consultation-section-intervention.component.html',
  styleUrls: ['./consultation-section-intervention.component.css']
})
export class ConsultationSectionInterventionComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input("ficheAppelDto")
  set ficheAppelDto(value: FicheAppelDTO) {
    this.buildConsultationDataSectionIntervention(value);
  }

  @Output()
  consulterAvis: EventEmitter<number> = new EventEmitter();

  idFicheAppel: number;
  statutFicheAppel: StatutFicheAppelEnum;

  suiviInfo: string;
  consultationFicheSectionSuiteInterventionDto: ConsultationFicheSectionSuiteInterventionDto;
  sourcesInformationDTOs: SourcesInformationDTO[] = [];
  avisDTOs: AvisDTO[] = [];
  verticalListByTitleDTO: VerticalListByTitleDTO = new VerticalListByTitleDTO();

  private urlApi: string;
  private nonAmeliorationStr: string = "Si pas d'amélioration d'ici ";
  private consulterStr: string = ", consulter ";

  private subscription: Subscription = new Subscription();

  constructor(private translateService: TranslateService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private autresSourcesInformationApiService: AutresSourcesInformationApiService,
    private avisService: AvisService,
  ) {
    this.urlApi = window["env"].urlSanteApi;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }

  }

  private buildConsultationDataSectionIntervention(ficheAppelDTO: FicheAppelDTO): void {
    if (!ficheAppelDTO) {
      ficheAppelDTO = new FicheAppelDTO();
    }
    this.suiteIntervention(ficheAppelDTO);
    this.avisCommuniques(ficheAppelDTO);
  }

  private suiteIntervention(ficheAppelDTO: FicheAppelDTO): void {
    this.consultationFicheSectionSuiteInterventionDto = new ConsultationFicheSectionSuiteInterventionDto();
    if (ficheAppelDTO?.id) {
      this.consultationFicheSectionSuiteInterventionDto.aucuneSuite = ficheAppelDTO.aucuneSuite;
      this.consultationFicheSectionSuiteInterventionDto.autorisationTransmission = ficheAppelDTO.autorisationTransmission;
      this.consultationFicheSectionSuiteInterventionDto.consentementenFicheEnregistreur = ficheAppelDTO.consentementenFicheEnregistreur;
      this.suiviInfo = this.buildSuiviData(ficheAppelDTO);
      forkJoin([this.orientationSuitesInterventionService.getListOrientations(this.urlApi, ficheAppelDTO.id),
      this.referenceSuitesInterventionService.findAll(this.urlApi, ficheAppelDTO.id),
      this.autresSourcesInformationApiService.getListeAutresSourcesInformation(ficheAppelDTO.id)]).subscribe(result => {
        this.consultationFicheSectionSuiteInterventionDto.orientations = result[0] as OrientationSuitesInterventionDTO[];
        this.consultationFicheSectionSuiteInterventionDto.references = result[1] as ReferenceSuitesInterventionDTO[];
        this.sourcesInformationDTOs = result[2] as SourcesInformationDTO[];
        this.buildSourcesInformationData(this.sourcesInformationDTOs);
      })
    }
  }

  private buildSourcesInformationData(sourcesInformationDTOs: SourcesInformationDTO[]): void {
    this.verticalListByTitleDTO.listObjects = [];
    if (sourcesInformationDTOs?.length > 0) {
      this.verticalListByTitleDTO.title = this.translateService.instant('sigct.sa.f_appel.consultevaluation.AutreSourcesInformation');
      sourcesInformationDTOs.forEach(source => {
        let listObject: ListObject = new ListObject();
        listObject.nom = source.nom;
        listObject.detail = source.details;
        this.verticalListByTitleDTO.listObjects.push(listObject);
      });
    }
  }

  private buildSuiviData(ficheAppelDTO: FicheAppelDTO): string {
    if (ficheAppelDTO && ficheAppelDTO.id && ficheAppelDTO.delaiAmelioration && ficheAppelDTO.referenceRessourceSuiviNom) {
      return this.nonAmeliorationStr + ficheAppelDTO.delaiAmelioration + this.consulterStr + ficheAppelDTO.referenceRessourceSuiviNom;
    }
  }

  private avisCommuniques(ficheAppelDTO: FicheAppelDTO): void {
    this.idFicheAppel = ficheAppelDTO.id;
    this.statutFicheAppel = ficheAppelDTO.statut;
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

}
