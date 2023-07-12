import { Component } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IsiswApiService } from 'projects/isiswhisto-ng-core/src/lib/services/isiswhisto-api.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private subsciption: Subscription = new Subscription();

  constructor(translate: TranslateService,
    private router: Router,
    private isiswService: IsiswApiService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('fr');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('fr');
  }

  ngOnInit(): void {
    // On souscrit au changement d'url afin de garder les sessions du backend actives.
    this.subsciption.add(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.subsciption.add(this.isiswService.keepAlive().subscribe());
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subsciption.unsubscribe();
  }
}