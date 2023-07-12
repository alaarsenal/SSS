import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InfosanteNgCoreModule } from 'projects/infosante-ng-core/src/public-api';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { UsagerNgCoreModule } from 'projects/usager-ng-core/src/lib/usager-ng-core.module';
import { EditerFicheAppelLayoutComponent } from './components/layouts/editer-fiche-appel/editer-fiche-appel-layout.component';
import { AccueilFicheAppelPageComponent, ConsultationFicheAppelAnterieurePageComponent, ConsultationFichePageComponent, DemandeEvaluationPageComponent, DetailUsagerPageComponent, FichesAppelNonTermineesPageComponent, FichiersAttachesPageComponent, InterventionFicheAppelPageComponent, ProtocolesPageComponent, RechercherFicheAppelPageComponent, SaisieDiffereeFicheAppelPageComponent, TerminaisonPageComponent } from "./components/pages";
import { CorrectionFicheAppelPageComponent } from './components/pages/correction-fiche-appel-page/correction-fiche-appel-page.component';
import { AvisPageComponent } from './components/pages/editer-fiche-appel/avis/avis-page.component';
import { JournalisationPageComponent } from './components/pages/journalisation-page/journalisation-page.component';
import { EditerInformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/editer-information-utile-page/editer-information-utile-page.component';
import { InformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/information-utile-page.component';
import { RapportFusionUsagerPageComponent } from './components/pages/rapport-fusion-page/rapport-fusion-page.component';
import { UsaerenregistrementsPageComponent } from './components/pages/usaerenregistrements-page/usaerenregistrements-page.component';
import { AvisCommuniquesComponent } from './components/ui/avis-communiques/avis-communiques.component';
import { DemarcheTraitementComponent } from './components/ui/demarche-traitement/demarche-traitement.component';
import { GlasgowComponent } from './components/ui/glasgow/glasgow.component';
import { LinkGlasgowComponent } from './components/ui/link-glasgow/link-glasgow.component';
import { ProjetRechercheComponent } from './components/ui/projet-recherche/projet-recherche.component';
import { SaisirReferencePopupComponent } from './components/ui/saisir-reference-popup/saisir-reference-popup.component';
import { SuiviComponent } from './components/ui/suivi/suivi.component';
import { ValidationFinInterventionComponent } from './components/ui/validation-fin-intervention/validation-fin-intervention.component';
import { AntecedentsPertinentsComponent, AutresSourcesInformationComponent, ConstatEvaluationComponent, DemarchesAnterieuresComponent, ManifestationsComponent, MedicationActuelleComponent, SignesVitauxComponent } from './components/uis';
import { FicheAppelRoutingModule } from './fiche-appel-routing.module';

@NgModule({
  declarations: [
    EditerFicheAppelLayoutComponent,
    AccueilFicheAppelPageComponent,
    RechercherFicheAppelPageComponent,
    ConsultationFichePageComponent,
    DemandeEvaluationPageComponent,
    SaisieDiffereeFicheAppelPageComponent,
    DetailUsagerPageComponent,
    FichiersAttachesPageComponent,
    InterventionFicheAppelPageComponent,
    ProtocolesPageComponent,
    TerminaisonPageComponent,
    FichesAppelNonTermineesPageComponent,
    AutresSourcesInformationComponent,
    ManifestationsComponent,
    SignesVitauxComponent,
    AntecedentsPertinentsComponent,
    MedicationActuelleComponent,
    DemarchesAnterieuresComponent,
    ConstatEvaluationComponent,
    DemarcheTraitementComponent,
    ValidationFinInterventionComponent,
    DemarcheTraitementComponent,
    GlasgowComponent,
    LinkGlasgowComponent,
    ProjetRechercheComponent,
    SuiviComponent,
    JournalisationPageComponent,
    InformationUtilePageComponent,
    EditerInformationUtilePageComponent,
    ConsultationFicheAppelAnterieurePageComponent,
    UsaerenregistrementsPageComponent,
    SaisirReferencePopupComponent,
    AvisPageComponent,
    AvisCommuniquesComponent,
    CorrectionFicheAppelPageComponent,
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
    InfosanteNgCoreModule,
  ],
  exports: [
    EditerFicheAppelLayoutComponent
  ]
})
export class FicheAppelModule { }
