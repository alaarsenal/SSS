import {
  Injectable,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  ComponentFactory
} from '@angular/core';

import { AlertComponent } from "./alert.component"
import { AlertModel, AlertType } from "./alert-model"
import CollectionUtils from '../utils/collection-utils';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }


  show(container: ViewContainerRef, alerts: AlertModel[], alertType?: AlertType) {
    let componentRef: ComponentRef<any> = this.initializeComponentRef(container);
    componentRef.instance.alerts = alerts;
    componentRef.instance.close.subscribe(event => { componentRef.destroy(); });
    if (CollectionUtils.isNotBlank(alerts)) {
      window.scroll(0, 0);
    }
  }

  showSuccessAlert(container: ViewContainerRef, alertType?: AlertType) {
    let componentRef: ComponentRef<any> = this.initializeComponentRef(container);
    const alert: AlertModel = new AlertModel();
    alert.title = "Votre ressource a ete sauvegarde";
    alert.type = AlertType.SUCCESS;
    componentRef.instance.alerts = [alert];
    componentRef.instance.close.subscribe(event => { componentRef.destroy(); });
  }

  buildErrorAlertModelList(messages?: string[]): AlertModel[] {
    const alert: AlertModel = new AlertModel();
    alert.title = "Message d'erreur : ";
    alert.type = AlertType.ERROR;
    if (messages) {
      alert.messages = messages
    } else {
      alert.messages = ["Problème serveur"];
    }
    return [alert];
  }

  buildWarningAlertModelList(messages?: string[]): AlertModel[] {
    const alert: AlertModel = new AlertModel();
    alert.title = "Message d'avertissement : ";
    alert.type = AlertType.WARNING;
    if (messages) {
      alert.messages = messages
    } else {
      alert.messages = ["Problème serveur"];
    }
    return [alert];
  }

  private initializeComponentRef(container: ViewContainerRef): ComponentRef<any> {
    container.clear();
    let componentRef: ComponentRef<any>;
    let factory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    componentRef = container.createComponent(factory);
    return componentRef;
  }

}

