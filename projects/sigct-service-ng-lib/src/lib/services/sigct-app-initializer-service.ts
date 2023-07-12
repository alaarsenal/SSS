import { Injectable } from '@angular/core';

@Injectable()
export class SigctAppInitializerService {

  clearStorages(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Retire les infos de l'utilisateur en session.
      sessionStorage.removeItem("user");

      // Retire les critères de recherche d'appel en session.
      sessionStorage.removeItem("critereRechercheAppelSA");
      sessionStorage.removeItem("critereRechercheAppelSO");

      resolve(0);
    });
  }
}
