import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { ConsultationManifestationSigneDemarcheAnterieureDTO, TypeManifestationSigneDemarcheAnterieureEnum } from '../../../models';
import { ConsultationDemandeEvaluationDTO } from '../../../models/consultation-demande-evaluation-dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SectionDemandeAnalyseDTO } from '../../../models/section-demande-analuse-dto';
import { CadreTextDto, TypeCadre } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';
import { ListInfoAffichageDto } from 'projects/sigct-ui-ng-lib/src/lib/components/list-info-affichage/list-info-affichage-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { TranslateService } from '@ngx-translate/core';
import { ConsultationApiService } from '../../../services/consultation-api.service';

@Component({
  selector: 'app-consultation-demande-evaluation',
  templateUrl: './consultation-demande-evaluation.component.html',
  styleUrls: ['./consultation-demande-evaluation.component.css']
})
export class ConsultationDemandeEvaluationComponent implements OnInit {
  dto: ConsultationDemandeEvaluationDTO;

  typeManifestationSigneDemarcheAnterieureEnum = TypeManifestationSigneDemarcheAnterieureEnum; // Pour utiliser l'enum dans le html

  donneesPertinentesHtml: SafeHtml;

  @Input()
  set consultationDemandeEvaluationDto(consultationDemandeEvaluationDto: ConsultationDemandeEvaluationDTO) {
    this.dto = consultationDemandeEvaluationDto;
    this.buildConsultationDemandeAnalyseSection(this.dto);
    if (this.dto?.donneesPertinentes) {
      this.donneesPertinentesHtml = this.sanitizer.bypassSecurityTrustHtml(this.dto.donneesPertinentes);
    }
  }

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  nomReferenceTypeFiche: string
  cadreTextDtoAccueil: CadreTextDto;
  cadreTextDtos: CadreTextDto[] = [];
  antecedentSanteDTOs: ListInfoAffichageDto[] = [];
  medicationSanteDTOs: ListInfoAffichageDto[] = [];
  mansignevitdemarchesDTOS:  ListInfoAffichageDto[] = [];
  displayConsentementFicheAnterieures: boolean;

  constructor(private sanitizer: DomSanitizer,
              private translateService: TranslateService,
              private consultationApiService: ConsultationApiService ) { }

  ngOnInit(): void {
  }

  isDateHeureDetailsIdentiques(o1: ConsultationManifestationSigneDemarcheAnterieureDTO, o2: ConsultationManifestationSigneDemarcheAnterieureDTO): boolean {
    let isDateIdentique: boolean = (o1?.dateDemandeEvaluation == o2?.dateDemandeEvaluation);
    let isHeureIdentique: boolean = (o1?.heureDemandeEvaluation == o2?.heureDemandeEvaluation);
    let isDetailsIdentique: boolean = (o1?.detailDemandeEvaluation == o2?.detailDemandeEvaluation);

    return isDateIdentique && isHeureIdentique && isDetailsIdentique;
  }

  isFirstVide(o1: ConsultationManifestationSigneDemarcheAnterieureDTO): boolean {
    let vide : boolean = false; 

    let idx = this.dto.manifestationSigneDemarcheAnterieures.findIndex((value) => (!value.dateDemandeEvaluation) && (!value.heureDemandeEvaluation) && (!value.detailDemandeEvaluation)  );

    for(let i = 0; i < this.dto.manifestationSigneDemarcheAnterieures.length; i++){
      if(i == idx  && o1 == this.dto.manifestationSigneDemarcheAnterieures[i]){
        vide = true;
        break;
      }
    } 

    return vide; 
  }

  loadDonneesImpression(section: SectionDemandeAnalyseDTO) {
    if (section) {
      section.typeFiche = this.nomReferenceTypeFiche;
      section.cadresTexts = [];
      if (this.cadreTextDtoAccueil && !StringUtils.isBlank(this.cadreTextDtoAccueil.plainText)) {
        section.cadresTexts.push({
          key: this.cadreTextDtoAccueil.titleLabel,
          value: this.cadreTextDtoAccueil.plainText
        });
      }
      this.cadreTextDtos?.filter(item => !StringUtils.isBlank(item.plainText))
        .forEach(item => {
          section.cadresTexts.push({
            key: item.titleLabel ,
            value: item.plainText
          });
        });
      section.antecedentsActuelles = [];
      
      section.antecedentsActuelles = this.dto.antecedents;
     
      section.medicationsActuelles = [];
      
      section.medicationsActuelles = this.dto.medications;

      section.manSigneAnterieurActuelles = [];
      section.manSigneAnterieurActuelles = this.dto.manifestationSigneDemarcheAnterieures;
      
    }
  

  }

  private buildConsultationDemandeAnalyseSection(ficheAppelSanteDto: ConsultationDemandeEvaluationDTO): void {
    if (!ficheAppelSanteDto) {
      ficheAppelSanteDto = new ConsultationDemandeEvaluationDTO();
    }
    // Rénitialiser la store pour préparer la prochaine itération
    this.cadreTextDtos = [];
    this.cadreTextDtos.push(this.demandeInitialeData(ficheAppelSanteDto));
    this.cadreTextDtos.push(this.consentementFichesAnterieurs(ficheAppelSanteDto));
    this.cadreTextDtos.push(this.reseauSoutienData(ficheAppelSanteDto));
    this.cadreTextDtos.push(this.donneesPertinentesData(ficheAppelSanteDto));
    this.mansignevitdemarchesData(ficheAppelSanteDto);
    
    
    
  }

  private demandeInitialeData = (ficheAppelSanteDto: ConsultationDemandeEvaluationDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSanteDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.sa.f_appel.consultevaluation.deminit');
      cadreTextDto.plainText = ficheAppelSanteDto.demandeInitiale;
    }
    return cadreTextDto;
  }

  private reseauSoutienData = (ficheAppelSanteDto: ConsultationDemandeEvaluationDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSanteDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.sa.f_appel.consultevaluation.resosoutien');
      cadreTextDto.titleValue = ficheAppelSanteDto.detailsSoutien;
      if(ficheAppelSanteDto.reseauSoutien){
        cadreTextDto.plainText = ficheAppelSanteDto.reseauSoutien;
      } else {
        cadreTextDto.plainText = "";
      }
      
      if(ficheAppelSanteDto.detailsSoutien){
        cadreTextDto.plainText += " <i>(" + ficheAppelSanteDto.detailsSoutien + ")</i>";
      }
    }
    return cadreTextDto;
  }

  private consentementFichesAnterieurs = (dto: ConsultationDemandeEvaluationDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (this.dto && this.dto.consentementFichesAnterieurs) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.sa.f_appel.consultevaluation.consentementfichesant') + " : "; 
      cadreTextDto.typeCadre = TypeCadre.Ordinaire;
      cadreTextDto.titleValue = "Oui";
      cadreTextDto.plainText = "sigct.sa.f_appel.consultevaluation.consentementfichesant";
    }
    return cadreTextDto;
  }

  private donneesPertinentesData = (ficheAppelSanteDto: ConsultationDemandeEvaluationDTO): CadreTextDto => {
    let cadreTextDto: CadreTextDto = new CadreTextDto();
    if (ficheAppelSanteDto) {
      cadreTextDto.titleLabel = this.translateService.instant('sigct.sa.f_appel.consultevaluation.donnepert');
      cadreTextDto.plainText = ficheAppelSanteDto.donneesPertinentes;
    }
    return cadreTextDto;
  }

  private mansignevitdemarchesData = (ficheAppelSanteDto: ConsultationDemandeEvaluationDTO): void => {

    if (ficheAppelSanteDto && ficheAppelSanteDto.idFicheAppel) {
      this.consultationApiService.getConsultationDemandeEvaluation(ficheAppelSanteDto.idFicheAppel).subscribe(dtoResult => {
        
        // Rénitialiser la store pour préparer la prochaine itération
        this.mansignevitdemarchesDTOS = [];

        if (dtoResult.manifestationSigneDemarcheAnterieures && dtoResult.manifestationSigneDemarcheAnterieures.length > 0) {
          if(dtoResult.antecedents){

            dtoResult.antecedents.forEach((value) => {
              if(value){
  
                let listInfoAffichageDto: ListInfoAffichageDto = new ListInfoAffichageDto();
                listInfoAffichageDto.data = value.antecedent;
                listInfoAffichageDto.detail = value.details;
                this.mansignevitdemarchesDTOS.push(listInfoAffichageDto)
  
              }
            });

          }
         
        }
        
        this.antecedentSanteDTOs = [];

        if (dtoResult.antecedents && dtoResult.antecedents.length > 0) {
          dtoResult.antecedents.forEach((value) => {
            let listInfoAffichageDto: ListInfoAffichageDto = new ListInfoAffichageDto();
            listInfoAffichageDto.data = value.antecedent;
            listInfoAffichageDto.detail = value.details;
            this.antecedentSanteDTOs.push(listInfoAffichageDto)
          });
        }

        this.medicationSanteDTOs = [];

        if (dtoResult.medications && dtoResult.medications.length > 0) {
          dtoResult.medications.forEach((value) => {
            let listInfoAffichageDto: ListInfoAffichageDto = new ListInfoAffichageDto();
            listInfoAffichageDto.data = value.medicament;
            listInfoAffichageDto.detail = value.details;
            this.medicationSanteDTOs.push(listInfoAffichageDto)
          });
        }


      })
    }
  
  }



}
