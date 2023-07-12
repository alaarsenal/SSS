import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { IndicateursFinInterventionDTO } from './indicateurs-fin-intervention-dto';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { InputOptionCollection } from '../../utils/input-option';
import { EnumReponseValidation } from './enum-reponse-validation';
import { Tuple } from '../../utils/tuple';
import { ValidationDTO } from './validation-dto';
import { InputRadioComponent } from '../input-radio/input-radio.component';
import { interval } from 'rxjs';


const DEFAULT_LABEL_REPONSE_OUI: string = "Oui";
const DEFAULT_LABEL_REPONSE_NON: string = "Non";
const DEFAULT_LABEL_REPONSE_SO: string = "S.O.";

@Component({
  selector: 'msss-indicateurs-fin-intervention',
  templateUrl: './indicateurs-fin-intervention.component.html',
  styleUrls: ['./indicateurs-fin-intervention.component.css']
})
export class IndicateursFinInterventionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('radioIndicateurs') private radioIndicateurs: QueryList<InputRadioComponent>;

  firstRadioButtonForFocus: any;
  timeForFirstRadioButtonFocus: any;

  @Input()
  labelReponseOui: string = DEFAULT_LABEL_REPONSE_OUI;

  @Input()
  labelReponseNon: string = DEFAULT_LABEL_REPONSE_NON;

  @Input()
  labelReponseSO: string = DEFAULT_LABEL_REPONSE_SO;

  @Input()
  isDisabled = false;

  @Input('questions')
  set questions(values: IndicateursFinInterventionDTO[]) {
    this.questionsIndicateurs = values;

    values.forEach((value, index) => {
      this.inputOptionReponsesArray.push({
        name: "radioReponses" + index,
        options: [
          { label: null, value: EnumReponseValidation.OUI, description: "" },
          { label: null, value: EnumReponseValidation.NON, description: "" },
          { label: null, value: EnumReponseValidation.SO, description: "" }
        ]
      });
      this.reponsesQuestions.push({ key: value.reponseCode, value: value.question.id });
    });

  }

  questionsIndicateurs: IndicateursFinInterventionDTO[];

  inputOptionReponsesArray: InputOptionCollection[] = [];

  private reponsesQuestions: Tuple[] = [];

  @Output()
  indicateurChangedEvent = new EventEmitter<ValidationDTO>();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.timeForFirstRadioButtonFocus) this.timeForFirstRadioButtonFocus.unsubscribe();
  }

  ngAfterViewInit() {

    this.changeFocus(100);

  }

  onReponseSelectedValueChange(indicateur: IndicateursFinInterventionDTO): void {
    this.indicateurChangedEvent.emit(this.createValidaiton(indicateur));
  }

  private createValidaiton(indicateur: IndicateursFinInterventionDTO): ValidationDTO {
    if (indicateur.reponse) {
      indicateur.reponse.reponse = indicateur.reponseCode;
    } else {
      indicateur.reponse = {
        id: null,
        idFicheAppel: null,
        idReferenceValidation: indicateur.question.id,
        reponse: indicateur.reponseCode
      }
    }
    return indicateur.reponse;
  }

  getQuestionInfoBull(question: ReferenceDTO): string {
    return question && !StringUtils.isBlank(question.description) ? question.description : question.nom;
  }


  /**Permet de changer au chargement de la page ou d'onglet */
  public changeFocus(delais): void {

    this.timeForFirstRadioButtonFocus = interval(delais).subscribe(tick => {
      if (this.radioIndicateurs && this.radioIndicateurs.length > 0) {

        this.firstRadioButtonForFocus = this.radioIndicateurs.toArray();

        if (this.firstRadioButtonForFocus && this.firstRadioButtonForFocus.length > 0) {
          let radio: InputRadioComponent = this.firstRadioButtonForFocus[0];
          radio.setFocus();
        }

        this.timeForFirstRadioButtonFocus.unsubscribe();

      }

    });


  }

}
