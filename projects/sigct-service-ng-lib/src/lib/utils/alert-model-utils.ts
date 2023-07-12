import CollectionUtils from './collection-utils';
import { AlertModel, AlertType } from '../alert/alert-model';

export default class AlertModelUtils {

  static createAlertModelSuccess(title: string): AlertModel {
    let alertModel: AlertModel = new AlertModel();
    alertModel.title = title;
    alertModel.type = AlertType.SUCCESS;
    return alertModel;
  }

  static createAlertModelValidationFinales(validationsFinales: Map<string, string>, title: string): AlertModel {
    if (validationsFinales) {
      let messages: string[] = Object.values(validationsFinales);
      if (CollectionUtils.isNotBlank(messages)) {
        return this.createAlertModel(messages, title, AlertType.WARNING_FINAL);
      }
    }
  }

  static createAlertModelAvertissements(avertissements: Map<string, string>, title: string): AlertModel {
    if (avertissements) {
      let messages: string[] = Object.values(avertissements);
      if (CollectionUtils.isNotBlank(messages)) {
        return this.createAlertModel(messages, title, AlertType.WARNING);
      }
    }
  }

  static createAlertModelErreurs(erreurs: Map<string, string>, title: string): AlertModel {
    if (erreurs) {
      let messages: string[] = Object.values(erreurs);
      if (CollectionUtils.isNotBlank(messages)) {
        return this.createAlertModel(messages, title, AlertType.ERROR);
      }
    }
  }

  static createAlertModel(messages: string[], title: string, alertType?: AlertType): AlertModel {
    if (CollectionUtils.isNotBlank(messages)) {
      if (!alertType) {
        alertType = AlertType.ERROR;
      }
      if (!title) {
        title = "Message Alert";
      }
      let alertModel: AlertModel = new AlertModel();
      alertModel.messages = messages;
      alertModel.title = title;
      alertModel.type = alertType;
      return alertModel;
    }
    return null;
  }

}
