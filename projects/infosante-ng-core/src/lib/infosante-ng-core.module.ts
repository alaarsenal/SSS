import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConsultationListeProtocolesComponent } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/components/ui/consultation-liste-protocoles/consultation-liste-protocoles.component';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';

import { ConsultationFicheAppelWrapperComponent } from './components/containers/consultation-fiche-appel-wrapper/consultation-fiche-appel-wrapper.component';
import { ConsultationFicheContainerComponent } from './components/containers/consultation-fiche/consultation-fiche-container.component';
import { CorrectionFicheAppelWrapperComponent } from './components/containers/correction-fiche-appel-wrapper/correction-fiche-appel-wrapper.component';
import { NoteComplementaireWrapperComponent } from './components/containers/note-complementaire-wrapper/note-complementaire-wrapper.component';
import { ConsultationDemandeEvaluationComponent } from './components/ui/consultation-demande-evaluation/consultation-demande-evaluation.component';
import { ConsultationFicheSectionTerminaisonValidationComponent } from './components/ui/consultation-fiche-section-terminaison-validation/consultation-fiche-section-terminaison-validation.component';
import { ConsultationSectionReferencielsComponent } from './components/ui/consultation-sect-referenciels/consultation-sect-referenciels.component';
import { ConsultationSectionInterventionComponent } from './components/ui/consultation-section-intervention/consultation-section-intervention.component';
import { InfosanteNgCoreComponent } from './infosante-ng-core.component';



@NgModule({
  declarations: [
    InfosanteNgCoreComponent,
    ConsultationDemandeEvaluationComponent,
    ConsultationSectionReferencielsComponent,
    ConsultationFicheContainerComponent,
    ConsultationSectionInterventionComponent,
    ConsultationFicheSectionTerminaisonValidationComponent,
    ConsultationFicheAppelWrapperComponent,
    ConsultationListeProtocolesComponent,
    NoteComplementaireWrapperComponent,
    CorrectionFicheAppelWrapperComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    MsssUiModule,
    MsssServicesModule,
  ],
  exports: [
    InfosanteNgCoreComponent,
    ConsultationDemandeEvaluationComponent,
    ConsultationSectionReferencielsComponent,
    ConsultationFicheContainerComponent,
    ConsultationSectionInterventionComponent,
    ConsultationFicheSectionTerminaisonValidationComponent,
    ConsultationListeProtocolesComponent,
    CorrectionFicheAppelWrapperComponent,
  ]
})
export class InfosanteNgCoreModule {


}
