import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { ConsultationFicheAppelWrapperComponent } from './components/containers/consultation-fiche-appel-wrapper/consultation-fiche-appel-wrapper.component';
import { ConsultationFicheContainerComponent } from './components/containers/consultation-fiche/consultation-fiche-container.component';
import { CorrectionFicheAppelWrapperComponent } from './components/containers/correction-fiche-appel-wrapper/correction-fiche-appel-wrapper.component';
import { NoteComplementaireWrapperComponent } from './components/containers/note-complementaire-wrapper/note-complementaire-wrapper.component';
import { ConsultationFicheSectionDemandeAnalyseComponent } from './components/ui/consultation-fiche-section-demande-analyse/consultation-fiche-section-demande-analyse.component';
import { ConsultationFicheSectionPlanActionComponent } from './components/ui/consultation-fiche-section-plan-action/consultation-fiche-section-plan-action.component';
import { ConsultationFicheSectionTerminaisonValidationComponent } from './components/ui/consultation-fiche-section-terminaison-validation/consultation-fiche-section-terminaison-validation.component';
import { ConsultationListeReferentielsComponent } from './components/ui/consultation-liste-referentiels/consultation-liste-referentiels.component';

@NgModule({
  declarations: [
    ConsultationFicheSectionDemandeAnalyseComponent,
    ConsultationFicheSectionPlanActionComponent,
    ConsultationFicheSectionTerminaisonValidationComponent,
    ConsultationListeReferentielsComponent,
    ConsultationFicheContainerComponent,
    ConsultationFicheAppelWrapperComponent,
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
    ConsultationFicheSectionDemandeAnalyseComponent,
    ConsultationFicheSectionPlanActionComponent,
    ConsultationFicheSectionTerminaisonValidationComponent,
    ConsultationListeReferentielsComponent,
    ConsultationFicheContainerComponent,
    CorrectionFicheAppelWrapperComponent,
  ]
})
export class InfosocialNgCoreModule {
}
