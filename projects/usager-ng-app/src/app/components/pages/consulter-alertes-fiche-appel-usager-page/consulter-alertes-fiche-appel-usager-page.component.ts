import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AppelAnterieurDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { HasIsDirty } from 'projects/usager-ng-core/src/lib/guards/ajouter-note-complementaire.guard';
import { ConsulterAlertesFicheAppelUsagerContainerComponent } from 'projects/usager-ng-core/src/lib/components/containers/consulter-alertes-fiche-appel-usager/consulter-alertes-fiche-appel-usager-container.component';

@Component({
  selector: 'app-consulter-alertes-fiche-appel-usager-page',
  templateUrl: './consulter-alertes-fiche-appel-usager-page.component.html',
  styleUrls: ['./consulter-alertes-fiche-appel-usager-page.component.css']
})
export class ConsulterAlertesFicheAppelUsagerPageComponent implements OnInit, OnDestroy, HasIsDirty {

  @ViewChild('consulterAlerteFicheAppelContainer', { static: true })
  consulterAlerteFicheAppelContainer: ConsulterAlertesFicheAppelUsagerContainerComponent;

  private subscriptions: Subscription = new Subscription();

  ficheAppelDto: AppelAnterieurDTO;
  idUsager: number;
  domaine: string;
  idFicheAppel: number;

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-lg fa-file-text-o" },
    actions: [],
  };

  leftMenuItems: MenuItem[] = [];

  constructor(private usagerService: UsagerService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    // On souscrit au changement d'url produit par les onglets afin de mettre à jour l'apparence des onglets et les liens du menu gauche.
    // Récupère de l'url l'identifiant de la fiche d'appel à consulter.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {

        this.domaine = params.get("domaine");
        this.idFicheAppel = +params.get("idFicheAppel");
        this.idUsager = +params.get("idUsager");
        this.init(this.domaine, this.idUsager, this.idFicheAppel)
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Récupère les données nécessaires à l'initialisation du composent et ajuste les liens dans le menu vertical.
   * @param idAppel
   * @param idFicheAppel
   */
  private init(domaine: string, idUsager: number, idFicheAppel: number): void {

    this.leftMenuItems = [
      {
        id: "menuItemConsulterAlertesFicheAppelUsagerPageComponentConsulterId",
        title: "usager.alertes.consulteralertes",
        link: "/consulter-alertes",
        icon: "fa fa-search",
        disabled: false,
        visible: true
      },
      {
        id: "menuItemConsulterAlertesFicheAppelUsagerPageComponentFicheId",
        title: "usager.alertes.consultationfiche",
        link: "/" + idUsager + "/alertes/fiche-appel/" + domaine + "/" + idFicheAppel + "/consulter",
        icon: "fa fa-file-text-o",
        disabled: false,
        visible: true
      },
    ];

    this.subscriptions.add(
      this.usagerService.getAppelsAnterieursUsager(this.idUsager).subscribe((appels: AppelAnterieurDTO[]) => {
        this.ficheAppelDto = new AppelAnterieurDTO();
        if (appels) {
          this.ficheAppelDto = appels.find(a => a.domaine == this.domaine && a.idFicheAppel == this.idFicheAppel);
        }
      })

    );

  }

  /**
   * Retourne true si le composant de la page a des modifs non sauvegardées.
   */
  isDirty(): boolean {
    return this.consulterAlerteFicheAppelContainer.isDirty();
  }

  /**
   * Lance la confirmation lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload ', ['$event'])
  beforeUnload(event: any) {
    if (this.isDirty()) {
      // Peu importe la valeur définie dans returnValue, le navigateur affiche son propre message de confirmation.
      // Chrome: "Les modifications que vous avez apportées ne seront peut-être pas enregistrées."
      event.returnValue = "popup";
    } else {
      // Retourner "undefined" permet d'éviter l'affichage du message de confirmation par défaut du navigateur.
      // Chrome: "Les modifications que vous avez apportées ne seront peut-être pas enregistrées."
      return undefined;
    }
  }

}
