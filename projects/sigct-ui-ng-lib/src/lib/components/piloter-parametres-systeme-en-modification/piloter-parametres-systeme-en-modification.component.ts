import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ParametreSystemeDTO } from '../piloter-parametres-systeme/parametre-systeme-dto';

@Component({
  selector: 'msss-piloter-parametres-systeme-en-modification',
  templateUrl: './piloter-parametres-systeme-en-modification.component.html',
  styleUrls: ['./piloter-parametres-systeme-en-modification.component.css']
})
export class PiloterParametresSystemeEnModificationComponent implements OnInit, OnDestroy {

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  subscriptions: Subscription = new Subscription();
  parametreSystemeDTO: ParametreSystemeDTO = new ParametreSystemeDTO();
  heightFieldContentParamSystm: string = "400";
  css: string;

  constructor(private appelAdmParameterService: AppelAdmParameterService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private router: Router) { }

  ngOnInit(): void {
    this.configureAlertMsg();
    this.loadDataParameterSystem();
    this.css = this.appelAdmParameterService.getCssOnModuleNom();
  }

  private configureAlertMsg(): void {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );
  }

  private loadDataParameterSystem(): void {
    // Récupère de l'url le code du parametre systeme à traiter.
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        let _codeParamSystm = params?.get("codeParamSystm");
        if (_codeParamSystm) {
          this.parametreSystemeDTO.code = _codeParamSystm;
          this.subscriptions.add(this.appelAdmParameterService.obtenirAdmParameterByCode(_codeParamSystm).subscribe((result: ParametreSystemeDTO) => {
            if (result) {
              this.parametreSystemeDTO.textRich = result.textRich;
              this.parametreSystemeDTO.contenu = result.contenu;
              localStorage.setItem('contenuHistory', this.parametreSystemeDTO.contenu);
            }
          }));
        }
      })
    );
  }

  sauvegarderParamSystemeBtn(): void {
    this.appelAdmParameterService.modifieAdmParameter(this.parametreSystemeDTO).subscribe((result: ParametreSystemeDTO) => {
      if (result) {
        localStorage.setItem('contenuHistory', result.contenu);
        this.afficherMessageSauvegardeReussie();
      }
    })
  }

  private afficherMessageSauvegardeReussie(): void {
    const alertM: AlertModel = new AlertModel();
    alertM.title = "Confirmation";
    alertM.messages = [this.translateService.instant("ss-iu-c00008")];
    alertM.type = AlertType.SUCCESS;
    this.alertStore.addAlert(alertM);
  }

  confirmBackToParamsSystemePagination(): void {
    if (this.parametreSystemeDTO.contenu != localStorage.getItem("contenuHistory")) {
      this.openModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    } else {
      this.router.navigate(["piloter-params-systeme"]);
    }
  }

  annulerModifEtRetourListeRechercheParamSysteme(): void {
    this.closeModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    if (this.parametreSystemeDTO.contenu != localStorage.getItem("contenuHistory")) {
      this.parametreSystemeDTO.contenu = localStorage.getItem("contenuHistory");
    }
    this.router.navigate(["piloter-params-systeme"]);
  }

  confirmerAnnulerModifParamSysteme(): void {
      this.openModal('confirm_popup_annuler-modif');
  }

  annulerModifParamSysteme(): void {
    this.closeModal('confirm_popup_annuler-modif');
    let previousContenu = localStorage.getItem("contenuHistory");
    this.parametreSystemeDTO.contenu = previousContenu;
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  ngOnDestroy(): void {
    localStorage.removeItem("contenuHistory");
    this.viderPileMessages();
    this.subscriptions.unsubscribe();

  }
  private viderPileMessages(): void {
    if (this.alertStore?.state) {
      this.alertStore.setState([]);
    }
  }

}
