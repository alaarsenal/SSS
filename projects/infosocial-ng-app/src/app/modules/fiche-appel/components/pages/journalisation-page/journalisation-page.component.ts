import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { FicheAppelApiService, ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { ConsultationJournalComponent, EnumTypeRapport } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-journal/consultation-journal.component';
import { RapportJournalisationDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/rapport-journalisation-dto';
import { TypeRapportJournalisationUtilisateur } from 'projects/sigct-ui-ng-lib/src/lib/model/type-rapport-journalisation-utilisateur-enum';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { forkJoin } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-journalisation-page',
  templateUrl: './journalisation-page.component.html',
  styleUrls: ['./journalisation-page.component.css']
})
export class JournalisationPageComponent implements OnInit, OnDestroy {

  @ViewChild('consultationJournalUsager')
  consultationJournalUsager: ConsultationJournalComponent;

  @ViewChild('consultationJournalFicheAppel')
  consultationJournalFicheAppel: ConsultationJournalComponent;

  @ViewChild('consultationJournalCompletFicheAppel')
  consultationJournalCompletFicheAppel: ConsultationJournalComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  readonly typesRapportUtilisateurSO: TypeRapportJournalisationUtilisateur[] = [
    TypeRapportJournalisationUtilisateur.SO_INTERVENTION,
    TypeRapportJournalisationUtilisateur.SO_USAGER,
    TypeRapportJournalisationUtilisateur.IS_APPEL,
  ];

  utilisateurs: ReferenceDTO[];
  utilisateursOrganismeISO: ReferenceDTO[];
  moyensCommunication: ReferenceDTO[];
  typesCoordMoyenCommunication: ReferenceDTO[];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private ficheAppelApiService: FicheAppelApiService,
    private usagerApiService: UsagerService,
    private alertService: AlertService,
    private referencesServiceSO: ReferencesApiService,
    private referenceServiceUS: ReferencesService,
    private alertStore: AlertStore) {
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
    this.chargerListeUtilisateursOrganismeISO();
    this.chargerReferences();
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();

    this.subscriptions.unsubscribe();
  }

  onSubmitUsagerEmitted(dto: RapportJournalisationDTO): void {
    this.consultationJournalUsager.doSubmit(EnumTypeRapport.USAGER, dto, this.usagerApiService.getBaseApiUrlUsager());
  }

  onSubmitFicheAppelEmitted(dto: RapportJournalisationDTO): void {
    if (!dto?.identifiant) {
      this.consultationJournalFicheAppel.doSubmit(EnumTypeRapport.FICHE_ALLEGEE, dto);
    } else {
      this.subscriptions.add(
        this.ficheAppelApiService.getFicheAppelIfExist(dto?.identifiant).subscribe(
          (ficheAppel: FicheAppelSocialDTO) => {
            if (ficheAppel != null) {
              dto.idAppel = ficheAppel.idAppel;
              if (StatutFicheAppelEnum.OUVERT != ficheAppel?.statut && ficheAppel?.usager?.idUsagerIdentHisto) {
                this.subscriptions.add(
                  this.usagerApiService.getUsagerHisto(ficheAppel?.usager?.idUsagerIdentHisto).subscribe(
                    (usagerHisto: UsagerIdentHistoDTO) => {
                      dto.prenomUsagerHisto = usagerHisto.prenom;
                      dto.nomUsagerHisto = usagerHisto.nom;
                      this.consultationJournalFicheAppel.doSubmit(EnumTypeRapport.FICHE_ALLEGEE, dto)
                    }
                  )
                )
              } else {
                this.consultationJournalFicheAppel.doSubmit(EnumTypeRapport.FICHE_ALLEGEE, dto);
              }
            } else {
              this.consultationJournalFicheAppel.doSubmit(EnumTypeRapport.FICHE_ALLEGEE, dto);
            }
          }
        )
      );
    }
  }

  onSubmitFicheAppelCompletEmitted(dto: RapportJournalisationDTO): void {
    if (dto) {
      dto.moyensCommunication = this.moyensCommunication;
      dto.typesCoordMoyenCommunication = this.typesCoordMoyenCommunication;
    }

    if (!dto?.identifiant) {
      this.consultationJournalCompletFicheAppel.doSubmit(EnumTypeRapport.FICHE_COMPLETE, dto);
    } else {
      this.subscriptions.add(
        this.ficheAppelApiService.getFicheAppelIfExist(dto?.identifiant).subscribe(
          (ficheAppel: FicheAppelSocialDTO) => {
            if (ficheAppel != null) {
              dto.idAppel = ficheAppel.idAppel;

              // Si la fiche d'appel est terminée, on récupère le nom et prénom de l'usager lié à la fiche.
              if (StatutFicheAppelEnum.OUVERT != ficheAppel?.statut && ficheAppel?.usager?.idUsagerIdentHisto) {
                this.subscriptions.add(
                  this.usagerApiService.getUsagerHisto(ficheAppel?.usager?.idUsagerIdentHisto).subscribe(
                    (usagerHisto: UsagerIdentHistoDTO) => {
                      dto.prenomUsagerHisto = usagerHisto.prenom;
                      dto.nomUsagerHisto = usagerHisto.nom;
                      this.consultationJournalCompletFicheAppel.doSubmit(EnumTypeRapport.FICHE_COMPLETE, dto)
                    }
                  )
                )
              } else {
                this.consultationJournalCompletFicheAppel.doSubmit(EnumTypeRapport.FICHE_COMPLETE, dto);
              }
            } else {
              this.consultationJournalCompletFicheAppel.doSubmit(EnumTypeRapport.FICHE_COMPLETE, dto);
            }
          }
        )
      );
    }
  }

  private chargerListeUtilisateurs(): void {
    this.subscriptions.add(
      this.referencesServiceSO.getListeUtilisateursOrganismeConnecte().subscribe(
        (results: ReferenceDTO[]) => {
          this.utilisateurs = results;
        }
      )
    );
  }

  /**
   * Récupère la liste de utilisateur liés à un organisme ISO
   */
  private chargerListeUtilisateursOrganismeISO(): void {
    this.subscriptions.add(
      this.referencesServiceSO.getListeUtilisateursOrganismeISO().subscribe(
        (results: ReferenceDTO[]) => {
          this.utilisateursOrganismeISO = results;
        }
      )
    );
  }

  private chargerReferences(): void {
    this.subscriptions.add(
      forkJoin([
        this.referenceServiceUS.getListeTypeEquip(),
        this.referenceServiceUS.getListeCoord()
      ]).subscribe(results => {
        this.moyensCommunication = results[0] as ReferenceDTO[];
        this.typesCoordMoyenCommunication = results[1] as ReferenceDTO[];
      })
    );
  }

}
