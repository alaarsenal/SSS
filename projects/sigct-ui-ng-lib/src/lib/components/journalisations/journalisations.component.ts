import { OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit, } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { JournalisationAccesUsagerComponent } from 'projects/usager-ng-core/src/lib/components/ui/journalisation-acces-usager/journalisation-acces-usager.component';
import { RapportJournalisationDTO } from 'projects/usager-ng-core/src/lib/models/rapport-journalisation-dto';
import { JournalisationsUsagerService } from 'projects/usager-ng-core/src/lib/services/journalisations-usager-.service';
import { Subscription } from 'rxjs';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';


/************************************************************************************************************* */
/*                              WRAPPER POUR LES RAPPORTS DE JOURNALISATION                                    */
/************************************************************************************************************* */

@Component({
  selector: 'msss-journalisations',
  templateUrl: './journalisations.component.html',
  styleUrls: ['./journalisations.component.css']
})
export class JournalisationsComponent implements OnInit, OnDestroy {

  /************************************************************************************************************************** */
  /*                              Wrapper pour les rapports de journalisations                                                */
  /************************************************************************************************************************** */



  @ViewChild('appAccesUsager', { static: true })
  appAccessUsager: JournalisationAccesUsagerComponent;

  rapportDTO: RapportJournalisationDTO;

  abonnements: Subscription = new Subscription();

  constructor(private alertStore: AlertStore,
    private rapportService: JournalisationsUsagerService,
    private translateService: TranslateService) { }

  ngOnDestroy(): void {
    if (this.abonnements) { this.abonnements.unsubscribe(); }
  }

  ngOnInit(): void {
  }

  genererAccesUsager(event: RapportJournalisationDTO): void {

    this.alertStore.resetAlert();

    this.rapportDTO = event;

    this.appAccessUsager.isIdentifiantUsagerValide = true;
    this.appAccessUsager.isDateDebutValide = true;
    this.appAccessUsager.isDateFinValide = true;

    if (!this.rapportDTO.identifiant) {

      this.appAccessUsager.isIdentifiantUsagerValide = false;

    }

    if (!this.rapportDTO.dateDebut) {

      this.appAccessUsager.setValidDateDebut(false);

    } else {
      let dt: Date = new Date(this.rapportDTO.dateDebut);
      dt.toLocaleString("en-US", { timeZone: "America/New_York" }); //Utilisation de la locale pour fixer le timezone et faire ensorte que la date ne varie pas
      dt.setHours(0);                                             //Selon l'heure à laquelle elle est sélectionnée.
      dt.setMinutes(0);
      dt.setSeconds(0);

      this.rapportDTO.dateDebut = dt;
    }

    if (!this.rapportDTO.dateFin) {

      this.appAccessUsager.setValidDateFin(false);

    } else {
      let dt: Date = new Date(this.rapportDTO.dateFin);
      dt.toLocaleString("en-US", { timeZone: "America/New_York" });
      dt.setHours(23);
      dt.setMinutes(59);
      dt.setSeconds(59);

      this.rapportDTO.dateFin = dt;
    }

    this.abonnements.add(this.rapportService.executerRapportAccessUsager(event).subscribe(
      (rapport: RapportJournalisationDTO) => {
        if (this.validerRapport(rapport)) {
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
      }
    ));
  }

  private validerRapport(dto: RapportJournalisationDTO): boolean {
    let errors: string[] = [];
    //Si les erreurs viennents du backend
    if (dto.erreurs) {
      errors = Object.keys(dto.erreurs).map(key => (dto.erreurs[key]));
    }
    if (CollectionUtils.isNotBlank(errors)) {
      let messages: string[] = [];
      for (let i = 0; i < errors.length; i++) {
        const msg = this.translateService.instant(errors[i]);
        messages.push(msg);
      }

      const msg = this.translateService.instant("sigct.ss.error.label");

      this.creerErreurs(messages, 'Message d\'erreur', AlertType.ERROR);

      return false;
    }

    return true;
  }

  //Messages d'erreurs de validation
  creerErreurs(messages: string[], titre: string, erreurType: AlertType) {

    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }
  }


}
