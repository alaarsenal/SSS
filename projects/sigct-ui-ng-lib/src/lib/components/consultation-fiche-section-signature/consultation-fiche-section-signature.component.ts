import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { SignatureDTO } from './signature-dto';
import { SectionSignatureDTO } from '../../model/section-signature-dto';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';

@Component({
  selector: 'msss-consultation-fiche-section-signature',
  templateUrl: './consultation-fiche-section-signature.component.html',
  styleUrls: ['./consultation-fiche-section-signature.component.css']
})
export class ConsultationFicheSectionSignatureComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input("signatureDTO")
  set signatureDTO(value: SignatureDTO) {
    this.buildSignatureData(value);
  }

  @Input()
  listeCorrectionsFicheAppel: FicheAppelCorrectionDTO[];

  _signatureDTO: SignatureDTO;
  signatureLigne1: string;
  signatureLigne2: string;

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionSignatureDTO): void {
    if (section) {
      section.signature1 = this.signatureLigne1;
      section.signature2 = this.signatureLigne2;
      section.correctionsFicheAppel = this.listeCorrectionsFicheAppel;
    }
  }

  private buildSignatureData(signatureDTO: SignatureDTO): void {
    this.signatureLigne1 = "";
    this.signatureLigne2 = "";

    if (signatureDTO) {
      this.signatureLigne1 = "";

      if (signatureDTO.lastNameIntervenant) {
        this.signatureLigne1 += signatureDTO.lastNameIntervenant + " "
      }
      if (signatureDTO.firstNameIntervenant) {
        this.signatureLigne1 += signatureDTO.firstNameIntervenant + ", "
      }
      if (signatureDTO.titreIntervenant) {
        this.signatureLigne1 += signatureDTO.titreIntervenant + " "
      }
      if (signatureDTO.usernameIntervenant) {
        this.signatureLigne1 += "(" + signatureDTO.usernameIntervenant + ")"
      }
      if (signatureDTO.regionCode) {
        this.signatureLigne1 += ", " + signatureDTO.regionCode + " "
      }
      if (signatureDTO.organismeNom) {
        this.signatureLigne1 += "- " + signatureDTO.organismeNom
      }

      if (signatureDTO.lastNameIntervenantSaisie ||
        signatureDTO.firstNameIntervenantSaisie ||
        signatureDTO.titreIntervenantSaisie ||
        signatureDTO.usernameIntervenantSaisie) {
        if (signatureDTO.lastNameIntervenantSaisie) {
          this.signatureLigne2 += signatureDTO.lastNameIntervenantSaisie + " "
        }
        if (signatureDTO.firstNameIntervenantSaisie) {
          this.signatureLigne2 += signatureDTO.firstNameIntervenantSaisie + ", "
        }
        if (signatureDTO.titreIntervenantSaisie) {
          this.signatureLigne2 += signatureDTO.titreIntervenantSaisie + " "
        }
        if (signatureDTO.usernameIntervenantSaisie) {
          this.signatureLigne2 += "(" + signatureDTO.usernameIntervenantSaisie + ")"
        }
        if (signatureDTO.regionCode) {
          this.signatureLigne2 += ", " + signatureDTO.regionCode + " "
        }
        if (signatureDTO.organismeNom) {
          this.signatureLigne2 += "- " + signatureDTO.organismeNom
        }
      }
    }
  }

}
