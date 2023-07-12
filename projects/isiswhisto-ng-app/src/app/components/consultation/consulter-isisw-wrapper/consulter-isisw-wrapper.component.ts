import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ConsulterIsiswUsagerComponent } from '../consulter-isisw-usager/consulter-isisw-usager.component';
import { ConsultationIsiswWrapperDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-wrapper-dto';
import { IsiswApiService } from 'projects/isiswhisto-ng-core/src/lib/services/isiswhisto-api.service';
import { Subscription } from 'rxjs';
import { ConsulterIsiswCentreActivitesComponent } from '../consulter-isisw-centre-activites/consulter-isisw-centre-activites.component';
import { ConsulterIsiswCollecteDonneesComponent } from '../consulter-isisw-collecte-donnees/consulter-isisw-collecte-donnees.component';
import { ConsulterIsiswInterventionComponent } from '../consulter-isisw-intervention/consulter-isisw-intervention.component';
import { ConsulterIsiswReferenceComponent } from '../consulter-isisw-reference/consulter-isisw-reference.component';
import { ConsulterIsiswEvaluationComponent } from '../consulter-isisw-evaluation/consulter-isisw-evaluation.component';
import { ConsulterIsiswNotesComplementairesComponent } from '../consulter-isisw-notes-complementaires/consulter-isisw-notes-complementaires.component';
import { ConsulterIsiswNoteSuiviComponent } from '../consulter-isisw-note-suivi/consulter-isisw-note-suivi.component';
import { ConsulterIsiswProfessionnelComponent } from '../consulter-isisw-professionnel/consulter-isisw-professionnel.component';
import { ConsulterIsiswHistoriqueComponent } from '../consulter-isisw-historique/consulter-isisw-historique.component';

@Component({
  selector: 'msss-consulter-isisw-wrapper',
  templateUrl: './consulter-isisw-wrapper.component.html',
  styleUrls: ['./consulter-isisw-wrapper.component.css']
})
export class ConsulterIsiswWrapperComponent implements OnInit, OnDestroy {

  @ViewChild('sectionUsager', { static: true })
  sectionUsager: ConsulterIsiswUsagerComponent;

  @ViewChild('sectionCentreActivite', { static: true })
  sectionCentreActivite: ConsulterIsiswCentreActivitesComponent;

  @ViewChild('sectionCollecteDonnees', { static: true })
  sectionCollecteDonnees: ConsulterIsiswCollecteDonneesComponent;

  @ViewChild('sectionIntervention', { static: true })
  sectionIntervention: ConsulterIsiswInterventionComponent;

  @ViewChild('sectionReference', { static: true })
  sectionReference: ConsulterIsiswReferenceComponent;

  @ViewChild('sectionEvaluation', { static: true })
  sectionEvaluation: ConsulterIsiswEvaluationComponent;

  @ViewChild('sectionNotesComplementaire', { static: true })
  sectionNotesComplementaire: ConsulterIsiswNotesComplementairesComponent;

  @ViewChild('sectionNoteSuivi', { static: true })
  sectionNoteSuivi: ConsulterIsiswNoteSuiviComponent;

  @ViewChild('sectionProfessionnel', { static: true })
  sectionProfessionnel: ConsulterIsiswProfessionnelComponent;

  @ViewChild('sectionHistorique', { static: true })
  sectionHistorique: ConsulterIsiswHistoriqueComponent;

  @Input()
  set idFicheIsisw(value: number) {
    this.loadData(value);
  };

  consulterIsiswWrapper: ConsultationIsiswWrapperDTO = new ConsultationIsiswWrapperDTO();

  private _idFicheIsisw: number;
  private subscription = new Subscription();

  constructor(private isiswApiService: IsiswApiService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  /**
   * Action de cliquer sur le pdf
   */
  onBtnGenererPdfClick(): void {
    this.updateSectionVisible();
    this.subscription.add(
      this.isiswApiService.genererPdf(this.consulterIsiswWrapper)
        .subscribe((dto: ConsultationIsiswWrapperDTO) => {
          if (dto) {
            const data: any = dto.contenuFichierPdf;
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            let blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        })
    );
  }

  private loadData(value: number): void {
    this._idFicheIsisw = value;
    this.subscription.add(
      this.isiswApiService.loadConsultationIsiswWrapper(this._idFicheIsisw).subscribe(
        (result: ConsultationIsiswWrapperDTO) => {
          this.consulterIsiswWrapper = result;
        }
      )
    )
  }

  private updateSectionVisible(): void {
    this.consulterIsiswWrapper.sectionUsager.visible = this.sectionUsager?.isVisible();
    this.consulterIsiswWrapper.sectionCentreActivite.visible = this.sectionCentreActivite?.isVisible();
    this.consulterIsiswWrapper.sectionCollecteDonnees.visible = this.sectionCollecteDonnees?.isVisible();
    this.consulterIsiswWrapper.sectionIntervention.visible = this.sectionIntervention?.isVisible();
    this.consulterIsiswWrapper.sectionReference.visible = this.sectionReference?.isVisible();
    this.consulterIsiswWrapper.sectionEvaluation.visible = this.sectionEvaluation?.isVisible();
    this.consulterIsiswWrapper.sectionNotesComplementaire.visible = this.sectionNotesComplementaire?.isVisible();
    this.consulterIsiswWrapper.sectionNoteSuivi.visible = this.sectionNoteSuivi?.isVisible();
    this.consulterIsiswWrapper.sectionProfessionnel.visible = this.sectionProfessionnel?.isVisible();
    this.consulterIsiswWrapper.sectionHistorique.visible = this.sectionHistorique?.isVisible();
  }

}
