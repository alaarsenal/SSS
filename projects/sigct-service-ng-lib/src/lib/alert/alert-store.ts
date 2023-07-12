import { Injectable } from '@angular/core';
import { Store } from '../store/abstract-store';

import { AlertModel } from '../alert/alert-model'

@Injectable({
  providedIn: 'root'
})
export class AlertStore extends Store<Array<AlertModel>> {

  constructor() {
    super(new Array<AlertModel>());
  }

  setAlerts(alerts: Array<AlertModel>): void {
    this.setState(alerts);
  }

  resetAlert(): void {
    this.setState(undefined);
  }

  /**
   * Ajoute une alerte au store
   * @param alerteAAjouter 
   */
  addAlert(alerteAAjouter: AlertModel): void {

    if (alerteAAjouter) {
      if (!this.state) { // Si le store est vide on ajoute
        this.setState([alerteAAjouter]);
      } else {
        let typeAlerteTrouve: boolean = false;

        this.state.forEach(function (alerteExistante: AlertModel) { // Pour chaque alerte existante
          if (alerteExistante.type === alerteAAjouter.type) {
            typeAlerteTrouve = true;
            if (alerteAAjouter.messages) {
              alerteAAjouter.messages.forEach(function (message: string) {
                //Evite les messages en double
                if (alerteExistante.messages.filter(m => m == message).length == 0) {
                  alerteExistante.messages.push(message);
                }
              });
            }
          }
        });

        if (!typeAlerteTrouve) { // Si on n'a pas trouvé c'est que ce type d'alertage n'est pas encore enregistré
          this.setState(this.state.concat(alerteAAjouter));
        }
      }
    }
  }

  /**
   * Ajoute un tableau d'alerte dans le store
   * @param alertesAAjouter tableau d'alertes
   */
  addAlerts(alertesAAjouter: AlertModel[]): void {
    if (alertesAAjouter) {
      alertesAAjouter.forEach((alerte: AlertModel) => {
        this.addAlert(alerte);
      });
    }
  }
}