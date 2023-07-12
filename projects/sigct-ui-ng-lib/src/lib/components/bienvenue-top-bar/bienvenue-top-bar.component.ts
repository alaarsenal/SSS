import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'msss-bienvenue-top-bar',
  templateUrl: './bienvenue-top-bar.component.html',
  styleUrls: ['./bienvenue-top-bar.component.css']
})
export class BienvenueTopBarComponent implements OnInit, OnDestroy {

  @Input() nomSysteme: string = '';

  @Input() nomEnvironnement: string = 'Test';

  @Input() prenomNomUtilisateur: string;

  @Input() nomOrganismeCourant: string;

  @Input() nomRegionOrganismeCourant: string;

  @Input() urlSystemeAPropos: string = '#';

  @Input() versionGlobal: string;

  @Input() appVersion: string;

  @Input()
  set buildNumber(value: string) {
    if (value && this.nomEnvironnement !== 'prod') {
      this.texteBuild = value;
    }
  };

  @Input() urlImageLogo: string

  @Input() bienvenueMot: string;

  dateMaintenant : Date = this.getDate();
  subDateMaintenant: Subscription;
  texteBuild: string;

  CSSclasseCouleurCadre: string;

  constructor() {

  }

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
      case "sigct.us.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-usager";
       break; }
      case "sigct.sa.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-infosante";
       break; }
      case "sigct.so.f_accueil.titre" : { this.CSSclasseCouleurCadre = "border-bottom-infosocial";
      break; }
      default: { this.CSSclasseCouleurCadre = "border-bottom-infosocial";
      break; }
    }


  }

  ngOnDestroy() {
    this.subDateMaintenant.unsubscribe();
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
