import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-fusionner-usager',
  templateUrl: './fusionner-usager-page.component.html',
  styleUrls: ['./fusionner-usager-page.component.css']
})
export class FusionnerUsagerPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private menuItemRechercherUsager: MenuItem;
  private menuItemFusionnerUsager: MenuItem;

  leftMenuItems: MenuItem[];

  idUsagerIdent1: number = null;
  idUsagerIdent2: number = null;

  constructor(private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // Récupère de l'url l'identifiant des usagers à fusionner.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const id1: string = params.get("idUsager1");
        const id2: string = params.get("idUsager2");

        this.idUsagerIdent1 = id1 ? +id1 : null;
        this.idUsagerIdent2 = id2 ? +id2 : null;

        this.creerLeftMenuItems();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Surcharge de la création des items de menu et assemblage du menu gauche.
   */
  protected creerLeftMenuItems(): void {
    const hasRoleFusion: boolean = AuthenticationUtils.hasRole('ROLE_US_USAGER_FUSION');

    this.menuItemRechercherUsager = {
      id: "menuItemFusionnerUsagerPageComponentRechercherId",
      title: "usager.menuvert.btnrechercher",
      link: "/recherche",
      icon: "fa fa-search",
      visible: true
    };

    this.menuItemFusionnerUsager = {
      id: "menuItemFusionnerUsagerPageComponentFusionnerId",
      title: "usager.menuvert.btnfusionner",
      link: "/fusionner/" + this.idUsagerIdent1 + "/" + this.idUsagerIdent2,
      icon: "fa fa-compress",
      visible: hasRoleFusion,
      isActive: true
    };

    this.leftMenuItems = [
      this.menuItemRechercherUsager,
      this.menuItemFusionnerUsager,
    ];
  }

  /**
   * Lorsqu'un retour à la liste est demandé.
   */
  onRetourListe(): void {
    let target = '/recherche';
    this.router.navigate([target]);
  }
}
