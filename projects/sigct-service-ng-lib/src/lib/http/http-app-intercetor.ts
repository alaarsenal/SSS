import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ListeAvertissementDTO } from 'projects/usager-ng-core/src/lib/models/liste-avertissement-dto';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AlertModel } from '../alert/alert-model';
import { AlertStore } from '../alert/alert-store';
import { AlertService } from '../alert/alert.service';
import { BindingErrors, BindingErrorsStore } from '../api-errors';
import { SigctModuleEnum } from '../enums/sigct-module.enum';
import { ModulesInactifsStore } from '../store/modules-inactifs-store';

@Injectable()
/**
 * @author Bruno Soufo
 */
export class HttpAppInterceptor implements HttpInterceptor {
  constructor(
    private bindingErrorsStore: BindingErrorsStore,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private spinner: NgxSpinnerService,
    private router: Router,
    private modulesInactifsStore: ModulesInactifsStore,
    private translateService: TranslateService) {
  }

  /**
   * Permet de déterminer à quel module appartient un url.
   * @param url
   * @returns SigctModuleEnum
   */
  private getSigctModuleFromUrl(url: string): SigctModuleEnum {
    let module: SigctModuleEnum = null;
    if (url) {
      if (url.toLowerCase().startsWith(window["env"].urlUsager)) {
        module = SigctModuleEnum.USAGER;
      } else if (url.toLowerCase().startsWith(window["env"].urlSante)) {
        module = SigctModuleEnum.SANTE;
      } else if (url.toLowerCase().startsWith(window["env"].urlInfoSocial)) {
        module = SigctModuleEnum.SOCIAL;
      } else if (url.toLowerCase().includes("m10services")) {
        module = SigctModuleEnum.M10;
      }
    }
    return module;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method == "POST") {
      this.spinner.show('spinner');
    }

    //Ne modifie pas la request si on tente d'accéder au serveur M10, sinon on obtient une erreur 405 - Method Not Allowed.
    if (!request.url.toLowerCase().includes("m10services")) {
      /*if (request.url.toLocaleLowerCase().includes("papa")) {
        request = request.clone({
          withCredentials: true,
          setHeaders: {
            'Accept': 'application/pdf,',
            'Cache-Control': 'no-cache'
          },
          responseType: 'blob'
        });
      } else {
        request = request.clone({
          withCredentials: true,
          setHeaders: {
            'Accept': 'application/json, application/javascript;charset=ISO-8859-1',
            'Cache-Control': 'no-cache'
          }
        });
      }*/
      request = request.clone({
        withCredentials: true,
        setHeaders: {
          'Accept': 'application/json, application/javascript;charset=ISO-8859-1',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body) {
            (<ListeAvertissementDTO>event.body)
            if (event.body.listeAvertissement) {
              if (event.body.listeAvertissement.length > 0) {
                const alert: AlertModel[] = this.alertService.buildWarningAlertModelList(Object.values(event.body.listeAvertissement))

                this.alertStore.addAlerts(alert);
              }
            }
          }

          // Le module vient peut être de passer de l'état inactif à actif alors on tente de le retirer du store des modules inactifs.
          const module: SigctModuleEnum = this.getSigctModuleFromUrl(event.url);
          this.modulesInactifsStore.removeModuleInactif(module);
        }

        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let httpResponse = <HttpErrorResponse>error;

        // Détermine le module courant.
        const currentModule: SigctModuleEnum = SigctModuleEnum.getByAppName(window["env"].appName);

        // Module externe inactif
        let moduleExterneInactif: SigctModuleEnum = null;

        switch (httpResponse.status) {
          case 0:   // DevTools (désactivation d'url)
          case 500: // Internal Server Error
          case 502: // Bad Gateway
          case 503: // Service Unavailable
          case 504: // Gateway Timeout
            // Détermine le module d'où provient l'erreur.
            const moduleEnErreur: SigctModuleEnum = this.getSigctModuleFromUrl(httpResponse.url);

            if (moduleEnErreur && moduleEnErreur != currentModule) {
              moduleExterneInactif = moduleEnErreur;
              this.modulesInactifsStore.addModuleInactif(moduleExterneInactif);
            }

            // Si l'erreur est produite par un keep-alive ou un msgbundles_fr.js, on arrête le traitement,
            // car on ne veut pas afficher de message d'erreur.
            if (request.url.toLocaleLowerCase().includes("/keep-alive") || request.url.toLocaleLowerCase().includes("/js/msgbundles_")) {
              return throwError(error);
            }
            break;
        }
        /*
                if (httpResponse?.url?.includes("papa")) {
                  console.log(httpResponse.url);
                  window.open(httpResponse.url);
                  return throwError(error);
                }
        */
        const isPortailLoginForm: boolean = httpResponse.error
          && httpResponse.error.text
          && (httpResponse.error.text).includes("sigctMdpForm");

        const isTomcatSessionNotFoundPage: boolean = httpResponse.error
          && (typeof (httpResponse.error) === "string")
          && (httpResponse.error).includes("your session was not found");

        const isSessionExpired: boolean = isPortailLoginForm || isTomcatSessionNotFoundPage;

        if (isSessionExpired) {
          window.location.href = window["env"].urlPortail;
          return;
        }

        const errorHtmlHeader: boolean = httpResponse.headers
          && httpResponse.headers.get('Content-Type')
          && httpResponse.headers.get('Content-Type').includes("text/html");

        const errorHtmlBody: boolean = httpResponse.error
          && httpResponse.error.text
          && (httpResponse.error.text).includes("</html>");

        if (httpResponse.status != 401 && (errorHtmlHeader || errorHtmlBody)) {
          return throwError(error);
        }

        if (httpResponse.status == 403) {
          const messages: string[] = ["Accès interdit."];
          const alert: AlertModel[] = this.alertService.buildErrorAlertModelList(messages)
          this.alertStore.addAlerts(alert);
          this.bindingErrorsStore.setState({});

          // Retour à l'accueil pour y afficher l'alerte.
          this.router.navigate(['/accueil'])
          return;
        }

        if (httpResponse.error != undefined && httpResponse.error.bindingErrors) {
          const bindingErrors = <BindingErrors>httpResponse.error.bindingErrors;

          const alert: AlertModel[] = this.alertService.buildErrorAlertModelList(Object.values(bindingErrors))

          this.alertStore.addAlerts(alert);

          this.bindingErrorsStore.setState(<BindingErrors>httpResponse.error.bindingErrors);

        } else {
          const messages: string[] = [];
          if (error.error && error.error instanceof Array) {
            error.error.forEach(item => {
              if (item.userMessage) {
                messages.push(item.userMessage);
              }
            });
          } else if (error.error && error.error.userMessage) {
            messages.push(error.error.userMessage);
          } else if (moduleExterneInactif) {
            // Certains services ne sont pas disponibles présentement. Vous pouvez continuer à utiliser
            // l'application mais certaines informations seront manquantes. Modules concernés : {{0}}
            const nomModule: string = this.modulesInactifsStore.getNomModule(moduleExterneInactif);
            const msg: string = this.translateService.instant("ss-iu-e90001", { 0: nomModule });
            messages.push(msg);
          }

          const alert: AlertModel[] = this.alertService.buildErrorAlertModelList(messages && messages.length > 0 ? messages : null)
          this.alertStore.addAlerts(alert);
          this.bindingErrorsStore.setState({});
        }

        return throwError(error);
      }),
      finalize(() => {
        this.spinner.hide('spinner');
      })
    );
  }
}
