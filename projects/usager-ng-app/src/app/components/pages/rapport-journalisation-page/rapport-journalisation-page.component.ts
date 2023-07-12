import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { ConsultationJournalComponent, EnumTypeRapport } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-journal/consultation-journal.component';
import { RapportJournalisationDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/rapport-journalisation-dto';
import { TypeRapportJournalisationUtilisateur } from 'projects/sigct-ui-ng-lib/src/lib/model/type-rapport-journalisation-utilisateur-enum';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { forkJoin, Subscription } from 'rxjs';



@Component({
  selector: 'app-rapport-journalisation-page',
  templateUrl: './rapport-journalisation-page.component.html',
  styleUrls: ['./rapport-journalisation-page.component.css']
})
export class RapportJournalisationPageComponent implements OnInit {

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  readonly typesRapportUtilisateurUS: TypeRapportJournalisationUtilisateur[] = [
    TypeRapportJournalisationUtilisateur.US_CONSULTATION,
    TypeRapportJournalisationUtilisateur.US_INTERVENTION,
    TypeRapportJournalisationUtilisateur.US_USAGER,
    TypeRapportJournalisationUtilisateur.IS_APPEL,
  ];

  utilisateurs: ReferenceDTO[];
  moyensCommunication: ReferenceDTO[];
  typesCoordMoyenCommunication: ReferenceDTO[];

  apiUrl: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private referencesService: ReferencesService,
    private alertStore: AlertStore,
    private usagerApiService: UsagerService) {
    this.apiUrl = window["env"].urlUsagerApi;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        this.alertService.show(this.alertContainer, state);
      })
    );
    this.chargerListeUtilisateurs();
    this.chargerReferences();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    this.alertStore.resetAlert();
  }

  private chargerListeUtilisateurs(): void {
    this.subscriptions.add(
      this.referencesService.getListeUtilisateursOrganismeConnecte().subscribe(
        (results: ReferenceDTO[]) => {
          this.utilisateurs = results;
        }
      )
    );
  }

  private chargerReferences(): void {
    this.subscriptions.add(
      forkJoin([
        this.referencesService.getListeTypeEquip(),
        this.referencesService.getListeCoord()
      ]).subscribe(results => {
        this.moyensCommunication = results[0] as ReferenceDTO[];
        this.typesCoordMoyenCommunication = results[1] as ReferenceDTO[];
      })
    );
  }

  @ViewChild('consultationJournalUsager')
  consultationJournalUsager: ConsultationJournalComponent;

  onSubmitUsagerEmitted(dto: RapportJournalisationDTO): void {
    this.consultationJournalUsager.doSubmit(EnumTypeRapport.USAGER, dto, this.usagerApiService.getBaseApiUrlUsager());
  }

}
