import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { AppelAnterieurDTO } from 'projects/usager-ng-core/src/lib/models/appel-anterieur-dto';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';
import { HasIsDirty } from 'projects/usager-ng-core/src/lib/guards/ajouter-note-complementaire.guard';
import { ConsulterAppelAnterieurUsagerContainerComponent } from 'projects/usager-ng-core/src/lib/components/containers/consulter-appel-anterieur-usager/consulter-appel-anterieur-usager-container.component';

@Component({
  selector: 'app-consulter-appel-anterieur-usager-page',
  templateUrl: './consulter-appel-anterieur-usager-page.component.html',
  styleUrls: ['./consulter-appel-anterieur-usager-page.component.css']
})
export class ConsulterAppelAnterieurUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy, HasIsDirty {

  @ViewChild('consulterAppelAnterieurContainer', { static: true })
  consulterAppelAnterieurContainer: ConsulterAppelAnterieurUsagerContainerComponent;

  appelAnterieurDto: AppelAnterieurDTO;

  constructor(router: Router,
    route: ActivatedRoute,
    authenticationService: AuthenticationService,
    appContextStore: AppContextStore,
    usagerService: UsagerService) {
    super(route, router, authenticationService, appContextStore, usagerService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    // Récupère de l'url l'identifiant de la fiche d'appel à consulter.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        this.appelAnterieurDto = new AppelAnterieurDTO();
        this.appelAnterieurDto.domaine = params.get("domaine");
        this.appelAnterieurDto.idFicheAppel = +params.get("idFicheAppel");
      })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Retourne true si le composant de la page a des modifs non sauvegardées.
   */
  isDirty(): boolean {
    return this.consulterAppelAnterieurContainer.isDirty()
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
