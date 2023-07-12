import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CritereRechercheTablesInfo } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-informations-utiles/critere-recherche-table-information';
import { TableInfoWrapperDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-informations-utiles/table-info-wrapper-dto';
import { TableInforUtileDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-informations-utiles/table-infor-utile-dto';
import { Observable } from 'rxjs';
import { HttpErrorHandler } from '../../http/http-error-handler.service';
import { InformationUtileDTO } from '../../models/information-utile-dto';

@Injectable({
    providedIn: 'root'
})
export class TableInformationsUtilesService {

    constructor(private http: HttpClient,
        httpErrorHandler: HttpErrorHandler) {
        httpErrorHandler.createHandleError('TableInformationsUtilesService');
    }

    public getTablesReferences(critereRechercheTablesInfo: CritereRechercheTablesInfo): Observable<TableInfoWrapperDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.post<TableInfoWrapperDTO>(urlBase + "/rechercher/", JSON.stringify(critereRechercheTablesInfo), {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }

    public getInformationUtile(id): Observable<TableInforUtileDTO> {

        const urlBase = this.getUrlBasedOnModuleNom();

        return this.http.get<TableInforUtileDTO>(urlBase + "/" + id, {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });

    }

    public saveInformationUtile(obj: TableInforUtileDTO): Observable<TableInforUtileDTO> {

        const urlBase = this.getUrlBasedOnModuleNom();

        if (obj.identifiant) {

            return this.http.post<TableInforUtileDTO>(urlBase + "/" + obj.identifiant, obj, {
                headers: new HttpHeaders().set('Content-Type', 'application/json'),
            });

        } else {

            return this.http.post<TableInforUtileDTO>(urlBase, obj, {
                headers: new HttpHeaders().set('Content-Type', 'application/json'),
            });
        }


    }

    public deleteInformationUtile(id): Observable<TableInforUtileDTO> {

        const urlBase = this.getUrlBasedOnModuleNom();

        return this.http.delete<TableInforUtileDTO>(urlBase + "/" + id, {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });

    }

    private getUrlBasedOnModuleNom(): string {
        let appName: string = window["env"].appName;
        let urlBase: string;
        if (appName == "infosante") {
            urlBase = window["env"].urlSante + '/api' + '/tables-info'
        }
        if (appName == "infosocial") {
            urlBase = window["env"].urlInfoSocial + '/api' + '/tables-info'
        }
        if (appName == "usager") {
          urlBase = window["env"].urlUsager + '/api' + '/tables-info'
        }
        return urlBase;
    }

    public afficherLiensUtiles(): Observable<InformationUtileDTO[]> {
        const urlBase = this.getUrlBasedOnModuleNom();

        return this.http.get<InformationUtileDTO[]>(urlBase + "/afficher/", {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }
}
