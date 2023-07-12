import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FicheAppelSocialDTO } from '../../../models';
import { TranslateService } from '@ngx-translate/core';
import { ConsultationAnterieureService, MedicationSocialService } from '../../../services';
import { ListInfoAffichageDto } from 'projects/sigct-ui-ng-lib/src/lib/components/list-info-affichage/list-info-affichage-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { CadreTextDto } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';
import { SectionDemandeAnalyseDTO } from '../../../models/section-demande-analyse-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';

@Component({
  selector: 'app-consultation-fiche-section-demande-analyse',
  templateUrl: './consultation-fiche-section-demande-analyse.component.html',
  styleUrls: ['./consultation-fiche-section-demande-analyse.component.css']
})
export class ConsultationFicheSectionDemandeAnalyseComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input("ficheAppelSocialDto")
  set ficheAppelSocialDto(value: FicheAppelSocialDTO) {
    this.displayConsentementFicheAnterieures = value?.usager?.consentementFichesAnterieures;
    this.buildConsultationDemandeAnalyseSection(value);
  }

  nomReferenceTypeFiche: string
  cadreTextDtoAccueil: CadreTextDto;
  cadreTextDtos: CadreTextDto[] = [];
  medicationSocialDTOs: ListInfoAffichageDto[] = [];
  consultationAnterieureListInfo: ListInfoAffichageDto[] = [];
  displayConsentementFicheAnterieures: boolean;
  referenceRaisonTypeInterventionCode: string;
  referenceRaisonTypeInterventionNom: string;


  constructor(private translateService: TranslateService,
    private medicationSocialService: MedicationSocialService,
    private consultationAnterieureService: ConsultationAnterieureService) { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionDemandeAnalyseDTO) {
    if (section) {
      section.typeFiche = this.nomReferenceTypeFiche;
      section.raisonFiche = this.referenceRaisonTypeInterventionNom;
      section.cadresTexts = [];
      if (this.cadreTextDtoAccueil && !StringUtils.isBlank(this.cadreTextDtoAccueil.plainText)) {
        section.cadresTexts.push({
          key: this.cadreTextDtoAccueil.titleLabel + (StringUtils.isBlank(this.cadreTextDtoAccueil.titleValue)
            ? " : " : " : " + this.cadreTextDtoAccueil.titleValue),
          value: this.cadreTextDtoAccueil.plainText
        });
      }
      this.cadreTextDtos?.filter(item => !StringUtils.isBlank(item.plainText))
        .forEach(item => {
          section.cadresTexts.push({
            key: item.titleLabel + (StringUtils.isBlank(item.titleValue) ? " : " : " : " + item.titleValue),
            value: item.plainText
          });
        });
      section.medicationsActuelles = [];
      this.medicationSocialDTOs?.forEach(item => {
        section.medicationsActuelles.push({ key: item.data, value: item.detail });
      })
    }
    section.consultationsAnterieures = [];
    this.consultationAnterieureListInfo?.forEach(item => {
      section.consultationsAnterieures.push({ key: item.data, value: item.detail });
    })
  }

  private buildConsultationDemandeAnalyseSection(ficheAppelSocialDto: FicheAppelSocialDTO): void {
    if (!ficheAppelSocialDto) {
      ficheAppelSocialDto = new FicheAppelSocialDTO();
    }
    // Rénitialiser la store pour préparer la prochaine itération
    this.cadreTextDtos = [];
    this.ficheTypeData(ficheAppelSocialDto);
    this.cadreTextDtoAccueil = this.accueilData(ficheAppelSocialDto);
    this.cadreTextDtos.push(this.analyseSituationData(ficheAppelSocialDto));
    this.cadreTextDtos.push(this.risqueSuicideData(ficheAppelSocialDto));
    this.cadreTextDtos.push(this.risqueHomicideData(ficheAppelSocialDto));
    this.cadreTextDtos.push(this.debaData(ficheAppelSocialDto));
    this.cadreTextDtos.push(this.competenceRessourceData(ficheAppelSocialDto));
    this.medicationData(ficheAppelSocialDto);
    this.consultationAnterieure(ficheAppelSocialDto);
  }

  private ficheTypeData = (ficheAppelSocialDto: FicheAppelSocialDTO): void => {
    if (ficheAppelSocialDto) {
      this.nomReferenceTypeFiche = ficheAppelSocialDto.nomReferenceTypeFiche;
      this.referenceRaisonTypeInterventionCode = ficheAppelSocialDto.referenceRaisonTypeInterventionCode;
      this.referenceRaisonTypeInterventionNom = ficheAppelSocialDto.referenceRaisonTypeInterventionNom;
    }
  }

  private accueilData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.accueil');
      cadreTextDto.plainText = ficheAppelSocialDto.accueil;
    }
    return cadreTextDto;
  }

  private analyseSituationData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.analysesituation');
    cadreTextDto.plainText = ficheAppelSocialDto.analyseSituation;
    return cadreTextDto;
  }

  private risqueSuicideData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.estimsuicide');
      cadreTextDto.titleValue = ficheAppelSocialDto.nomReferenceDangerSuicide;
      cadreTextDto.plainText = ficheAppelSocialDto.estimationSuicide;
    }
    return cadreTextDto;
  }

  private risqueHomicideData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.estimhomicide');
      cadreTextDto.titleValue = ficheAppelSocialDto.nomReferenceRisqueHomicide;
      cadreTextDto.plainText = ficheAppelSocialDto.estimationHomicide;
    }
    return cadreTextDto;
  }

  private debaData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.deba');
      cadreTextDto.plainText = ficheAppelSocialDto.deba;
    }
    return cadreTextDto;
  }

  private competenceRessourceData = (ficheAppelSocialDto: FicheAppelSocialDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSocialDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.so.f_appel.consultation.analyse.compress');
      cadreTextDto.plainText = ficheAppelSocialDto.competenceRessource
      return cadreTextDto;
    }
  }

  private medicationData = (ficheAppelSocialDto: FicheAppelSocialDTO): void => {
    if (ficheAppelSocialDto && ficheAppelSocialDto.id) {
      this.medicationSocialService.getListeMedication(ficheAppelSocialDto.id).subscribe(medicationSocialDTOsResult => {
        // Rénitialiser la store pour préparer la prochaine itération
        this.medicationSocialDTOs = [];
        if (medicationSocialDTOsResult && medicationSocialDTOsResult.length > 0) {
          medicationSocialDTOsResult.forEach((value) => {
            let listInfoAffichageDto: ListInfoAffichageDto = new ListInfoAffichageDto();
            listInfoAffichageDto.data = value.medication;
            listInfoAffichageDto.detail = value.details;
            this.medicationSocialDTOs.push(listInfoAffichageDto)
          });
        }
      })
    }
  }

  private consultationAnterieure = (ficheAppelSocialDto: FicheAppelSocialDTO): void => {
    if (ficheAppelSocialDto && ficheAppelSocialDto.id) {
      this.consultationAnterieureService.getListeConsultationAnterieure(ficheAppelSocialDto.id).subscribe(consultationAnterieureDTOsResult => {
        // Rénitialiser la store pour préparer la prochaine itération
        this.consultationAnterieureListInfo = [];
        consultationAnterieureDTOsResult.forEach((value) => {
          let listInfoAffichageDto: ListInfoAffichageDto = new ListInfoAffichageDto();
          listInfoAffichageDto.data = (value.quand ? value.quand + ", " : "") + (value.nomRefRessConsult ? value.nomRefRessConsult + ", " : "") + value.raison;
          listInfoAffichageDto.detail = value.precision;
          this.consultationAnterieureListInfo.push(listInfoAffichageDto)
        });
      })
    }
  }

}
