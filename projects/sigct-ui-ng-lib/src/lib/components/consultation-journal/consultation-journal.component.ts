import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { JournalisationApiService } from 'projects/sigct-service-ng-lib/src/lib/services/journalisation-api.servie';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { Subscription } from 'rxjs';
import { RapportJournalisationDTO } from '../../model/rapport-journalisation-dto';
import { InputTextComponent } from '../input-text/input-text.component';

export enum EnumTypeRapport {
  USAGER,
  FICHE_ALLEGEE,
  FICHE_COMPLETE
}

@Component({
  selector: 'msss-consultation-journal',
  templateUrl: './consultation-journal.component.html',
  styleUrls: ['./consultation-journal.component.css']
})
export class ConsultationJournalComponent implements OnInit, OnDestroy {

  @ViewChild("inputIdentifiant", { static: true })
  inputIdentifiant: InputTextComponent;

  @Input()
  set identifiantFocus(value: boolean) {
    if (value) {
      this.inputIdentifiant.focus();
    }
  }

  @Input()
  labelTitreSection: string;

  @Input()
  labelIdentifiant: string;

  @Input()
  section: String;

  @Output()
  submitEvent = new EventEmitter<RapportJournalisationDTO>();

  identifiantValide: boolean;
  dateDebutValide: boolean;
  dateFinValide: boolean;

  dto = new RapportJournalisationDTO();
  endDate: Date = new Date();

  readonly labelDateDebut: string = "sigct.ss.f_rapport_journ.datedebut";
  readonly labelDateFin: string = "sigct.ss.f_rapport_journ.datefin";

  private subscription = new Subscription();

  constructor(
    private journalisationApiService: JournalisationApiService,
    private translateService: TranslateService,
    private alertStore: AlertStore,) { }

  ngOnInit(): void {
    this.resetValideChamps();
  }

  onSubmit(): void {
    const aux: RapportJournalisationDTO = {
      identifiant: this.dto.identifiant,
      dateDebut: this.dto.dateDebut,
      dateFin: this.dto.dateFin,
    }
    this.submitEvent.emit(aux);
  }

  doSubmit(typeRapport: EnumTypeRapport, dto: RapportJournalisationDTO, baseApiUrl?: string): void {
    this.dto = dto;
    this.alertStore.resetAlert();
    this.dto.dateDebut = this.updateDateTime(this.dto.dateDebut, 0, 0, 0);
    this.dto.dateFin = this.updateDateTime(this.dto.dateFin, 23, 59, 59);

    switch (typeRapport) {
      case EnumTypeRapport.FICHE_COMPLETE:
        this.subscription.add(
          this.journalisationApiService.genererRapportCompletFicheAppel(this.dto, baseApiUrl).subscribe(
            (rapport: RapportJournalisationDTO) => {
              if (this.validerRapport(rapport)) {
                this.genererExcel(rapport);
              }
            }
          )
        );
        break;
        
      case EnumTypeRapport.USAGER:
      case EnumTypeRapport.FICHE_ALLEGEE:
      default:
        this.subscription.add(
          this.journalisationApiService.genererRapport(this.dto, baseApiUrl).subscribe(
            (rapport: RapportJournalisationDTO) => {
              if (this.validerRapport(rapport)) {
                this.genererExcel(rapport);
              }
            }
          )
        );
    }
  }

  private genererExcel(rapport: RapportJournalisationDTO) {
    const data: any = rapport.contenu;
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], { type: 'application / vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = rapport.nomRapport;
    anchor.href = url;
    anchor.click();
  }

  private updateDateTime(date: Date, hours: number, minutes: number, seconds: number): Date {
    if (!date) {
      return date;
    }
    let _date: Date = new Date(date);
    _date.toLocaleString("en-US", { timeZone: "America/New_York" });
    _date.setHours(hours);
    _date.setMinutes(minutes);
    _date.setSeconds(seconds);
    return _date;
  }

  private resetValideChamps(): void {
    this.identifiantValide = true;
    this.dateDebutValide = true;
    this.dateFinValide = true;
  }

  private validerRapport(dto: RapportJournalisationDTO): boolean {
    let errors: string[] = [];
    if (dto.erreurs) {
      errors = Object.keys(dto.erreurs).map(key => (dto.erreurs[key]));
    }
    if (CollectionUtils.isNotBlank(errors)) {
      this.resetValideChamps();
      if (!dto.identifiant) {
        this.identifiantValide = false;
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
