import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ReferenceDTO, UsagerCommDTO, UsagerLieuResidenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerCommHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-comm-histo-dto';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { UsagerLieuResidenceHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-lieu-residence-histo-dto';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { UtilitaireService } from 'projects/usager-ng-core/src/lib/services/utilitaire.service';
import { forkJoin, Subscription } from 'rxjs';
import { SectionAdresseUsagerDTO } from '../../model/section-adresse-usager-dto';
import { SectionCommunicationUsagerDTO } from '../../model/section-communication-usager-dto';
import { SectionIdentificationUsagerDTO } from '../../model/section-identification-usager-dto';
import { SectionInformationSuppDTO } from '../../model/section-information-supp-dto';
import { ConsultationFicheSectionUsagerAdresseComponent } from '../consultation-fiche-section-usager-adresse/consultation-fiche-section-usager-adresse.component';
import { ConsultationFicheSectionUsagerCommunicationComponent } from '../consultation-fiche-section-usager-communication/consultation-fiche-section-usager-communication.component';
import { ConsultationFicheSectionUsagerIdentificationComponent } from '../consultation-fiche-section-usager-identification/consultation-fiche-section-usager-identification.component';
import { ConsultationFicheSectionUsagerInformationsSuppComponent } from '../consultation-fiche-section-usager-informations-supp/consultation-fiche-section-usager-informations-supp.component';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { ConsultationFicheSectionUsagerDTO } from './consultation-fiche-section-usager-dto';

@Component({
  selector: 'msss-consultation-fiche-section-usager',
  templateUrl: './consultation-fiche-section-usager.component.html',
  styleUrls: ['./consultation-fiche-section-usager.component.css']
})
export class ConsultationFicheSectionUsagerComponent implements OnInit {

  @ViewChild('sectionIdentification', { static: true })
  sectionIdentification: ConsultationFicheSectionUsagerIdentificationComponent;

  @ViewChild('sectionInformationSupp', { static: true })
  sectionInformationSupp: ConsultationFicheSectionUsagerInformationsSuppComponent;

  @ViewChild('sectionCommunication', { static: true })
  sectionCommunication: ConsultationFicheSectionUsagerCommunicationComponent;

  @ViewChild('sectionAdresse', { static: true })
  sectionAdresse: ConsultationFicheSectionUsagerAdresseComponent;

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input()
  set consultationUsager(value: ConsultationFicheSectionUsagerDTO) {
    this.chargerDonnees(value);
  }
  consultationFicheSectionUsager: ConsultationFicheSectionUsagerDTO;
  communications: UsagerCommDTO[];
  lieuxResidence: UsagerLieuResidenceDTO[];
  referencesGroupeAges: ReferenceDTO[];

  private subscriptions = new Subscription();

  constructor(private usagerService: UsagerService,
    private referenceService: ReferencesService,
    private utilitaireService: UtilitaireService) { }

  ngOnInit(): void {
    this.chergerReferencesGroupeAges();
  }

  loadSectionIdentificationUsager(section: SectionIdentificationUsagerDTO): void {
    this.sectionIdentification.loadDonneesImpression(section);
  }

  loadSectionCommunicationUsager(section: SectionCommunicationUsagerDTO): void {
    this.sectionCommunication.loadDonneesImpression(section);
  }

  loadSectionAdresseUsager(section: SectionAdresseUsagerDTO): void {
    this.sectionAdresse.loadDonneesImpression(section);
  }

  loadSectionInformationSupp(section: SectionInformationSuppDTO): void {
    this.sectionInformationSupp.loadDonneesImpression(section);
  }

  private chergerReferencesGroupeAges(): void {
    this.subscriptions.add(
      this.referenceService.getListeGroupeDAge()
        .subscribe((data: ReferenceDTO[]) => {
          this.referencesGroupeAges = data;
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
        })
    );
  }

  private chargerDonnees(value: ConsultationFicheSectionUsagerDTO): void {
    this.consultationFicheSectionUsager = null;
    this.communications = null;
    this.lieuxResidence = null;
    if (value) {
      if (value.idUsager) {
        this.chargerDonneesUsager(value);
      } else if (value.idUsagerHisto) {
        this.chargerDonneesHistoriqueUsager(value);
      }
    }
  }

  private chargerDonneesUsager(value: ConsultationFicheSectionUsagerDTO): void {
    this.subscriptions.add(
      forkJoin([
        this.usagerService.getUsager(value.idUsager),
        this.utilitaireService.listUsagerCommunicationsActifs(value.idUsager, true),
        this.utilitaireService.getAllUsagerLieuResidencesActifs(value.idUsager, true)
      ]).subscribe(
        (results) => {
          this.consultationFicheSectionUsager = value;
          this.consultationFicheSectionUsager.usagerDTO = results[0];
          this.communications = results[1];
          this.lieuxResidence = results[2];
        }, (error: HttpErrorResponse) => {
          console.log(error.message)
        }
      )
    );
  }

  private chargerDonneesHistoriqueUsager(value: ConsultationFicheSectionUsagerDTO): void {
    this.subscriptions.add(
      this.usagerService.getUsagerHisto(value.idUsagerHisto)
        .subscribe((result: UsagerIdentHistoDTO) => {
          this.consultationFicheSectionUsager = value;
          this.consultationFicheSectionUsager.usagerHistoDTO = result;
          this.communications = this.chargerCommunications(result.usagerCommHistos);
          this.lieuxResidence = this.chargerLieuResidence(result.usagerLieuResidenceHistos);
        }, (error: HttpErrorResponse) => {
          console.log(error.message);
        })
    );
  }

  private chargerCommunications(usagerCommHistos: UsagerCommHistoDTO[]): UsagerCommDTO[] {
    if (CollectionUtils.isNotBlank(usagerCommHistos)) {
      let aux: UsagerCommDTO[] = [];
      usagerCommHistos
        .filter(item => item.actif)
        .forEach(item => {
          let dto = new UsagerCommDTO();
          dto.actif = item.actif;
          dto.codeTypeCoordComm = item.codeTypeCoordComm;
          dto.codeTypeEquipComm = item.codeTypeEquipComm;
          dto.coordonnees = item.coordonnees;
          dto.detail = item.detail;
          dto.nomTypeCoordComm = item.nomTypeCoordComm;
          dto.nomTypeEquipComm = item.nomTypeEquipComm;
          aux.push(dto);
        });
      return aux;
    }
    return null;
  }

  private chargerLieuResidence(usagerLieuResidenceHistos: UsagerLieuResidenceHistoDTO[]): UsagerLieuResidenceDTO[] {
    if (CollectionUtils.isNotBlank(usagerLieuResidenceHistos)) {
      let aux: UsagerLieuResidenceDTO[] = [];
      usagerLieuResidenceHistos
        .filter(item => item.actif)
        .forEach(item => {
          let dto = new UsagerLieuResidenceDTO();
          dto.actif = item.actif;
          dto.adresse = (item.noCiviq ? item.noCiviq + " " : "");
          dto.adresse += (item.noCiviqSuffx ? item.noCiviqSuffx + " " : "");
          dto.adresse += (item.adresse ? item.adresse : "");
          dto.clscCode = item.clscCode;
          dto.clscNom = item.clscNom;
          dto.codeCategSubdvImmeu = item.codeCategSubdvImmeu;
          dto.codePays = item.codePays;
          dto.codePostal = item.codePostal;
          dto.codeProvince = item.codeProvince;
          dto.codeRegion = item.codeRegion;
          dto.codeTypeAdresse = item.codeTypeAdresse;
          dto.detail = item.detail;
          dto.municCode = item.municCode;
          dto.municNom = item.municNom;
          dto.noCiviq = item.noCiviq;
          dto.noCiviqSuffx = item.noCiviqSuffx;
          dto.nomCategSubdvImmeu = item.nomCategSubdvImmeu;
          dto.nomPays = item.nomPays;
          dto.nomProvince = item.nomProvince;
          dto.nomRegion = item.nomRegion;
          dto.nomTypeAdresse = item.nomTypeAdresse;
          dto.rlsCode = item.rlsCode;
          dto.rlsNom = item.rlsNom;
          dto.rtsCode = item.rtsCode;
          dto.rtsNom = item.rtsNom;
          dto.subdvImmeu = item.subdvImmeu;
          aux.push(dto);
        });
      return aux;
    }
    return null;
  }
}
