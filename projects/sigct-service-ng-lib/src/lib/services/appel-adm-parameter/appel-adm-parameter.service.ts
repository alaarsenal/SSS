import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { CritereRechercheParametresSysteme } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme/critere-recherche-parametres-systeme';
import { ParametreSystemeDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme/parametre-systeme-dto';
import { ParamsSystemeWrapperDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme/params-systeme-wrapper-dto';
import { Observable } from 'rxjs';
import { ReferenceDTO } from '../../models/reference-dto';

@Injectable({
    providedIn: 'root'
})
export class AppelAdmParameterService {

    constructor(
        private http: HttpClient,
        private httpErrorHandler: HttpErrorHandler) {
        this.httpErrorHandler.createHandleError('AppelAdmParameterService');
    }

    /**
    * Retourne la valeur d'un paramètre (Tables XX_ADM_PARAMETERS)
    * @param urlApi URL de l'api à utiliser pour aller chercher l'information, selon l'environnement
    * @param nomParametre Nom (ou code) du paramètre dont on veut la valeur
    */
    obtenirAdmParameter(urlApi: string, nomParametre: string): Observable<any> {
        let params = new HttpParams().set('nomParametre', nomParametre);
        return this.http.get<any>(urlApi + '/valeur-parametre', { params });
    }

    /**
     * Retourne tous les paramètres nécessaires à l'utilisation de M10
     * @param urlApi URL de l'api à utiliser pour aller chercher l'information, selon l'environnement
     */
    obtenirAdmParametersM10(urlApi: string): Observable<any> {
        return this.http.get<any>(urlApi + 'valeurs-parametres/m10');
    }

    /**
     * Retourne tous les paramètres nécessaires à l'utilisation de RRSS
     * @param urlApi URL de l'api à utiliser pour aller chercher l'information, selon l'environnement
     */
    obtenirAdmParametersRRSS(urlApi: string): Observable<any> {
        return this.http.get<any>(urlApi + 'valeurs-parametres/rrss');
    }

    accederModuleGarde(urlApi: string, codeMG: string): Observable<any> {
        return this.http.get<any>(urlApi + "/sigct/systemesexternes/connectToRessource/MG/" + codeMG);
    }

    getLiensSystemesExternes(urlApi: string): Observable<ReferenceDTO[]> {
        return this.http.get<ReferenceDTO[]>(urlApi + "sigct/systemesexternes/getLiensSystemesExternes");
    }

    openModuleGarde(urlApi: string) {
        // Force le navigateur de ne pas utiliser le cache pour ouvrir la nouvelle url
        window.open(urlApi + "sigct/systemesexternes/connectToRessource/MG?now=" + new Date().getTime(), "_blank");
    }

    getAllParametresSysteme(critereRechercheParametresSysteme: CritereRechercheParametresSysteme): Observable<ParamsSystemeWrapperDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.post<ParamsSystemeWrapperDTO>(urlBase + "/parametressysteme/", JSON.stringify(critereRechercheParametresSysteme), {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }

    obtenirAdmParameterByCode(codeParametre: string): Observable<ParametreSystemeDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        const context = this.getContextOnModuleNom();
        return this.http.get<ParametreSystemeDTO>(urlBase + context + codeParametre);
    }

    modifieAdmParameter(ParametreSystemeDTO: ParametreSystemeDTO): Observable<ParametreSystemeDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.put<ParametreSystemeDTO>(urlBase + "/parametressysteme/", ParametreSystemeDTO);
    }

    private getUrlBasedOnModuleNom(): string {
        let appName: string = window["env"].appName;
        let urlBase: string;
        if (appName == "infosante") {
            urlBase = window["env"].urlSante + '/api';
        }
        if (appName == "infosocial") {
            urlBase = window["env"].urlInfoSocial + '/api';
        }
        return urlBase;
    }

    private getContextOnModuleNom(): string {
        let appName: string = window["env"].appName;
        let context: string;
        if (appName == "infosante") {
            context = "/parametres-sante/";
        }
        if (appName == "infosocial") {
            context = "/parametres-social/";
        }
        return context;
    }

    public getCssOnModuleNom(): string {
        let appName: string = window["env"].appName;
        let css: string;
        if (appName == "infosante") {
            css = "row margin-bottom-15 piloterParamsSystemeEnModifTitleSante";
        }
        if (appName == "infosocial") {
            css = "row margin-bottom-15 piloterParamsSystemeEnModifTitleSocial";
        }
        return css;
    }
}