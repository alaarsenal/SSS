import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { IsiswHistoNgCoreModule } from 'projects/isiswhisto-ng-core/src/public-api';
import { AlertComponent } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.component';
import { HttpAppInterceptor } from 'projects/sigct-service-ng-lib/src/lib/http/http-app-intercetor';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { MessageService } from 'projects/sigct-service-ng-lib/src/lib/http/message.service';
import { ModalComponent } from 'projects/sigct-service-ng-lib/src/lib/modal-dialog/modal-dialog.component';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { SigctAppInitializerService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-app-initializer-service';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConsulterIsiswCentreActivitesComponent } from './components/consultation/consulter-isisw-centre-activites/consulter-isisw-centre-activites.component';
import { ConsulterIsiswCollecteDonneesComponent } from './components/consultation/consulter-isisw-collecte-donnees/consulter-isisw-collecte-donnees.component';
import { ConsulterIsiswEvaluationComponent } from './components/consultation/consulter-isisw-evaluation/consulter-isisw-evaluation.component';
import { ConsulterIsiswHistoriqueComponent } from './components/consultation/consulter-isisw-historique/consulter-isisw-historique.component';
import { ConsulterIsiswInterventionComponent } from './components/consultation/consulter-isisw-intervention/consulter-isisw-intervention.component';
import { ConsulterIsiswNoteSuiviComponent } from './components/consultation/consulter-isisw-note-suivi/consulter-isisw-note-suivi.component';
import { ConsulterIsiswNotesComplementairesComponent } from './components/consultation/consulter-isisw-notes-complementaires/consulter-isisw-notes-complementaires.component';
import { ConsulterIsiswProfessionnelComponent } from './components/consultation/consulter-isisw-professionnel/consulter-isisw-professionnel.component';
import { ConsulterIsiswReferenceComponent } from './components/consultation/consulter-isisw-reference/consulter-isisw-reference.component';
import { ConsulterIsiswUsagerComponent } from './components/consultation/consulter-isisw-usager/consulter-isisw-usager.component';
import { ConsulterIsiswWrapperComponent } from './components/consultation/consulter-isisw-wrapper/consulter-isisw-wrapper.component';
import { AppLayout } from './components/layouts/app-layout/app-layout.component';
import { ConsulterIsiswPageComponent, RechercherIsiswPageComponent } from './components/pages';
import { RechercherIsiswCriteriasComponent } from './components/rechercher-isisw-criterias/rechercher-isisw-criterias.component';
import { RechercherIsiswWrapperComponent } from './components/rechercher-isisw-wrapper/rechercher-isisw-wrapper.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: window["env"].urlIsiswHisto + "/js/msgbundles_", suffix: ".js" },
  ])
}

export function clearStorages(appInitializerService: SigctAppInitializerService) {
  return () => appInitializerService.clearStorages();
}

@NgModule({
  declarations: [
    AppComponent,
    AppLayout,
    RechercherIsiswPageComponent,
    RechercherIsiswWrapperComponent,
    RechercherIsiswCriteriasComponent,
    ConsulterIsiswPageComponent,
    ConsulterIsiswWrapperComponent,
    ConsulterIsiswUsagerComponent,
    ConsulterIsiswCentreActivitesComponent,
    ConsulterIsiswCollecteDonneesComponent,
    ConsulterIsiswInterventionComponent,
    ConsulterIsiswReferenceComponent,
    ConsulterIsiswEvaluationComponent,
    ConsulterIsiswNotesComplementairesComponent,
    ConsulterIsiswNoteSuiviComponent,
    ConsulterIsiswProfessionnelComponent,
    ConsulterIsiswHistoriqueComponent
  ],
  imports: [
    BrowserAnimationsModule, NgxSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useValue: TranslatePipe,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    FormsModule,
    MsssUiModule,
    MsssServicesModule,
    IsiswHistoNgCoreModule,
    MatSnackBarModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'My-Xsrf-Cookie',
      headerName: 'My-Xsrf-Header',
    }),
  ],
  providers: [
    HttpErrorHandler,
    MatSnackBarModule,
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpAppInterceptor, multi: true },
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    },
    SigctAppInitializerService,
    { provide: APP_INITIALIZER, useFactory: clearStorages, deps: [SigctAppInitializerService], multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [AlertComponent, ModalComponent]
})
export class AppModule {

  constructor(public translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');
    translate.use('fr');
    registerLocaleData(localeFr); // Utilisé par DatePipe
  }
}
