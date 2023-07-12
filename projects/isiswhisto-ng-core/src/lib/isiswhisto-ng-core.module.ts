import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    TranslateModule.forChild(),
    FormsModule,
    MsssUiModule,
    MsssServicesModule,
    MatToolbarModule,
  ],
  exports: [
  ],
})

export class IsiswHistoNgCoreModule {
}
