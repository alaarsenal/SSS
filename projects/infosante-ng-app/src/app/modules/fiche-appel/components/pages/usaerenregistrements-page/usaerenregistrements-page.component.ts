import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { RechercheSuiviEnregistramentResultatDTO } from 'projects/usager-ng-core/src/lib/models/recherche-suivi-enregistrament-resultat-dto ';

@Component({
  selector: 'app-usaerenregistrements-page',
  templateUrl: './usaerenregistrements-page.component.html',
  styleUrls: ['./usaerenregistrements-page.component.css']
})
export class UsaerenregistrementsPageComponent implements OnInit, OnDestroy {


  public action = "rechercher";

  public leftMenuItems:  MenuItem[] = [];

  public itemSelectione = new RechercheSuiviEnregistramentResultatDTO();

  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    private alertStore: AlertStore) { }

  ngOnInit(): void{
    this.initleftMenu();
    this.activedRoute.params.subscribe(params => { this.action = params['action']; console.log(this.action) });
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
  }

  initleftMenu(){
    this.leftMenuItems = [this.getRechercherMenuItem(), this.getEnregistrementMenuItem()];
  }

  getRechercherMenuItem(){
    return {
      id: "menuItemUsaerenregistrementsPageComponentRechercherId",
      title: "ss.listes.enregistrements.menu.rechercher",
      isAction: true,
      isActive: this.isRechercher(),
      action: () => {this.onRechercherClick()},
      icon: "fa fa-search",
      disabled: this.isRechercher(),
      visible: true
    }
  }

  getEnregistrementMenuItem() {
    return {
      id: "menuItemUsaerenregistrementsPageComponentEnregistrementId",
      title: "ss.listes.enregistrements.menu.enregistrement",
      icon: "fa icon-address-card-o",
      isAction: true,
      disabled: true,
      isActive: ! this.isRechercher(),
      visible: ! this.isRechercher(),
    }
  }

  onRechercherClick(){
    this.naviguer('rechercher', new RechercheSuiviEnregistramentResultatDTO());
  }

  onConsulterClick(event: RechercheSuiviEnregistramentResultatDTO){
    this.naviguer('consulter', event);
  }

  onEditerClick(event: RechercheSuiviEnregistramentResultatDTO) {
    this.naviguer('editer', event);
  }

  naviguer(action: string, itemSelectione: RechercheSuiviEnregistramentResultatDTO){
    this.itemSelectione = itemSelectione;
    this.router.navigate(['/usager/enregistrements/'+action]);
    this.initleftMenu();
  }

  isRechercher() {
    return this.action == "rechercher";
  }

  isConsulter() {
    return this.action == "consulter"
  }

  isEditer() {
    return this.action == "editer"
  }


}
