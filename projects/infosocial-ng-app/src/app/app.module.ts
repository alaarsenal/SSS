import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-api.service';
import { AlertComponent } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.component';
import { HttpAppInterceptor } from 'projects/sigct-service-ng-lib/src/lib/http/http-app-intercetor';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { MessageService } from 'projects/sigct-service-ng-lib/src/lib/http/message.service';
import { ModalComponent } from 'projects/sigct-service-ng-lib/src/lib/modal-dialog/modal-dialog.component';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { SigctAppInitializerService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-app-initializer-service';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { UsagerNgCoreModule } from 'projects/usager-ng-core/src/lib/usager-ng-core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayout } from './modules/fiche-appel/components/layouts/app-layout/app-layout.component';

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
  ],
  imports: [
    BrowserModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
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
    { provide: 'IficheAppelApiService', useClass: FicheAppelApiService },
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    },
    SigctAppInitializerService,
    { provide: APP_INITIALIZER, useFactory: clearStorages, deps: [SigctAppInitializerService], multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [AlertComponent, ModalComponent, SigctChosenComponent]
})
export class AppModule {

  constructor(public translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');
    translate.use('fr');
    registerLocaleData(localeFr); // Utilisé par DatePipe
  }

}
