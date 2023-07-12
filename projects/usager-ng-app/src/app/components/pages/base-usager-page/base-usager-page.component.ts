import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { StatusEnregisrementEnum } from 'projects/usager-ng-core/src/lib/enums/status-enregistrements-enum';
import { EnregistrementsUsagerResultatDTO } from 'projects/usager-ng-core/src/lib/models/enregistrements-usager-resultat-dto';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-usager-page',
  template: `Vide!`
})
export class BaseUsagerPageComponent implements OnInit, OnDestroy {

  // Identifiant de l'usager à modifier
  idUsager: number;

  // Identifiant de l'enregistrement à modifier
  idEnregistrement: number;

  subscriptions: Subscription = new Subscription();

  leftMenuItems: MenuItem[];

  protected menuItemRechercherUsager: MenuItem;
  protected menuItemEditerUsager: MenuItem;
  protected menuItemFichesAnterieures: MenuItem;
  protected menuItemConsulterUsager: MenuItem;
  protected menuItemEnregistrementsUsager: MenuItem;
  protected culeurIconeEnregistrements: boolean;
  protected menuItemAjouterEnregistrementUsager: MenuItem;

  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected authenticationService: AuthenticationService,
    protected appContextStore: AppContextStore,
    protected usagerSevice: UsagerService) {
  }

  ngOnInit(): void {
    // Garde la session du portail active
    this.subscriptions.add(
      this.authenticationService.setSessionActivePortail().subscribe()
    );

    // Récupère de l'url l'identifiant de l'usager à traiter.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        let id = params.get("idUsager");

        if (id) {
          this.idUsager = Number.parseInt(id);
        } else {
          // valeur initialisée correspond a un usager anonyme ou l'usager n'a pas été sélectionné !
          this.idUsager = null;
        }
      })
    );

    // Récupère de l'url l'identifiant de l'enregistrement à traiter.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        let id = params.get("idEnregistrement");

        if (id) {
          this.idEnregistrement = Number.parseInt(id);
        } else {
          // valeur initialisée correspond a un usager anonyme ou l'usager n'a pas été sélectionné !
          this.idEnregistrement = null;
        }
      })
    );

    this.calculerCuleurIconeEnregistrements();

    // Création du menu gauche.
    this.creerLeftMenuItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Met à jour l'apparence des menus enregistrement selon le statut des enregistrements de l'usager
   */
  updateLeftMenuItems(statusEnregisrement: string): void {

    if (!this.leftMenuItems) {
      this.creerLeftMenuItems();
    }

    let isMenuEnregColored: boolean;
    switch (statusEnregisrement) {
      case StatusEnregisrementEnum.ACTIF:
        isMenuEnregColored = true;
        break;
      case StatusEnregisrementEnum.INACTIF:
        isMenuEnregColored = false;
        break;
      default:
        isMenuEnregColored = undefined;
    }

    this.menuItemEnregistrementsUsager.isColorHighlited = (this.idUsager && isMenuEnregColored);
  }

  /**
   * Création des items de menu et assemblage du menu gauche.
   */
  protected creerLeftMenuItems(): void {
    if (this.idUsager) {
      this.menuItemRechercherUsager = {
        id: "menuItemBaseUsagerPageComponentRechercherUsagerId",
        title: "usager.menuvert.btnrechercher",
        link: "/recherche",
        icon: "fa fa-search",
        visible: true
      };

      this.menuItemConsulterUsager = {
        id: "menuItemBaseUsagerPageComponentConsulterId",
        title: "usager.menuvert.btnconsulter",
        link: "/" + this.idUsager + "/consulter",
        icon: "fa fa-user",
        visible: true
      };

      this.menuItemEditerUsager = {
        id: "menuItemBaseUsagerPageComponentEditerId",
        title: "usager.menuvert.btnmodifier",
        link: "/" + this.idUsager + "/editer",
        icon: "fa fa-edit",
        visible: true
      };

      // Liste des appels de l'usager
      this.menuItemFichesAnterieures = {
        id: "menuItemBaseUsagerPageComponentFichesId",
        title: "usager.menuvert.btnlstappel",
        icon: "fa fa-folder-open",
        link: "/" + this.idUsager + "/fiches-anterieures",
        visible: true
      };

      this.menuItemEnregistrementsUsager = {
        id: "menuItemBaseUsagerPageComponentEnregistrementId",
        title: "usager.menuvert.btnenregistrement",
        link: "/" + this.idUsager + "/enregistrements",
        icon: "fa icon-address-card-o",
        visible: true,
        isColorHighlited: this.culeurIconeEnregistrements
      };

      this.leftMenuItems = [
        this.menuItemRechercherUsager,
        this.menuItemConsulterUsager,
        this.menuItemEditerUsager,
        this.menuItemFichesAnterieures,
        this.menuItemEnregistrementsUsager,
      ];
    }

  }


  calculerCuleurIconeEnregistrements() {

    if (this.idUsager != null) {
      this.usagerSevice.getEnregistrementsUsager(this.idUsager).subscribe(data => {
        let enregistrements: EnregistrementsUsagerResultatDTO[] = data;
        let totalActif = enregistrements.filter(enregistrement => enregistrement.actif).length;
        let totalInactif = enregistrements.filter(enregistrment => !enregistrment.actif).length;;
        let total = enregistrements.length;

        let statusEnregistrementsUsager: StatusEnregisrementEnum;

        if (total == 0) statusEnregistrementsUsager = null; //blanc
        if (totalInactif > 0) statusEnregistrementsUsager = StatusEnregisrementEnum.INACTIF; //bleu
        if (totalActif > 0) statusEnregistrementsUsager = StatusEnregisrementEnum.ACTIF; //orange

        this.updateLeftMenuItems(statusEnregistrementsUsager)
      });
    }

  }

  /**
  * Lorsqu'un retour à la liste est demandé.
  */
  onRetourListe(): void {
    let target = '/recherche';
    this.router.navigate([target]);
  }

}
