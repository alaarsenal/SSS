import { Component } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { SigctModuleEnum } from 'projects/sigct-service-ng-lib/src/lib/enums/sigct-module.enum';
import { NotificationCtiService } from 'projects/sigct-service-ng-lib/src/lib/services/cti/notification-cti.service';
import { KeepAliveService } from 'projects/sigct-service-ng-lib/src/lib/services/keep-alive.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private subsciption: Subscription = new Subscription();
  private infoSanteApiUrl: string;
  private infoSocialApiUrl: string;

  constructor(translate: TranslateService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationCtiService: NotificationCtiService,
    private keepAliveService: KeepAliveService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('fr');
    this.infoSanteApiUrl = window["env"].urlSanteApi;
    this.infoSocialApiUrl = window["env"].urlInfoSocial + "/api";
  }

  ngOnInit(): void {
    // On souscrit au changement d'url afin de garder les sessions du backend actives.
    this.subsciption.add(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.keepAliveService.keepAliveSante();
          this.keepAliveService.keepAliveSocial();
          this.keepAliveService.keepAliveSocialGuide();
          this.keepAliveService.keepAliveSanteGuide();
        }
      })
    );
    //Souscrire aux notifications CTI du serveur et écouter les messages
    this.subsciption.add(
      this.authenticationService.listenUserSubject().subscribe(
        (user: User) => {
          if (user) {
            //Souscrire aux notifications CTI du serveur infosante et relancer au module sante
            this.notificationCtiService.loadNotificationCTI(SigctModuleEnum.SANTE, this.infoSanteApiUrl);
            //Souscrire aux notifications CTI du serveur infosocial et relancer au module social
            this.notificationCtiService.loadNotificationCTI(SigctModuleEnum.SOCIAL, this.infoSocialApiUrl);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subsciption.unsubscribe();
    this.notificationCtiService.unsubscribe();
  }

}
