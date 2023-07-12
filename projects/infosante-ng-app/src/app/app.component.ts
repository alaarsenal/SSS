import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { User } from 'projects/sigct-service-ng-lib/src/lib/auth/user';
import { SigctModuleEnum } from 'projects/sigct-service-ng-lib/src/lib/enums/sigct-module.enum';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { NotificationCtiService } from 'projects/sigct-service-ng-lib/src/lib/services/cti/notification-cti.service';
import { KeepAliveService } from 'projects/sigct-service-ng-lib/src/lib/services/keep-alive.service';
import { RaccourciService } from 'projects/sigct-service-ng-lib/src/lib/services/raccourcis/raccourcis-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private subsciption: Subscription = new Subscription();

  constructor(translate: TranslateService,
    private router: Router,
    private keepAliveService: KeepAliveService,
    private authenticationService: AuthenticationService,
    private notificationCtiService: NotificationCtiService,
    private raccourciService: RaccourciService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('fr');
  }

  ngOnInit(): void {
    // On souscrit au changement d'url afin de garder les sessions du backend actives.
    this.subsciption.add(this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.keepAliveService.keepAliveIsiswHisto();
        this.keepAliveService.keepAliveUsager();
        this.keepAliveService.keepAliveSanteGuide();
      }
    }));

    //nous initialisons les raccourcis.
    this.subsciption.add(this.raccourciService
      .getListeRaccourcis()
      .subscribe((data: ReferenceDTO[]) =>
        this.raccourciService.populeRaccourcis(data)));

    //Souscrire aux notifications CTI du serveur et écouter les messages
    this.subsciption.add(
      this.authenticationService.listenUserSubject().subscribe(
        (user: User) => {
          if (user) {
            this.notificationCtiService.loadNotificationCTI(SigctModuleEnum.SANTE);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
    this.notificationCtiService.unsubscribe();
    // console.log("ngOnDestroy : " + sessionStorage.getItem("user"));
  }

  // /**
  //  * Met fin à la souscription CTI.
  //  * @param event
  //  */
  // @HostListener('window:beforeunload ', ['$event'])
  // beforeUnload(event: any) {
  //   this.notificationCtiService.unsubscribeNotificationCTI(SigctModuleEnum.SANTE);
  // }
}
