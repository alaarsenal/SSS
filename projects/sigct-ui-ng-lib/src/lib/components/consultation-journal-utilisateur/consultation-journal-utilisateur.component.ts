import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { JournalisationApiService } from 'projects/sigct-service-ng-lib/src/lib/services/journalisation-api.servie';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { Subscription } from 'rxjs';
import { RapportJournalisationDTO } from '../../model/rapport-journalisation-dto';
import { TypeRapportJournalisationUtilisateur } from '../../model/type-rapport-journalisation-utilisateur-enum';
import { InputOptionCollection } from '../../utils/input-option';

@Component({
  selector: 'msss-consultation-journal-utilisateur',
  templateUrl: './consultation-journal-utilisateur.component.html',
  styleUrls: ['./consultation-journal-utilisateur.component.css']
})
export class ConsultationJournalUtilisateurComponent implements OnInit, OnDestroy {

  @Input()
  set utilisateurs(values: ReferenceDTO[]) {
    this.chargerListeUtilisateurs(values);
  }

  @Input()
  typesRapportUtilisateur: TypeRapportJournalisationUtilisateur[];

  @Input()
  baseApiUrl: string;

  @Input()
  moyensCommunication: ReferenceDTO[];

  @Input()
  typesCoordMoyenCommunication?: ReferenceDTO[];

  inputOptionsUtilisateur: InputOptionCollection = {
    name: "professionnel",
    options: []
  };

  inputOptionsTypeRapportUtilisateur: InputOptionCollection = {
    name: "typeRapportUtilisateur",
    options: []
  };

  isUtilisateurValide: boolean;
  dateDebutValide: boolean;
  dateFinValide: boolean;
  isTypeRapportUtilisateurValide: boolean;

  dto = new RapportJournalisationDTO();
  endDate: Date = new Date();

  private subscription = new Subscription();

  constructor(
    private journalisationApiService: JournalisationApiService,
    private translateService: TranslateService,
    
    private alertStore: AlertStore) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    this.alertStore.resetAlert();
    this.dto.dateDebut = DateUtils.updateDateTime(this.dto.dateDebut, 0, 0, 0);
    this.dto.dateFin = DateUtils.updateDateTime(this.dto.dateFin, 23, 59, 59);
      this.dto.moyensCommunication = this.moyensCommunication;
      this.dto.typesCoordMoyenCommunication = this.typesCoordMoyenCommunication;
    this.baseApiUrl = this.getApiUrlByTypeRapport(this.dto.typeRapportUtilisateur);
    this.subscription.add(
      this.journalisationApiService.genererRapportUtilisateurs(this.dto, this.baseApiUrl).subscribe(
        (rapport: RapportJournalisationDTO) => {
          if (this.validerRapport(rapport)) {
            this.journalisationApiService.genererExcel(rapport);
          }
        }
      )
    );
  }

  private getApiUrlByTypeRapport(typeRapportUtilisateur: TypeRapportJournalisationUtilisateur): string {
    if (TypeRapportJournalisationUtilisateur.SA_CONSULTATION == typeRapportUtilisateur
      || TypeRapportJournalisationUtilisateur.US_CONSULTATION == typeRapportUtilisateur) {
      return window["env"].urlSante + '/api';
    } else if (TypeRapportJournalisationUtilisateur.SO_INTERVENTION == typeRapportUtilisateur
      || TypeRapportJournalisationUtilisateur.US_INTERVENTION == typeRapportUtilisateur) {
      return window["env"].urlInfoSocial + '/api';
    } else if (TypeRapportJournalisationUtilisateur.SA_USAGER == typeRapportUtilisateur
      || TypeRapportJournalisationUtilisateur.SO_USAGER == typeRapportUtilisateur
      || TypeRapportJournalisationUtilisateur.US_USAGER == typeRapportUtilisateur) {
      return window["env"].urlUsagerApi;
    } else if (TypeRapportJournalisationUtilisateur.IS_APPEL == typeRapportUtilisateur) {
      return window["env"].urlIsiswHisto + '/api';
    }
    return this.baseApiUrl;
  }

  private chargerListeUtilisateurs(values: ReferenceDTO[]): void {
    this.inputOptionsUtilisateur.options = [
      { label: this.translateService.instant("option.select.message"), value: null }
    ];
    if (values) {
      values.forEach(item => {
        this.inputOptionsUtilisateur.options.push({ label: item.nom, value: item.code, actif: item.actif });
      });
      /**On charge en ce moment pour garantir que le constructeur ait déjà été chargé */
      this.chargerListeTypeRapportUtilisateur(this.typesRapportUtilisateur);
    }
  }

  private chargerListeTypeRapportUtilisateur(values: TypeRapportJournalisationUtilisateur[]): void {
    this.inputOptionsTypeRapportUtilisateur.options = [
      { label: this.translateService.instant("option.select.message"), value: null }
    ];
    if (values) {
      values.forEach(item => {
        this.inputOptionsTypeRapportUtilisateur.options.push({
          label: this.translateService.instant(this.getLabelTypeRapportUtilisateur(item)),
          value: item.toString()
        });
      });
    }
  }

  private getLabelTypeRapportUtilisateur(item: TypeRapportJournalisationUtilisateur): string | string[] {
    switch (item) {
      case TypeRapportJournalisationUtilisateur.SA_CONSULTATION:
        return "sigct.sa.f_rapport_journ_type_consultation";
      case TypeRapportJournalisationUtilisateur.SA_USAGER:
        return "sigct.sa.f_rapport_journ_type_usager";
      case TypeRapportJournalisationUtilisateur.SO_INTERVENTION:
        return "sigct.so.f_rapport_journ_type_intervention";
      case TypeRapportJournalisationUtilisateur.SO_USAGER:
        return "sigct.so.f_rapport_journ_type_usager";
      case TypeRapportJournalisationUtilisateur.US_CONSULTATION:
        return "sigct.us.f_rapport_journ_type_consultation";
      case TypeRapportJournalisationUtilisateur.US_INTERVENTION:
        return "sigct.us.f_rapport_journ_type_intervention";
      case TypeRapportJournalisationUtilisateur.US_USAGER:
        return "sigct.us.f_rapport_journ_type_usager";
      case TypeRapportJournalisationUtilisateur.IS_APPEL:
        return "sigct.ss.f_rapport_journ_type_consultation_isisw";
      default: return null;
    }
  }

  private validerRapport(dto: RapportJournalisationDTO): boolean {
    this.resetValideChamps();
    let errors: string[] = [];
    if (dto.erreurs) {
      errors = Object.keys(dto.erreurs).map(key => (dto.erreurs[key]));
    }
    if (CollectionUtils.isNotBlank(errors)) {
      if (!dto.codeUtilisateur) {
        this.isUtilisateurValide = false;
      }
      if (!dto.dateDebut) {
        this.dateDebutValide = false;
      }
      if (!dto.dateFin) {
        this.dateFinValide = false;
      }
      if (!dto.typeRapportUtilisateur) {
        this.isTypeRapportUtilisateurValide = false;
      }
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModelErreurs(dto.erreurs, alertTitle);

      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertModel));
      } else {
        this.alertStore.setState([alertModel]);
      }
      return false;
    }
    return true;
  }

  private resetValideChamps(): void {
    this.isUtilisateurValide = true;
    this.dateDebutValide = true;
    this.dateFinValide = true;
    this.isTypeRapportUtilisateurValide = true;
  }

}
