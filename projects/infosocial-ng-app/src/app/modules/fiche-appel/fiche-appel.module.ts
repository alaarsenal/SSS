import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { UsagerNgCoreModule } from 'projects/usager-ng-core/src/lib/usager-ng-core.module';
import { EditerFicheAppelLayoutComponent } from './components/layouts/editer-fiche-appel/editer-fiche-appel-layout.component';
import {
  AccueilFicheAppelPageComponent,
  ConsultationFichePageComponent,
  DemandeEvaluationPageComponent,
  DetailUsagerPageComponent,
  FichiersAttachesPageComponent,
  PlanActionPageComponent,
  ProtocolesPageComponent,
  RechercherFicheAppelPageComponent,
  TerminaisonPageComponent,
  ConsultationFicheAppelAnterieurePageComponent,
  RapportFusionUsagerPageComponent,
} from "./components/pages";
import { AntecedentsPertinentsComponent } from './components/ui/antecedents-pertinents/antecedents-pertinents.component';
import { AutresSourcesInformationComponent } from './components/ui/autres-sources-information/autres-sources-information.component';
import { ConstatEvaluationComponent } from './components/ui/constat-evaluation/constat-evaluation.component';
import { DemarchesAnterieuresComponent } from './components/ui/demarches-anterieures/demarches-anterieures.component';
import { ManifestationsComponent } from './components/ui/manifestations/manifestations.component';
import { MedicationActuelleComponent } from './components/ui/medication-actuelle/medication-actuelle.component';
import { SignesVitauxComponent } from './components/ui/signes-vitaux/signes-vitaux.component';
import { FicheAppelRoutingModule } from './fiche-appel-routing.module';
import { FichesAppelNonTermineesPageComponent } from './components/pages/fiches-appel-non-terminees-page/fiches-appel-non-terminees-page.component';
import { ValidationFinInterventionComponent } from './components/ui/validation-fin-intervention/validation-fin-intervention.component';
import { JournalisationPageComponent } from './components/pages/journalisation-page/journalisation-page.component';
import { InfosocialNgCoreModule } from 'projects/infosocial-ng-core/src/public-api';
import { ConsultationsAnterieuresComponent } from './components/ui/consultations-anterieures/consultations-anterieures.component';
import { InformationUtilePageComponent } from './components/pages/information-utile-page/information-utile-page.component';
import { EditerInfoUtilPageComponent } from './components/pages/information-utile-page/editer-info-util-page/editer-info-util-page.component';
import { UsaerenregistrementsPageComponent } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/components/pages/usaerenregistrements-page/usaerenregistrements-page.component';
import { AvisPageComponent } from './components/pages/editer-fiche-appel/avis-page/avis-page.component';
import { CorrectionFicheAppelPageComponent } from './components/pages/correction-fiche-appel-page/correction-fiche-appel-page.component';
import { AvisCommuniquesComponent } from './components/ui/avis-communiques/avis-communiques.component';

@NgModule({
  declarations: [
    EditerFicheAppelLayoutComponent,
    AccueilFicheAppelPageComponent,
    RechercherFicheAppelPageComponent,
    ConsultationFichePageComponent,
    DemandeEvaluationPageComponent,
    DetailUsagerPageComponent,
    FichiersAttachesPageComponent,
    PlanActionPageComponent,
    ProtocolesPageComponent,
    TerminaisonPageComponent,
    AutresSourcesInformationComponent,
    ManifestationsComponent,
    SignesVitauxComponent,
    AntecedentsPertinentsComponent,
    MedicationActuelleComponent,
    DemarchesAnterieuresComponent,
    ConstatEvaluationComponent,
    FichesAppelNonTermineesPageComponent,
    ValidationFinInterventionComponent,
    JournalisationPageComponent,
    ConsultationsAnterieuresComponent,
    InformationUtilePageComponent,
    EditerInfoUtilPageComponent,
    ConsultationFicheAppelAnterieurePageComponent,
    UsaerenregistrementsPageComponent,
    AvisPageComponent,
    CorrectionFicheAppelPageComponent,
    AvisCommuniquesComponent,
    RapportFusionUsagerPageComponent,
  ],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    TranslateModule.forChild(),
    FormsModule,
    FicheAppelRoutingModule,
    MsssUiModule,
    FormsModule,
    MsssServicesModule,
    UsagerNgCoreModule,
    MatDialogModule,
    InfosocialNgCoreModule,
  ],
  exports: [
    EditerFicheAppelLayoutComponent
  ]
})
export class FicheAppelModule { }
