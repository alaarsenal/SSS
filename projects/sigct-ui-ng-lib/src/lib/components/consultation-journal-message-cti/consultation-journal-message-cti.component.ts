import { Component, OnInit, Input, OnDestroy, Inject } from '@angular/core';
import { RapportJournalisationDTO } from '../../model/rapport-journalisation-dto';
import { InputOptionCollection } from '../../utils/input-option';
import { TypeRapportJournalisationUtilisateur } from '../../model/type-rapport-journalisation-utilisateur-enum';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { JournalisationApiService } from 'projects/sigct-service-ng-lib/src/lib/services/journalisation-api.servie';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';

@Component({
  selector: 'msss-consultation-journal-message-cti',
  templateUrl: './consultation-journal-message-cti.component.html',
  styleUrls: ['./consultation-journal-message-cti.component.css']
})
export class ConsultationJournalMessageCtiComponent implements OnInit, OnDestroy {

  @Input()
  set utilisateurs(values: ReferenceDTO[]) {
    this.chargerListeUtilisateurs(values);
  }

  @Input()
  baseApiUrl: string;

  inputOptionsUtilisateur: InputOptionCollection = {
    name: "professionnel",
    options: []
  };

  isUtilisateurValide: boolean;
  dateDebutValide: boolean;
  dateFinValide: boolean;

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
    this.subscription.add(
      this.journalisationApiService.genererRapportMessagesCti(this.dto).subscribe(
        (rapport: RapportJournalisationDTO) => {
          if (this.validerRapport(rapport)) {
            this.journalisationApiService.genererExcel(rapport);
          }
        }
      )
    );
  }

  private chargerListeUtilisateurs(values: ReferenceDTO[]): void {
    this.inputOptionsUtilisateur.options = [
      { label: this.translateService.instant("option.select.message"), value: null }
    ];
    if (values) {
      values.forEach(item => {
        this.inputOptionsUtilisateur.options.push({ label: item.nom, value: item.code, actif: item.actif });
      });
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
  }

}
