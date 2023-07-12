import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'msss-quebec-pied-de-page',
  templateUrl: './quebec-pied-de-page.component.html',
  styleUrls: ['./quebec-pied-de-page.component.css']
})
export class QuebecPiedDePageComponent implements OnInit {

  @Input() urlImage: string;
  @Input() nomSysteme: string = '';

  @Input() nomModule: string = '';

  @Input() nomEnvironnement: string = '';
  @Input() versionGlobal: string;

  @Input() appVersion: string;

  @Input()
  set buildNumber(value: string) {
    if (value && this.nomEnvironnement !== 'prod') {
      this.texteBuild = value;
    }
  };
  texteBuild: string;
  todayDate : Date = new Date();
  CSSBorderTop: string;
  dateMaintenant : Date = this.getDate();
  subDateMaintenant: Subscription;
  CSSclasseCouleurCadre: string;
  constructor() { }

  ngOnInit() {
    this.subDateMaintenant = this.getDateNow().subscribe(value => this.dateMaintenant = value);

    switch(this.nomEnvironnement) {
      case "prod" : { this.nomEnvironnement = "production"; break; }
      case "fon" : { this.nomEnvironnement = "fonctionnel"; break; }
      case "int" : { this.nomEnvironnement = "intégré"; break; }
      case "acc" : { this.nomEnvironnement = "acceptation"; break; }
      case "for" : { this.nomEnvironnement = "formation"; break; }
      case "pre" : { this.nomEnvironnement = "pré-production"; break; }
      case "acc" : { this.nomEnvironnement = "acceptation"; break; }
      case "qua" : { this.nomEnvironnement = "qualité"; break; }
      case "urg" : { this.nomEnvironnement = "urgence"; break; }
      default: { this.nomEnvironnement = "de développement"; break;}
    }
    switch(this.nomSysteme) {
      case "sigct.us.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-usager"; break; }
      case "sigct.sa.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-infosante"; break; }
      case "sigct.so.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-infosocial"; break; }
      default: { this.CSSclasseCouleurCadre = "border-bottom-infosocial"; break; }
    }

    switch(this.nomModule) {
      case "usager" : { this.CSSBorderTop = "border-top-usager"; break; }
      case "infosante" : { this.CSSBorderTop = "border-top-infosante"; break; }
      case "infosocial" : { this.CSSBorderTop = "border-top-infosocial"; break; }
      default: { this.CSSBorderTop = "border-top-infosante"; break; }
    }

  }

  getDateNow():Observable<Date> {
    return new Observable<Date>(observer => {

      const interval = setInterval(() => observer.next(this.getDate()), 1000);

      return () => {
        clearInterval(interval);
      }
    });

  }

  getDate():Date {
    return new Date();
  }

}
