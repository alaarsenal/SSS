import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { BindingErrors, BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { ReferenceDTO, UsagerDTO } from '../../../models';






@Component({
  selector: 'app-informations-supp-usager',
  templateUrl: './informations-supp-usager.component.html',
  styleUrls: ['./informations-supp-usager.component.css']
})
export class InformationsSuppUsagerComponent implements OnInit, OnDestroy {

  constructor(
    private bindingErrorsStore: BindingErrorsStore,
    private translate: TranslateService) {

  }

  @ViewChild("fInfoSupp", { static: true })
  form: NgForm;

  @ViewChild('moisExpr', { read: ElementRef, static: true })
  moisExpr: ElementRef;

  @ViewChild("langue", { static: true })
  langue;

  public usagerDTO: UsagerDTO = new UsagerDTO();
  public actionLinks: ActionLinkItem[];
  public bindingErrors: BindingErrors;
  public inputTextNAMValide: boolean = true;
  public inputTextNAMAnneeValide: boolean = true;
  public inputTextNAMMoisValide: boolean = true;
  private subscriptions: Subscription = new Subscription();


  //Conteneur pour les listes de valeurs
  public inputOptionLangue: InputOptionCollection = {
    name: "langue",
    options: []
  };

  public inputOptionMalentendant: InputOptionCollection = {
    name: "malentendant",
    options: []
  }

  public inputOptionDoublonPotentiel: InputOptionCollection = {
    name: "doublonPotentiel",
    options: []
  }


  public errorsMessages = {}


  /** Peuple la liste des langues */
  @Input("listeLangue")
  public set listeLangue(values: ReferenceDTO[]) {
    this.inputOptionLangue.options = [];

    if (this.inputOptionLangue.options[0] === undefined) {
      this.inputOptionLangue.options.push({ label: this.translate.instant("option.select.message"), value: null });
    }

    if (values) {
      values.forEach(item => {
        this.inputOptionLangue.options.push({ label: item.nom, value: item.code, description: item.description });
      });
    }
  }

  ngOnInit() {

    this.subscriptions.add(
      this.form.valueChanges.subscribe(value => this.form.valid) //TODO: nécessaire?
    );

    this.subscriptions.add(
      this.bindingErrorsStore.state$.subscribe(bindingErrors => {
        this.bindingErrors = bindingErrors;
      })
    );

    this.inputOptionMalentendant.options = [{ label: this.translate.instant("usager.info.supp.malentendant"), value: "true" }];
    this.inputOptionDoublonPotentiel.options = [{ label: this.translate.instant("usager.info.supp.doublon.potentiel"), value: "true" }];

    this.inputTextNAMAnneeValide = true;
    this.inputTextNAMMoisValide = true;
    this.inputTextNAMValide = true;

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lors de la saisie s'il y a 2 caractères on met en majuscule la première lettre
   * @param event Origine de la modification
   */
  onKey(event: any): void {
    if (event.target.value.length >= 2) {
      event.target.value = StringUtils.convertFirstLetterToUpperCase(event.target.value);
    }

  }
  /**
   * À la saisie du NAM on met en majuscule
   */
  onKeyupNAM(): void {
    this.usagerDTO.nam = this.usagerDTO.nam.toUpperCase();
  }

  /**
   * soumettre le formulaire
   * @param args 
   */
  onSubmit(args) {
    let ngForm = <NgForm>args;
    let alertM = new AlertModel();
    alertM.messages = [];

    let NAMSaisie: string = "";
    if (ngForm.value.nam) { NAMSaisie = ngForm.value.nam; }
    let NAMAnneeExprSaisie: string = "";
    if (ngForm.value.anneeExpr) { NAMAnneeExprSaisie = ngForm.value.anneeExpr; }
    let NAMMoisExprSaisie: string = "";
    if (ngForm.value.moisExpr) { NAMMoisExprSaisie = ngForm.value.moisExpr; }


  }

  onFocus(event: string) {
    this.onFocusClick(event);
  }

  onClick(event) {
    this.onFocusClick(event.target.id);
  }
  /**
   * Lorsqu'on clique dans un champ on veut qu'il ne soit plus marqué comme invalide
   * @param event 
   */
  private onFocusClick(id: string) {

    switch (id) {

      case "nam": {
        this.inputTextNAMValide = true;
        this.bindingErrors['nam'] = undefined;
        this.actionLinks
        break;
      }

      case "anneeExpr": {
        this.inputTextNAMAnneeValide = true;
        this.bindingErrors['anneeExpr'] = undefined;
        break;
      }

      case "moisExpr": {
        this.inputTextNAMMoisValide = true;
        this.bindingErrors['moisExpr'] = undefined;
        break;
      }
    }
  }

}
