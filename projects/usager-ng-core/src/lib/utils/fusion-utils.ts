import { Injectable } from '@angular/core';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { UsagerLieuResidenceDTO } from '../models/usager-lieu-residence-dto';






@Injectable({
  providedIn: 'root'
})
export default class FusionUtils {
  static inputOptionVide: InputOption = {
    value: null,
    label: " ",
    description: " "
  };

  /**
   * Crée une liste de InputOption avec les références correspondant aux codes refCode1 et refCode2.
   * Retourne une liste avec une option vide si refCode1 et refCode2 sont vides.
   * @param refCode1 
   * @param refCode2 
   * @param references liste de références dans laquelle retrouver refCode1 et refCode2
   * @param inputOptionSelectionnez InputOption Sélectionnez... (ajouté au début de la liste d'InputOption si présent)
   * @returns 
   */
  static creerInputOptionsFromRefCodes(refCode1: string, refCode2: string, references: ReferenceDTO[], inputOptionSelectionnez: InputOption): InputOption[] {
    let options: InputOption[] = [];

    if (refCode1 || refCode2) {
      if (inputOptionSelectionnez) {
        options.push(inputOptionSelectionnez);
      }

      references.forEach((reference: ReferenceDTO) => {
        if (reference.code == refCode1 || reference.code == refCode2) {
          options.push({ value: reference.code, label: reference.nom, description: reference.description });
        }
      });
    } else {
      options = [this.inputOptionVide];
    }
    return options;
  }

  /**
   * Crée une liste de InputOption à partir d'une liste de références.
   * @param references liste de références à transformer en liste de InputOption
   * @param inputOptionSelectionnez InputOption Sélectionnez... (ajouté au début de la liste d'InputOption si présent)
   * @returns 
   */
  static creerInputOptionsFromReferences(references: ReferenceDTO[], inputOptionSelectionnez: InputOption): InputOption[] {
    let options: InputOption[] = [];

    if (references) {
      if (inputOptionSelectionnez) {
        options.push(inputOptionSelectionnez);
      }

      references.forEach((reference: ReferenceDTO) => {
        options.push({ value: reference.code, label: reference.nom, description: reference.description });
      });
    }
    return options;
  }

  /**
   * Crée une liste de InputOption avec les valeurs value1 et value2. 
   * Retourne une liste avec une option vide si value1 et value2 sont vides.
   * @param value1 value de l'option 1
   * @param value2 value de l'option 2
   * @param inputOptionSelectionnez InputOption Sélectionnez... (ajouté au début de la liste d'InputOption si présent)
   * @returns 
   */
  static creerInputOptionsFromValues(value1: any, value2: any, inputOptionSelectionnez: InputOption): InputOption[] {
    let options: InputOption[] = [];

    if (value1 || value2) {
      if (inputOptionSelectionnez) {
        options.push(inputOptionSelectionnez);
      }

      if (value1) {
        options.push({ value: value1, label: value1, description: '' });
      }

      if (value2) {
        options.push({ value: value2, label: value2, description: '' });
      }
    } else {
      options.push(FusionUtils.inputOptionVide);
    }
    return options;
  }
  /**
   * Crée une liste de InputOption avec les valeurs value1 et value2. 
   * Retourne une liste avec une option vide si value1 et value2 sont vides.
   * @param value1 value de l'option 1
   * @param label1 label/description de l'option 1
   * @param value2 value de l'option 2
   * @param label2 label/description de l'option 2
   * @param inputOptionSelectionnez InputOption Sélectionnez... (ajouté au début de la liste d'InputOption si présent)
   * @returns
   */
  static creerInputOptionsFromValuesEtLibelles(value1: any, label1: string, value2: any, label2: string, inputOptionSelectionnez: InputOption): InputOption[] {
    let options: InputOption[] = [];

    if (value1 || value2) {
      if (inputOptionSelectionnez) {
        options.push(inputOptionSelectionnez);
      }

      if (value1) {
        options.push({ value: value1, label: label1, description: '' });
      }
      if (value2) {
        options.push({ value: value2, label: label2, description: '' });
      }
    } else {
      options.push(FusionUtils.inputOptionVide);
    }
    return options;
  }

  /**
   * Retourne value1 si value2 est null, retourne value2 si value1 est null ou retourne value1 si elle est égale à value2.
   * @param value1 
   * @param value2 
   * @returns 
   */
  static equalsOuUnique(value1: any, value2: any): any {
    if (value1 == value2) {
      return value1;
    } else if (value1 && !value2) {
      return value1;
    } else if (!value1 && value2) {
      return value2;
    }
    return null;
  }

  /**
   * Retourne value1 si value2 est null, retourne value2 si value1 est null ou retourne value1 si elle est égale à value2.
   * @param value1 
   * @param value2 
   * @returns 
   */
  static equalsOuUniqueBool(value1: boolean, value2: boolean): any {
    if (value1 == value2) {
      return value1;
    } else if (value1 != null && value2 == null) {
      return value1;
    } else if (value1 == null && value2 != null) {
      return value2;
    }
    return null;
  }

  /**
   * Récupère un InputOption d'un InputOptionCollection selon la valeur de son attribut value.
   * @param value 
   * @param collection 
   * @returns 
   */
  static getInputOptionFromCollection(value: string, collection: InputOptionCollection): InputOption {
    if (value && collection?.options?.length > 0) {
      return collection.options.find((option: InputOption) => option.value == value);
    }
    return null;
  }

  /**
   * Récupère un InputOption d'un InputOptionCollection selon la valeur de son attribut value.
   * @param value 
   * @param inputOptions 
   * @returns 
   */
  static getLabelFromInputOptions(value: string, inputOptions: InputOption[]): string {
    if (value && inputOptions?.length > 0) {
      return inputOptions.find((option: InputOption) => option.value == value)?.label;
    }
    return null;
  }

  /**
   * Indique si 2 adresses sont identiques.
   * 
   * Deux adresses sont identiques si elles ont le même numéro civique, le même nom de rue et le même code postal.
   * Par contre, si le numéro de la rue et le nom de la rue ne sont pas fournis, il faut que le code postal soit pareil.
   * @param usagerLieuRes1 
   * @param usagerLieuRes2 
   * @returns 
   */
  static isUsagerLieuxResidencesIdentiques(usagerLieuRes1: UsagerLieuResidenceDTO, usagerLieuRes2: UsagerLieuResidenceDTO): boolean {
    if (usagerLieuRes1 && usagerLieuRes2) {
      if (usagerLieuRes1.noCiviq || usagerLieuRes2.noCiviq ||
        usagerLieuRes1.rue || usagerLieuRes2.rue ||
        usagerLieuRes1.codePostal || usagerLieuRes2.codePostal)
        return usagerLieuRes1.noCiviq == usagerLieuRes2.noCiviq &&
          usagerLieuRes1.rue == usagerLieuRes2.rue &&
          usagerLieuRes1.codePostal == usagerLieuRes2.codePostal;
    }
    return false;
  }
}
