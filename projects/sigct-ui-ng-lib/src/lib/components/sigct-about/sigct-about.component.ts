import { AfterViewInit, Component, OnDestroy, OnInit, VERSION, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { SigctAbout } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-about/sigct-about';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { forkJoin, interval, Subscription } from 'rxjs';
import { SigctAboutService } from '../../../../../sigct-service-ng-lib/src/lib/services/sigct-about/sigct-about.service';
import { SigctDatepickerComponent } from '../sigct-datepicker/sigct-datepicker.component';

@Component({
  selector: 'msss-sigct-about',
  templateUrl: './sigct-about.component.html',
  styleUrls: ['./sigct-about.component.css']
})
export class SigctAboutComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private alertStore: AlertStore,
    private translateService: TranslateService,
    private sigctAboutService: SigctAboutService,
    private alertService: AlertService,
    private authService: AuthenticationService,
    ) { }


  public dateActuelle = new Date();

  public versionAngular: string;
  public currentLang: string;
  public payLang: string;
  public cultureLang: string;
  public appLang: string;

  public navigator;
  public navigatorVersion;
  public resolution = window.screen.width + ' x ' + window.screen.height;

  public localeDisplayName: string;
  public localeDisplayCountry: string;
  public localeDisplayLanguage: string;

  public serverHostName: string;
  public serverIpAddress: string;
  public serverType: string;
  public servletVersion: string;
  public javaVersion: string;
  public clientIpAddress: string;
  public clientNameHost: string;

  public urlRafraichirCache: string;
  public urlRafraichirOrganisme: string;

  public dateDebut: Date;
  public dateFin: Date = new Date();

  public subscriptions: Subscription = new Subscription();

  public indexerFiche: boolean = false;
  public indexerUsager: boolean = false;

  private modulesMap = new Map<string, string>();

  public nomModule: string;

  public user: User;

  public permissions = [];


  @ViewChild("dateDebutDatePicker", { read: SigctDatepickerComponent, static: false })
  dateDebutDatePicker: SigctDatepickerComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: false })
  alertContainer: ViewContainerRef;

  ngOnInit(): void {
    this.alertStore.resetAlert();

    this.user = this.authService.getAuthenticatedUser();

    this.modulesMap.set('usager', 'sigct.us.f_accueil.titre');
    this.modulesMap.set('infosante', 'sigct.sa.f_accueil.titre');
    this.modulesMap.set('infosocial', 'sigct.so.f_accueil.titre');

    this.nomModule = this.modulesMap.get(window["env"].appName);

    this.versionAngular = VERSION.full;
    this.currentLang = this.translateService.currentLang;

    // Appel "initial" pour récupérer les informations
    this.sigctAboutService.getSigctAboutInfo().subscribe((sigctAbout: SigctAbout) => {
      this.serverHostName = sigctAbout.serverHostName;
      this.serverIpAddress = sigctAbout.serverIpAddress;
      this.serverType = sigctAbout.serverType;
      this.servletVersion = sigctAbout.servletVersion;
      this.javaVersion = sigctAbout.javaVersion;
      this.clientIpAddress = sigctAbout.clientIpAddress;
      this.clientNameHost = sigctAbout.clientNameHost;
      this.navigator = sigctAbout.navigatorName;
      this.navigatorVersion = sigctAbout.navigatorVersion;
      this.localeDisplayName = sigctAbout.localeDisplayName;
      this.localeDisplayCountry = sigctAbout.localeDisplayCountry;
      this.localeDisplayLanguage = sigctAbout.localeDisplayLanguage;
      this.appLang = sigctAbout.appLocale;
      this.permissions = sigctAbout.permissions;
    });

    this.urlRafraichirCache = window["env"].urlSante + '/api/cache/rafraichir';
    this.urlRafraichirOrganisme = window["env"].urlSante + '/api/rafraichirCatgrOrgnsm';

    if (this.authService.hasAllRoles(['ROLE_ST_PILOTAGE_DGTI'])) {
      // Récupère le statut des collections Solr et démarre le spinner si une collection est busy
      forkJoin([this.sigctAboutService.getStatutFiche(window["env"].appName),
      this.sigctAboutService.getStatutUsager('usager')]).subscribe(results => {

        const stateFiche = results[0] as string;
        const stateUsager = results[1] as string;

        if (stateFiche == 'busy' || stateUsager == 'busy') {
          this.startTimer();
        }


      });
    }

  }

  ngAfterViewInit(): void {
    this.dateDebutDatePicker.focus();

    if (this.alertContainer) {
      this.subscriptions.add(
        this.alertStore.state$.subscribe((state: AlertModel[]) => {
          this.alertService.show(this.alertContainer, state);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.alertStore.resetAlert();
  }

  private startTimer() {
    const clock = interval(2000);
    this.subscriptions.add(clock.subscribe(n => {
      if (this.indexerFiche || this.indexerUsager) {
        this.getStatutFiche();
        this.getStatutUsager();
      }
    }));
  }


  public onRafraichirCache() {
    this.alertStore.resetAlert();

    this.subscriptions.add(
      this.sigctAboutService.getRafraichirCacheApplicative().subscribe(() => {
        // const title: string = this.translateService.instant("ss.msg.succes.confirmation");
        // const alert: AlertModel = AlertModelUtils.createAlertModelSuccess(title);
        // //ss-iu-c30001=L'indexation a été effectuée avec succès!
        // const msgs: string[] = [this.translateService.instant("ss-iu-c30001")];
        // alert.messages = msgs;
        // this.alertStore.addAlert(alert);
      })
    );
  }

  public onRafraichirOrganisme() {
    this.alertStore.resetAlert();

    this.sigctAboutService.getRafraichirOrganisme(this.urlRafraichirOrganisme);
  }

  private getStatutFiche() {
    this.subscriptions.add(
      this.sigctAboutService.getStatutFiche(window["env"].appName).subscribe((dto: string) => {
        if (dto) {
          if (dto == 'busy') {
            this.indexerFiche = true;
          } else {
            this.indexerFiche = false;
          }
        }
      },
        (error: any) => {
          this.indexerFiche = false;
        })
    );
  }

  private getStatutUsager() {
    this.subscriptions.add(
      this.sigctAboutService.getStatutUsager('usager').subscribe((dto: string) => {
        if (dto) {
          if (dto == 'busy') {
            this.indexerUsager = true;
          } else {
            this.indexerUsager = false;
          }
        }
      },
        (error: any) => {
          this.indexerUsager = false;
        })
    );
  }

  public onIndexerUsager() {
    this.alertStore.resetAlert();

    this.startTimer();

    if (this.dateDebut) {

      this.indexerUsager = true;
      this.subscriptions.add(
        this.sigctAboutService.getIndexer(this.dateDebut, 'usager').subscribe((erreur: string) => {
          if (erreur == null) {
            // Afficher une message de succès
            //ss-iu-c30001=L'indexation a été effectuée avec succès!
            const messages: string[] = [this.translateService.instant("ss-iu-c30001")];
            const alertTitle: string = this.translateService.instant("ss.msg.succes.confirmation");
            const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess(alertTitle);
            alertModel.messages = messages;
            this.alertStore.addAlert(alertModel);
          } else {
            let messages: string[] = [];
            // Une indexation est déjà en cours. Veuillez réessayer plus tard.
            let msg: string = this.translateService.instant("ss-sv-e50001");
            messages.push(msg);
            const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
            const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
            this.alertStore.addAlert(alertModel);
          }
          this.indexerUsager = false;
        },
          (error) => {
            // Un problème est survenu lors de l'indexation. Veuillez réessayer plus tard.
            const messages: string[] = [this.translateService.instant("ss-iu-e30012")];
            const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
            const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
            this.alertStore.setAlerts([alertModel]);
          })
      );

    } else {
      let messages: string[] = [];
      let fld: string = this.translateService.instant("sigct.ss.f_bandeau.informations.Datedebut");
      let msg: string = this.translateService.instant("general.msg.obligatoire", [fld]);
      messages.push(msg);
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
      this.alertStore.addAlert(alertModel);
    }


  }


  public onIndexerFiches() {
    this.alertStore.resetAlert();

    this.startTimer();

    if (this.dateDebut) {

      this.indexerFiche = true;
      this.subscriptions.add(
        this.sigctAboutService.getIndexer(this.dateDebut, 'fiches').subscribe(
          (erreur) => {
            if (erreur == null) {
              // Afficher une message de succès
              //ss-iu-c30001=L'indexation a été effectuée avec succès!
              const messages: string[] = [this.translateService.instant("ss-iu-c30001")];
              const alertTitle: string = this.translateService.instant("ss.msg.succes.confirmation");
              const alertModel: AlertModel = AlertModelUtils.createAlertModelSuccess(alertTitle);
              alertModel.messages = messages;
              this.alertStore.addAlert(alertModel);
            } else {
              // Une indexation est déjà en cours. Veuillez réessayer plus tard.
              const messages: string[] = [this.translateService.instant("ss-sv-e50001")];
              const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
              const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
              this.alertStore.addAlert(alertModel);
            }
            this.indexerFiche = false;
          },
          (error) => {
            // Un problème est survenu lors de l'indexation. Veuillez réessayer plus tard.
            const messages: string[] = [this.translateService.instant("ss-iu-e30012")];
            const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
            const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
            this.alertStore.setAlerts([alertModel]);
          })
      );

    } else {
      let messages: string[] = [];
      let fld: string = this.translateService.instant("sigct.ss.f_bandeau.informations.Datedebut");
      let msg: string = this.translateService.instant("general.msg.obligatoire", [fld]);
      messages.push(msg);
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
      this.alertStore.addAlert(alertModel);
    }
  }

  public isModuleUsager() {
    return window["env"].appName == 'usager';
  }

}
