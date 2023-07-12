import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { RechercheSuiviEnregistramentResultatDTO } from '../../../models/recherche-suivi-enregistrament-resultat-dto ';




@Component({
  selector: 'app-liste-des-enregistrements-container',
  templateUrl: './liste-des-enregistrements-container.component.html',
  styleUrls: ['./liste-des-enregistrements-container.component.css']
})
export class ListeDesEnregistrementsContainerComponent implements OnInit {

  public regionOrganismeCourant: string;
  @Output() public onConsuterClick = new EventEmitter<RechercheSuiviEnregistramentResultatDTO>();
  @Output() public onEditerClick = new EventEmitter<RechercheSuiviEnregistramentResultatDTO>();

  constructor(
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.initRegionOrganismeCourant();
  }

  initRegionOrganismeCourant(){
    this.regionOrganismeCourant = this.authenticationService.getAuthenticatedUser().codRegionOrganismeCourant + " - "
      + this.authenticationService.getAuthenticatedUser().nomRegionOrganismeCourant;
  }

  actionOnConsulerClick(event: RechercheSuiviEnregistramentResultatDTO) {
    this.onConsuterClick.emit(event);
  }

  actionOnEditerClick(event: RechercheSuiviEnregistramentResultatDTO) {
    this.onEditerClick.emit(event);
  }

}
