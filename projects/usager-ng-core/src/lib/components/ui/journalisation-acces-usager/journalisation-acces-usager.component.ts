import { EventEmitter, Output } from '@angular/core';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';

import { RapportJournalisationDTO } from 'projects/usager-ng-core/src/lib/models/rapport-journalisation-dto';
import { Subscription } from 'rxjs';





@Component({
  selector: 'msss-journalisation-acces-usager',
  templateUrl: './journalisation-acces-usager.component.html',
  styleUrls: ['./journalisation-acces-usager.component.css']
})
export class JournalisationAccesUsagerComponent implements OnInit, OnDestroy {

  rapportDTO: RapportJournalisationDTO = new RapportJournalisationDTO();
  endDate: Date = new Date();

  isIdentifiantUsagerValide: boolean = true;
  isDateDebutValide: boolean = true;
  isDateFinValide: boolean = true;

  tooltip: string;

  abonnements: Subscription = new Subscription();

  constructor(public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService) { }

  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("idusager", { static: true })
  identifiantHTML: InputTextComponent;

  @Output()
  genererRapport : EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {

    this.tooltip = this.translateService.instant("sigct.ss.f_rapport_journ.btn.genrer", null);

    this.identifiantHTML.focus();

  }

  ngOnDestroy(): void {
    if (this.abonnements) { this.abonnements.unsubscribe(); }
    this.alertStore.resetAlert();

  }

  onSubmit() {

    this.alertStore.resetAlert();


    this.genererRapport.emit(this.rapportDTO);


  }


  public setValidDateDebut(val: boolean): void {
    this.isDateDebutValide = null;
    this.isDateDebutValide = val;
  }

  public setValidDateFin(val: boolean): void {
    this.isDateFinValide = null;
    this.isDateFinValide = val;
  }



}
