import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { IndicateursFinInterventionDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/indicateurs-fin-intervention-dto';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ValidationFinInterventionDTO } from 'projects/infosante-ng-core/src/lib/models/validation-fin-intervention-dto';
import { ProjetRechercheService } from 'projects/infosante-ng-core/src/lib/services/projet-recherche.service';
import { ProjetRechercheDTO } from 'projects/infosante-ng-core/src/lib/models/projet-recherche-dto';
import { ProjetRechercheComponent } from '../projet-recherche/projet-recherche.component';
import { IndicateursFinInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/indicateurs-fin-intervention.component';

const DEFAULT_OPTION: string = "Sélectionnez...";

@Component({
  selector: 'app-validation-fin-intervention',
  templateUrl: './validation-fin-intervention.component.html',
  styleUrls: ['./validation-fin-intervention.component.css']
})
export class ValidationFinInterventionComponent implements OnInit {

  @ViewChild('projetrecherche', { static: true }) private appProjetRecherche: ProjetRechercheComponent;

  @ViewChild('validations', { static: true }) private appValidations: IndicateursFinInterventionComponent;

  @Input()
  set validationFinInterventionInput(value: ValidationFinInterventionDTO) {
    this.validationFinIntervention = value;
    this.convertToIndicateursFinIntervention();
  }

  @Input()
  idFicheAppel: number;

  @Input()
  typeFiche: string;

  @Input()
  set referencesValidationsInput(values: ReferenceDTO[]) {
    if (values) {
      this.referencesValidations = values;
    }
  }

  @Input()
  public set referencesRaisonCpInconnusInput(values: ReferenceDTO[]) {
    if (values) {
      this.inputOptionsRaisonCpNonSaisi.options = [];
      this.inputOptionsRaisonCpNonSaisi.options.push({ label: DEFAULT_OPTION , value: null });
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsRaisonCpNonSaisi.options.push({
          label: item.nom,
          value: item.code,
          description: item.description
        });
      });
      this.referencesRaisonCpInconnusDTO = values;
    }
  }

  @Input()
  public set referencesCategoriesAppelantInput(values: ReferenceDTO[]) {
    if (values) {
      this.inputOptionsConclusionEffectuee.options = [];
      this.inputOptionsConclusionEffectuee.options.push({ label: DEFAULT_OPTION, value: null });
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsConclusionEffectuee.options.push({
          label: item.simpleNom,
          value: item.code,
          description: item.description
        });
      });
      this.referencesCategoriesAppelantDTO = values;
    }
  }

  public listeProjetRecherche: ProjetRechercheDTO[];

  @Input("listeProjetRecherches")
  public set listeProjetRecherches(values: ProjetRechercheDTO[]) {

      this.listeProjetRecherche = values;

  }


  @Input()
  public isDisabled = false;

  inputOptionsRaisonCpNonSaisi: InputOptionCollection = {
    name: "raisoncpnonsaisi",
    options: [] = [{ label: DEFAULT_OPTION, value: null }]
  };

  inputOptionsConclusionEffectuee: InputOptionCollection = {
    name: "concltypeinterloc",
    options: [] = [{ label: DEFAULT_OPTION, value: null }]
  };


  //Les événements qui sont poussés au parent
  @Output()
  projetRechercheSave: EventEmitter<any> = new EventEmitter();

  @Output()
  projetRechercheDelete: EventEmitter<any> = new EventEmitter();


  validationFinIntervention: ValidationFinInterventionDTO;

  indicateursFinInterventions: IndicateursFinInterventionDTO[] = [];

  raisonCpNonSaisiValide: boolean = true;
  conclusionEffectueeValide: boolean = true;

  infoBullRaisonCpNonSaisi: string = "";//On ne peut pas utilisé DEFAULT_OPTION car au chargement de la page cela inscrit sélectionner... dans le tooltip alors qu'il ne l'est pas;
  infoBullConclusionEffectuee: string = "";//DEFAULT_OPTION;

  private referencesValidations: ReferenceDTO[] = [];
  private referencesRaisonCpInconnusDTO: ReferenceDTO[] = [];
  private referencesCategoriesAppelantDTO: ReferenceDTO[] = [];

  constructor(
    private projetRechercheService: ProjetRechercheService) { }

  ngOnInit(): void {
  }

  onIndicateurChanged(validation: ValidationDTO): void {
    if (validation) {
      if (!validation.idFicheAppel) {
        validation.idFicheAppel = this.idFicheAppel;
      }
      if (!this.validationFinIntervention.validations) {
        this.validationFinIntervention.validations = [];
      }
      let validationExists: boolean = false;
      this.validationFinIntervention.validations.forEach(item => {
        if (item.idReferenceValidation == validation.idReferenceValidation) {
          validationExists = true;
          item.reponse = validation.reponse;
          return;
        }
      });
      if (!validationExists) {
        this.validationFinIntervention.validations.push(validation);
      }
    }
  }

  onChangeRaisonCpNonSaisi(): void {
    this.infoBullRaisonCpNonSaisi = DEFAULT_OPTION;
    if (this.validationFinIntervention.codeRefRaisonCpInconnu) {
      this.referencesRaisonCpInconnusDTO.forEach(ref => {
        if (ref.code == this.validationFinIntervention.codeRefRaisonCpInconnu) {
          this.infoBullRaisonCpNonSaisi = ref.description ? ref.description : ref.nom;
        }
      });
    }
  }

  onChangeConclusionEffectuee(): void {
    this.infoBullConclusionEffectuee = DEFAULT_OPTION;
    if (this.validationFinIntervention.codeRefCategorieAppelant) {
      this.referencesCategoriesAppelantDTO.forEach(ref => {
        if (ref.code == this.validationFinIntervention.codeRefCategorieAppelant) {
          this.infoBullConclusionEffectuee = ref.description ? ref.description : ref.simpleNom;
        }
      });
    }
  }

  onOptionSelectedRaisonCpNonSaisi(): void {
    this.raisonCpNonSaisiValide = true;
  }

  onOptionSelectedConclusionEffectuee(): void {
    this.conclusionEffectueeValide = true;
  }

  resetChampsValides():void {
    this.appProjetRecherche.resetChampsValides();
  }

  private convertToIndicateursFinIntervention() {
    let aux: IndicateursFinInterventionDTO[] = [];
    this.referencesValidations.forEach(reference => {
      aux.push(this.getIndicateursFinIntervention(reference));
    });
    this.indicateursFinInterventions = aux;
  }

  private getIndicateursFinIntervention(reference: ReferenceDTO): IndicateursFinInterventionDTO {
    let result: IndicateursFinInterventionDTO = { question: reference, reponseCode: null, reponse: null };
    if (this.validationFinIntervention.validations) {
      this.validationFinIntervention.validations
        .filter(validation => validation.idReferenceValidation == reference.id)
        .forEach(validation => {
          result.reponseCode = validation.reponse;
          result.reponse = validation;
          return;
        });
    }
    return result;
  }

  onProjetRechercheSave(event){
    this.projetRechercheSave.emit(event);
  }

  onProjetRechercheDelete(event){
    this.projetRechercheDelete.emit(event);
  }

  getProjetRechercheComponent():ProjetRechercheComponent {
    return this.appProjetRecherche;
  }

  /** Permet de changer le focus lors du changement de chemin */
  setFocusOnRouting():void{
    this.appValidations.changeFocus(800);
  }

}
