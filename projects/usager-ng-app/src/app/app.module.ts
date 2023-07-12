import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { AlertComponent } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.component';
import { HttpAppInterceptor } from 'projects/sigct-service-ng-lib/src/lib/http/http-app-intercetor';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { MessageService } from 'projects/sigct-service-ng-lib/src/lib/http/message.service';
import { ModalComponent } from 'projects/sigct-service-ng-lib/src/lib/modal-dialog/modal-dialog.component';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { SigctAppInitializerService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-app-initializer-service';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { UsagerNgCoreModule } from 'projects/usager-ng-core/src/lib/usager-ng-core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayout } from './components/layouts/app-layout/app-layout.component';
import { RapportFusionUsagerPageComponent } from './components/pages';
import { AccueilUsagerPageComponent } from './components/pages/accueil-usager-page/accueil-usager-page.component';
import { AjouterEnregistrementUsagerPageComponent } from './components/pages/ajouter-enregistrement-usager-page/ajouter-enregistrement-usager-page.component';
import { AppelsAnterieursUsagerPageComponent } from './components/pages/appels-anterieurs-usager-page/appels-anterieurs-usager-page.component';
import { BaseUsagerPageComponent } from './components/pages/base-usager-page/base-usager-page.component';
import { ConsulterAlertesFicheAppelUsagerPageComponent } from './components/pages/consulter-alertes-fiche-appel-usager-page/consulter-alertes-fiche-appel-usager-page.component';
import { ConsulterAlertesUsagerPageComponent } from './components/pages/consulter-alertes-usager-page/consulter-alertes-usager-page.component';
import { ConsulterAppelAnterieurUsagerPageComponent } from './components/pages/consulter-appel-anterieur-usager-page/consulter-appel-anterieur-usager-page.component';
import { ConsulterEnregistrementUsagerPageComponent } from './components/pages/consulter-enregistrement-usager-page/consulter-enregistrement-usager-page.component';
import { ConsulterUsagerPageComponent } from './components/pages/consulter-usager-page/consulter-usager-page.component';
import { EditerUsagerPageComponent } from './components/pages/editer-usager-page/editer-usager-page.component';
import { EnregistrementsUsagerPageComponent } from './components/pages/enregistrements-usager-page/enregistrements-usager-page.component';
import { FusionnerUsagerPageComponent } from './components/pages/fusionner-usager-page/fusionner-usager-page.component';
import { ListeDesEnregistrementsPageComponent } from './components/pages/liste-des-enregistrements-page/liste-des-enregistrements-page.component';
import { RapportJournalisationPageComponent } from './components/pages/rapport-journalisation-page/rapport-journalisation-page.component';
import { RechercherUsagerPageComponent } from './components/pages/rechercher-usager-page/rechercher-usager-page.component';
import { SuiviEtatEnregistrementPageComponent } from './components/pages/suivi-etat-enregistrement-page/suivi-etat-enregistrement-page.component';
import { InformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/information-utile-page.component';
import { EditerInformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/editer-information-utile-page/editer-information-utile-page.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: window["env"].urlUsager + "/js/msgbundles_", suffix: ".js" },
    { prefix: window["env"].urlInfoSocial + "/js/msgbundles_", suffix: ".js" },
    { prefix: window["env"].urlSante + "/js/msgbundles_", suffix: ".js" },
  ])
}

export function clearStorages(appInitializerService: SigctAppInitializerService) {
  return () => appInitializerService.clearStorages();
}

@NgModule({
  declarations: [
    AppComponent,
    AppLayout,
    RechercherUsagerPageComponent,
    SuiviEtatEnregistrementPageComponent,
    ListeDesEnregistrementsPageComponent,
    EditerUsagerPageComponent,
    ConsulterUsagerPageComponent,
    AccueilUsagerPageComponent,
    EnregistrementsUsagerPageComponent,
    AjouterEnregistrementUsagerPageComponent,
    BaseUsagerPageComponent,
    ConsulterEnregistrementUsagerPageComponent,
    AppelsAnterieursUsagerPageComponent,
    ConsulterAppelAnterieurUsagerPageComponent,
    ConsulterAlertesUsagerPageComponent,
    ConsulterAlertesFicheAppelUsagerPageComponent,
    FusionnerUsagerPageComponent,
    RapportFusionUsagerPageComponent,
    RapportJournalisationPageComponent,
    InformationUtilePageComponent,
    EditerInformationUtilePageComponent
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
    MsssUiModule,
    MsssServicesModule,
    UsagerNgCoreModule,
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
