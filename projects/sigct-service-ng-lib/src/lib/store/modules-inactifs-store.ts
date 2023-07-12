import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SigctModuleEnum } from '../enums/sigct-module.enum';
import { Store } from './abstract-store';

@Injectable({
  providedIn: 'root'
})
export class ModulesInactifsStore extends Store<SigctModuleEnum[]> {

  constructor(private translateService: TranslateService) {
    super([]);
  }

  /**
   * Retourne le nom du module reçu en paramètre.
   * @param modules SigctModuleEnum
   * @returns le nom du module
   */
  public getNomModule(module: SigctModuleEnum): string {
    let nomModule: string = "";
    if (module) {
      nomModule = this.translateService.instant(module.getLibelle());
    }
    return nomModule;
  }

  /**
   * Retourne le nom des modules reçus en paramètre séparés par une virgule.
   * @param modules liste de SigctModuleEnum
   * @returns le nom des modules séparés par une virgule
   */
  public getNomsModules(modules: SigctModuleEnum[]): string {
    let nomModules: string = "";
    modules?.forEach((module: SigctModuleEnum) => {
      if (nomModules) {
        nomModules += ", ";
      }
      nomModules += this.getNomModule(module);
    });
    return nomModules;
  }

  /**
   * Retourne le nom des modules actuellement dans le store séparés par une virgule.
   * @returns le nom des modules séparés par une virgule
   */
  public getNomsModulesInStore(): string {
    return this.getNomsModules(this.state);
  }

  resetStore(): void {
    this.setState(new Array<SigctModuleEnum>());
  }

  /**
   * Ajoute un module inactif au store
   * @param moduleInactif
   */
  addModuleInactif(moduleInactif: SigctModuleEnum): void {
    if (moduleInactif != null) {
      // Ajoute pas de doublon
      if (!this.state.includes(moduleInactif)) {
        this.setState(this.state.concat(moduleInactif));
        //      this.setState([...this.state, moduleInactif]);
      }
    }
  }

  /**
   * Retire un module inactif du store
   * @param moduleInactif
   */
  removeModuleInactif(moduleInactif: SigctModuleEnum): void {
    if (this.state?.length > 0 && moduleInactif) {
      const idx: number = this.state.indexOf(moduleInactif);
      if (idx > -1) {
        this.state.splice(idx, 1);
        this.setState(this.state);
      }
    }
  }
}