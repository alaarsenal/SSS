import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UrlTree } from '@angular/router';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { Observable, Subscription } from 'rxjs';
import { HasAutoSave } from '../../../../services/auto-save-guard.service';

@Component({
  template: ''
})
export abstract class BaseFicheAppelPage implements OnInit, OnDestroy, HasAutoSave {
  /**
   * Subscription utilisé pour accumuler les souscriptions.
   * Automatiquement libéré dans le OnDestroy().
   * Peut être utilisé par les classes qui héritent de celle-ci.
   */
  protected subscriptions: Subscription = new Subscription();

  protected afficherPopUpUnload: boolean = false;

  constructor(
    private baseFicheAppelDataService: FicheAppelDataService) {
  }

  ngOnInit(): void {
    // On s'abonne au clic sur le bouton Annuler.
    this.subscriptions.add(
      this.baseFicheAppelDataService.onAnnuler().subscribe(() => {
        this.onAnnuler();
      })
    );

    // On s'abonne au changement d'onglet.
    this.subscriptions.add(
      this.baseFicheAppelDataService.onFicheAppelActiveChange().subscribe((ficheAppel: FicheAppelDTO) => {
        if (ficheAppel?.id) {
          this.onFicheAppelActiveChange(ficheAppel?.id);
        }
      })
    );

    // On s'abonne au clic sur le bouton Sauvegarder.
    this.subscriptions.add(
      this.baseFicheAppelDataService.onSauvegarder().subscribe(() => {
        this.onSauvegarder();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lance la sauvegarde automatique lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload ', ['$event'])
  beforeUnload(event: any) {
    try {

      if (this.afficherPopUpUnload) {
        event.returnValue = "popup";
      } else {
        this.autoSaveBeforeUnload();
      }
    } finally {
      // Retourner "undefined" permet d'éviter l'affichage du message de confirmation par défaut du navigateur.
      // Chrome: "Les modifications que vous avez apportées ne seront peut-être pas enregistrées."
      // Le finally permet d'éviter l'apparition du message en cas d'erreur inattendue dans autoSaveBeforeUnload().

      return undefined;


    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: L'implémentation doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  abstract autoSaveBeforeUnload(): void;

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  abstract autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  abstract onAnnuler(): void;

  /**
   * Lorsqu'une navigation est effectuée (changement d'url).
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  abstract onFicheAppelActiveChange(idFicheAppel: number): void;

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  abstract onSauvegarder(): void;
}
